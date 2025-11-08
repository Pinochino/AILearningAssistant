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
import { keepPreviousData, QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFetchCountUserByTeacherRole, useFetchCountUserByUserRole, useGetUsers } from '../../services/UserService'
import { Skeleton } from '../ui/skeleton'
import { toast } from 'sonner'

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
        <div key={user?._id || user?.id || index} className='flex items-center justify-between p-4 border rounded-lg'>
          <div className='flex items-center gap-4'>
            <Avatar>
              <AvatarFallback>
                {(user?.username || user?.name || user?.email || 'U')
                  .split(' ')
                  .map((n: string) => n && n[0] ? n[0] : '')
                  .join('')
                  .toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-medium'>{user?.name || user?.username || 'Người dùng'}</h3>
                <Badge variant={getRoleBadgeVariant(user?.roles?.[0]?.name || 'user')}>
                  {getRoleLabel(user?.roles?.[0]?.name || 'user')}
                </Badge>
                <Badge variant={user?.status === 'active' || user?.isActive === true ? 'secondary' : 'outline'}>
                  {user?.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>@{user?.username || ''}</p>
              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <span>Tham gia: {new Date(user?.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>Đăng nhập cuối: {new Date(user?.lastLogin || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Eye className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={() => navigateTo('edit-user', { userId: user?._id || user?.id })}>
              <Edit className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm'>
              {user?.status === 'active' ? <UserX className='h-4 w-4' /> : <UserCheck className='h-4 w-4' />}
            </Button>
            <Button variant='outline' size='sm' value={user?._id || user?.id} onClick={() => handleDeleteUser(user?._id || user?.id)}>
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
  const queryClient = useQueryClient()

  const [userData, setUserData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [value, setValue] = useState({
    name: '',
    username: '',
    password: '',
    roles: [] as any[]
  });
  const [userByRoleId, setUserByRoleId] = useState([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);


  const { mutate: handleDeleteUser } = useMutation({
    mutationFn: async (userId: string) => {
      return await handleApi({ url: `/users/delete/${userId}`, method: 'DELETE' })
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['users'] })

      const previousUsers = queryClient.getQueryData<any[]>(['users'])

      queryClient.setQueryData<any[]>(['users'], (old) => (old ? old.filter((user) => user._id !== userId) : []))

      return { previousUsers }
    },
    onError: (_err, _userId, context) => {
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
      toast.success('Tạo tài khoản thành công')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['usersByRoleId'] })
      setValue({ name: '', username: '', password: '', roles: [] })
      setIsCreateDialogOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Tạo tài khoản thất bại')
    }
  })

  const handleCreateValidated = () => {
    const name = String(value.name || '').trim()
    const username = String(value.username || '').trim()
    const password = String(value.password || '')
    const rolesArr = Array.isArray(value.roles) ? value.roles : []
    if (!name) return toast.error('Vui lòng nhập họ và tên')
    if (!username) return toast.error('Vui lòng nhập username')
    if (!password || password.length < 6) return toast.error('Mật khẩu phải tối thiểu 6 ký tự')
    if (!rolesArr.length) return toast.error('Vui lòng chọn vai trò')
    mutate()
  }

  const handleChangeUserByRoleId = (roleId: string) => {
    console.log(roleId)
    setSelectedRole(roleId)
  }

  const fetchUsersByRoleId = async () => {
    try {
      if (!selectedRole) return { data: { users: [] } } as any;
      const res = await handleApi({ url: `/roles/list-user/${selectedRole}`, method: 'POST' })
      return res.data
    } catch (e) {
      return { data: { users: [] } } as any;
    }
  }

  const { data: usersByRoleId } = useQuery({
    queryKey: ['usersByRoleId', selectedRole],
    queryFn: fetchUsersByRoleId,
    enabled: !!selectedRole,
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

  useEffect(() => {
    if (!usersByRoleId) {
      setLoadingPage(true);
    } else {
      const timeout = setTimeout(() => {
        setUserByRoleId(usersByRoleId?.data?.users);
        setLoadingPage(false);
      }, 300); // delay 300ms cho mượt hơn
      return () => clearTimeout(timeout);
    }
  }, [usersByRoleId]);

  useEffect(() => {
    if (!users) {
      setLoadingPage(true);
    } else {
      const timeout = setTimeout(() => {
        setUserData(users);
        setLoadingPage(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [users]);


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
                <Input
                  id="name"
                  placeholder="Nhập họ và tên"
                  value={value.name}
                  onChange={(e) => setValue((prev: any) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập username"
                  value={value.username}
                  onChange={(e) => setValue((prev: any) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={value.password}
                  onChange={(e) => setValue((prev: any) => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select onValueChange={(val) => setValue((prev: any) => ({ ...prev, roles: [val] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(roles?.data) ? roles?.data : Array.isArray(roles) ? roles : [])
                      .filter((r: any) => r?.name !== 'super-admin' && r?.name !== 'SUPER_ADMIN')
                      .map((r: any) => (
                        <SelectItem key={r?._id || r?.id} value={(r?._id || r?.id) as string}>
                          {r?.name === 'teacher' ? 'Giáo viên' : r?.name === 'student' ? 'Học sinh' : (r?.name || 'Vai trò')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateValidated} disabled={isPending}>
                  {isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
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
                  placeholder="Tìm kiếm theo tên hoặc username..."
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
      {loadingPage ? (
        <Skeleton>Loading</Skeleton>

      ) : (<>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng ({users?.length})</CardTitle>
            <CardDescription>Quản lý thông tin và quyền hạn của từng người dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {usersByRoleId
                ? DisplayUsers({ users: userByRoleId, navigateTo, getRoleBadgeVariant, getRoleLabel, handleDeleteUser })
                : DisplayUsers({ users: userData, navigateTo, getRoleBadgeVariant, getRoleLabel, handleDeleteUser })}
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
        </div></>)}
    </div>
  );
}