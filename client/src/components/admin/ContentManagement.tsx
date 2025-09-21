import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Search, Plus, FileText, Video, Image, Download, Edit, Trash2, Eye, Filter, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'

const mockDocuments = [
  {
    id: '1',
    title: 'Bài giảng: Hàm số bậc nhất',
    type: 'pdf',
    subject: 'Toán học',
    teacher: 'GV. Nguyễn Văn Giáo',
    size: '2.5 MB',
    downloads: 156,
    views: 324,
    uploadDate: '2024-09-15',
    status: 'published'
  },
  {
    id: '2',
    title: 'Video: Thí nghiệm điện phân',
    type: 'video',
    subject: 'Hóa học',
    teacher: 'GV. Trần Thị Hóa',
    size: '45.2 MB',
    downloads: 89,
    views: 234,
    uploadDate: '2024-09-14',
    status: 'published'
  },
  {
    id: '3',
    title: 'Hình ảnh: Cấu trúc nguyên tử',
    type: 'image',
    subject: 'Vật lý',
    teacher: 'GV. Lê Văn Phúc',
    size: '1.8 MB',
    downloads: 67,
    views: 145,
    uploadDate: '2024-09-13',
    status: 'pending'
  }
]

const mockQuizzes = [
  {
    id: '1',
    title: 'Kiểm tra chương 1: Hàm số',
    subject: 'Toán học',
    teacher: 'GV. Nguyễn Văn Giáo',
    questions: 15,
    attempts: 234,
    avgScore: 85.2,
    createdDate: '2024-09-12',
    status: 'active'
  },
  {
    id: '2',
    title: 'Quiz: Bảng tuần hoàn',
    subject: 'Hóa học',
    teacher: 'GV. Trần Thị Hóa',
    questions: 10,
    attempts: 178,
    avgScore: 78.9,
    createdDate: '2024-09-11',
    status: 'active'
  }
]

const mockFlashcards = [
  {
    id: '1',
    title: 'Flashcard: Công thức toán học',
    subject: 'Toán học',
    teacher: 'GV. Nguyễn Văn Giáo',
    cardCount: 25,
    studyCount: 456,
    avgRetention: 89.5,
    createdDate: '2024-09-10',
    status: 'active'
  },
  {
    id: '2',
    title: 'Flashcard: Từ vựng vật lý',
    subject: 'Vật lý',
    teacher: 'GV. Lê Văn Phúc',
    cardCount: 32,
    studyCount: 298,
    avgRetention: 82.1,
    createdDate: '2024-09-09',
    status: 'active'
  }
]

export function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className='h-4 w-4 text-red-600' />
      case 'video':
        return <Video className='h-4 w-4 text-blue-600' />
      case 'image':
        return <Image className='h-4 w-4 text-green-600' />
      default:
        return <FileText className='h-4 w-4' />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant='default'>Đã xuất bản</Badge>
      case 'pending':
        return <Badge variant='secondary'>Chờ duyệt</Badge>
      case 'active':
        return <Badge variant='default'>Hoạt động</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1>Quản lý nội dung</h1>
          <p className='text-muted-foreground'>Quản lý tài liệu, quiz và flashcard trong hệ thống</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Thêm nội dung
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nội dung mới</DialogTitle>
              <DialogDescription>Tạo tài liệu, quiz hoặc flashcard mới</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='contentType'>Loại nội dung</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn loại nội dung' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='document'>Tài liệu</SelectItem>
                    <SelectItem value='quiz'>Quiz</SelectItem>
                    <SelectItem value='flashcard'>Flashcard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='title'>Tiêu đề</Label>
                <Input id='title' placeholder='Nhập tiêu đề' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='subject'>Môn học</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn môn học' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='math'>Toán học</SelectItem>
                    <SelectItem value='physics'>Vật lý</SelectItem>
                    <SelectItem value='chemistry'>Hóa học</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>Tạo mới</Button>
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
                  placeholder='Tìm kiếm nội dung...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Lọc theo môn học' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả môn học</SelectItem>
                <SelectItem value='math'>Toán học</SelectItem>
                <SelectItem value='physics'>Vật lý</SelectItem>
                <SelectItem value='chemistry'>Hóa học</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue='documents' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='documents'>Tài liệu ({mockDocuments.length})</TabsTrigger>
          <TabsTrigger value='quizzes'>Quiz ({mockQuizzes.length})</TabsTrigger>
          <TabsTrigger value='flashcards'>Flashcard ({mockFlashcards.length})</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value='documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu học tập</CardTitle>
              <CardDescription>Quản lý tất cả tài liệu trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center gap-4'>
                      <div className='p-2 bg-muted rounded'>{getTypeIcon(doc.type)}</div>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-medium'>{doc.title}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>{doc.subject}</span>
                          <span>•</span>
                          <span>{doc.teacher}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>{doc.downloads} tải về</span>
                          <span>•</span>
                          <span>{doc.views} lượt xem</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Edit className='h-4 w-4' />
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
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value='quizzes' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Quiz và bài kiểm tra</CardTitle>
              <CardDescription>Quản lý các quiz trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockQuizzes.map((quiz) => (
                  <div key={quiz.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium'>{quiz.title}</h3>
                        {getStatusBadge(quiz.status)}
                      </div>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>{quiz.subject}</span>
                        <span>•</span>
                        <span>{quiz.teacher}</span>
                        <span>•</span>
                        <span>{quiz.questions} câu hỏi</span>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>{quiz.attempts} lượt làm</span>
                        <span>•</span>
                        <span>Điểm TB: {quiz.avgScore}%</span>
                        <span>•</span>
                        <span>{new Date(quiz.createdDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Edit className='h-4 w-4' />
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
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value='flashcards' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Flashcard</CardTitle>
              <CardDescription>Quản lý bộ flashcard trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockFlashcards.map((flashcard) => (
                  <div key={flashcard.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium'>{flashcard.title}</h3>
                        {getStatusBadge(flashcard.status)}
                      </div>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>{flashcard.subject}</span>
                        <span>•</span>
                        <span>{flashcard.teacher}</span>
                        <span>•</span>
                        <span>{flashcard.cardCount} thẻ</span>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>{flashcard.studyCount} lượt học</span>
                        <span>•</span>
                        <span>Ghi nhớ: {flashcard.avgRetention}%</span>
                        <span>•</span>
                        <span>{new Date(flashcard.createdDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Edit className='h-4 w-4' />
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
