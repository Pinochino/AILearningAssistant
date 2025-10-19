import { React, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, Plus, Edit, Trash2, Eye, Users, BookOpen, Loader2 } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { subjectApi, type Subject } from '../../services/api';

export function SubjectManagement() {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    department: '',
    description: '',
  });

  // Load subjects from API
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subjectApi.getAll();
      setSubjects(response.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách môn học');
      console.error('Error loading subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      await subjectApi.create({
        ...formData,
        isActive: true,
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', code: '', credits: 3, department: '', description: '' });
      loadSubjects(); // Reload list
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể tạo môn học'));
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa môn học này?')) return;
    
    try {
      await subjectApi.delete(id);
      loadSubjects(); // Reload list
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể xóa môn học'));
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    return subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý môn học</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các môn học trong hệ thống
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo môn học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo môn học mới</DialogTitle>
              <DialogDescription>
                Tạo môn học mới trong hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectName">Tên môn học</Label>
                <Input 
                  id="subjectName" 
                  placeholder="VD: Toán học cao cấp" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Mã môn học</Label>
                <Input 
                  id="subjectCode" 
                  placeholder="VD: MATH101" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Khoa</Label>
                <Input 
                  id="department" 
                  placeholder="VD: Khoa Toán" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Số tín chỉ</Label>
                <Input 
                  id="credits" 
                  type="number" 
                  min="1" 
                  max="10"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea 
                  id="description" 
                  placeholder="Mô tả chi tiết về môn học" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateSubject}>
                  Tạo môn học
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
              placeholder="Tìm kiếm môn học theo tên, mã hoặc khoa..."
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

      {/* Subject List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => (
            <Card key={subject._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription>
                      {subject.code} • {subject.credits} tín chỉ
                    </CardDescription>
                  </div>
                  <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                    {subject.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Department */}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{subject.department}</span>
                </div>

                {/* Description */}
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subject.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Tạo: {new Date(subject.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateTo('edit-subject', { id: subject._id })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteSubject(subject._id)}
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
      {!loading && !error && filteredSubjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Không tìm thấy môn học nào' : 'Chưa có môn học nào'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!loading && !error && subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{subjects.length}</p>
              <p className="text-sm text-muted-foreground">Tổng môn học</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {subjects.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {subjects.reduce((sum, s) => sum + s.credits, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Tổng tín chỉ</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}