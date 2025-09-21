import { React, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Search, Plus, X, Save, ArrowLeft, Users, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useNavigation } from '../../hooks/useNavigation'

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

const mockStudents = [
  {
    id: '1',
    name: 'Lê Minh Học',
    email: 'student1@example.com',
    studentId: 'SV001'
  },
  {
    id: '2',
    name: 'Phạm Thị Thông',
    email: 'student2@example.com',
    studentId: 'SV002'
  },
  {
    id: '3',
    name: 'Nguyễn Văn Tài',
    email: 'student3@example.com',
    studentId: 'SV003'
  },
  {
    id: '4',
    name: 'Trần Thị Giỏi',
    email: 'student4@example.com',
    studentId: 'SV004'
  }
]

const mockSubject = {
  id: '1',
  name: 'Toán học 12A1',
  description: 'Chương trình Toán học lớp 12A1 - Học kỳ 1',
  teacher: {
    id: '1',
    name: 'Nguyễn Văn Giáo',
    email: 'teacher1@example.com'
  },
  students: [
    { id: '1', name: 'Lê Minh Học', email: 'student1@example.com', studentId: 'SV001' },
    { id: '2', name: 'Phạm Thị Thông', email: 'student2@example.com', studentId: 'SV002' }
  ],
  status: 'active',
  createdDate: '2024-01-15'
}

export function EditSubject() {
  const { navigateTo } = useNavigation()
  const [subjectData, setSubjectData] = useState(mockSubject)
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState(subjectData.teacher.id)

  const handleSave = () => {
    // Logic to save subject data
    console.log('Saving subject:', subjectData)
    navigateTo('subjects')
  }

  const handleAddStudent = (studentId: string) => {
    const student = mockStudents.find((s) => s.id === studentId)
    if (student && !subjectData.students.find((s) => s.id === studentId)) {
      setSubjectData((prev) => ({
        ...prev,
        students: [...prev.students, student]
      }))
    }
    setIsAddStudentDialogOpen(false)
  }

  const handleRemoveStudent = (studentId: string) => {
    setSubjectData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId)
    }))
  }

  const handleTeacherChange = (teacherId: string) => {
    const teacher = mockTeachers.find((t) => t.id === teacherId)
    if (teacher) {
      setSubjectData((prev) => ({
        ...prev,
        teacher
      }))
    }
  }

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  )

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' onClick={() => navigateTo('subjects')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Quay lại
          </Button>
          <div>
            <h1>Chỉnh sửa môn học</h1>
            <p className='text-muted-foreground'>Cập nhật thông tin môn học và quản lý thành viên</p>
          </div>
        </div>

        <Button onClick={handleSave} className='gap-2'>
          <Save className='h-4 w-4' />
          Lưu thay đổi
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Subject Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin môn học</CardTitle>
            <CardDescription>Cập nhật thông tin cơ bản của môn học</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='subjectName'>Tên môn học</Label>
              <Input
                id='subjectName'
                value={subjectData.name}
                onChange={(e) => setSubjectData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Mô tả</Label>
              <Textarea
                id='description'
                value={subjectData.description}
                onChange={(e) => setSubjectData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='teacher'>Giáo viên phụ trách</Label>
              <Select
                value={selectedTeacher}
                onValueChange={(value) => {
                  setSelectedTeacher(value)
                  handleTeacherChange(value)
                }}
              >
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

            <div className='space-y-2'>
              <Label>Trạng thái</Label>
              <div className='flex items-center gap-2'>
                <Badge variant={subjectData.status === 'active' ? 'default' : 'secondary'}>
                  {subjectData.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setSubjectData((prev) => ({
                      ...prev,
                      status: prev.status === 'active' ? 'inactive' : 'active'
                    }))
                  }
                >
                  {subjectData.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Management */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Danh sách học sinh</CardTitle>
                <CardDescription>
                  Quản lý học sinh trong môn học ({subjectData.students.length} học sinh)
                </CardDescription>
              </div>

              <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size='sm' className='gap-2'>
                    <UserPlus className='h-4 w-4' />
                    Thêm học sinh
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm học sinh vào môn học</DialogTitle>
                    <DialogDescription>Tìm kiếm và thêm học sinh vào môn học này</DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label>Tìm kiếm học sinh</Label>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                          placeholder='Tìm theo tên, mã sinh viên hoặc email...'
                          value={studentSearchTerm}
                          onChange={(e) => setStudentSearchTerm(e.target.value)}
                          className='pl-9'
                        />
                      </div>
                    </div>

                    <div className='max-h-60 overflow-y-auto space-y-2'>
                      {filteredStudents.map((student) => (
                        <div key={student.id} className='flex items-center justify-between p-3 border rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='text-xs'>
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium'>{student.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {student.studentId} • {student.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size='sm'
                            onClick={() => handleAddStudent(student.id)}
                            disabled={subjectData.students.some((s) => s.id === student.id)}
                          >
                            {subjectData.students.some((s) => s.id === student.id) ? 'Đã thêm' : 'Thêm'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {subjectData.students.map((student) => (
                <div key={student.id} className='flex items-center justify-between p-3 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='text-xs'>
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{student.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {student.studentId} • {student.email}
                      </p>
                    </div>
                  </div>
                  <Button variant='outline' size='sm' onClick={() => handleRemoveStudent(student.id)}>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              {subjectData.students.length === 0 && (
                <div className='text-center py-8 text-muted-foreground'>
                  <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Chưa có học sinh nào trong môn học này</p>
                  <p className='text-sm'>Nhấn "Thêm học sinh" để bắt đầu</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
