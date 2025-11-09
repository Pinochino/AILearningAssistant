import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Save, Edit, Camera, User, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { toast } from 'sonner';

export function Profile() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API
  const mockProfileData = {
    id: user?.id || '1',
    name: user?.name || 'Nguyễn Văn A',
    username: user?.username || 'user',
    role: user?.role || 'student',
    avatar: user?.avatar,
    phone: '0123456789',
    joinDate: '2024-01-15',
    lastLogin: '2024-09-18',
  };

  // Form data
  const [formData, setFormData] = useState({
    name: mockProfileData.name,
    username: mockProfileData.username,
    phone: mockProfileData.phone,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update profile data (in real app, this would be an API call)
      console.log('Saving profile data:', formData);

      toast.success('Cập nhật thông tin thành công');
      setHasChanges(false);
      setIsEditing(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: mockProfileData.name,
      username: mockProfileData.username,
      phone: mockProfileData.phone,
    });
    setHasChanges(false);
    setIsEditing(false);
  };

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
          <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin hiển thị và trạng thái tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-xl">
                      {mockProfileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      variant="secondary"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{mockProfileData.name}</h3>
                <p className="text-sm text-muted-foreground">{mockProfileData.username}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={getRoleBadgeVariant(mockProfileData.role)}>
                    {getRoleLabel(mockProfileData.role)}
                  </Badge>
                  <Badge variant="secondary">
                    Hoạt động
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tham gia:</span>
                  <span>{new Date(mockProfileData.joinDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Đăng nhập cuối:</span>
                  <span>{new Date(mockProfileData.lastLogin).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân và cài đặt tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập họ và tên"
                    disabled={
                      !isEditing || mockProfileData.role === 'student' || mockProfileData.role === 'teacher'
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Nhập username"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
