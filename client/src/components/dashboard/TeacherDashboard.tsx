import React, { useState } from 'react';
import { AnnouncementSection, Announcement } from '../dashboard/AnnouncementSection';
import { AnnouncementCreator } from '../dashboard/AnnouncementCreator';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Plus,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Eye
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigation } from '../../hooks/useNavigation';
import { AnnouncementService } from '../../services/announcements';
import { useAuth } from '../../hooks/useAuth';

const mySubjects = [
  {
    id: '1',
    name: 'Toán học 12A1',
    students: 35,
    completion: 78,
    nextClass: '2024-09-19 07:30',
    pendingQuizzes: 3,
    newMessages: 5,
  },
  {
    id: '2',
    name: 'Toán học 12A2',
    students: 32,
    completion: 82,
    nextClass: '2024-09-19 09:15',
    pendingQuizzes: 1,
    newMessages: 2,
  },
  {
    id: '3',
    name: 'Toán nâng cao',
    students: 18,
    completion: 91,
    nextClass: '2024-09-20 14:00',
    pendingQuizzes: 0,
    newMessages: 1,
  },
];

const recentActivities = [
  {
    student: 'Nguyễn Văn A',
    action: 'hoàn thành quiz "Đạo hàm cơ bản"',
    score: 95,
    time: '2 giờ trước',
    avatar: 'NA',
  },
  {
    student: 'Trần Thị B',
    action: 'gửi câu hỏi về bài "Tích phân"',
    time: '3 giờ trước',
    avatar: 'TB',
  },
  {
    student: 'Lê Minh C',
    action: 'hoàn thành flashcard "Lượng giác"',
    score: 88,
    time: '5 giờ trước',
    avatar: 'LC',
  },
  {
    student: 'Phạm Thị D',
    action: 'tải lên bài tập về nhà',
    time: '6 giờ trước',
    avatar: 'PD',
  },
];

const upcomingClasses = [
  {
    subject: 'Toán học 12A1',
    time: '07:30 - 08:15',
    room: 'Phòng 201',
    topic: 'Ứng dụng đạo hàm',
  },
  {
    subject: 'Toán học 12A2',
    time: '09:15 - 10:00',
    room: 'Phòng 201',
    topic: 'Bài tập tổng hợp',
  },
  {
    subject: 'Toán nâng cao',
    time: '14:00 - 15:30',
    room: 'Phòng 301',
    topic: 'Phương trình vi phân',
  },
];

const mockOverallStats = {
  totalStudents: 85,
  totalSubjects: 3,
  totalQuizzes: 24,
  totalFlashcards: 89,
  avgQuizScore: 82.5,
  completionRate: 78.3,
  activeStudents: 72,
  avgStudyTime: 2.4,
};

const mockSubjectStats = [
  {
    id: '1',
    name: 'Toán học 12A1',
    students: 35,
    avgScore: 85.2,
    completionRate: 82.1,
    quizCount: 8,
    flashcardCount: 45,
    lastActivity: '2024-09-18',
    trend: 'up',
    trendValue: 5.2,
  },
  {
    id: '2',
    name: 'Toán học 12A2',
    students: 32,
    avgScore: 78.9,
    completionRate: 75.4,
    quizCount: 6,
    flashcardCount: 32,
    lastActivity: '2024-09-17',
    trend: 'up',
    trendValue: 2.1,
  },
  {
    id: '3',
    name: 'Toán nâng cao',
    students: 18,
    avgScore: 91.3,
    completionRate: 88.8,
    quizCount: 10,
    flashcardCount: 28,
    lastActivity: '2024-09-16',
    trend: 'down',
    trendValue: -1.5,
  },
];

const mockStudentPerformance = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    studentId: 'SV001',
    subject: 'Toán học 12A1',
    quizScore: 92,
    completionRate: 95,
    studyTime: 3.2,
    lastActive: '2024-09-18',
    status: 'excellent',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    studentId: 'SV002',
    subject: 'Toán học 12A1',
    quizScore: 88,
    completionRate: 87,
    studyTime: 2.8,
    lastActive: '2024-09-17',
    status: 'good',
  },
  {
    id: '3',
    name: 'Lê Minh C',
    studentId: 'SV003',
    subject: 'Toán học 12A2',
    quizScore: 75,
    completionRate: 65,
    studyTime: 1.5,
    lastActive: '2024-09-15',
    status: 'needs_attention',
  },
];

