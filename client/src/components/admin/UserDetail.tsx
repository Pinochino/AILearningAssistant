import  { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ArrowLeft, Save,  } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigation } from '../../hooks/useNavigation'
import { GetUserInfor } from '../../hooks/getUserInfor'
import {  useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApi } from '../../api/handleApi'
import { GetAllData } from '../../hooks/getAllData'


interface IRole {
  id: string;
  name: string;
}

export function UserDetailPage() {
  const { navigateTo, currentParams } = useNavigation()
  const userId = currentParams.userId

  const queryClient = useQueryClient();

  const [user, setUser] = useState<any>(null)
  // const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    removeRoleId: '',
    addRoleId: '',
    status: '',
    phone: '',
    address: '',
    bio: '',
    studentId: ''
  })

  const { isLoading, data, error } = GetUserInfor(userId);

  const [roles, setRoles] = useState<IRole[]>([{
    id: '',
    name: ''
  }])

  const { data: roleList, isLoading: rolesListLoading } = GetAllData({ url: '/roles/list', name: 'RoleList' })


  useEffect(() => {
    if (data?.data) {
      setUser(data?.data);
    }
  }, [data]);


  formData.removeRoleId = user?.roles[0]._id


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

  const { isLoading: editUserLoading, mutate: updateUser, error: editUserError } = useMutation({
    mutationFn: async () => {
      const res = await handleApi({
        url: `/users/update/${userId}`,
        method: 'PUT',
        data: formData,
        withCredentials: true,
      })

      const result = await res.data;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`detail-infor-${userId}`, userId] });
      queryClient.invalidateQueries({ queryKey: [`users`] });
      toast.success('Cập nhật người dùng thành công!');
    },
    onError: (err: any) => {
      console.error('Update failed', err);
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    },
  })

  const handleEditUser = () => {
    if (!formData.username || !formData.name) {
      toast.error('Họ tên và Username là bắt buộc');
      return;
    }
    console.log('Sending update: ', formData);
    updateUser();
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
      case 'SUPER_ADMIN':
        return 'Quản trị viên'
      case 'TEACHER':
        return 'Giáo viên'
      case 'USER':
        return 'Học sinh'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive'
      case 'TEACHER':
        return 'default'
      case 'USER':
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
            <h1 className='text-2xl font-bold'>Thông tin  người dùng</h1>
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
                  <Badge variant={getRoleBadgeVariant(user?.roles[0].name)}>{getRoleLabel(user?.roles[0].name)}</Badge>
                  <Badge variant={user.isActive === 'active' ? 'secondary' : 'outline'}>
                    {user?.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
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
              <CardTitle>Thông tin chi tiết của người dùng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Họ và tên *</Label>
                  <Input
                    id='name'
                    placeholder={user?.username}
                    autoComplete='new-name'
                    disabled
                    style={{
                      fontWeight: "bolder",
                      color: "black"
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='name'>Name *</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder={user?.name}
                    disabled
                      style={{
                      fontWeight: "bolder",
                      color: "black"
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Số điện thoại</Label>
                  <Input
                    id='phone'
                    placeholder='0335 250 819'
                    disabled
                       style={{
                      fontWeight: "bolder",
                      color: "black"
                    }}
                  />
                </div>
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

    </div>
  )
}