import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BookOpen,
  Loader2,
  Calendar,
} from 'lucide-react';
import { classApi, enrollmentApi, teacherApi, type Class, type ClassEnrollment } from '../../services/api';

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function EnrollmentApproval() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<ClassEnrollment[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<ClassEnrollment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Get current teacher ID from localStorage
  const getCurrentTeacherId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user._id;
    }
    return null;
  };

  // Load teacher's classes
  useEffect(() => {
    loadMyClasses();
  }, []);

  // Load pending enrollments when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadPendingEnrollments(selectedClass._id);
    }
  }, [selectedClass]);

  const loadMyClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const teacherId = getCurrentTeacherId();
      
      if (!teacherId) {
        setError('Vui lòng đăng nhập để xem danh sách lớp học');
        setLoading(false);
        return;
      }

      const response = await teacherApi.getClasses(teacherId, { limit: 100 });
      setMyClasses(response.data.items);
      
      // Auto-select first class if available
      if (response.data.items.length > 0) {
        setSelectedClass(response.data.items[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách lớp học');
      console.error('Error loading classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingEnrollments = async (classId: string) => {
    try {
      const response = await classApi.getPendingEnrollments(classId);
      setPendingEnrollments(response.data);
    } catch (err: any) {
      console.error('Error loading pending enrollments:', err);
      setPendingEnrollments([]);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    toast('Bạn có chắc muốn duyệt yêu cầu này?', {
      action: {
        label: 'Xác nhận',
        onClick: async () => {
          const toastId = toast.loading('Đang xử lý...');
          try {
            setProcessing(true);
            await enrollmentApi.approve(enrollmentId);
            
            // Reload data
            if (selectedClass) {
              await loadPendingEnrollments(selectedClass._id);
              await loadMyClasses();
            }
            
            toast.success('Đã duyệt yêu cầu thành công!', { id: toastId });
          } catch (err: any) {
            toast.error(`Lỗi: ${err.message || 'Không thể duyệt yêu cầu'}`, { id: toastId });
          } finally {
            setProcessing(false);
          }
        },
      },
      cancel: {
        label: 'Hủy',
        onClick: () => {}
      },
      duration: 10000
    });
  };

  const handleReject = (enrollment: ClassEnrollment) => {
    toast('Bạn có chắc muốn từ chối yêu cầu này?', {
      description: 'Vui lòng nhập lý do từ chối bên dưới',
      action: {
        label: 'Tiếp tục',
        onClick: () => {
          setSelectedEnrollment(enrollment);
          setIsRejectDialogOpen(true);
        }
      },
      cancel: {
        label: 'Hủy',
        onClick: () => {}
      },
      duration: 10000
    });
  };

  const handleSubmitReject = async () => {
    if (!selectedEnrollment) return;

    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    const toastId = toast.loading('Đang xử lý...');
    try {
      setProcessing(true);
      await enrollmentApi.reject(selectedEnrollment._id, rejectReason);
      
      // Reload data
      if (selectedClass) {
        await loadPendingEnrollments(selectedClass._id);
      }
      
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setSelectedEnrollment(null);
      toast.success('Đã từ chối yêu cầu!', { id: toastId });
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message || 'Không thể từ chối yêu cầu'}`, { id: toastId });
    } finally {
      setProcessing(false);
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
        <h1>Duyệt đăng ký lớp học</h1>
        <p className="text-muted-foreground">
          Xem xét và phê duyệt các yêu cầu tham gia lớp học
        </p>
      </div>

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

      {/* Class Selection */}
      {!loading && !error && myClasses.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chọn lớp học</CardTitle>
              <CardDescription>
                Chọn lớp học để xem các yêu cầu đăng ký
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClasses.map((cls) => (
                  <Card
                    key={cls._id}
                    className={`cursor-pointer transition-all ${
                      selectedClass?._id === cls._id
                        ? 'border-primary shadow-md'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedClass(cls)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{cls.name}</h3>
                        <p className="text-sm text-muted-foreground">{cls.subject}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{cls.studentIds.length}/{cls.maxStudents}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatSchedule(cls.schedule)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Enrollments */}
          {selectedClass && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Yêu cầu đăng ký - {selectedClass.name}</CardTitle>
                    <CardDescription>
                      {pendingEnrollments.length} yêu cầu đang chờ duyệt
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-4 w-4 mr-1" />
                    {pendingEnrollments.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEnrollments.map((enrollment) => (
                    <div key={enrollment._id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {((enrollment.studentId as any)?.username || 'S')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-medium">
                                {(enrollment.studentId as any)?.username || 'Sinh viên'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {(enrollment.studentId as any)?.email || ''}
                              </p>
                            </div>
                            {enrollment.message && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm font-medium mb-1">Lý do đăng ký:</p>
                                <p className="text-sm text-muted-foreground">{enrollment.message}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Đăng ký: {new Date(enrollment.requestedAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            onClick={() => handleApprove(enrollment._id)}
                            disabled={processing}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => handleReject(enrollment)}
                            disabled={processing}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {pendingEnrollments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Không có yêu cầu đăng ký nào đang chờ duyệt</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Classes */}
      {!loading && !error && myClasses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Bạn chưa có lớp học nào
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu đăng ký</DialogTitle>
            <DialogDescription>
              Vui lòng cho biết lý do từ chối để sinh viên hiểu rõ hơn
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-medium">
                  Sinh viên: {(selectedEnrollment.studentId as any)?.username || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(selectedEnrollment.studentId as any)?.email || ''}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Lý do từ chối (không bắt buộc)</Label>
                <Textarea
                  placeholder="Nhập lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRejectDialogOpen(false)}
                  disabled={processing}
                >
                  Hủy
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleSubmitReject}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận từ chối'
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
