import { React, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';

interface User {
  _id: string;
  username: string;
  email: string;
  roles?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export function UserManagement() {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract the user's primary role as a lowercase string, regardless of data shape
  const getPrimaryRole = (user: any): string => {
    const first = user?.roles?.[0] ?? null;
    if (!first) return '';
    if (typeof first === 'object') {
      const name = (first as any)?.name ?? '';
      return String(name).toLowerCase();
    }
    return String(first).toLowerCase();
  };

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:9000/api';
      const response = await fetch(`${API_URL}/users/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users data:', data); // Debug
      const list = Array.isArray(data?.data) ? data.data : [];
      setUsers(list);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRole = true;
    if (selectedRole !== 'all') {
      const userRole = getPrimaryRole(user);
      matchesRole = userRole.includes(selectedRole.toLowerCase());
    }
    
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học sinh';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      case 'student': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản giáo viên và học sinh trong hệ thống
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>
                Thêm người dùng mới vào hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" placeholder="Nhập họ và tên" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Nhập email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    <SelectItem value="student">Học sinh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Tạo tài khoản
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="teacher">Giáo viên</SelectItem>
                <SelectItem value="student">Học sinh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Quản lý thông tin và quyền hạn của từng người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.username}</h3>
                      <Badge variant={getRoleBadgeVariant(getPrimaryRole(user))}>
                        {getRoleLabel(getPrimaryRole(user))}
                      </Badge>
                      <Badge variant={'secondary'}>
                        {'Hoạt động'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                      {user.updatedAt && (
                        <>
                          <span>•</span>
                          <span>Cập nhật: {new Date(user.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateTo('edit-user', { userId: user._id })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{users.filter(u => getPrimaryRole(u) === 'teacher').length}</p>
              <p className="text-sm text-muted-foreground">Giáo viên</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{users.filter(u => getPrimaryRole(u) === 'student').length}</p>
              <p className="text-sm text-muted-foreground">Học sinh</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
