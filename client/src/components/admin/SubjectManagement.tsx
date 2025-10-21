import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Edit, Trash2, Eye, Users, BookOpen, Loader2 } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { subjectApi, type Subject } from '../../services/api';

export function SubjectManagement() {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subjects from API
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading subjects...');
      const response = await subjectApi.getAll();
      console.log('📦 Response:', response);
      console.log('📚 Subjects data:', response.data);
      setSubjects(response.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách môn học');
      console.error('❌ Error loading subjects:', err);
    } finally {
      setLoading(false);
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
            Quản lý các môn học trong hệ thống (môn học được tạo khi tạo lớp học mới)
          </p>
        </div>
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
              {searchTerm ? 'Không tìm thấy môn học nào' : 'Chưa có môn học nào trong hệ thống'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Môn học sẽ được tạo tự động khi tạo lớp học mới
              </p>
            )}
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