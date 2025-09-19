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
    email: user?.email || 'user@example.com',
    role: user?.role || 'student',
    avatar: user?.avatar,
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
    bio: 'Sinh viên năm 3 chuyên ngành Công nghệ thông tin',
    studentId: 'SV2024001',
    joinDate: '2024-01-15',
    lastLogin: '2024-09-18',
    subjects: ['Toán học', 'Vật lý', 'Hóa học', 'Tin học'],
    achievements: [
      { id: '1', title: 'Học sinh giỏi', date: '2024-06-15', description: 'Đạt danh hiệu học sinh giỏi học kỳ 2' },
      { id: '2', title: 'Tham gia cuộc thi', date: '2024-08-20', description: 'Tham gia cuộc thi lập trình cấp trường' },
    ],
  };

  // Form data
  const [formData, setFormData] = useState({
    name: mockProfileData.name,
    email: mockProfileData.email,
    phone: mockProfileData.phone,
    address: mockProfileData.address,
    bio: mockProfileData.bio,
    studentId: mockProfileData.studentId,
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
      email: mockProfileData.email,
      phone: mockProfileData.phone,
      address: mockProfileData.address,
      bio: mockProfileData.bio,
      studentId: mockProfileData.studentId,
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
                <p className="text-sm text-muted-foreground">{mockProfileData.email}</p>
                {mockProfileData.role === 'student' && mockProfileData.studentId && (
                  <p className="text-sm text-muted-foreground font-medium">
                    Mã sinh viên: {mockProfileData.studentId}
                  </p>
                )}
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập email"
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

                {mockProfileData.role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Mã sinh viên *</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="Nhập mã sinh viên"
                      disabled={true} // luôn luôn disable
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ"
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Nhập giới thiệu về bản thân"
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Môn học
              </CardTitle>
              <CardDescription>
                {mockProfileData.role === 'teacher'
                  ? 'Các môn học mà bạn giảng dạy'
                  : 'Các môn học mà bạn đang theo học'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockProfileData.subjects?.map((subject: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Thành tích</CardTitle>
              <CardDescription>
                Các thành tích và chứng chỉ đã đạt được
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProfileData.achievements?.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(achievement.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
