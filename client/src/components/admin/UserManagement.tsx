import { ChangeEvent, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX, Check, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useNavigation } from '../../hooks/useNavigation'
import { handleApi } from '../../api/handleApi'
import React from 'react'
import { toast } from 'sonner'

import { keepPreviousData, QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGetUsers } from '../../services/UserService'
import { useFetchCountUserByRole } from '../../hooks/getAllData'
import GetRoleCountByName from '../../hooks/getRoleCount'

const DisplayUsers = ({ users, navigateTo, getRoleBadgeVariant, getRoleLabel, onDeleteClick }) => {
  console.log('User: ', users)

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
                <h3 className='font-medium'>{user.name}</h3>
                <Badge variant={getRoleBadgeVariant(user.roles[0]?.name || user.name)}>
                  {getRoleLabel(user.roles[0]?.name) || user.name}
                </Badge>
                <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                  {user.isActive === true ? 'Hoạt động' : 'Không hoạt động'}
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
            <Button variant='outline' size='sm' onClick={() => navigateTo('user-detail', { userId: user._id })} >
              <Eye className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={() => navigateTo('edit-user', { userId: user?._id || user?.id })}>
              <Edit className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' value={user._id} onClick={() => onDeleteClick(user._id, user)}>
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

  const [userData, setUserData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [value, setValue] = useState({
    username: '',
    name: '',
    password: '',
    roles: [] as string[]
  })
  const [userByRoleId, setUserByRoleId] = useState<any[]>([])
  const [userCounts, setUserCounts] = useState<number>(0);
  const [teacherCounts, setTeacherCounts] = useState<number>(0);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const handleDeleteClick = (userId: string, user: any) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete._id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const { mutate: handleDeleteUser } = useMutation({
    mutationFn: async (userId: string) => {
      try {
        const response = await handleApi({
          url: `/users/delete/${userId}`,
          method: 'DELETE',
          data: { userId }
        });
        return response;
      } catch (error) {
        console.error('Delete user error:', error);
        throw error;
      }
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      if (selectedRole) {
        await queryClient.cancelQueries({ queryKey: ['usersByRoleId', selectedRole] });
      }

      const getUsersData = (key: string) => {
        const data = queryClient.getQueryData<any>(key);
        if (Array.isArray(data)) return data;
        if (data?.data?.users) return data.data.users;
        if (data?.data) return data.data;
        return [];
      };

      const previousUsers = getUsersData('users');
      const previousFilteredUsers = selectedRole
        ? getUsersData(['usersByRoleId', selectedRole].join('-'))
        : null;

      const updateQueryData = (key: string, userId: string) => {
        queryClient.setQueryData<any>(key, (old: any) => {
          const data = Array.isArray(old) ? old :
            old?.data?.users ? old.data.users :
              old?.data ? old.data : [];
          return data.filter((user: any) => user?._id !== userId);
        });
      };

      updateQueryData('users', userId);

      if (selectedRole) {
        updateQueryData(['usersByRoleId', selectedRole].join('-'), userId);
      }

      return {
        previousUsers: { data: { users: previousUsers } },
        previousFilteredUsers: previousFilteredUsers ? { data: { users: previousFilteredUsers } } : null
      };
    },
    onError: (error: any, userId, context) => {
      console.error('Error deleting user:', error);

      const rollbackQueryData = (key: string, data: any) => {
        if (!data) return;
        queryClient.setQueryData(key, data);
      };

      if (context?.previousUsers) {
        rollbackQueryData('users', context.previousUsers);
      }
      if (selectedRole && context?.previousFilteredUsers) {
        rollbackQueryData(['usersByRoleId', selectedRole].join('-'), context.previousFilteredUsers);
      }

      const errorMessage = error.response?.data?.message || 'Xóa người dùng thất bại';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success('Đã xóa người dùng thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (selectedRole) {
        queryClient.invalidateQueries({ queryKey: ['usersByRoleId', selectedRole] });
      }
      queryClient.invalidateQueries({ queryKey: ['count-role-USER'] });
      queryClient.invalidateQueries({ queryKey: ['count-role-TEACHER'] });
    }
  })


  const fetchRoles = async () => {
    const res = await handleApi({ url: '/roles/list', method: 'GET' })
    return res.data
  }

  const users = useGetUsers(searchTerm)
  const userCount = useFetchCountUserByRole("STUDENT")
  const teacherCount = useFetchCountUserByRole("TEACHER")

  useEffect(() => {
    if (userCount) {
      setUserCounts(userCount)
    }
    if (teacherCount) {
      setTeacherCounts(teacherCount)
    }
  }, [userCount, teacherCount])


  const {
    data: roles,
    isLoading: roleLoading,
    error: errorRole
  } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  })

  // Create user mutation: now accepts variable payload and controls dialog closing on success only
  const createUserFn = async (newUser: any) => {
    const res = await handleApi({ url: '/auth/register', method: 'POST', data: newUser })
    return res.data
  }

  const {
    mutate: createUser,
    error: createUserError,
    isLoading: createUserLoading
  } = useMutation({
    mutationFn: createUserFn,
    onSuccess: (data) => {
      toast.success('Tạo tài khoản thành công')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['count-role-USER'] })
      queryClient.invalidateQueries({ queryKey: ['count-role-TEACHER'] })
      // Close only on success
      setIsCreateDialogOpen(false)
      // reset form
      setValue({ username: '', name: '', password: '', roles: [] })
      setCreateErrors({})
    },
    onError: (error: any) => {
      console.error('Create user error:', error)
      // Try to parse validation errors from server
      const serverMsg = error?.response?.data;
      if (serverMsg && typeof serverMsg === 'object') {
        // If server returns field errors like { errors: { username: '...' } } or { message: '...' }
        if (serverMsg.errors) {
          setCreateErrors(serverMsg.errors);
        } else if (serverMsg.message) {
          setCreateErrors({ general: serverMsg.message });
        } else {
          setCreateErrors({ general: 'Tạo người dùng thất bại' });
        }
      } else {
        setCreateErrors({ general: 'Tạo người dùng thất bại' });
      }
      // keep dialog open (do nothing else)
    }
  });

  const handleChangeUserByRoleId = (roleId: string) => {
    console.log(roleId)
    setSelectedRole(roleId)
  }

  const fetchUsersByRoleId = async () => {
    console.log(selectedRole)
    const res = await handleApi({ url: `/users/list-user/${selectedRole}`, method: 'POST' })
    console.log(res.data)
    return res.data
  }

  const { data: usersByRoleId } = useQuery({
    queryKey: ['usersByRoleId', selectedRole],
    queryFn: fetchUsersByRoleId,
    enabled: !!selectedRole,
  })

  console.log("usersByRoleId: ", usersByRoleId)

  // Get users from the response data structure
  const usersFromResponse = usersByRoleId?.data?.users || [];

  const filteredUsers = usersFromResponse.filter((user: any) => {
    if (!user) return false;

    const matchesSearch = searchTerm ? (
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : true;

    const matchesRole = !selectedRole || selectedRole === 'all' ||
      (user.roles && user.roles.some((role: any) => role._id === selectedRole));

    return matchesSearch && matchesRole;
  })

  const filterUserIsActive = async () => {
    const res = await handleApi({ url: `/users/count-by-active`, method: 'POST' })
    return await res.data
  }

  const {
    data: userActiveCount,
    isLoading: userActiveCountLoading,
    error: userActiveCountError
  } = useQuery({
    queryKey: ['userActiveCount'],
    queryFn: filterUserIsActive
  })

  // Update local userData state whenever users (from hook) changes
  useEffect(() => {
    if (users) {
      // users might be array or { data: { users: [...] } } depending on implementation of useGetUsers
      if (Array.isArray(users)) setUserData(users)
      else if (users?.data?.users) setUserData(users.data.users)
      else if (users?.data) setUserData(users.data)
      else setUserData([])
    }
  }, [users])

  useEffect(() => {
    if (usersByRoleId) {
      setUserByRoleId(usersByRoleId?.data?.users)
    }
  }, [usersByRoleId])

  console.log('userActiveCount: ', userActiveCount)
  console.log('users:', users)

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Quản trị viên'
      case 'ADMIN':
        return 'Quản trị viên'
      case 'TEACHER':
        return 'Giáo viên'
      case 'STUDENT':
        return 'Học sinh'
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
      case 'ADMIN':
        return 'destructive'
      case 'TEACHER':
        return 'default'
      case 'STUDENT':
        return 'secondary'
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
    // clear error for this field as user types
    setCreateErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleChangeRole = (roleId: string) => {
    setValue({ ...value, roles: [roleId] })
    setCreateErrors(prev => ({ ...prev, roles: '' }))
  }

  const validateCreateForm = () => {
    const errs: Record<string, string> = {}
    if (!value.name || value.name.trim() === '') errs.name = 'Họ và tên là bắt buộc'
    if (!value.username || value.username.trim() === '') errs.username = 'Tên đăng nhập là bắt buộc'
    if (!value.password || value.password.trim() === '') errs.password = 'Mật khẩu là bắt buộc'
    if (!value.roles || value.roles.length === 0) errs.roles = 'Chọn vai trò là bắt buộc'

    // check username uniqueness locally
    const usernameExists = userData.some(u => (u.username || '').toLowerCase() === (value.username || '').toLowerCase())
    if (usernameExists) errs.username = 'Tên đăng nhập đã tồn tại'

    setCreateErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateErrors({}) // reset first
    // Validate client-side
    const isValid = validateCreateForm()
    if (!isValid) {
      // don't call API, keep dialog open
      return
    }

    // call mutation with payload (so mutationFn receives it)
    createUser({
      username: value.username,
      name: value.name,
      password: value.password,
      roles: value.roles
    })
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa người dùng
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
              {userToDelete && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{userToDelete.name || 'Không có tên'}</p>
                  <p className="text-sm text-muted-foreground">@{userToDelete.username || 'Không có username'}</p>
                  <p className="text-sm text-muted-foreground">
                    {userToDelete.roles?.[0]?.name ? `Vai trò: ${userToDelete.roles[0].name}` : 'Không có vai trò'}
                  </p>
                </div>
              )}
              <p className="text-sm text-destructive font-medium">
                Hành động này không thể hoàn tác!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDeleteUser}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Xóa người dùng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    type='text'
                    placeholder='Nhập họ và tên'
                    onChange={handleChangeInput}
                    name='name'
                    value={value.name}
                  />
                  {createErrors.name && <p className="text-sm text-destructive mt-1">{createErrors.name}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='username'>Tên đăng nhập</Label>
                  <Input
                    id='username'
                    placeholder='Nhập tên đăng nhập'
                    onChange={handleChangeInput}
                    name='username'
                    value={value.username}
                  />
                  {createErrors.username && <p className="text-sm text-destructive mt-1">{createErrors.username}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password'>Mật khẩu</Label>
                  <Input
                    id='password'
                    placeholder='Nhập mật khẩu'
                    onChange={handleChangeInput}
                    name='password'
                    value={value.password}
                  />
                  {createErrors.password && <p className="text-sm text-destructive mt-1">{createErrors.password}</p>}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='role'>Vai trò</Label>
                  <Select onValueChange={handleChangeRole} value={value.roles?.[0]}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn vai trò' />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(roles?.data || []).map((role: any, index: number) => {
                        return (
                          <SelectItem value={role?._id} key={index}>
                            {getRoleLabel(role?.name)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {createErrors.roles && <p className="text-sm text-destructive mt-1">{createErrors.roles}</p>}
                </div>

                {createErrors.general && <p className="text-sm text-destructive">{createErrors.general}</p>}

                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => { setIsCreateDialogOpen(false); setCreateErrors({}); }}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createUserLoading} className={createUserLoading ? 'opacity-70' : ''}>
                    {createUserLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                  </Button>
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
                  placeholder="Tìm kiếm theo tên hoặc tên đăng nhập..."
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
                {Array.from(roles?.data || []).map((role: any, index) => (
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
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách người dùng ({userData?.length || 0})</CardTitle>
            {selectedRole && selectedRole !== 'all' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {roles?.data?.find((r: any) => r._id === selectedRole)?.name} ({filteredUsers.length})
                </span>
              </div>
            )}
          </div>
          <CardDescription>Quản lý thông tin và quyền hạn của từng người dùng</CardDescription>
        </CardHeader >
        <CardContent>
          <div className='space-y-4'>
            {
              selectedRole && selectedRole !== 'all'
                ? (
                  filteredUsers.length > 0
                    ? <DisplayUsers
                      users={filteredUsers}
                      navigateTo={navigateTo}
                      getRoleBadgeVariant={getRoleBadgeVariant}
                      getRoleLabel={getRoleLabel}
                      onDeleteClick={handleDeleteClick}
                    />
                    : <p className='text-center py-4 text-muted-foreground'>Không tìm thấy người dùng nào</p>
                )
                : (
                  userData.length > 0
                    ? <DisplayUsers
                      users={userData}
                      navigateTo={navigateTo}
                      getRoleBadgeVariant={getRoleBadgeVariant}
                      getRoleLabel={getRoleLabel}
                      onDeleteClick={handleDeleteClick}
                    />
                    : <p className='text-center py-4 text-muted-foreground'>Không có người dùng nào</p>
                )
            }
          </div >
        </CardContent >
      </Card >

      {/* Stats */}
      < div className='grid grid-cols-1 md:grid-cols-3 gap-4' >
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{teacherCounts || 0}</p>
              <p className='text-sm text-muted-foreground'>Giáo viên</p>
            </div >
          </CardContent >
        </Card >
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{userCounts || 0}</p>
              <p className='text-sm text-muted-foreground'>Học sinh</p>
            </div >
          </CardContent >
        </Card >
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{userActiveCount?.data?.userCount}</p>
              <p className='text-sm text-muted-foreground'>Đang hoạt động</p>
            </div >
          </CardContent >
        </Card >
      </div >
    </div >
  )
}
