import { React, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Search,
  Plus,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Clock,
  Trophy,
  Target,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

const mockStudents = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'student1@example.com',
    class: '12A1',
    subjects: ['Toán học', 'Vật lý'],
    progress: 85,
    quizScore: 92,
    flashcardProgress: 78,
    studyStreak: 7,
    totalStudyTime: 45.5,
    lastActive: '2024-09-18',
    status: 'active',
    achievements: 5,
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'student2@example.com',
    class: '12A1',
    subjects: ['Toán học', 'Hóa học'],
    progress: 78,
    quizScore: 88,
    flashcardProgress: 82,
    studyStreak: 12,
    totalStudyTime: 52.3,
    lastActive: '2024-09-17',
    status: 'active',
    achievements: 8,
  },
  {
    id: '3',
    name: 'Lê Minh C',
    email: 'student3@example.com',
    class: '12A2',
    subjects: ['Vật lý'],
    progress: 65,
    quizScore: 75,
    flashcardProgress: 60,
    studyStreak: 3,
    totalStudyTime: 32.1,
    lastActive: '2024-09-15',
    status: 'inactive',
    achievements: 2,
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'student4@example.com',
    class: '12A2',
    subjects: ['Toán học', 'Vật lý', 'Hóa học'],
    progress: 92,
    quizScore: 95,
    flashcardProgress: 88,
    studyStreak: 15,
    totalStudyTime: 68.7,
    lastActive: '2024-09-18',
    status: 'active',
    achievements: 12,
  },
];

const mockClassStats = [
  {
    class: '12A1',
    totalStudents: 35,
    activeStudents: 32,
    avgProgress: 78.5,
    avgQuizScore: 85.2,
    completedAssignments: 145,
    totalAssignments: 185,
  },
  {
    class: '12A2',
    totalStudents: 33,
    activeStudents: 30,
    avgProgress: 82.1,
    avgQuizScore: 87.8,
    completedAssignments: 156,
    totalAssignments: 190,
  },
];

export function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesSubject = selectedSubject === 'all' ||
      student.subjects.some(subject => subject.toLowerCase().includes(selectedSubject.toLowerCase()));
    return matchesSearch && matchesClass && matchesSubject;
  });

  const handleSendMessage = (student: any) => {
    setSelectedStudent(student);
    setIsMessageDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý học sinh</h1>
          <p className="text-muted-foreground">
            Theo dõi tiến độ và quản lý học sinh trong các lớp học
          </p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm học sinh
        </Button>
      </div>

      {/* Class Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockClassStats.map((classData) => (
          <Card key={classData.class}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{classData.class}</CardTitle>
                <Badge variant="secondary">
                  {classData.activeStudents}/{classData.totalStudents} hoạt động
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Tiến độ TB</p>
                  <p className="text-xl font-semibold">{classData.avgProgress}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Điểm TB</p>
                  <p className="text-xl font-semibold">{classData.avgQuizScore}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bài tập hoàn thành</span>
                  <span>{classData.completedAssignments}/{classData.totalAssignments}</span>
                </div>
                <Progress
                  value={(classData.completedAssignments / classData.totalAssignments) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                <SelectItem value="12A1">12A1</SelectItem>
                <SelectItem value="12A2">12A2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn</SelectItem>
                <SelectItem value="toán">Toán học</SelectItem>
                <SelectItem value="vật lý">Vật lý</SelectItem>
                <SelectItem value="hóa">Hóa học</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Danh sách ({filteredStudents.length})</TabsTrigger>
          <TabsTrigger value="performance">Thành tích</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        {/* Students List Tab */}
        <TabsContent value="list" className="space-y-4">
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{student.name}</h3>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.class}
                          </Badge>
                          <Badge variant={student.status === 'active' ? 'secondary' : 'outline'}>
                            {student.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Môn: {student.subjects.join(', ')}</span>
                          <span>•</span>
                          <span>Hoạt động cuối: {new Date(student.lastActive).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 text-center text-sm">
                        <div>
                          <div className="flex items-center gap-1 justify-center">
                            <Target className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">{student.progress}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Tiến độ</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 justify-center">
                            <BarChart3 className="h-3 w-3 text-green-600" />
                            <span className="font-medium">{student.quizScore}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Quiz</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 justify-center">
                            <Clock className="h-3 w-3 text-orange-600" />
                            <span className="font-medium">{student.studyStreak}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Streak</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 justify-center">
                            <Trophy className="h-3 w-3 text-yellow-600" />
                            <span className="font-medium">{student.achievements}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Thành tích</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(student)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tiến độ tổng thể</span>
                      <span>{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top học sinh</CardTitle>
                <CardDescription>Dựa trên điểm quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudents
                    .sort((a, b) => b.quizScore - a.quizScore)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                            }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <Badge variant="secondary">{student.quizScore}%</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Học sinh chăm chỉ</CardTitle>
                <CardDescription>Dựa trên thời gian học</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudents
                    .sort((a, b) => b.totalStudyTime - a.totalStudyTime)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <Badge variant="outline">{student.totalStudyTime}h</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Streak dài nhất</CardTitle>
                <CardDescription>Học liên tục nhiều ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudents
                    .sort((a, b) => b.studyStreak - a.studyStreak)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">🔥</div>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <Badge variant="destructive">{student.studyStreak} ngày</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích tổng quan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Điểm trung bình quiz</span>
                  <span className="font-medium">
                    {(mockStudents.reduce((sum, s) => sum + s.quizScore, 0) / mockStudents.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tiến độ trung bình</span>
                  <span className="font-medium">
                    {(mockStudents.reduce((sum, s) => sum + s.progress, 0) / mockStudents.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian học TB/tuần</span>
                  <span className="font-medium">
                    {(mockStudents.reduce((sum, s) => sum + s.totalStudyTime, 0) / mockStudents.length).toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tỷ lệ hoạt động</span>
                  <span className="font-medium text-green-600">
                    {Math.round((mockStudents.filter(s => s.status === 'active').length / mockStudents.length) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xu hướng học tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Học sinh cải thiện</span>
                  <span className="font-medium text-green-600">+15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tham gia quiz</span>
                  <span className="font-medium text-green-600">+8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hoàn thành bài tập</span>
                  <span className="font-medium text-blue-600">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian học TB</span>
                  <span className="font-medium text-orange-600">+3.2h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi tin nhắn</DialogTitle>
            <DialogDescription>
              Gửi tin nhắn tới {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Tiêu đề</Label>
              <Input id="subject" placeholder="Nhập tiêu đề tin nhắn" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Nội dung</Label>
              <Textarea
                id="message"
                placeholder="Nhập nội dung tin nhắn..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsMessageDialogOpen(false)}>
                Gửi tin nhắn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}