
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Download, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Bluetooth,
  Mail,
  Search
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const stats = {
    totalStudents: 1245,
    totalClasses: 156,
    todayAttendance: 892,
    pendingAbsences: 23,
    averageAttendance: 84.5
  };

  const pendingAbsences = [
    {
      id: 1,
      student: 'John Doe',
      class: 'Advanced Programming',
      date: '2024-01-10',
      reason: 'Medical emergency - hospitalization due to...',
      urgency: 'high',
      wordsCount: 456
    },
    {
      id: 2,
      student: 'Jane Smith',
      class: 'Database Systems',
      date: '2024-01-09',
      reason: 'Family emergency requiring immediate travel...',
      urgency: 'medium',
      wordsCount: 324
    },
    {
      id: 3,
      student: 'Mike Johnson',
      class: 'Web Development',
      date: '2024-01-08',
      reason: 'Transportation strike affected public transport...',
      urgency: 'low',
      wordsCount: 289
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproval = (id: number, action: 'approve' | 'reject') => {
    console.log(`${action} absence request ${id}`);
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">ZETECH SmartAttend Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.todayAttendance / stats.totalStudents) * 100).toFixed(1)}% of students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingAbsences}</div>
              <p className="text-xs text-muted-foreground">Absence explanations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
              <p className="text-xs text-green-600">+2.1% from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="absences">Absences</TabsTrigger>
            <TabsTrigger value="beacons">BLE Beacons</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: '2 mins ago', event: 'New absence request from John Doe', type: 'request' },
                      { time: '15 mins ago', event: 'Beacon LAB-204 went offline', type: 'alert' },
                      { time: '1 hour ago', event: 'Weekly report generated for CS Department', type: 'report' },
                      { time: '2 hours ago', event: 'Mass attendance marked for Morning Assembly', type: 'attendance' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-500 min-w-[60px]">{activity.time}</div>
                        <div className="flex-1 text-sm">{activity.event}</div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center space-x-2">
                        <Bluetooth className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">BLE Beacons</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">45/47 Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Email Service</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="absences" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Absence Requests</CardTitle>
                    <CardDescription>Review and manage student absence explanations</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search requests..." className="pl-8 w-64" />
                    </div>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAbsences.map((absence) => (
                    <div key={absence.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold">{absence.student}</h3>
                            <p className="text-sm text-gray-600">{absence.class} - {absence.date}</p>
                          </div>
                          <Badge className={getUrgencyColor(absence.urgency)}>
                            {absence.urgency} priority
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {absence.wordsCount} words
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {absence.reason}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleApproval(absence.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproval(absence.id, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beacons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bluetooth className="w-5 h-5 mr-2" />
                  BLE Beacon Management
                </CardTitle>
                <CardDescription>Monitor and manage Bluetooth beacons across campus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Bluetooth className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Beacon management interface would be implemented here</p>
                  <Button variant="outline" className="mt-4">
                    Add New Beacon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Reports & Analytics
                </CardTitle>
                <CardDescription>Generate and view attendance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Advanced reporting dashboard would be implemented here</p>
                  <div className="flex justify-center space-x-4 mt-4">
                    <Button variant="outline">
                      Weekly Report
                    </Button>
                    <Button variant="outline">
                      Monthly Report
                    </Button>
                    <Button variant="outline">
                      Custom Report
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

export default AdminDashboard;
