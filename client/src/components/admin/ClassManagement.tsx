import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Users, Calendar, Clock, Loader2, BookOpen } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { classApi, subjectApi, type Class, type Subject } from '../../services/api';

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];


export function ClassManagement() {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Load teachers from API (for debugging purposes)
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      console.log('🔍 Loading teachers for debugging...');
      // Fetch users and filter for teachers
      const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:9000/api';

      // Try without authentication first for debugging
      const response = await fetch(`${API_URL}/users/list`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('📋 Teachers API response (no auth):', data);
      console.log('📋 Teachers data (no auth):', data?.data);

      if (Array.isArray(data?.data)) {
        // Debug: show all users first
        console.log('🔍 All users in response:', data.data);

        // Try different role formats
        const allUsers = data.data;
        console.log('🔍 All users with roles:', allUsers.map((u: any) => ({
          username: u.username || u.email,
          roles: u.roles,
          roleType: Array.isArray(u.roles) ? 'array' : typeof u.roles
        })));

        // Try different role filtering approaches
        const teacherUsers1 = allUsers.filter((user: any) =>
          user?.roles?.[0]?.name?.toLowerCase() === 'teacher'
        );
        const teacherUsers2 = allUsers.filter((user: any) =>
          user?.roles?.[0]?.toLowerCase() === 'teacher'
        );
        const teacherUsers3 = allUsers.filter((user: any) =>
          user?.role?.toLowerCase() === 'teacher'
        );
        const teacherUsers4 = allUsers.filter((user: any) =>
          user?.roles === 'teacher'
        );

        console.log('👩‍🏫 Teachers (roles[0].name):', teacherUsers1);
        console.log('👩‍🏫 Teachers (roles[0]):', teacherUsers2);
        console.log('👩‍🏫 Teachers (role):', teacherUsers3);
        console.log('👩‍🏫 Teachers (roles string):', teacherUsers4);

        // Use the first approach that finds teachers
        const finalTeachers = teacherUsers1.length > 0 ? teacherUsers1 :
                             teacherUsers2.length > 0 ? teacherUsers2 :
                             teacherUsers3.length > 0 ? teacherUsers3 :
                             teacherUsers4.length > 0 ? teacherUsers4 : [];

        console.log('👩‍🏫 Final teachers list:', finalTeachers);

        // Fallback: if no teachers found, use some default teachers
        if (finalTeachers.length === 0) {
          console.warn('⚠️ No teachers found from API, using fallback teachers');
          const fallbackTeachers = [
            { username: 'teacher1', email: 'teacher1@example.com', _id: 'teacher1' },
            { username: 'teacher2', email: 'teacher2@example.com', _id: 'teacher2' },
            { username: 'admin', email: 'admin@example.com', _id: 'admin' }
          ];
          setTeachers(fallbackTeachers);
        } else {
          setTeachers(finalTeachers);
        }
      } else {
        console.warn('❌ Teachers API response format invalid:', data);
        console.warn('❌ Expected data.data to be array, got:', typeof data?.data, data?.data);
      }
    } catch (err: any) {
      console.error('❌ Error loading teachers:', err);
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state for create
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    teacherId: '',
    maxStudents: 30,
    schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
  });

  // Form state for edit (separate from create)
  const [editFormData, setEditFormData] = useState({
    subject: '',
    grade: '',
    teacherId: '',
    maxStudents: 30,
    schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
  });

  // Load classes and subjects from API
  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, [currentPage]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading classes...');
      const response = await classApi.getAll({ page: currentPage, limit: 10 });
      console.log('📦 Full response:', response);
      console.log('📦 Response data:', response.data);
      console.log('📦 Response data type:', typeof response.data);
      
      // Handle different response formats
      if (response?.data?.items && Array.isArray(response.data.items)) {
        // Format: { data: { items: [...], pagination: {...} } }
        setClasses(response.data.items);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response?.data && Array.isArray(response.data)) {
        // Format: { data: [...] }
        setClasses(response.data);
        setTotalPages(1);
      } else if (Array.isArray(response)) {
        // Format: [...]
        setClasses(response);
        setTotalPages(1);
      } else {
        console.warn('Unexpected response format:', response);
        setClasses([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách lớp học');
      console.error('Error loading classes:', err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      console.log('🔍 Loading subjects for class management...');
      const response = await subjectApi.getAll();
      console.log('📚 Subjects response:', response);
      console.log('📚 Subjects data:', response.data);
      setSubjects(response.data || []);
    } catch (err: any) {
      console.error('❌ Error loading subjects:', err);
      setSubjects([]);
    }
  };

  const handleCreateClass = async () => {
    try {
      // Validation
      if (!formData.subject.trim()) {
        alert('Vui lòng nhập môn học');
        return;
      }
      if (!formData.teacherId.trim()) {
        alert('Vui lòng nhập username giáo viên');
        return;
      }

      // Use the entered teacher username directly
      const teacherId = formData.teacherId.trim();

      // Prepare data - remove empty grade and name (backend auto-generates name)
      const classData: any = {
        subject: formData.subject.trim(),
        teacherId: teacherId, // Use the entered username directly
        maxStudents: formData.maxStudents,
        schedule: formData.schedule,
        studentIds: [],
        isActive: true,
      };

      // Only include grade if it's not empty
      if (formData.grade && formData.grade.trim()) {
        classData.grade = formData.grade.trim();
      }

      console.log('Creating class with data:', classData); // Debug

      await classApi.create(classData);

      setIsCreateDialogOpen(false);
      setFormData({
        subject: '',
        grade: '',
        teacherId: '',
        maxStudents: 30,
        schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
      });
      loadClasses(); // Reload list
      alert('Tạo lớp học thành công!');
    } catch (err: any) {
      console.error('Error creating class:', err); // Debug
      alert('Lỗi: ' + (err.message || 'Không thể tạo lớp học'));
    }
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    // Extract teacherId - handle both string and object formats
    const teacherId = typeof cls.teacherId === 'string' 
      ? cls.teacherId 
      : (cls.teacherId as any)?._id || '';
    
    setEditFormData({
      subject: cls.subject,
      grade: cls.grade || '',
      teacherId: teacherId,
      maxStudents: cls.maxStudents,
      schedule: cls.schedule,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClass = async () => {
    if (!editingClass) return;

    try {
      // Validation
      if (!editFormData.subject.trim()) {
        alert('Vui lòng nhập môn học');
        return;
      }
      if (!editFormData.teacherId.trim()) {
        alert('Vui lòng nhập username giáo viên');
        return;
      }

      // Use the entered teacher username directly
      const teacherId = editFormData.teacherId.trim();

      // Prepare update data
      const updateData: any = {
        subject: editFormData.subject.trim(),
        teacherId: teacherId, // Use the validated teacher ID
        maxStudents: editFormData.maxStudents,
        schedule: editFormData.schedule,
      };

      // Include grade (can be empty string)
      updateData.grade = editFormData.grade.trim();

      console.log('Updating class with data:', updateData);

      await classApi.update(editingClass._id, updateData);

      setIsEditDialogOpen(false);
      setEditingClass(null);
      setEditFormData({
        subject: '',
        grade: '',
        teacherId: '',
        maxStudents: 30,
        schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
      });
      loadClasses();
      alert('Cập nhật lớp học thành công!');
    } catch (err: any) {
      console.error('Error updating class:', err);
      alert('Lỗi: ' + (err.message || 'Không thể cập nhật lớp học'));
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;
    
    try {
      await classApi.delete(id);
      loadClasses(); // Reload list
      alert('Xóa lớp học thành công!');
    } catch (err: any) {
      console.error('Error deleting class:', err);
      alert('Lỗi: ' + (err.message || 'Không thể xóa lớp học'));
    }
  };

  const addScheduleSlot = (isEdit = false) => {
    if (isEdit) {
      setEditFormData({
        ...editFormData,
        schedule: [...editFormData.schedule, { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
      });
    } else {
      setFormData({
        ...formData,
        schedule: [...formData.schedule, { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
      });
    }
  };

  const removeScheduleSlot = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditFormData({
        ...editFormData,
        schedule: editFormData.schedule.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        schedule: formData.schedule.filter((_, i) => i !== index),
      });
    }
  };

  const updateScheduleSlot = (index: number, field: string, value: any, isEdit = false) => {
    if (isEdit) {
      const newSchedule = [...editFormData.schedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      setEditFormData({ ...editFormData, schedule: newSchedule });
    } else {
      const newSchedule = [...formData.schedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      setFormData({ ...formData, schedule: newSchedule });
    }
  };

  const filteredClasses = classes.filter(cls => {
    const searchLower = (searchTerm || '').toLowerCase();
    const name = (cls.name || '').toLowerCase();
    const subject = (cls.subject || '').toLowerCase();
    return name.includes(searchLower) || subject.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý lớp học</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các lớp học trong hệ thống
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo lớp học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo lớp học mới</DialogTitle>
              <DialogDescription>
                Tạo lớp học mới và thiết lập lịch học
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  placeholder="VD: 12A1, IT, MME, K65... (có thể để trống)" 
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập lớp cụ thể (12A1, 10B...) hoặc ngành (IT, MME...). Để trống nếu áp dụng chung.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacherId">Giáo viên</Label>
                <Input
                  id="teacherId"
                  placeholder="Nhập username giáo viên (VD: teacher1, admin, teacher2...)"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập username chính xác của giáo viên từ hệ thống
                </p>
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
              
              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Lịch học</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm buổi học
                  </Button>
                </div>
                {formData.schedule.map((slot, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs">Thứ</Label>
                        <Select 
                          value={slot.dayOfWeek.toString()} 
                          onValueChange={(val) => updateScheduleSlot(index, 'dayOfWeek', parseInt(val))}
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
                        Xóa buổi học này
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateClass}>
                  Tạo lớp học
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin lớp học
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Môn học</Label>
                <Input 
                  id="edit-subject" 
                  placeholder="VD: Toán học, Vật lý, Hóa học..." 
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade">Lớp/Ngành (không bắt buộc)</Label>
                <Input 
                  id="edit-grade" 
                  placeholder="VD: 12A1, IT, MME, K65... (có thể để trống)" 
                  value={editFormData.grade}
                  onChange={(e) => setEditFormData({...editFormData, grade: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập lớp cụ thể (12A1, 10B...) hoặc ngành (IT, MME...). Để trống nếu áp dụng chung.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-teacherId">Giáo viên</Label>
                <Input
                  id="edit-teacherId"
                  placeholder="Nhập username giáo viên (VD: teacher1, admin, teacher2...)"
                  value={editFormData.teacherId}
                  onChange={(e) => setEditFormData({...editFormData, teacherId: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập username giáo viên mới (để trống nếu không muốn thay đổi)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxStudents">Số học sinh tối đa</Label>
                <Input 
                  id="edit-maxStudents" 
                  type="number" 
                  min="1" 
                  max="100"
                  value={editFormData.maxStudents}
                  onChange={(e) => setEditFormData({...editFormData, maxStudents: parseInt(e.target.value)})}
                />
              </div>
              
              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Lịch học</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addScheduleSlot(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm buổi học
                  </Button>
                </div>
                {editFormData.schedule.map((slot, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs">Thứ</Label>
                        <Select 
                          value={slot.dayOfWeek.toString()} 
                          onValueChange={(val) => updateScheduleSlot(index, 'dayOfWeek', parseInt(val), true)}
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
                          onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value, true)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Kết thúc</Label>
                        <Input 
                          type="time" 
                          value={slot.endTime}
                          onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value, true)}
                        />
                      </div>
                    </div>
                    {editFormData.schedule.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 w-full text-destructive"
                        onClick={() => removeScheduleSlot(index, true)}
                      >
                        Xóa buổi học này
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingClass(null);
                  setEditFormData({
                    subject: '',
                    grade: '',
                    teacherId: '',
                    maxStudents: 30,
                    schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
                  });
                }}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateClass}>
                  Cập nhật
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm lớp học theo tên hoặc môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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

      {/* Class List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{cls.name || 'Tên lớp học'}</CardTitle>
                    <CardDescription>{cls.subject || 'Môn học'}</CardDescription>
                  </div>
                  <Badge variant={cls.isActive ? 'default' : 'secondary'}>
                    {cls.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{(cls.studentIds || []).length}/{cls.maxStudents || 0} học sinh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{(cls.schedule || []).length} buổi/tuần</span>
                  </div>
                </div>

                {/* Teacher Info */}
                {cls.teacherId && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      GV: {typeof cls.teacherId === 'string' ? cls.teacherId : (cls.teacherId as any)?.username || (cls.teacherId as any)?.email || 'Không xác định'}
                    </span>
                  </div>
                )}

                {/* Schedule */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Lịch học:</p>
                  {(cls.schedule || []).map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {DAYS_OF_WEEK[slot.dayOfWeek]}: {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Tạo: {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClass(cls)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClass(cls._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClasses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
            </p>
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

      {/* Summary Stats */}
      {!loading && !error && classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{classes.length}</p>
              <p className="text-sm text-muted-foreground">Tổng lớp học</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {classes.filter(c => c.isActive !== false).length}
              </p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + (c.studentIds || []).length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Tổng học sinh</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + (c.maxStudents || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Sức chứa tối đa</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
