import { useState, useEffect } from 'react';
import { GetAllData } from '../../hooks/getAllData';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { BookOpen, Calendar, Target, Trophy, Brain, Clock, Play, FileText, Search, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useNavigation } from '../../hooks/useNavigation';
import { AnnouncementSection, Announcement } from '../dashboard/AnnouncementSection';


const mySubjects = [
  {
    id: '1',
    name: 'Toán học',
    teacher: 'GV. Nguyễn Văn Giáo',
    progress: 78,
    nextClass: '2024-09-19 07:30',
    pendingQuizzes: 2,
    newDocuments: 1,
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Vật lý',
    teacher: 'GV. Trần Thị B',
    progress: 65,
    nextClass: '2024-09-19 09:15',
    pendingQuizzes: 1,
    newDocuments: 0,
    color: 'bg-green-500',
  },
  {
    id: '3',
    name: 'Hóa học',
    teacher: 'GV. Lê Minh C',
    progress: 82,
    nextClass: '2024-09-20 13:30',
    pendingQuizzes: 0,
    newDocuments: 2,
    color: 'bg-purple-500',
  },
  {
    id: '4',
    name: 'Sinh học',
    teacher: 'GV. Phạm Thị D',
    progress: 91,
    nextClass: '2024-09-20 15:00',
    pendingQuizzes: 1,
    newDocuments: 1,
    color: 'bg-orange-500',
  },
];

const todaySchedule = [
  {
    time: '07:30 - 08:15',
    subject: 'Toán học',
    topic: 'Ứng dụng đạo hàm',
    room: 'Phòng 201',
    status: 'upcoming',
  },
  {
    time: '09:15 - 10:00',
    subject: 'Vật lý',
    topic: 'Sóng âm',
    room: 'Phòng 301',
    status: 'upcoming',
  },
  {
    time: '10:15 - 11:00',
    subject: 'Tiếng Anh',
    topic: 'Grammar review',
    room: 'Phòng 102',
    status: 'completed',
  },
];

const recentAchievements = [
  {
    title: 'Quiz Master',
    description: 'Hoàn thành 10 quiz liên tiếp với điểm 90+',
    icon: '🏆',
    date: 'Hôm nay',
  },
  {
    title: 'Streak Warrior',
    description: 'Học liên tục 7 ngày',
    icon: '🔥',
    date: 'Hôm qua',
  },
  {
    title: 'Knowledge Seeker',
    description: 'Đọc hoàn thành 5 tài liệu',
    icon: '📚',
    date: '2 ngày trước',
  },
];

const aiRecommendations = [
  {
    type: 'review',
    title: 'Ôn tập: Đạo hàm cơ bản',
    reason: 'Bạn cần ôn lại kiến thức này trước bài học mai',
    subject: 'Toán học',
    estimatedTime: '15 phút',
  },
  {
    type: 'practice',
    title: 'Luyện tập: Bài tập sóng âm',
    reason: 'Điểm quiz gần đây cho thấy bạn cần luyện thêm',
    subject: 'Vật lý',
    estimatedTime: '20 phút',
  },
  {
    type: 'new',
    title: 'Học mới: Phản ứng oxi hóa khử',
    reason: 'Chuẩn bị cho bài học tuần tới',
    subject: 'Hóa học',
    estimatedTime: '25 phút',
  },
];

