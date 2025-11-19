import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Users, Calendar, Clock, BookOpen, User, GraduationCap, AlertCircle } from 'lucide-react';
import { classApi, type Class } from '../../services/api';

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

      // Load class data - API đã populate thông tin teacher và students
      const response = await classApi.getById(classId!);
      const cls = response.data;
      setClassData(cls);


      if (cls.teacherId) {
        setTeacherInfo({
          username: (cls.teacherId as any)?.username || 'Không xác định',
          name: (cls.teacherId as any)?.name || 'name không có sẵn'
        });
      }


      if (cls.studentIds && cls.studentIds.length > 0) {
        setStudentInfo(cls.studentIds.map((student: any) => ({
          username: student?.username || 'Không xác định',
          name: student?.name || 'name không có sẵn'
        })));
      } else {
        setStudentInfo([]);
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
    return teacherInfo.name || 'name không có sẵn';
  };

  const getStudentName = (student: any, index: number) => {
    return student?.name || `Học sinh ${index + 1}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-sm" style={{
        '--scrollbar-width': '8px',
        '--scrollbar-track-color': '#f8fafc',
        '--scrollbar-thumb-color': '#cbd5e1',
        '--scrollbar-thumb-hover-color': '#94a3b8'
      } as React.CSSProperties}>
        <div className="p-4 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              {classData?.name || 'Chi tiết lớp học'}
            </DialogTitle>
            <DialogDescription>
              {classData?.subject || 'Thông tin chi tiết về lớp học'}
            </DialogDescription>
          </DialogHeader>
        </div>

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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6 pb-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tên lớp học</Label>
                        <p className="text-base font-medium">{classData.name || 'Chưa đặt tên'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Môn học</Label>
                        <p className="text-base font-medium">{classData.subject}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Lớp/Ngành</Label>
                        <p className="text-base font-medium">{classData.grade || 'Không xác định'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
                        <Badge variant={classData.isActive ? 'default' : 'secondary'} className="mt-1">
                          {classData.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xl font-semibold">{classData.studentIds?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Học sinh</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-xl font-semibold">{classData.maxStudents}</div>
                        <p className="text-sm text-muted-foreground">Sức chứa tối đa</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xl font-semibold">{classData.schedule?.length || 0}</p>
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
                          {teacherInfo?.username || 'Username không có sẵn'}
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
                                {student?.username || 'Username không có sẵn'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Lớp chưa có student tham gia</p>
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
              <ScrollBar orientation="vertical" className="w-4 bg-gray-200 hover:bg-gray-300" />
            </ScrollArea>
          </div>
        ) : null}

        <div className="border-t p-3 bg-gray-50">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}