import { ChangeEvent, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useNavigation } from '../../hooks/useNavigation'
import { handleApi } from '../../api/handleApi'
import React from 'react'
import { keepPreviousData, QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useFetchCountUserByTeacherRole, useFetchCountUserByUserRole, useGetUsers } from '../../services/UserService'

const mockUsers = [
  {
    id: '1',
    name: 'Nguyễn Văn Giáo',
    email: 'teacher1@example.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Toán học', 'Vật lý'],
    joinDate: '2024-01-15',
    lastLogin: '2024-09-18'
  },
  {
    id: '2',
    name: 'Trần Thị Hóa',
    email: 'teacher2@example.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Hóa học', 'Sinh học'],
    joinDate: '2024-02-10',
    lastLogin: '2024-09-17'
  },
  {
    id: '3',
    name: 'Lê Minh Học',
    email: 'student1@example.com',
    role: 'student',
    status: 'active',
    subjects: ['Toán học', 'Vật lý', 'Hóa học'],
    joinDate: '2024-03-01',
    lastLogin: '2024-09-18'
  },
  {
    id: '4',
    name: 'Phạm Thị Thông',
    email: 'student2@example.com',
    role: 'student',
    status: 'inactive',
    subjects: ['Toán học', 'Sinh học'],
    joinDate: '2024-03-05',
    lastLogin: '2024-09-10'
  }
]

const DisplayUsers = ({ users, navigateTo, getRoleBadgeVariant, getRoleLabel, handleDeleteUser }) => {
  return (
    <>
      {Array.from(users || []).map((user: any, index: number) => (
        <div key={user.id} className='flex items-center justify-between p-4 border rounded-lg'>
          <div className='flex items-center gap-4'>
            <Avatar>
              <AvatarFallback>
                {user.username
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-medium'>{user.name}</h3>
                <Badge variant={getRoleBadgeVariant(user.roles[0]?.name)}>{getRoleLabel(user.roles[0]?.name)}</Badge>
                <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                  {user.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <span>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>Đăng nhập cuối: {new Date(user.lastLogin).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Eye className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={() => navigateTo('edit-user', { userId: user.id })}>
              <Edit className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm'>
              {user.status === 'active' ? <UserX className='h-4 w-4' /> : <UserCheck className='h-4 w-4' />}
            </Button>
            <Button variant='outline' size='sm' value={user._id} onClick={() => handleDeleteUser(user._id)}>
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        </div>
      ))}
    </>
  )
}

export function UserManagement() {
  const { navigateTo } = useNavigation()
  const queryClient = new QueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [value, setValue] = useState({
    username: '',
    email: '',
    password: '',
    roles: []
  })

  // const { isPending, error, data } = useQuery({
  //   queryKey: ['getUsers'],
  //   queryFn: () => getUsers()
  // })

  const { mutate: handleDeleteUser } = useMutation({
    mutationFn: async (userId: string) => {
      return await handleApi({ url: `/users/delete/${userId}`, method: 'DELETE' })
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['users'] })

      // Lưu lại cache cũ để rollback nếu lỗi
      const previousUsers = queryClient.getQueryData<any[]>(['users'])

      // Xóa ngay user khỏi cache
      queryClient.setQueryData<any[]>(['users'], (old) => (old ? old.filter((user) => user._id !== userId) : []))

      return { previousUsers }
    },
    onError: (_err, _userId, context) => {
      // rollback nếu API fail
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const fetchUsers = async () => {
    const res = await handleApi({ url: '/users/list', method: 'GET', withCredentials: true })
    return res.data?.data
  }

  const fetchRoles = async () => {
    const res = await handleApi({ url: '/roles/list', method: 'GET' })
    return res.data
  }

  const users = useGetUsers(searchTerm)
  const userCount = useFetchCountUserByUserRole()
  const teacherCount = useFetchCountUserByTeacherRole()

  const {
    data: roles,
    isLoading: roleLoading,
    error: errorRole
  } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  })

  const fetchCreateUser = async () => {
    const res = await handleApi({ url: '/auth/register', method: 'POST', data: value })
    return res.data
  }



  const {
    mutate,
    error: createUserError,
    isPending
  } = useMutation({
    mutationFn: fetchCreateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const handleChangeUserByRoleId = (roleId: string) => {
    console.log(roleId)
    setSelectedRole(roleId)
  }

  const fetchUsersByRoleId = async () => {
    console.log(selectedRole)
    const res = await handleApi({ url: `/roles/list-user/${selectedRole}`, method: 'POST' })
    console.log(res.data)
    return res.data
  }

  const { data: usersByRoleId } = useQuery({
    queryKey: ['usersByRoleId', selectedRole],
    queryFn: fetchUsersByRoleId
  })

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const filterUserIsActive = async () => {
    const res = await handleApi({ url: `/users/count-by-active`, method: 'GET' })
    return res.data
  }

  const {
    data: userActiveCount,
    isLoading: userActiveCountLoading,
    error: userActiveCountError
  } = useQuery({
    queryKey: ['userActiveCount'],
    queryFn: filterUserIsActive
  })

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

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValue((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleChangeRole = (roleId: string) => {
    setValue({ ...value, roles: [roleId] })
  }

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(value)
    mutate()
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1>Quản lý người dùng</h1>
          <p className='text-muted-foreground'>Quản lý tài khoản giáo viên và học sinh trong hệ thống</p>
        </div>

        {/* CREATE USER */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>Thêm người dùng mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Họ và tên</Label>
                  <Input
                    id='name'
                    placeholder='Nhập họ và tên'
                    onChange={(value) => handleChangeInput(value)}
                    name='username'
                    value={value.username}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Nhập email'
                    onChange={(value) => handleChangeInput(value)}
                    name='email'
                    value={value.email}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='Password'>Mật khẩu</Label>
                  <Input
                    id='password'
                    placeholder='Nhập mật khẩu'
                    onChange={(value) => handleChangeInput(value)}
                    name='password'
                    value={value.password}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='role'>Vai trò</Label>
                  <Select onValueChange={handleChangeRole}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn vai trò' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value='teacher'>Giáo viên</SelectItem>
                      <SelectItem value='student'>Học sinh</SelectItem> */}
                      {Array.from(roles?.data || []).map((role, index: number) => {
                        return (
                          <SelectItem value={role._id} key={index}>
                            {getRoleLabel(role.name)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Tạo tài khoản</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm theo tên hoặc email...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={handleChangeUserByRoleId}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Lọc theo vai trò' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả vai trò</SelectItem>
                {Array.from(roles?.data || []).map((role, index) => (
                  <SelectItem value={role?._id} key={index}>
                    {getRoleLabel(role?.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({users?.length})</CardTitle>
          <CardDescription>Quản lý thông tin và quyền hạn của từng người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {usersByRoleId
              ? DisplayUsers({ users: usersByRoleId, navigateTo, getRoleBadgeVariant, getRoleLabel, handleDeleteUser })
              : DisplayUsers({ users, navigateTo, getRoleBadgeVariant, getRoleLabel, handleDeleteUser })}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{teacherCount?.data || 0}</p>
              <p className='text-sm text-muted-foreground'>Giáo viên</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{userCount?.data || 0}</p>
              <p className='text-sm text-muted-foreground'>Học sinh</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{userActiveCount?.data}</p>
              <p className='text-sm text-muted-foreground'>Đang hoạt động</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
