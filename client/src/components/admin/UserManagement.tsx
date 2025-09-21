import { React, useEffect, useState } from 'react'
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
import { useQuery } from '@tanstack/react-query'
import { handleApi } from '../../api/handleApi'

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

export function UserManagement() {
  const { navigateTo } = useNavigation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [err, setErr] = useState<string | null>(null)



  // const { isPending, error, data } = useQuery({
  //   queryKey: ['getUsers'],
  //   queryFn: () => getUsers()
  // })

  useEffect(() => {

    const getUsers = async () => {
      try {
        const res = await handleApi({ url: `/users/list`, method: 'GET', withCredentials: true });
        if (res.status < 200 || res.status > 300) {
          setErr(res.statusText)
        }
        const result = await res.data;
        return result
      } catch (error: any) {
        setErr(err)
      }
    }
    getUsers()
  }, [err])

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1>Quản lý người dùng</h1>
          <p className='text-muted-foreground'>Quản lý tài khoản giáo viên và học sinh trong hệ thống</p>
        </div>

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
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Họ và tên</Label>
                <Input id='name' placeholder='Nhập họ và tên' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='Nhập email' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role'>Vai trò</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn vai trò' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='teacher'>Giáo viên</SelectItem>
                    <SelectItem value='student'>Học sinh</SelectItem>
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
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Lọc theo vai trò' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả vai trò</SelectItem>
                <SelectItem value='teacher'>Giáo viên</SelectItem>
                <SelectItem value='student'>Học sinh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
          <CardDescription>Quản lý thông tin và quyền hạn của từng người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredUsers.map((user) => (
              <div key={user.id} className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-4'>
                  <Avatar>
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium'>{user.name}</h3>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                      <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                        {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>{user.email}</p>
                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                      <span>Tham gia: {new Date(user.joinDate).toLocaleDateString('vi-VN')}</span>
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
                  <Button variant='outline' size='sm'>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{mockUsers.filter((u) => u.role === 'teacher').length}</p>
              <p className='text-sm text-muted-foreground'>Giáo viên</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{mockUsers.filter((u) => u.role === 'student').length}</p>
              <p className='text-sm text-muted-foreground'>Học sinh</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{mockUsers.filter((u) => u.status === 'active').length}</p>
              <p className='text-sm text-muted-foreground'>Đang hoạt động</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
