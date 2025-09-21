import { React, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Search, Plus, Edit, Trash2, Eye, Users, BookOpen } from 'lucide-react'
import { useNavigation } from '../../hooks/useNavigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Progress } from '../ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const mockTeachers = [
  {
    id: '1',
    name: 'Nguyễn Văn Giáo',
    email: 'teacher1@example.com'
  },
  {
    id: '2',
    name: 'Trần Thị Hóa',
    email: 'teacher2@example.com'
  },
  {
    id: '3',
    name: 'Lê Minh Dạy',
    email: 'teacher3@example.com'
  }
]

const mockSubjects = [
  {
    id: '1',
    name: 'Toán học 12A1',
    description: 'Chương trình Toán học lớp 12A1 - Học kỳ 1',
    teacher: {
      id: '1',
      name: 'Nguyễn Văn Giáo',
      email: 'teacher1@example.com'
    },
    studentCount: 35,
    chapterCount: 8,
    quizCount: 24,
    flashcardCount: 156,
    progress: 78,
    status: 'active',
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Vật lý 12A2',
    description: 'Chương trình Vật lý lớp 12A2 - Học kỳ 1',
    teacher: {
      id: '2',
      name: 'Trần Thị Hóa',
      email: 'teacher2@example.com'
    },
    studentCount: 32,
    chapterCount: 6,
    quizCount: 18,
    flashcardCount: 89,
    progress: 65,
    status: 'active',
    createdDate: '2024-02-10'
  },
  {
    id: '3',
    name: 'Hóa học nâng cao',
    description: 'Chương trình Hóa học nâng cao cho học sinh giỏi',
    teacher: {
      id: '2',
      name: 'Trần Thị Hóa',
      email: 'teacher2@example.com'
    },
    studentCount: 18,
    chapterCount: 10,
    quizCount: 30,
    flashcardCount: 200,
    progress: 82,
    status: 'active',
    createdDate: '2024-03-01'
  }
]

export function SubjectManagement() {
  const { navigateTo } = useNavigation()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredSubjects = mockSubjects.filter((subject) => {
    return (
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1>Quản lý môn học</h1>
          <p className='text-muted-foreground'>Tạo và quản lý các môn học trong hệ thống</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Tạo môn học mới
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Tạo môn học mới</DialogTitle>
              <DialogDescription>Tạo môn học mới và phân công giáo viên</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='subjectName'>Tên môn học</Label>
                <Input id='subjectName' placeholder='VD: Toán học 12A1' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Mô tả</Label>
                <Textarea id='description' placeholder='Mô tả chi tiết về môn học' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='teacher'>Giáo viên được phân công</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn giáo viên' />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>Tạo môn học</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm môn học hoặc giáo viên...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9'
            />
          </div>
        </CardContent>
      </Card>

      {/* Subject List */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg'>{subject.name}</CardTitle>
                  <CardDescription>{subject.description}</CardDescription>
                </div>
                <Badge variant={subject.status === 'active' ? 'default' : 'secondary'}>
                  {subject.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Teacher Info */}
              <div className='flex items-center gap-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback className='text-xs'>
                    {subject.teacher.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium'>{subject.teacher.name}</p>
                  <p className='text-xs text-muted-foreground'>{subject.teacher.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>{subject.studentCount} học sinh</span>
                </div>
                <div className='flex items-center gap-2'>
                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>{subject.chapterCount} chương</span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm text-muted-foreground'>
                <div>Quiz: {subject.quizCount}</div>
                <div>Flashcard: {subject.flashcardCount}</div>
              </div>

              {/* Progress */}
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Tiến độ hoàn thành</span>
                  <span>{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className='h-2' />
              </div>

              {/* Actions */}
              <div className='flex justify-between items-center pt-2'>
                <p className='text-xs text-muted-foreground'>
                  Tạo: {new Date(subject.createdDate).toLocaleDateString('vi-VN')}
                </p>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => navigateTo('edit-subject')}>
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{mockSubjects.length}</p>
            <p className='text-sm text-muted-foreground'>Tổng môn học</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{mockSubjects.reduce((sum, s) => sum + s.studentCount, 0)}</p>
            <p className='text-sm text-muted-foreground'>Tổng học sinh</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{mockSubjects.reduce((sum, s) => sum + s.quizCount, 0)}</p>
            <p className='text-sm text-muted-foreground'>Tổng quiz</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{mockSubjects.reduce((sum, s) => sum + s.flashcardCount, 0)}</p>
            <p className='text-sm text-muted-foreground'>Tổng flashcard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
