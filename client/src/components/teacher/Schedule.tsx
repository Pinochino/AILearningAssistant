import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Video,
  FileText
} from 'lucide-react'

const mockSchedule = [
  {
    id: '1',
    title: 'Toán học 12A1 - Hàm số bậc nhất',
    subject: 'Toán học 12A1',
    type: 'lecture',
    date: '2024-09-20',
    startTime: '08:00',
    endTime: '09:30',
    location: 'Phòng A101',
    students: 35,
    description: 'Giảng dạy về hàm số bậc nhất và cách vẽ đồ thị',
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Toán học 12A2 - Đạo hàm cơ bản',
    subject: 'Toán học 12A2',
    type: 'lecture',
    date: '2024-09-20',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Phòng A102',
    students: 33,
    description: 'Hướng dẫn các quy tắc đạo hàm cơ bản',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Vật lý 11B1 - Kiểm tra giữa kỳ',
    subject: 'Vật lý 11B1',
    type: 'exam',
    date: '2024-09-21',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Phòng B201',
    students: 38,
    description: 'Kiểm tra kiến thức chương 1-3',
    status: 'upcoming'
  },
  {
    id: '4',
    title: 'Toán học 12A1 - Ôn tập',
    subject: 'Toán học 12A1',
    type: 'review',
    date: '2024-09-19',
    startTime: '15:00',
    endTime: '16:30',
    location: 'Phòng A101',
    students: 35,
    description: 'Ôn tập các dạng bài tập về hàm số',
    status: 'completed'
  }
]

