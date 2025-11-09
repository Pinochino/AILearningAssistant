import { React, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

import {
  Calendar,
  Clock,
  MapPin,
  User,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const mockSchedule = {
  '2024-09-18': [
    {
      id: '1',
      subject: 'Toán học',
      teacher: 'GV. Nguyễn Văn Giáo',
      time: '07:30 - 08:15',
      room: 'Phòng 201',
      type: 'lesson',
      status: 'upcoming',
    },
    {
      id: '2',
      subject: 'Vật lý',
      teacher: 'GV. Lê Văn Phúc',
      time: '08:25 - 09:10',
      room: 'Phòng 301',
      type: 'lesson',
      status: 'upcoming',
    },
    {
      id: '3',
      subject: 'Kiểm tra Hóa học',
      teacher: 'GV. Trần Thị Hóa',
      time: '09:20 - 10:05',
      room: 'Phòng 102',
      type: 'exam',
      status: 'upcoming',
    },
    {
      id: '4',
      subject: 'Thể dục',
      teacher: 'GV. Phạm Văn Thể',
      time: '10:15 - 11:00',
      room: 'Sân thể thao',
      type: 'physical',
      status: 'upcoming',
    },
  ],
  '2024-09-19': [
    {
      id: '5',
      subject: 'Hóa học',
      teacher: 'GV. Trần Thị Hóa',
      time: '07:30 - 08:15',
      room: 'Phòng 102',
      type: 'lesson',
      status: 'upcoming',
    },
    {
      id: '6',
      subject: 'Văn học',
      teacher: 'GV. Nguyễn Thị Văn',
      time: '08:25 - 09:10',
      room: 'Phòng 105',
      type: 'lesson',
      status: 'upcoming',
    },
  ],
  '2024-09-20': [
    {
      id: '7',
      subject: 'Toán học - Ôn luyện',
      teacher: 'GV. Nguyễn Văn Giáo',
      time: '07:30 - 08:15',
      room: 'Phòng 201',
      type: 'review',
      status: 'upcoming',
    },
    {
      id: '8',
      subject: 'Tự học',
      teacher: '',
      time: '08:25 - 09:10',
      room: 'Thư viện',
      type: 'self-study',
      status: 'upcoming',
    },
  ],
};

const mockUpcomingEvents = [
  {
    id: '1',
    title: 'Kiểm tra 15 phút - Toán học',
    subject: 'Toán học',
    date: '2024-09-21',
    time: '07:30',
    type: 'quiz',
    teacher: 'GV. Nguyễn Văn Giáo',
  },
  {
    id: '2',
    title: 'Nộp bài tập lớn - Vật lý',
    subject: 'Vật lý',
    date: '2024-09-22',
    time: '23:59',
    type: 'assignment',
    teacher: 'GV. Lê Văn Phúc',
  },
  {
    id: '3',
    title: 'Hội thảo khoa học',
    subject: 'Chung',
    date: '2024-09-25',
    time: '14:00',
    type: 'event',
    teacher: 'Ban tổ chức',
  },
];

export function Schedule() {
  const [selectedDate, setSelectedDate] = useState('2024-09-18');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date('2024-09-16'));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'exam': return '📝';
      case 'quiz': return '❓';
      case 'assignment': return '📋';
      case 'event': return '🎯';
      case 'physical': return '🏃';
      case 'review': return '🔄';
      case 'self-study': return '📖';
      default: return '📅';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'quiz': return 'bg-yellow-100 text-yellow-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'physical': return 'bg-orange-100 text-orange-800';
      case 'review': return 'bg-indigo-100 text-indigo-800';
      case 'self-study': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWeekDates = (): Date[] => {
    const start = new Date(currentWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };


  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Thời khóa biểu</h1>
          <p className="text-muted-foreground">
            Lịch học và các sự kiện quan trọng
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Nhắc nhở
          </Button>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm sự kiện
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm sự kiện mới</DialogTitle>
                <DialogDescription>
                  Tạo lịch nhắc nhở cá nhân
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Tiêu đề</Label>
                  <Input id="eventTitle" placeholder="Nhập tiêu đề sự kiện" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Loại sự kiện</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sự kiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Bài tập</SelectItem>
                      <SelectItem value="exam">Kiểm tra</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="personal">Cá nhân</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Ngày</Label>
                    <Input id="eventDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Giờ</Label>
                    <Input id="eventTime" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventNote">Ghi chú</Label>
                  <Textarea id="eventNote" placeholder="Ghi chú thêm..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsAddEventOpen(false)}>
                    Thêm sự kiện
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar & Schedule */}
        <div className="lg:col-span-2 space-y-4">
          {/* Week Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(currentWeek.getDate() - 7);
                    setCurrentWeek(newWeek);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="font-medium">
                  Tuần {Math.ceil(currentWeek.getDate() / 7)} - Tháng {currentWeek.getMonth() + 1}, {currentWeek.getFullYear()}
                </h3>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(currentWeek.getDate() + 7);
                    setCurrentWeek(newWeek);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2">
                {getWeekDates().map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const hasSchedule = mockSchedule[dateStr];

                  return (
                    <Button
                      key={dateStr}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-16 flex flex-col gap-1 ${isToday ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <span className="text-xs font-medium">{weekDays[index]}</span>
                      <span className="text-lg">{date.getDate()}</span>
                      {hasSchedule && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>
                Lịch học ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockSchedule[selectedDate] ? (
                <div className="space-y-3">
                  {mockSchedule[selectedDate].map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{item.subject}</h3>
                          <Badge className={getTypeColor(item.type)}>
                            {item.type === 'lesson' ? 'Học' :
                              item.type === 'exam' ? 'Kiểm tra' :
                                item.type === 'physical' ? 'Thể dục' :
                                  item.type === 'review' ? 'Ôn tập' :
                                    item.type === 'self-study' ? 'Tự học' : item.type}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.time}</span>
                          </div>
                          {item.teacher && (
                            <>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{item.teacher}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.room}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Không có lịch học trong ngày này</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tiết học</span>
                  <span className="font-medium">
                    {mockSchedule[new Date().toISOString().split('T')[0]]?.length || 0} tiết
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Thời gian</span>
                  <span className="font-medium">7:30 - 11:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiết tiếp theo</span>
                  <span className="font-medium text-primary">Toán học</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}