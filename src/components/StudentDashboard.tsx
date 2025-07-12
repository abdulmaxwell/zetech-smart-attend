
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
  BarChart3
} from 'lucide-react';
import { User as UserType } from '@/types';

interface StudentDashboardProps {
  user: UserType;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const [attendancePercentage, setAttendancePercentage] = useState(78);
  const [classesAttended, setClassesAttended] = useState(47);
  const [classesMissed, setClassesMissed] = useState(13);
  const [nextClass, setNextClass] = useState({
    name: 'Advanced Programming',
    time: '2:00 PM - 4:00 PM',
    location: 'Lab 204',
    lecturer: 'Dr. Sarah Mwangi'
  });

  const [recentAttendance, setRecentAttendance] = useState([
    { date: '2024-01-12', class: 'Database Systems', status: 'present' },
    { date: '2024-01-11', class: 'Software Engineering', status: 'present' },
    { date: '2024-01-10', class: 'Data Structures', status: 'absent' },
    { date: '2024-01-09', class: 'Web Development', status: 'present' },
    { date: '2024-01-08', class: 'Advanced Programming', status: 'late' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <p className="text-sm text-gray-500">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for low attendance */}
        {attendancePercentage < 80 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your attendance is below 80%. Consider attending more classes to maintain good standing.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
              <Progress value={attendancePercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {classesAttended} attended, {classesMissed} missed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Class</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{nextClass.name}</div>
              <p className="text-sm text-muted-foreground">{nextClass.time}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {nextClass.location}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BLE Status</CardTitle>
              <Bluetooth className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Auto-attendance enabled
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="absences">Absences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Weekly Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: '8:00 AM', class: 'Mathematics', room: 'Room 101', status: 'completed' },
                      { time: '10:00 AM', class: 'Physics', room: 'Lab 202', status: 'completed' },
                      { time: '2:00 PM', class: 'Advanced Programming', room: 'Lab 204', status: 'upcoming' },
                      { time: '4:00 PM', class: 'Database Systems', room: 'Room 105', status: 'upcoming' },
                    ].map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-600">{schedule.time}</div>
                        <div className="flex-1">
                          <div className="font-medium">{schedule.class}</div>
                          <div className="text-sm text-gray-500">{schedule.room}</div>
                        </div>
                        <Badge variant={schedule.status === 'completed' ? 'secondary' : 'default'}>
                          {schedule.status}
                        </Badge>
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
                <CardDescription>Your attendance history for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAttendance.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <div className="font-medium">{record.class}</div>
                          <div className="text-sm text-gray-500">{record.date}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
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
                  <Button size="sm">
                    Submit New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No absence explanations submitted yet.</p>
                    <Button variant="outline" className="mt-4">
                      Submit Your First Explanation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