export function StudentDashboard() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'init-public',
      title: 'Chào các bạn học sinh',
      content: 'Nhớ kiểm tra lịch thi giữa kỳ vào tuần sau nhé.',
      author: 'Admin',
      date: new Date().toLocaleDateString(),
    },
  ]);
  const [mySubjectsState, setMySubjectsState] = useState<any[]>(mySubjects);

  // Fetch student's enrollments from API
  const studentId = user?.id || (user as any)?._id;
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = GetAllData({ 
    url: studentId ? `/students/${studentId}/enrollments?status=approved` : '',
    name: `student-enrollments-${studentId}` 
  });

  // Update mySubjects when enrollments data is loaded
  useEffect(() => {
    if (enrollmentsData?.data && Array.isArray(enrollmentsData.data)) {
      const enrollments = enrollmentsData.data;
      if (enrollments.length > 0) {
        // Map enrollments to subjects format
        const subjects = enrollments.map((enrollment: any, index: number) => {
          const classData = enrollment.classId;
          return {
            id: classData?._id || `${index}`,
            name: classData?.subject || 'Unknown',
            teacher: `GV. ${classData?.teacherId?.username || 'Unknown'}`,
            progress: 75, // Mock - chưa có trong DB
            nextClass: classData?.schedule?.[0] ? new Date().toISOString() : '2024-09-19 07:30',
            pendingQuizzes: 2, // Mock - chưa có trong DB
            newDocuments: 1, // Mock - chưa có trong DB
            color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][index % 4],
          };
        });
        setMySubjectsState(subjects);
      }
    }
  }, [enrollmentsData]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Chào mừng trở lại!</h1>
          <p className="text-muted-foreground">
            Hôm nay là ngày tuyệt vời để học tập. Bạn đã sẵn sàng chưa?
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigateTo('subject-search')}
          >
            <Search className="h-4 w-4" />
            Tìm môn học
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigateTo('schedule')}
          >
            <Calendar className="h-4 w-4" />
            Xem lịch học
          </Button>
          <Button
            className="gap-2"
            onClick={() => navigateTo('ai-tutor')}
          >
            <Brain className="h-4 w-4" />
            Hỏi AI Tutor
          </Button>
        </div>
      </div>
      {/* Announcement area (Student) */}
      <div className="mt-4">
        <AnnouncementSection announcements={announcements} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tiến độ hôm nay</p>
                <p className="text-xl font-semibold">65%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Thời gian học</p>
                <p className="text-xl font-semibold">3.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                <p className="text-xl font-semibold">87.5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Quiz chưa làm</p>
                <p className="text-xl font-semibold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Môn học của tôi</CardTitle>
            <CardDescription>Tiến độ học tập theo từng môn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mySubjectsState.map((subject) => (
              <div key={subject.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                  <div className="flex-1">
                    <h3 className="font-medium">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.teacher}</p>
                  </div>
                  <Badge variant="secondary">{subject.progress}%</Badge>
                </div>

                <Progress value={subject.progress} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tiết học tiếp theo: {new Date(subject.nextClass).toLocaleString('vi-VN')}
                  </span>
                  <div className="flex gap-1">
                    {subject.pendingQuizzes > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {subject.pendingQuizzes} quiz
                      </Badge>
                    )}
                    {subject.newDocuments > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {subject.newDocuments} tài liệu mới
                      </Badge>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  Tiếp tục học
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Gợi ý từ AI
            </CardTitle>
            <CardDescription>AI đề xuất những gì bạn nên học tiếp theo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={rec.type === 'review' ? 'secondary' : rec.type === 'practice' ? 'destructive' : 'default'}>
                    {rec.type === 'review' ? 'Ôn tập' : rec.type === 'practice' ? 'Luyện tập' : 'Học mới'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{rec.estimatedTime}</span>
                </div>
                <h4 className="font-medium">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">{rec.subject}</Badge>
                  <Button size="sm" variant="secondary">
                    Bắt đầu
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch học hôm nay</CardTitle>
            <CardDescription>Thứ Năm, 19 tháng 9, 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className={`flex items-center gap-4 p-3 rounded-lg border ${item.status === 'completed' ? 'bg-muted/50' : 'bg-background'
                }`}>
                <div className="text-sm font-medium min-w-fit">
                  {item.time}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.subject}</p>
                    <Badge variant="outline" className="text-xs">{item.room}</Badge>
                    {item.status === 'completed' && (
                      <Badge variant="secondary" className="text-xs">Đã học</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.topic}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Thành tích gần đây
            </CardTitle>
            <CardDescription>Những cống hiến đáng khen ngợi của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}