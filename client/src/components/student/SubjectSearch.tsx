import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  User,
  Send,
  Calendar,
} from 'lucide-react';

const mockAvailableSubjects = [
  {
    id: '1',
    name: 'Toán học 12A1',
    description: 'Chương trình Toán học lớp 12A1 - Học kỳ 1',
    teacher: { name: 'Nguyễn Văn Giáo', email: 'teacher1@example.com', avatar: null },
    students: 35,
    maxStudents: 40,
    schedule: 'Thứ 2, 4, 6 - 8:00-9:30',
    room: 'Phòng A101',
    startDate: '2024-09-15',
    endDate: '2024-12-15',
    prerequisites: ['Toán học 11'],
    tags: ['Toán học', 'Lớp 12', 'Học kỳ 1'],
  },
  {
    id: '2',
    name: 'Vật lý 11B1',
    description: 'Chương trình Vật lý lớp 11B1 - Học kỳ 1',
    teacher: { name: 'Lê Văn Phúc', email: 'teacher2@example.com', avatar: null },
    students: 28,
    maxStudents: 35,
    schedule: 'Thứ 3, 5 - 10:00-11:30',
    room: 'Phòng B201',
    startDate: '2024-09-16',
    endDate: '2024-12-16',
    prerequisites: ['Vật lý 10'],
    tags: ['Vật lý', 'Lớp 11', 'Học kỳ 1'],
  },
  {
    id: '3',
    name: 'Hóa học 12C1',
    description: 'Chương trình Hóa học lớp 12C1 - Học kỳ 1',
    teacher: { name: 'Trần Thị Hóa', email: 'teacher3@example.com', avatar: null },
    students: 32,
    maxStudents: 40,
    schedule: 'Thứ 2, 4 - 14:00-15:30',
    room: 'Phòng C301',
    startDate: '2024-09-17',
    endDate: '2024-12-17',
    prerequisites: ['Hóa học 11'],
    tags: ['Hóa học', 'Lớp 12', 'Học kỳ 1'],
  },
  {
    id: '4',
    name: 'Toán nâng cao 12A2',
    description: 'Chương trình Toán nâng cao lớp 12A2 - Dành cho học sinh giỏi',
    teacher: { name: 'Phạm Minh Toán', email: 'teacher4@example.com', avatar: null },
    students: 18,
    maxStudents: 25,
    schedule: 'Thứ 3, 5 - 15:00-16:30',
    room: 'Phòng A102',
    startDate: '2024-09-18',
    endDate: '2024-12-18',
    prerequisites: ['Toán học 11', 'Điểm TB >= 8.0'],
    tags: ['Toán học', 'Nâng cao', 'Lớp 12'],
  },
];

export function SubjectSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [selectedSubjectForEnrollment, setSelectedSubjectForEnrollment] = useState<any>(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState('');

  const [availableSubjects, setAvailableSubjects] = useState(mockAvailableSubjects);
  const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);

  const filteredSubjects = availableSubjects.filter(subject => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === 'all' ||
      subject.tags.some(tag => tag.toLowerCase().includes(selectedSubject.toLowerCase()));

    return matchesSearch && matchesSubject;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEnroll = (subject: any) => {
    setSelectedSubjectForEnrollment(subject);
    setIsEnrollmentDialogOpen(true);
  };

  const handleSubmitEnrollment = () => {
    if (selectedSubjectForEnrollment) {
      // Xóa khỏi danh sách available
      setAvailableSubjects(prev =>
        prev.filter(s => s.id !== selectedSubjectForEnrollment.id)
      );

      // Thêm vào danh sách đã đăng ký với trạng thái pending
      setEnrolledSubjects(prev => [
        ...prev,
        {
          ...selectedSubjectForEnrollment,
          isEnrolled: true,
          enrollmentDate: new Date().toISOString(),
          status: 'pending',
        },
      ]);
    }

    setIsEnrollmentDialogOpen(false);
    setEnrollmentMessage('');
    setSelectedSubjectForEnrollment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Tìm kiếm môn học</h1>
        <p className="text-muted-foreground">
          Tìm kiếm và đăng ký tham gia các môn học
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm môn học, giáo viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn</SelectItem>
                <SelectItem value="toán">Toán học</SelectItem>
                <SelectItem value="vật lý">Vật lý</SelectItem>
                <SelectItem value="hóa">Hóa học</SelectItem>
                <SelectItem value="sinh">Sinh học</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Subjects */}
      {enrolledSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Môn học đã đăng ký</CardTitle>
            <CardDescription>
              Các môn học bạn đã đăng ký tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledSubjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">{subject.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Giáo viên: {subject.teacher.name}</span>
                        <span>•</span>
                        <span>Lịch: {subject.schedule}</span>
                        <span>•</span>
                        <span>Phòng: {subject.room}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(subject.status)}
                    <Badge variant="outline" className="text-xs">
                      {subject.students}/{subject.maxStudents} HS
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Môn học có sẵn</CardTitle>
          <CardDescription>
            Các môn học bạn có thể đăng ký tham gia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubjects.map((subject) => (
              <div key={subject.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{subject.name}</h3>
                      <p className="text-muted-foreground">{subject.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{subject.teacher.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{subject.students}/{subject.maxStudents} sinh viên</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{subject.schedule}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Phòng: {subject.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Bắt đầu</p>
                      <p className="font-medium">{new Date(subject.startDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <Button onClick={() => handleEnroll(subject)} className="gap-2">
                      <Send className="h-4 w-4" />
                      Đăng ký tham gia
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký tham gia môn học</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu tham gia môn học cho giáo viên phụ trách
            </DialogDescription>
          </DialogHeader>
          {selectedSubjectForEnrollment && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">{selectedSubjectForEnrollment.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedSubjectForEnrollment.description}</p>
                <p className="text-sm text-muted-foreground">
                  Giáo viên: {selectedSubjectForEnrollment.teacher.name}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Lý do muốn tham gia môn học này</Label>
                <Textarea
                  placeholder="Hãy chia sẻ lý do bạn muốn tham gia môn học này..."
                  value={enrollmentMessage}
                  onChange={(e) => setEnrollmentMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEnrollmentDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmitEnrollment}>
                  Gửi yêu cầu đăng ký
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