const mockTimeSlots = [
  { time: '08:00', label: '8:00 AM' },
  { time: '09:00', label: '9:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '11:00', label: '11:00 AM' },
  { time: '12:00', label: '12:00 PM' },
  { time: '13:00', label: '1:00 PM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:00', label: '4:00 PM' },
  { time: '17:00', label: '5:00 PM' }
]

export function Schedule() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedView, setSelectedView] = useState('week')
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('all')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className='h-4 w-4' />
      case 'exam':
        return <FileText className='h-4 w-4' />
      case 'review':
        return <Users className='h-4 w-4' />
      case 'online':
        return <Video className='h-4 w-4' />
      default:
        return <Calendar className='h-4 w-4' />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-600'
      case 'exam':
        return 'bg-red-100 text-red-600'
      case 'review':
        return 'bg-green-100 text-green-600'
      case 'online':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant='default'>Sắp tới</Badge>
      case 'completed':
        return <Badge variant='secondary'>Đã hoàn thành</Badge>
      case 'cancelled':
        return <Badge variant='destructive'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const filteredSchedule = mockSchedule.filter((event) => {
    const matchesSubject = selectedSubject === 'all' || event.subject === selectedSubject
    return matchesSubject
  })

  const getWeekDates = (date: Date): Date[] => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startOfWeek)
      newDate.setDate(startOfWeek.getDate() + i)
      dates.push(newDate)
    }
    return dates
  }

  const weekDates = getWeekDates(currentDate)

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredSchedule.filter((event) => event.date === dateStr)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1>Lịch học</h1>
          <p className='text-muted-foreground'>Quản lý lịch dạy học và các sự kiện</p>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Lọc theo môn học' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả môn học</SelectItem>
              <SelectItem value='Toán học 12A1'>Toán học 12A1</SelectItem>
              <SelectItem value='Toán học 12A2'>Toán học 12A2</SelectItem>
              <SelectItem value='Vật lý 11B1'>Vật lý 11B1</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' />
                Tạo sự kiện
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo sự kiện mới</DialogTitle>
                <DialogDescription>Thêm buổi học hoặc sự kiện vào lịch</DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Tiêu đề sự kiện</Label>
                  <Input placeholder='Nhập tiêu đề sự kiện' />
                </div>
                <div className='space-y-2'>
                  <Label>Môn học</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn môn học' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='math1'>Toán học 12A1</SelectItem>
                      <SelectItem value='math2'>Toán học 12A2</SelectItem>
                      <SelectItem value='physics'>Vật lý 11B1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Ngày</Label>
                    <Input type='date' />
                  </div>
                  <div className='space-y-2'>
                    <Label>Loại sự kiện</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn loại' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='lecture'>Bài giảng</SelectItem>
                        <SelectItem value='exam'>Kiểm tra</SelectItem>
                        <SelectItem value='review'>Ôn tập</SelectItem>
                        <SelectItem value='online'>Trực tuyến</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Giờ bắt đầu</Label>
                    <Input type='time' />
                  </div>
                  <div className='space-y-2'>
                    <Label>Giờ kết thúc</Label>
                    <Input type='time' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label>Địa điểm</Label>
                  <Input placeholder='Nhập địa điểm' />
                </div>
                <div className='space-y-2'>
                  <Label>Mô tả</Label>
                  <Textarea placeholder='Nhập mô tả sự kiện' />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setIsCreateEventOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsCreateEventOpen(false)}>Tạo sự kiện</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>
              {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={() => navigateWeek('prev')}>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={() => setCurrentDate(new Date())}>
                Hôm nay
              </Button>
              <Button variant='outline' size='sm' onClick={() => navigateWeek('next')}>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Week View */}
          <div className='overflow-x-auto'>
            <div className='min-w-[800px]'>
              {/* Day headers */}
              <div className='grid grid-cols-8 gap-1 mb-2'>
                <div className='text-sm font-medium text-muted-foreground p-2 text-center border rounded'>Giờ</div>
                {weekDates.map((date, index) => (
                  <div key={index} className='text-center p-2 border rounded'>
                    <div className='text-sm font-medium'>{date.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                    <div
                      className={`text-lg ${
                        date.toDateString() === new Date().toDateString()
                          ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                          : ''
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className='space-y-1'>
                {mockTimeSlots.map((slot) => (
                  <div key={slot.time} className='grid grid-cols-8 gap-1'>
                    <div className='text-sm text-muted-foreground p-2 border rounded text-center'>{slot.label}</div>
                    {weekDates.map((date, dayIndex) => {
                      const events = getEventsForDate(date).filter((event) =>
                        event.startTime.startsWith(slot.time.split(':')[0])
                      )
                      return (
                        <div key={`${slot.time}-${dayIndex}`} className='min-h-[60px] border rounded p-1'>
                          {events.map((event) => (
                            <div
                              key={event.id}
                              className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 ${getTypeColor(event.type)}`}
                            >
                              <div className='font-medium truncate'>{event.title}</div>
                              <div className='text-xs opacity-75'>{event.startTime}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Sự kiện sắp tới</CardTitle>
          <CardDescription>Danh sách các buổi học và sự kiện trong tuần</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredSchedule
              .filter((event) => event.status === 'upcoming')
              .sort(
                (a, b) =>
                  new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime()
              )
              .map((event) => (
                <div key={event.id} className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-4'>
                    <div className={`p-2 rounded-lg ${getTypeColor(event.type)}`}>{getTypeIcon(event.type)}</div>
                    <div className='space-y-1'>
                      <h3 className='font-medium'>{event.title}</h3>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {event.subject}
                        </Badge>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-4 w-4' />
                          {new Date(event.date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-4 w-4' />
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className='flex items-center gap-1'>
                          <MapPin className='h-4 w-4' />
                          {event.location}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Users className='h-4 w-4' />
                          {event.students} sinh viên
                        </div>
                      </div>
                      {event.description && <p className='text-sm text-muted-foreground mt-1'>{event.description}</p>}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm'>
                      <Bell className='h-4 w-4' />
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

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{filteredSchedule.filter((e) => e.status === 'upcoming').length}</div>
            <div className='text-sm text-muted-foreground'>Sự kiện sắp tới</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{filteredSchedule.filter((e) => e.status === 'completed').length}</div>
            <div className='text-sm text-muted-foreground'>Đã hoàn thành</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{filteredSchedule.filter((e) => e.type === 'lecture').length}</div>
            <div className='text-sm text-muted-foreground'>Bài giảng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{filteredSchedule.reduce((sum, e) => sum + e.students, 0)}</div>
            <div className='text-sm text-muted-foreground'>Tổng sinh viên</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
