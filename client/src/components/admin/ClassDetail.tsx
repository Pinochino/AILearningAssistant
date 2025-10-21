import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Users, Calendar, Clock, BookOpen, User, GraduationCap, AlertCircle } from 'lucide-react';
import { classApi, type Class } from '../../services/api';

// Hàm đơn giản để lấy thông tin user theo ID
const getUserById = async (userId: string) => {
  const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:9000/api';
  const token = localStorage.getItem('accessToken');

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch user');
  } catch (error) {
    console.error('Error fetching user:', error);
    return { data: { username: 'Không xác định', email: 'unknown@example.com' } };
  }
};

interface ClassDetailProps {
  classId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClassDetail({ classId, isOpen, onClose }: ClassDetailProps) {
  const [classData, setClassData] = useState<Class | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId && isOpen) {
      loadClassDetail();
    }
  }, [classId, isOpen]);

  const loadClassDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load class data with populated teacher and students
      const response = await classApi.getById(classId!);
      const cls = response.data;
      setClassData(cls);

      // Load teacher info if teacherId exists
      if (cls.teacherId) {
        try {
          const teacherResponse = await getUserById(typeof cls.teacherId === 'string' ? cls.teacherId : (cls.teacherId as any)?._id);
          setTeacherInfo(teacherResponse.data);
        } catch (teacherErr) {
          console.warn('Could not load teacher info:', teacherErr);
        }
      }

      // Load student info if there are students
      if (cls.studentIds && cls.studentIds.length > 0) {
        try {
          const studentPromises = cls.studentIds.map((studentId: string) =>
            getUserById(studentId).catch(err => ({ data: { username: 'Unknown', email: 'unknown@example.com' } }))
          );
          const studentResults = await Promise.all(studentPromises);
          setStudentInfo(studentResults.map(result => result.data));
        } catch (studentErr) {
          console.warn('Could not load student info:', studentErr);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin lớp học');
      console.error('Error loading class detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = () => {
    if (!teacherInfo) return 'Không xác định';

    // Handle both populated and non-populated teacher data
    if (typeof classData?.teacherId === 'object') {
      return (classData.teacherId as any)?.username || (classData.teacherId as any)?.email || 'Không xác định';
    }

    return teacherInfo.username || teacherInfo.email || 'Không xác định';
  };

  const getStudentName = (student: any, index: number) => {
    return student?.username || student?.email || `Học sinh ${index + 1}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chi tiết lớp học
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về lớp học bao gồm giáo viên, học sinh và lịch học
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="p-4 text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              {error}
            </CardContent>
          </Card>
        ) : classData ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tên lớp học</Label>
                      <p className="text-lg font-semibold">{classData.name || 'Chưa đặt tên'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Môn học</Label>
                      <p className="text-lg font-semibold">{classData.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Lớp/Ngành</Label>
                      <p className="text-lg font-semibold">{classData.grade || 'Không xác định'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
                      <Badge variant={classData.isActive ? 'default' : 'secondary'} className="mt-1">
                        {classData.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{classData.studentIds?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Học sinh</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{classData.maxStudents}</div>
                      <p className="text-sm text-muted-foreground">Sức chứa tối đa</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{classData.schedule?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Buổi học/tuần</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Teacher Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin giáo viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{getTeacherName()}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacherInfo?.email || 'Email không có sẵn'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Lịch học
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classData.schedule && classData.schedule.length > 0 ? (
                    <div className="space-y-3">
                      {classData.schedule.map((slot, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][slot.dayOfWeek]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Chưa có lịch học nào được thiết lập</p>
                  )}
                </CardContent>
              </Card>

              {/* Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Danh sách học sinh ({classData.studentIds?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentInfo.length > 0 ? (
                    <div className="space-y-3">
                      {studentInfo.map((student, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{getStudentName(student, index)}</p>
                            <p className="text-sm text-muted-foreground">
                              {student?.email || 'Email không có sẵn'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Chưa có học sinh nào đăng ký lớp học này</p>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin hệ thống</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ngày tạo:</span>
                    <span>{new Date(classData.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                    <span>{new Date(classData.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : null}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
