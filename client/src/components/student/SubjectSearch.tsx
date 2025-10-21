import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { enrollmentApi, classApi, type Class, type ClassEnrollment } from '../../services/api';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function SubjectSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [selectedClassForEnrollment, setSelectedClassForEnrollment] = useState<Class | null>(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<ClassEnrollment[]>([]);

  // Get current user ID from localStorage or useAuth
  const getCurrentUserId = () => {
    // Try multiple sources - check currentUser first (new key)
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id || user.userId;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Fallback: try to get from other storage keys
    const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (userId) return userId;
    
    return null;
  };

  // Load available classes and enrollments
  useEffect(() => {
    loadData();
  }, [currentPage, selectedSubject]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();
      
      console.log('Current User ID:', userId); // Debug
      console.log('LocalStorage currentUser:', localStorage.getItem('currentUser')); // Debug
      
      if (!userId) {
        setError('Vui lòng đăng nhập để xem danh sách lớp học');
        setLoading(false);
        return;
      }

      // Load available classes
      console.log('Fetching available classes for user:', userId); // Debug
      const classesResponse = await enrollmentApi.getAvailableClasses(userId, {
        page: currentPage,
        limit: 10,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
      });
      console.log('Classes response:', classesResponse); // Debug
      setAvailableClasses(classesResponse?.data?.items || []);
      setTotalPages(classesResponse?.data?.pagination?.totalPages || 1);

      // Load my enrollments (all statuses: pending, approved, rejected)
      console.log('Fetching enrollments for user:', userId); // Debug
      const enrollmentsResponse = await enrollmentApi.getStudentEnrollments(userId); // Get ALL enrollments
      console.log('Enrollments response:', enrollmentsResponse); // Debug

      // Handle null/undefined data safely
      const enrollmentsData = enrollmentsResponse?.data || [];
      console.log('Enrolled class IDs:', enrollmentsData.map((e: any) => ({
        classId: typeof e.classId === 'object' ? e.classId?._id : e.classId,
        status: e.status
      })).filter(item => item.classId)); // Debug

      // Filter out enrollments without valid classId
      const validEnrollments = enrollmentsData.filter((e: any) => {
        const classId = typeof e.classId === 'object' ? (e.classId as any)?._id : e.classId;
        return classId;
      });

      setMyEnrollments(validEnrollments);
    } catch (err: any) {
      console.error('Error loading data:', err); // Debug
      setError(err.message || 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = availableClasses.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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

  const handleEnroll = (cls: Class) => {
    setSelectedClassForEnrollment(cls);
    setIsEnrollmentDialogOpen(true);
  };

  const handleSubmitEnrollment = async () => {
    if (!selectedClassForEnrollment) return;

    try {
      setSubmitting(true);
      await classApi.requestEnrollment(selectedClassForEnrollment._id, enrollmentMessage);
      
      // Reload data to update lists
      await loadData();
      
      setIsEnrollmentDialogOpen(false);
      setEnrollmentMessage('');
      setSelectedClassForEnrollment(null);
      toast.success('Đã gửi yêu cầu đăng ký thành công!');
    } catch (err: any) {
      toast.error('Lỗi: ' + (err.message || 'Không thể gửi yêu cầu đăng ký'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatSchedule = (schedule: any[]) => {
    return schedule.map(s => 
      `${DAYS_OF_WEEK[s.dayOfWeek]} ${s.startTime}-${s.endTime}`
    ).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Tìm kiếm lớp học</h1>
        <p className="text-muted-foreground">
          Tìm kiếm và đăng ký tham gia các lớp học
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
                  placeholder="Tìm kiếm lớp học..."
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* My Enrollments */}
      {!loading && !error && myEnrollments.filter(e => e.status === 'approved' || e.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lớp học đã đăng ký</CardTitle>
            <CardDescription>
              Các lớp học bạn đã đăng ký tham gia (đã duyệt hoặc đang chờ duyệt)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEnrollments.filter(e => e.status === 'approved' || e.status === 'pending').map((enrollment) => (
                <div key={enrollment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{(enrollment.classId as any)?.name || 'Lớp học'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(enrollment.classId as any)?.subject || ''}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Đăng ký: {new Date(enrollment.requestedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(enrollment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Enrollments */}
      {!loading && !error && myEnrollments.filter(e => e.status === 'rejected').length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Lớp học bị từ chối</CardTitle>
            <CardDescription>
              Các lớp học bạn đã đăng ký nhưng bị từ chối (có thể đăng ký lại)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEnrollments.filter(e => e.status === 'rejected').map((enrollment) => (
                <div key={enrollment._id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{(enrollment.classId as any)?.name || 'Lớp học'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(enrollment.classId as any)?.subject || ''}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Đăng ký: {new Date(enrollment.requestedAt).toLocaleDateString('vi-VN')}</span>
                        {enrollment.message && (
                          <span className="text-orange-600">Lý do: {enrollment.message}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(enrollment.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Tìm lớp học bị từ chối trong danh sách có sẵn
                        const rejectedClass = availableClasses.find(cls => cls._id === (enrollment.classId as any)?._id);
                        if (rejectedClass) {
                          handleEnroll(rejectedClass);
                        }
                      }}
                    >
                      Đăng ký lại
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Classes */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Lớp học có sẵn</CardTitle>
            <CardDescription>
              Các lớp học bạn có thể đăng ký tham gia (chưa đăng ký)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClasses.map((cls) => (
                <div key={cls._id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-lg">{cls.name}</h3>
                        <p className="text-muted-foreground">{cls.subject}</p>
                        {cls.grade && (
                          <Badge variant="outline">{cls.grade}</Badge>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{cls.studentIds.length}/{cls.maxStudents} sinh viên</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatSchedule(cls.schedule)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={cls.isActive ? 'default' : 'secondary'}>
                        {cls.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                      <Button 
                        onClick={() => handleEnroll(cls)} 
                        className="gap-2"
                        disabled={!cls.isActive || cls.studentIds.length >= cls.maxStudents}
                      >
                        <Send className="h-4 w-4" />
                        Đăng ký tham gia
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredClasses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy lớp học nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trang trước
          </Button>
          <span className="flex items-center px-4">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký tham gia lớp học</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu tham gia lớp học cho giáo viên phụ trách
            </DialogDescription>
          </DialogHeader>
          {selectedClassForEnrollment && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">{selectedClassForEnrollment.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedClassForEnrollment.subject}</p>
                {selectedClassForEnrollment.grade && (
                  <p className="text-sm text-muted-foreground">Lớp: {selectedClassForEnrollment.grade}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Lý do muốn tham gia lớp học này (không bắt buộc)</Label>
                <Textarea
                  placeholder="Hãy chia sẻ lý do bạn muốn tham gia lớp học này..."
                  value={enrollmentMessage}
                  onChange={(e) => setEnrollmentMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEnrollmentDialogOpen(false)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleSubmitEnrollment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi yêu cầu đăng ký'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
