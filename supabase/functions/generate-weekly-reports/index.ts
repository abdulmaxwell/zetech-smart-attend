import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting weekly report generation...');

    // Get current week boundaries
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`Generating reports for week: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

    // Get all students
    const { data: students, error: studentsError } = await supabaseClient
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'student');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    console.log(`Found ${students?.length || 0} students`);

    const reports = [];

    for (const student of students || []) {
      console.log(`Processing student: ${student.first_name} ${student.last_name}`);

      // Get student's enrolled classes
      const { data: enrolledClasses, error: classesError } = await supabaseClient
        .from('student_classes')
        .select(`
          class_id,
          classes!inner(id, name, code)
        `)
        .eq('student_id', student.id);

      if (classesError) {
        console.error(`Error fetching classes for student ${student.id}:`, classesError);
        continue;
      }

      // Get attendance logs for the week
      const { data: attendanceLogs, error: attendanceError } = await supabaseClient
        .from('attendance_logs')
        .select('*')
        .eq('student_id', student.id)
        .gte('timestamp', weekStart.toISOString())
        .lte('timestamp', weekEnd.toISOString());

      if (attendanceError) {
        console.error(`Error fetching attendance for student ${student.id}:`, attendanceError);
        continue;
      }

      const totalClasses = enrolledClasses?.length * 7 || 0; // Assuming daily classes
      const attendedClasses = attendanceLogs?.length || 0;
      const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      // Generate AI insights
      let aiInsights = '';
      if (attendancePercentage >= 90) {
        aiInsights = 'Excellent attendance! Keep up the outstanding work.';
      } else if (attendancePercentage >= 75) {
        aiInsights = 'Good attendance overall. Consider maintaining consistency to achieve excellence.';
      } else if (attendancePercentage >= 60) {
        aiInsights = 'Attendance is below recommended levels. Focus on improving time management and prioritizing classes.';
      } else {
        aiInsights = 'Critical: Attendance is significantly below acceptable levels. Please contact your academic advisor immediately.';
      }

      // Check if report already exists for this week
      const { data: existingReport } = await supabaseClient
        .from('weekly_reports')
        .select('id')
        .eq('student_id', student.id)
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .single();

      const reportData = {
        student_id: student.id,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        total_classes: totalClasses,
        attended_classes: attendedClasses,
        attendance_percentage: Math.round(attendancePercentage * 100) / 100,
        ai_insights: aiInsights,
        content: {
          student_name: `${student.first_name} ${student.last_name}`,
          classes: enrolledClasses?.map(ec => ec.classes) || [],
          attendance_logs: attendanceLogs || []
        }
      };

      if (existingReport) {
        // Update existing report
        const { error: updateError } = await supabaseClient
          .from('weekly_reports')
          .update(reportData)
          .eq('id', existingReport.id);

        if (updateError) {
          console.error(`Error updating report for student ${student.id}:`, updateError);
        } else {
          console.log(`Updated report for student: ${student.first_name} ${student.last_name}`);
        }
      } else {
        // Create new report
        const { error: insertError } = await supabaseClient
          .from('weekly_reports')
          .insert(reportData);

        if (insertError) {
          console.error(`Error creating report for student ${student.id}:`, insertError);
        } else {
          console.log(`Created report for student: ${student.first_name} ${student.last_name}`);
        }
      }

      reports.push({
        student: `${student.first_name} ${student.last_name}`,
        attendance_percentage: attendancePercentage,
        total_classes: totalClasses,
        attended_classes: attendedClasses
      });
    }

    console.log('Weekly report generation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly reports generated successfully',
        reports_generated: reports.length,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        summary: reports
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-weekly-reports function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});