import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ArrowLeft, Save, X, UserCheck, UserX } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { toast } from 'sonner'
import { useNavigation } from '../../hooks/useNavigation'

// Mock data - trong thực tế sẽ fetch từ API
const mockUsers = [
  {
    id: '1',
    name: 'Nguyễn Văn Giáo',
    email: 'teacher1@example.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Toán học', 'Vật lý'],
    joinDate: '2024-01-15',
    lastLogin: '2024-09-18',
    phone: '0123456789',
    address: 'Hà Nội',
    bio: 'Giáo viên có kinh nghiệm 5 năm trong lĩnh vực giáo dục'
  },
  {
    id: '2',
    name: 'Trần Thị Hóa',
    email: 'teacher2@example.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Hóa học', 'Sinh học'],
    joinDate: '2024-02-10',
    lastLogin: '2024-09-17',
    phone: '0987654321',
    address: 'TP.HCM',
    bio: 'Chuyên gia hóa học với nhiều năm kinh nghiệm'
  },
  {
    id: '3',
    name: 'Lê Minh Học',
    email: 'student1@example.com',
    role: 'student',
    status: 'active',
    subjects: ['Toán học', 'Vật lý', 'Hóa học'],
    joinDate: '2024-03-01',
    lastLogin: '2024-09-18',
    phone: '0369852147',
    address: 'Đà Nẵng',
    bio: 'Học sinh chăm chỉ, có tiềm năng trong các môn khoa học',
    studentId: 'SV2024001'
  },
  {
    id: '4',
    name: 'Phạm Thị Thông',
    email: 'student2@example.com',
    role: 'student',
    status: 'inactive',
    subjects: ['Toán học', 'Sinh học'],
    joinDate: '2024-03-05',
    lastLogin: '2024-09-10',
    phone: '0741258963',
    address: 'Cần Thơ',
    bio: 'Học sinh có năng khiếu về toán học',
    studentId: 'SV2024002'
  }
]

export function EditUser() {
  const { navigateTo, currentParams } = useNavigation()
  const userId = currentParams.userId
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    phone: '',
    address: '',
    bio: '',
    studentId: ''
  })

  // useEffect(() => {
  //   // Simulate API call
  //   const fetchUser = async () => {
  //     setIsLoading(true)
  //     try {
  //       // Simulate delay
  //       await new Promise((resolve) => setTimeout(resolve, 500))

  //       const foundUser = mockUsers.find((u) => u.id === userId)
  //       if (foundUser) {
  //         setUser(foundUser)
  //         setFormData({
  //           name: foundUser.name,
  //           email: foundUser.email,
  //           role: foundUser.role,
  //           status: foundUser.status,
  //           phone: foundUser.phone || '',
  //           address: foundUser.address || '',
  //           bio: foundUser.bio || '',
  //           studentId: foundUser.studentId || ''
  //         })
  //       }
  //     } catch (error) {
  //       toast.error('Không thể tải thông tin người dùng')
  //       navigateTo('users')
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   if (userId) {
  //     fetchUser()
  //   }
  // }, [userId, navigateTo])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user data (in real app, this would be an API call)
      console.log('Saving user data:', formData)

      toast.success('Cập nhật thông tin thành công')
      setHasChanges(false)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = formData.status === 'active' ? 'inactive' : 'active'
    handleInputChange('status', newStatus)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái')
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'teacher':
        return 'Giáo viên'
      case 'student':
        return 'Học sinh'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'teacher':
        return 'default'
      case 'student':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='text-center py-8'>
        <h2 className='text-2xl font-bold mb-4'>Không tìm thấy người dùng</h2>
        <p className='text-muted-foreground mb-4'>Người dùng này không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => navigateTo('users')}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' onClick={() => navigateTo('users')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Quay lại
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Chỉnh sửa người dùng</h1>
            <p className='text-muted-foreground'>Cập nhật thông tin và quyền hạn của người dùng</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={handleToggleStatus}
            className={formData.status === 'active' ? 'text-orange-600' : 'text-green-600'}
          >
            {formData.status === 'active' ? (
              <>
                <UserX className='h-4 w-4 mr-2' />
                Vô hiệu hóa
              </>
            ) : (
              <>
                <UserCheck className='h-4 w-4 mr-2' />
                Kích hoạt
              </>
            )}
          </Button>

          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className='gap-2'>
            <Save className='h-4 w-4' />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* User Info Card */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Thông tin hiển thị và trạng thái tài khoản</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-col items-center text-center'>
                <Avatar className='h-20 w-20 mb-4'>
                  <AvatarFallback className='text-lg'>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className='font-semibold text-lg'>{user.name}</h3>
                <p className='text-sm text-muted-foreground'>{user.email}</p>
                {formData.role === 'student' && formData.studentId && (
                  <p className='text-sm text-muted-foreground font-medium'>Mã sinh viên: {formData.studentId}</p>
                )}
                <div className='flex gap-2 mt-2'>
                  <Badge variant={getRoleBadgeVariant(formData.role)}>{getRoleLabel(formData.role)}</Badge>
                  <Badge variant={formData.status === 'active' ? 'secondary' : 'outline'}>
                    {formData.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tham gia:</span>
                  <span>{new Date(user.joinDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Đăng nhập cuối:</span>
                  <span>{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Chỉnh sửa thông tin</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân và cài đặt tài khoản</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Họ và tên *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder='Nhập họ và tên'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email *</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder='Nhập email'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Số điện thoại</Label>
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder='Nhập số điện thoại'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='role'>Vai trò *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn vai trò' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='admin'>Quản trị viên</SelectItem>
                      <SelectItem value='teacher'>Giáo viên</SelectItem>
                      <SelectItem value='student'>Học sinh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'student' && (
                  <div className='space-y-2'>
                    <Label htmlFor='studentId'>Mã sinh viên *</Label>
                    <Input
                      id='studentId'
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder='Nhập mã sinh viên'
                    />
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address'>Địa chỉ</Label>
                <Input
                  id='address'
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder='Nhập địa chỉ'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bio'>Giới thiệu</Label>
                <textarea
                  id='bio'
                  className='w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring'
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder='Nhập giới thiệu về người dùng'
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects Card (for teachers and students) */}
          {(formData.role === 'teacher' || formData.role === 'student') && (
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>Môn học</CardTitle>
                <CardDescription>
                  {formData.role === 'teacher'
                    ? 'Các môn học mà giáo viên này giảng dạy'
                    : 'Các môn học mà học sinh này đang theo học'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {user.subjects?.map((subject: string, index: number) => (
                    <Badge key={index} variant='outline'>
                      {subject}
                    </Badge>
                  ))}
                </div>
                <p className='text-sm text-muted-foreground mt-2'>
                  Để thay đổi môn học, vui lòng liên hệ quản trị viên hệ thống.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <Card className='border-destructive'>
        <CardHeader>
          <CardTitle className='text-destructive'>Vùng nguy hiểm</CardTitle>
          <CardDescription>Các hành động này không thể hoàn tác. Hãy cẩn thận!</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' className='gap-2'>
                <X className='h-4 w-4' />
                Xóa tài khoản
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa vĩnh viễn tài khoản của <strong>{user.name}</strong> và tất cả dữ liệu liên quan.
                  Điều này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  onClick={() => {
                    toast.error('Tính năng xóa tài khoản chưa được triển khai')
                  }}
                >
                  Xóa tài khoản
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