export function TeacherDashboard() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  // Announcements (from backend notifications)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const mapToAnnouncement = (n: any): Announcement => ({
    id: n._id || n.id,
    title: String(n.title || 'Thông báo'),
    content: String(n.content || ''),
    author: String(n.authorName || n.author || 'Hệ thống'),
    date: new Date(n.createdAt || Date.now()).toLocaleString('vi-VN'),
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await AnnouncementService.list() as any; // { items }
        const list = Array.isArray(res?.items) ? res.items : [];
        if (!mounted) return;
        setAnnouncements(list.map(mapToAnnouncement));
      } catch {
        if (!mounted) return;
        setAnnouncements([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreateAnnouncement = async (title: string, content: string) => {
    try {
      await AnnouncementService.create({ title, content, scope: 'school' });
      const res = await AnnouncementService.list() as any; // { items }
      const list = Array.isArray(res?.items) ? res.items : [];
      setAnnouncements(list.map(mapToAnnouncement));
    } catch (e) {
      // TODO: show a toast
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Xuất sắc</Badge>;
      case 'good':
        return <Badge variant="secondary">Tốt</Badge>;
      case 'needs_attention':
        return <Badge variant="destructive">Cần chú ý</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSubjectStats = selectedSubject === 'all'
    ? mockSubjectStats
    : mockSubjectStats.filter(s => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Bảng điều khiển giáo viên</h1>
          <p className="text-muted-foreground">
            Quản lý lớp học và theo dõi tiến độ học tập của học sinh
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần</SelectItem>
              <SelectItem value="month">Tháng</SelectItem>
              <SelectItem value="quarter">Quý</SelectItem>
              <SelectItem value="year">Năm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => navigateTo('schedule')}>
            <Calendar className="h-4 w-4" />
            Xem lịch học
          </Button>
          <Button className="gap-2" onClick={() => navigateTo('content')}>
            <Plus className="h-4 w-4" />
            Tạo nội dung mới
          </Button>
        </div>
      </div>
      {/* Announcement area for Teacher */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div className="lg:col-span-1">
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Tạo thông báo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo thông báo mới</DialogTitle>
                </DialogHeader>
                <AnnouncementCreator onCreate={handleCreateAnnouncement} />
              </DialogContent>
            </Dialog>
          </div>
        )}
        <div className="lg:col-span-3">
          <AnnouncementSection announcements={announcements} />
        </div>
      </div>


      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng sinh viên</p>
                <p className="text-xl font-semibold">{mockOverallStats.totalStudents}</p>
                <p className="text-xs text-green-600">+{mockOverallStats.activeStudents} đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Môn học</p>
                <p className="text-xl font-semibold">{mockOverallStats.totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Đang giảng dạy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Điểm TB Quiz</p>
                <p className="text-xl font-semibold">{mockOverallStats.avgQuizScore}%</p>
                <p className="text-xs text-green-600">+2.1% so với tháng trước</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                <p className="text-xl font-semibold">{mockOverallStats.completionRate}%</p>
                <p className="text-xs text-green-600">+3.2% so với tháng trước</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Lớp học của tôi</TabsTrigger>
          <TabsTrigger value="students">Hiệu suất sinh viên</TabsTrigger>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredSubjectStats.map((subject) => (
              <Card key={subject.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subject.students} sinh viên • Hoạt động cuối: {new Date(subject.lastActivity).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${subject.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {subject.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">{Math.abs(subject.trendValue)}%</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateTo('subjects')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{subject.avgScore}%</p>
                      <p className="text-sm text-muted-foreground">Điểm TB</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{subject.completionRate}%</p>
                      <p className="text-sm text-muted-foreground">Hoàn thành</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{subject.quizCount}</p>
                      <p className="text-sm text-muted-foreground">Quiz</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{subject.flashcardCount}</p>
                      <p className="text-sm text-muted-foreground">Flashcard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất sinh viên</CardTitle>
              <CardDescription>
                Phân tích chi tiết về tiến độ học tập của từng sinh viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudentPerformance.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{student.name}</h3>
                          <Badge variant="outline" className="text-xs">{student.studentId}</Badge>
                          {getStatusBadge(student.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{student.subject}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Điểm Quiz: {student.quizScore}%</span>
                          <span>•</span>
                          <span>Hoàn thành: {student.completionRate}%</span>
                          <span>•</span>
                          <span>Thời gian học: {student.studyTime}h/ngày</span>
                          <span>•</span>
                          <span>Hoạt động cuối: {new Date(student.lastActive).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tiến độ</span>
                          <span>{student.completionRate}%</span>
                        </div>
                        <Progress value={student.completionRate} className="h-2" />
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">{student.quizScore}%</p>
                        <p className="text-xs text-muted-foreground">Điểm Quiz</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Các hoạt động mới nhất của học sinh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.student}</span>{' '}
                        {activity.action}
                        {activity.score && (
                          <Badge variant="secondary" className="ml-2">
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch học hôm nay</CardTitle>
                <CardDescription>Thứ Năm, 19 tháng 9, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((classItem, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{classItem.subject}</h4>
                        <Badge variant="outline">{classItem.room}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{classItem.time}</p>
                      <p className="text-sm">{classItem.topic}</p>
                      <Button size="sm" variant="secondary" className="w-full">
                        Chuẩn bị bài giảng
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateTo('content')}>
          <CardContent className="p-4 text-center">
            <Plus className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Tạo Quiz</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateTo('content')}>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Upload tài liệu</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateTo('analytics')}>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Xem báo cáo</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateTo('messages')}>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Nhắn tin HS</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}