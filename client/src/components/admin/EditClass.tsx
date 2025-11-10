import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { classApi, subjectApi, type Class, type Subject } from '../../services/api';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function EditClass() {
  const { navigateTo, currentParams } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    teacherId: '',
    maxStudents: 30,
    isActive: true,
    schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
  });

  const classId = currentParams?.id;

  useEffect(() => {
    if (classId) {
      loadClassData();
      loadSubjects();
    } else {
      setError('Không tìm thấy ID lớp học');
      setLoading(false);
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classApi.getById(classId!);
      const cls = response.data;
      setClassData(cls);
      
      // Extract teacherId - handle both string and object formats
      let teacherIdValue = cls.teacherId;
      if (typeof teacherIdValue === 'object' && teacherIdValue !== null) {
        teacherIdValue = (teacherIdValue as any)._id || (teacherIdValue as any).id || '';
      }
      
      // Set form data
      setFormData({
        subject: cls.subject,
        grade: cls.grade || '',
        teacherId: String(teacherIdValue || ''),
        maxStudents: cls.maxStudents,
        isActive: cls.isActive,
        schedule: cls.schedule,
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin lớp học');
      console.error('Error loading class:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectApi.getAll();
      setSubjects(response.data);
    } catch (err: any) {
      console.error('Error loading subjects:', err);
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.subject.trim()) {
        toast.error('Vui lòng nhập môn học');
        return;
      }
      if (!formData.teacherId || !String(formData.teacherId).trim()) {
        toast.error('Vui lòng nhập username giáo viên');
        return;
      }

      setSaving(true);
      
      // Prepare data - clean up empty fields
      const updateData: any = {
        subject: formData.subject.trim(),
        teacherId: String(formData.teacherId).trim(),
        maxStudents: formData.maxStudents,
        schedule: formData.schedule,
        isActive: formData.isActive,
      };

      // Only include grade if it's not empty
      if (formData.grade && formData.grade.trim()) {
        updateData.grade = formData.grade.trim();
      }

      console.log('Updating class with data:', updateData); // Debug
      
      await classApi.update(classId!, updateData);
      toast.success('Đã cập nhật lớp học thành công!');
      navigateTo('classes');
    } catch (err: any) {
      console.error('Error updating class:', err); // Debug
      toast.error('Lỗi: ' + (err.message || 'Không thể cập nhật lớp học'));
    } finally {
      setSaving(false);
    }
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
    });
  };

  const removeScheduleSlot = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const updateScheduleSlot = (index: number, field: string, value: any) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigateTo('classes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-4 text-center text-destructive">
            {error || 'Không tìm thấy lớp học'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigateTo('classes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1>Chỉnh sửa lớp học</h1>
            <p className="text-muted-foreground">
              Cập nhật thông tin lớp học: {classData.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin lớp học</CardTitle>
          <CardDescription>
            Chỉnh sửa thông tin cơ bản của lớp học
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Môn học</Label>
              <Input 
                id="subject" 
                placeholder="VD: Toán học, Vật lý, Hóa học..." 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Lớp/Ngành (không bắt buộc)</Label>
              <Input 
                id="grade" 
                placeholder="VD: 12A1, IT, MME, K65..." 
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username giáo viên</Label>
              <Input 
                id="username" 
                placeholder="Nhập username giáo viên" 
                value={formData.teacherId}
                onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Số học sinh tối đa</Label>
              <Input 
                id="maxStudents" 
                type="number" 
                min="1" 
                max="100"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="isActive">Lớp đang hoạt động</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lịch học</CardTitle>
              <CardDescription>
                Thiết lập thời gian học của lớp
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm buổi học
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.schedule.map((slot, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">Thứ</Label>
                  <Select 
                    value={slot.dayOfWeek.toString()} 
                    onValueChange={(val: string) => updateScheduleSlot(index, 'dayOfWeek', parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Bắt đầu</Label>
                  <Input 
                    type="time" 
                    value={slot.startTime}
                    onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Kết thúc</Label>
                  <Input 
                    type="time" 
                    value={slot.endTime}
                    onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                  />
                </div>
              </div>
              {formData.schedule.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 w-full text-destructive"
                  onClick={() => removeScheduleSlot(index)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Xóa buổi học này
                </Button>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Class Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bổ sung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số học sinh hiện tại:</span>
            <span className="font-medium">{classData.studentIds.length}/{classData.maxStudents}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ngày tạo:</span>
            <span className="font-medium">{new Date(classData.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cập nhật lần cuối:</span>
            <span className="font-medium">{new Date(classData.updatedAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trạng thái:</span>
            <Badge variant={classData.isActive ? 'default' : 'secondary'}>
              {classData.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
