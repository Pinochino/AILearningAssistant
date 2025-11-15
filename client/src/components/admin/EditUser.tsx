import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ArrowLeft, Save, X, UserCheck, UserX, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigation } from '../../hooks/useNavigation'
import { GetUserInfor } from '../../hooks/getUserInfor'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApi } from '../../api/handleApi'
import { GetAllData } from '../../hooks/getAllData'
import { useAuth } from '../../hooks/useAuth'


interface IRole {
  id: string;
  name: string;
}

export function EditUser() {
  const { navigateTo, currentParams } = useNavigation()
  const userId = currentParams.userId
  const { user: currentUser, setUser } = useAuth()

  const queryClient = useQueryClient();

  const [user, setEditedUser] = useState<any>(null)
  // const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { isLoading, data, error } = GetUserInfor(userId);

  useEffect(() => {
    if (data?.data) {
      setEditedUser(data?.data);
    }
  }, [data]);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    removeRoleId: '',
    addRoleId: '',
    studentId: ''
  })
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        removeRoleId: user?.roles?.[0]?._id || '',
        addRoleId: '',
        studentId: user?.studentId || ''
      })
    }
  }, [user])

  const [roles, setRoles] = useState<IRole[]>([{
    id: '',
    name: ''
  }])

  const { data: roleList, isLoading: rolesListLoading } = GetAllData({ url: '/roles/list', name: 'RoleList' })


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  useEffect(() => {
    const roles = roleList?.data;

    if (roles) {
      setRoles(roles)
    }

  }, [roleList?.data, roles]);

  console.log('id: ', userId)

  const { isLoading: editUserLoading, mutate: updateUser } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await handleApi({
        url: `/users/update/${userId}`,
        method: 'PUT',
        data: payload,
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (updatedData: any) => {
      queryClient.invalidateQueries({ queryKey: [`detail-infor-${userId}`, userId] });
      queryClient.invalidateQueries({ queryKey: [`users`] });

      // If admin is editing their own profile, update global user state
      const updatedUser = updatedData?.data;
      if (updatedUser && currentUser?.id === userId) {
        const updatedGlobalUser = {
          ...currentUser!,
          name: updatedUser.name,
          username: updatedUser.username,
          avatar: updatedUser.avatar || currentUser?.avatar,
        };
        setUser(updatedGlobalUser);

        // Force update all components that depend on user state
        window.dispatchEvent(new Event('storage'));
      }

      toast.success('Cập nhật người dùng thành công!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    },
  });

  const handleEditUser = () => {
    if (!formData.username || !formData.name) {
      toast.error('Họ tên và Tên đăng nhập là bắt buộc')
      return
    }
    const payload: any = {
      username: formData.username,
      name: formData.name,
    };
    // Chỉ gửi removeRoleId/addRoleId khi người dùng thực sự đổi role
    if (formData.addRoleId && formData.addRoleId !== formData.removeRoleId) {
      payload.removeRoleId = formData.removeRoleId;
      payload.addRoleId = formData.addRoleId;
    }

    console.log('Sending update: ', payload);
    updateUser(payload);
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
      case 'ADMIN':
        return 'Quản trị viên'
      case 'TEACHER':
        return 'Giáo viên'
      case 'STUDENT':
        return 'Học sinh'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'TEACHER':
        return 'default'
      case 'STUDENT':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  console.log('loading: ', isLoading);

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


          <Button onClick={handleEditUser} disabled={!hasChanges || isSaving} className='gap-2'>
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
                  <AvatarFallback className='text-lg '>
                    {user?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className='font-semibold text-lg'>{user.name}</h3>
                <p className='text-sm text-muted-foreground mb-3'>{user.username}</p>
                {/* {formData.role === 'student' && formData.studentId && (
                  <p className='text-sm text-muted-foreground font-medium'>Mã sinh viên: {formData._id}</p>
                )} */}
                <div className='flex gap-2 mt-2'>
                  <div className='flex gap-2 mt-2'>
                    {user?.roles?.[0]?.name && (
                      <Badge variant={getRoleBadgeVariant(user.roles[0].name)}>
                        {getRoleLabel(user.roles[0].name)}
                      </Badge>
                    )}
                    <Badge variant={user?.isActive === 'active' ? 'secondary' : 'outline'}>
                      {user?.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tham gia:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Đăng nhập cuối:</span>
                  <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : "8/11/2025"}</span>
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
                  <Label htmlFor='name'>Tên đăng nhập *</Label>
                  <Input
                    id='name'
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder='Nhập tên đăng nhập'
                    autoComplete='new-name'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='name'>Họ và tên *</Label>
                  <Input
                    id='name'
                    type='text'
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder='Nhập họ và tên'
                    autoComplete='additional-name'
                  />
                </div>


                <div className='space-y-2'>
                  <Label htmlFor='role'>Vai trò *</Label>
                  <Select value={formData.addRoleId} onValueChange={(value: string) => handleInputChange('addRoleId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn vai trò' />
                    </SelectTrigger>
                    <SelectContent>

                      {roles.map((r, index) => {
                        console.log("e: ", r)
                        return (
                          (
                            <SelectItem value={r?._id} key={index}>{getRoleLabel(r.name.toUpperCase())}</SelectItem>
                          )
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>


              </div>



            </CardContent>
          </Card>

          {/* Subjects Card (for teachers and students) */}
          {((user?.roles?.[0]?.name || '').toLowerCase() === 'teacher' || (user?.roles?.[0]?.name || '').toLowerCase() === 'student') && (
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>Môn học</CardTitle>
                <CardDescription>
                  {(user?.roles?.[0]?.name || '').toLowerCase() === 'teacher'
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


    </div>
  )
}
