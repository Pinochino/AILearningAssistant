import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Users, Calendar, Clock, Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { classApi, type Class } from '../../services/api';
import { handleApi } from '../../api/handleApi';
import { toast } from 'sonner';
import { ClassDetail } from './ClassDetail';

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];


export function ClassManagement() {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Load teachers from API (for debugging purposes)
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      console.log('🔍 Loading teachers...');

      // Use the authenticated API service
      const response = await handleApi({
        url: '/users/list',
        method: 'GET',
        withCredentials: true
      });

      const users = response?.data?.data || [];
      console.log('📋 Users loaded:', users.length);

      // Filter teachers based on role
      const teacherUsers = users.filter((user: any) => {
        // Check different possible role structures
        const userRoles = user.roles || [];
        return userRoles.some((role: any) => {
          const roleName = typeof role === 'string' ? role : role?.name;
          return roleName && roleName.toLowerCase() === 'teacher';
        });
      });

      console.log('👩‍🏫 Teachers found:', teacherUsers.length);
      setTeachers(teacherUsers);

    } catch (err: any) {
      console.error('❌ Error loading teachers:', err);
      // Show error to user
      toast.error('Không thể tải danh sách giáo viên');
      setTeachers([]);
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
  }, [currentPage, searchTerm]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading classes...');

      const response = await classApi.getAll({
        page: currentPage,
        limit: 10,
        subject: searchTerm || undefined,
      });

      console.log('📦 Full response:', response);
      console.log('📦 Response data:', response.data);
      console.log('📦 Response data type:', typeof response.data);

      // Handle different response formats
      if (response?.data?.items && Array.isArray(response.data.items)) {
        // Format: { data: { items: [...], pagination: {...} } }
        setClasses(response.data.items);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalClasses(response.data.pagination?.totalItems || response.data.items.length);
      } else if (response?.data && Array.isArray(response.data)) {
        // Format: { data: [...] }
        setClasses(response.data);
        setTotalPages(1);
        setTotalClasses(response.data.length);
      } else if (Array.isArray(response)) {
        // Format: [...]
        setClasses(response);
        setTotalPages(1);
        setTotalClasses(response.length);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setClasses([]);
        setTotalPages(1);
        setTotalClasses(0);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách lớp học');
      console.error('❌ Error loading classes:', err);
      setClasses([]);
      setTotalClasses(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      // Validation
      if (!formData.subject.trim()) {
        toast.error('Vui lòng nhập môn học');
        return;
      }
      if (!formData.teacherId.trim()) {
        toast.error('Vui lòng nhập username giáo viên');
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
      };

      // Only include grade if it's not empty
      if (formData.grade && formData.grade.trim()) {
        classData.grade = formData.grade.trim();
      }

      console.log('Creating class with data:', classData); // Debug

      const response = await classApi.create(classData);
      console.log('Create response:', response); // Debug

      setIsCreateDialogOpen(false);
      setFormData({
        subject: '',
        grade: '',
        teacherId: '',
        maxStudents: 30,
        schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }],
      });

      // Reload classes to get updated list including the new class
      await loadClasses();

      toast.success('Tạo lớp học thành công!');
    } catch (err: any) {
      console.error('Error creating class:', err); // Debug
      toast.error('Lỗi: ' + (err.message || 'Không thể tạo lớp học'));
    }
  };

  const handleViewClass = (cls: Class) => {
    setSelectedClassId(cls._id);
    setIsDetailDialogOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);

    // Handle teacher data - check if it's populated
    let teacherUsername = '';
    if (cls.teacherId && typeof cls.teacherId === 'object' && cls.teacherId !== null) {
      // Teacher is populated, get the username
      teacherUsername = (cls.teacherId as any).username || '';
    }

    setEditFormData({
      subject: cls.subject,
      grade: cls.grade || '',
      teacherId: teacherUsername || String(cls.teacherId || ''), // Use username if available, otherwise fallback to ID
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
        toast.error('Vui lòng nhập môn học');
        return;
      }
      if (!editFormData.teacherId.trim()) {
        toast.error('Vui lòng nhập tên đăng nhập của giáo viên');
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
      toast.success('Cập nhật lớp học thành công!');
    } catch (err: any) {
      console.error('Error updating class:', err);
      toast.error('Lỗi: ' + (err.message || 'Không thể cập nhật lớp học'));
    }
  };

  const handleDeleteClass = (cls: Class) => {
    setClassToDelete(cls);
    setIsDeleteDialogOpen(true);
  };

  // Helper function to get teacher's display name
  const getTeacherDisplayName = (teacherId: any) => {
    if (!teacherId) return 'Không xác định';

    // If it's a string (just the ID), try to find the teacher in the teachers list
    if (typeof teacherId === 'string') {
      const teacher = teachers.find(t => t._id === teacherId);
      return teacher?.name || teacher?.username || teacherId;
    }

    // If it's an object with name property (populated teacher)
    if (typeof teacherId === 'object' && teacherId !== null) {
      return teacherId.name || teacherId.username || 'Không xác định';
    }

    return 'Không xác định';
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      await classApi.delete(classToDelete._id);
      loadClasses(); // Reload list
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
      toast.success('Xóa lớp học thành công!');
    } catch (err: any) {
      console.error('Error deleting class:', err);
      toast.error('Lỗi: ' + (err.message || 'Không thể xóa lớp học'));
    }
  };

  const cancelDeleteClass = () => {
    setIsDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const addScheduleSlot = (isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        schedule: [
          ...prev.schedule,
          { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }
        ]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        schedule: [
          ...prev.schedule,
          { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }
        ]
      }));
    }
  };

  const removeScheduleSlot = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index),
      }));
    }
  };

  const updateScheduleSlot = (index: number, field: string, value: any, isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => {
        const newSchedule = [...prev.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        return { ...prev, schedule: newSchedule };
      });
    } else {
      setFormData(prev => {
        const newSchedule = [...prev.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        return { ...prev, schedule: newSchedule };
      });
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Use all classes as we're filtering on the server side
  const filteredClasses = classes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý lớp học</h1>
          <p className="text-muted-foreground">
            Danh sách lớp học ({totalClasses})
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Tạo lớp học mới
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='pb-6'>Tạo lớp học mới</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='subject'>Môn học</Label>
                <Input
                  id='subject'
                  placeholder='Nhập môn học'
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='grade'>Lớp/Ngành (không bắt buộc)</Label>
                <Input
                  id='grade'
                  placeholder='Nhập lớp ngành (có thể bỏ trống)'
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
                <p className='text-xs text-muted-foreground'>Nhập lớp cụ thể hoặc ngành. Để trống nếu áp dụng chung.</p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='teacherId'>Giáo viên</Label>
                <Input
                  id='teacherId'
                  placeholder='Nhập tên đăng nhập của giáo viên'
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                />
                <p className='text-xs text-muted-foreground'>Nhập tên đăng nhập chính xác của giáo viên từ hệ thống</p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='maxStudents'>Số học sinh tối đa</Label>
                <Input
                  id='maxStudents'
                  type='number'
                  min='1'
                  max='100'
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                />
              </div>

              {/* Schedule */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between pb-2'>
                  <Label>Lịch học</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={(e: { preventDefault: () => void; stopPropagation: () => void }) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addScheduleSlot()
                    }}
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Thêm buổi học
                  </Button>
                </div>
                {formData.schedule.map((slot, index) => (
                  <Card key={index} className='p-4'>
                    <div className='grid grid-cols-3 gap-3 w-full'>
                      <div>
                        <Label className='text-xs p-2'>Thứ</Label>
                        <Select
                          value={slot.dayOfWeek.toString()}
                          onValueChange={(val: string) => updateScheduleSlot(index, 'dayOfWeek', parseInt(val))}
                        >
                          <SelectTrigger className='w-full h-9 text-sm'>
                            <SelectValue placeholder='Chọn thứ' />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className='text-xs p-2'>Bắt đầu</Label>
                        <Input
                          type='time'
                          value={slot.startTime}
                          onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                          className='w-full h-9 text-sm border rounded-md px-3'
                        />
                      </div>

                      <div>
                        <Label className='text-xs p-2'>Kết thúc</Label>
                        <Input
                          type='time'
                          value={slot.endTime}
                          onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                          className='w-full h-9 text-sm border rounded-md px-3'
                        />
                      </div>
                    </div>
                    {formData.schedule.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='mt-2 w-full text-destructive'
                        onClick={() => removeScheduleSlot(index)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateClass}>Tạo lớp học</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
              <DialogDescription className='pb-6'>Cập nhật thông tin lớp học</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-subject'>Môn học</Label>
                <Input
                  id='edit-subject'
                  placeholder='VD: Toán học, Vật lý, Hóa học...'
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-grade'>Lớp/Ngành (không bắt buộc)</Label>
                <Input
                  id='edit-grade'
                  placeholder='VD: 12A1, IT, MME, K65... (có thể để trống)'
                  value={editFormData.grade}
                  onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                />
                <p className='text-xs text-muted-foreground'>
                  Nhập lớp cụ thể (12A1, 10B...) hoặc ngành (IT, MME...). Để trống nếu áp dụng chung.
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-teacherId'>Giáo viên</Label>
                <Input
                  id='edit-teacherId'
                  placeholder='Nhập username giáo viên (VD: teacher1, admin, teacher2...)'
                  value={editFormData.teacherId}
                  onChange={(e) => setEditFormData({ ...editFormData, teacherId: e.target.value })}
                />
                <p className='text-xs text-muted-foreground'>
                  Nhập username giáo viên mới (để trống nếu không muốn thay đổi)
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-maxStudents'>Số học sinh tối đa</Label>
                <Input
                  id='edit-maxStudents'
                  type='number'
                  min='1'
                  max='100'
                  value={editFormData.maxStudents}
                  onChange={(e) => setEditFormData({ ...editFormData, maxStudents: parseInt(e.target.value) })}
                />
              </div>

              {/* Schedule */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between pb-2'>
                  <Label>Lịch học</Label>
                  <Button type='button' variant='outline' size='sm' onClick={() => addScheduleSlot(true)}>
                    <Plus className='h-4 w-4 mr-1' />
                    Thêm buổi học
                  </Button>
                </div>
                {editFormData.schedule.map((slot, index) => (
                  <Card key={index} className='p-4'>
                    <div className='grid grid-cols-3 gap-3 w-full'>
                      <div className='col-span-2'>
                        <Label className='text-xs p-2'>Thứ</Label>
                        <Select
                          value={slot.dayOfWeek.toString()}
                          onValueChange={(val: string) => updateScheduleSlot(index, 'dayOfWeek', parseInt(val), true)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className='text-xs p-2'>Bắt đầu</Label>
                        <Input
                          type='time'
                          value={slot.startTime}
                          onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value, true)}
                        />
                      </div>
                      <div>
                        <Label className='text-xs p-2'>Kết thúc</Label>
                        <Input
                          type='time'
                          value={slot.endTime}
                          onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value, true)}
                        />
                      </div>
                    </div>
                    {editFormData.schedule.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='mt-2 w-full text-destructive'
                        onClick={() => removeScheduleSlot(index, true)}
                      >
                        Xóa buổi học này
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingClass(null)
                    setEditFormData({
                      subject: '',
                      grade: '',
                      teacherId: '',
                      maxStudents: 30,
                      schedule: [{ dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }]
                    })
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleUpdateClass}>Cập nhật</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4" style={{paddingLeft: 0, paddingRight: 0}}>
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm theo tên môn học..."
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-input border-gray-300 focus-visible:ring-1 focus-visible:ring-ring"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
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
                      GV: {getTeacherDisplayName(cls.teacherId)}
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
                    <Button variant="outline" size="sm" onClick={() => handleViewClass(cls)}>
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
                      onClick={() => handleDeleteClass(cls)}
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
          <CardContent className="p-12 text-center" style={{paddingTop: '24px'}}>
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (!searchTerm || classes.length > 10) && (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalClasses}</p>
              <p className="text-sm text-muted-foreground">Tổng lớp học</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {totalClasses}
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
        </div>
      )}

      {/* Class Detail Dialog */}
      <ClassDetail
        classId={selectedClassId}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedClassId(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa lớp học
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn xóa lớp học này?</p>
              {classToDelete && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{classToDelete.name || 'Tên lớp học'}</p>
                  <p className="text-sm text-muted-foreground">{classToDelete.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {(classToDelete.studentIds || []).length} học sinh đã đăng ký
                  </p>
                </div>
              )}
              <p className="text-sm text-destructive font-medium">
                Hành động này không thể hoàn tác!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDeleteClass}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteClass}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Xóa lớp học
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}