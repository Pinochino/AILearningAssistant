import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Save, Edit, Camera, Calendar, ArrowLeft } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'
import { toast } from 'sonner'
import { useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'
import { useAuth } from '../hooks/useAuth'
import { handleApi } from '../api/handleApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function Profile() {
  const { navigateTo } = useNavigation()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // const { user } = useAppSelector((state: RootState) => state.auth.login)
  const { user, setUser } = useAuth()

  const [userData, setUserData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    role: user?.role || 'student',
    isActive: user?.isActive ?? true,
    createdAt: user?.createdAt || new Date(),
    lastLogin: user?.lastLogin || null,
    avatar: user?.avatar || ''
  });


  console.log('user login', user)

  const queryClient = useQueryClient()

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  })

  const handleEditUser = () => {
    if (!formData.username || !formData.name) {
      toast.error('Họ tên và Username là bắt buộc')
      return
    }
    console.log('Sending update: ', formData)
    updateUser()
  }

  const {
    isLoading: editUserLoading,
    mutate: updateUser,
    error: editUserError
  } = useMutation({
    mutationFn: async () => {
      const res = await handleApi({
        url: `/users/update/${user?.id}`,
        method: 'PUT',
        data: formData,
        withCredentials: true
      })

      const result = await res.data
      return result
    },
    onSuccess: (updatedData) => {
      const userFromServer = updatedData?.data; // <-- Lấy data bên trong response
      if (!userFromServer) return;

      queryClient.invalidateQueries({ queryKey: [`detail-infor-${user?.id}`, user?.id] });
      queryClient.invalidateQueries({ queryKey: [`users`] });

      console.log("updated user: ", userFromServer);

      setUser((prev: any) => ({
        ...prev!,
        name: userFromServer.name,
        username: userFromServer.username,
        avatar: userFromServer.avatar || prev?.avatar,
      }));

      toast.success('Cập nhật người dùng thành công!');
    },

    onError: (err: any) => {
      console.error('Update failed', err)
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật')
    }
  })

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

      // Update profile data (in real app, this would be an API call)
      console.log('Saving profile data:', formData)

      toast.success('Cập nhật thông tin thành công')
      setHasChanges(false)
      setIsEditing(false)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      username: ''
    })
    setHasChanges(false)
    setIsEditing(false)
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

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        username: user.username || '',
        role: user.role || 'student',
        isActive: user.isActive ?? true,
        createdAt: user.createdAt || new Date(),
        lastLogin: user.lastLogin || null,
        avatar: user.avatar || ''
      });
    }
  }, [user]);


  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex justify-between items-center '>
          <Button onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Quay lại danh sách
          </Button>
          <div style={{
            marginLeft: 20
          }}>
            <h1 className='text-2xl font-bold'>Hồ sơ cá nhân</h1>
            <p className='text-muted-foreground'>Quản lý thông tin cá nhân và cài đặt tài khoản</p>
          </div>
        </div>

      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Info Card */}
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
                      ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className='font-semibold text-lg'>{userData?.name}</h3>
                <p className='text-sm text-muted-foreground mb-3'>{userData?.username}</p>
                {/* {formData.role === 'student' && formData.studentId && (
                        <p className='text-sm text-muted-foreground font-medium'>Mã sinh viên: {formData._id}</p>
                      )} */}
                <div className='flex gap-2 mt-2'>
                  <Badge variant={getRoleBadgeVariant(userData?.role)}>{getRoleLabel(userData?.role)}</Badge>
                  <Badge variant={userData?.isActive === 'active' ? 'secondary' : 'outline'}>
                    {userData?.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tham gia:</span>
                  <span>{new Date(user?.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Đăng nhập cuối:</span>
                  <span>{user?.lastLogin ? new Date(user?.lastLogin).toLocaleDateString('vi-VN') : '8/11/2025'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân và cài đặt tài khoản</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='username'>Tên đăng nhập *</Label>
                  <Input
                    id='username'
                    placeholder={user?.username}
                    disabled
                    style={{
                      fontWeight: "bolder"
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='name'>Họ và tên *</Label>
                  <Input
                    id='name'
                    type='name'
                    placeholder={user?.name}
                    disabled
                    style={{
                      fontWeight: "bolder"
                    }}
                  />
                </div>
              </div>


            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}