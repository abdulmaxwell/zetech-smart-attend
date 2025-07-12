import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp, 
  Bell, 
  FileText, 
  Bluetooth,
  CheckCircle,
  AlertCircle,
  BookOpen,
  BarChart3,
  Plus,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { User as UserType, AttendanceLog, Class, AbsenceRequest } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AbsenceForm from './AbsenceForm';

interface StudentDashboardProps {
  user: UserType;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const [attendanceStats, setAttendanceStats] = useState({
    percentage: 0,
    attended: 0,
    missed: 0,
    total: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<AttendanceLog[]>([]);
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [nextClass, setNextClass] = useState<Class | null>(null);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [bleStatus, setBleStatus] = useState({ connected: true, scanning: false });
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchAttendanceStats(),
        fetchRecentAttendance(),
        fetchTodayClasses(),
        fetchAbsenceRequests()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    const { data: logs, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', user.id);

    if (error) {
      console.error('Error fetching attendance stats:', error);
      return;
    }

    // Get total enrolled classes
    const { data: enrolledClasses, error: classError } = await supabase
      .from('student_classes')
      .select('class_id')
      .eq('student_id', user.id);

    if (classError) {
      console.error('Error fetching enrolled classes:', classError);
      return;
    }

    const totalClasses = enrolledClasses?.length || 0;
    const attendedClasses = logs?.length || 0;
    const missedClasses = Math.max(0, totalClasses - attendedClasses);
    const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    setAttendanceStats({
      percentage,
      attended: attendedClasses,
      missed: missedClasses,
      total: totalClasses
    });
  };

  const fetchRecentAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select(`
        *,
        classes:class_id (
          name,
          code
        )
      `)
      .eq('student_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent attendance:', error);
      return;
    }

    setRecentAttendance(data || []);
  };

  const fetchTodayClasses = async () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const { data: enrolledClasses, error } = await supabase
      .from('student_classes')
      .select(`
        classes:class_id (
          id,
          name,
          code,
          schedule,
          department
        )
      `)
      .eq('student_id', user.id);

    if (error) {
      console.error('Error fetching today classes:', error);
      return;
    }

    // Filter classes for today - handle schedule as JSON
    const todaySchedule = enrolledClasses
      ?.map(item => item.classes)
      .filter(cls => {
        if (!cls?.schedule) return false;
        try {
          const schedule = typeof cls.schedule === 'string' ? JSON.parse(cls.schedule) : cls.schedule;
          return schedule?.day?.toLowerCase() === today;
        } catch {
          return false;
        }
      })
      .map(cls => ({
        ...cls,
        schedule: typeof cls.schedule === 'string' ? JSON.parse(cls.schedule) : cls.schedule
      })) || [];

    setTodayClasses(todaySchedule as Class[]);

    // Find next class
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const upcomingClass = todaySchedule.find(cls => {
      if (!cls?.schedule?.start) return false;
      try {
        const [hours, minutes] = cls.schedule.start.split(':').map(Number);
        const classTime = hours * 60 + minutes;
        return classTime > currentTime;
      } catch {
        return false;
      }
    });

    setNextClass(upcomingClass as Class || null);
  };

  const fetchAbsenceRequests = async () => {
    const { data, error } = await supabase
      .from('absence_requests')
      .select(`
        *,
        classes:class_id (
          name,
          code
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching absence requests:', error);
      return;
    }

    setAbsenceRequests(data || []);
  };

  const handleBLEToggle = () => {
    setBleStatus(prev => ({ ...prev, connected: !prev.connected }));
    toast.success(bleStatus.connected ? 'BLE disconnected' : 'BLE connected');
  };

  const handleMarkAttendance = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('attendance_logs')
        .insert({
          student_id: user.id,
          class_id: classId,
          method: 'manual',
          notes: 'Manually marked by student'
        });

      if (error) {
        console.error('Error marking attendance:', error);
        toast.error('Error marking attendance');
        return;
      }

      toast.success('Attendance marked successfully');
      fetchAttendanceStats();
      fetchRecentAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Error marking attendance');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      case 'absent': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-full p-2">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {user.admission_number} • {user.department} • Year {user.year_of_study}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for low attendance */}
        {attendanceStats.percentage < 75 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your attendance is {attendanceStats.percentage}%. You need at least 75% to maintain good standing.
              {attendanceStats.percentage < 65 && ' Contact your academic advisor immediately.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.percentage}%</div>
              <Progress value={attendanceStats.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {attendanceStats.attended} attended, {attendanceStats.missed} missed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Class</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextClass ? (
                <>
                  <div className="text-lg font-semibold">{nextClass.name}</div>
                  <p className="text-sm text-muted-foreground">
                    {nextClass.schedule?.start} - {nextClass.schedule?.end}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {nextClass.schedule?.room}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No classes today</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BLE Status</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBLEToggle}
                className="h-auto p-0"
              >
                {bleStatus.connected ? (
                  <Bluetooth className="h-4 w-4 text-blue-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${bleStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {bleStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {bleStatus.connected ? 'Auto-attendance enabled' : 'Manual check-in required'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {absenceRequests.filter(req => req.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Absence explanations awaiting review
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="absences">Absences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayClasses.length > 0 ? todayClasses.map((cls, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium">{cls.name}</div>
                          <div className="text-sm text-gray-500">
                            {cls.schedule?.start} - {cls.schedule?.end} • {cls.schedule?.room}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(cls.id)}
                        >
                          Check In
                        </Button>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No classes scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock weekly data - replace with real data */}
                    {[
                      { day: 'Monday', attended: 3, total: 4 },
                      { day: 'Tuesday', attended: 2, total: 3 },
                      { day: 'Wednesday', attended: 4, total: 4 },
                      { day: 'Thursday', attended: 1, total: 3 },
                      { day: 'Friday', attended: 3, total: 3 },
                    ].map((day) => (
                      <div key={day.day} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{day.day}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(day.attended / day.total) * 100} className="w-20" />
                          <span className="text-xs text-muted-foreground">
                            {day.attended}/{day.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your attendance history for recent classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttendance.length > 0 ? recentAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">{record.classes?.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {record.method}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No attendance records yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Classes</CardTitle>
                <CardDescription>Your enrolled classes this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Loading enrolled classes...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="absences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Absence Explanations
                  </span>
                  <Button size="sm" onClick={() => setShowAbsenceForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {absenceRequests.length > 0 ? absenceRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{request.class?.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getUrgencyColor(request.urgency)}>
                            {request.urgency}
                          </Badge>
                          <Badge variant={
                            request.status === 'approved' ? 'secondary' :
                            request.status === 'rejected' ? 'destructive' : 'default'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.reason.substring(0, 150)}...
                      </p>
                      <div className="text-xs text-gray-500">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                        {request.reviewed_at && (
                          <span> • Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      {request.admin_comments && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Admin Response:</strong> {request.admin_comments}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No absence explanations submitted yet.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowAbsenceForm(true)}>
                        Submit Your First Explanation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Absence Form Modal */}
      {showAbsenceForm && (
        <AbsenceForm
          userId={user.id}
          onClose={() => setShowAbsenceForm(false)}
          onSuccess={() => {
            setShowAbsenceForm(false);
            fetchAbsenceRequests();
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;