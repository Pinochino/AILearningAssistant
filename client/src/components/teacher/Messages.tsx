import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Search,
  Plus,
  Send,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  StarOff,
  Filter,
  MoreVertical,
  Users,
  BookOpen,
  Clock,
  Check,
  CheckCheck,
  Download,
  MessageSquare
} from 'lucide-react'

const mockMessages = [
  {
    id: '1',
    sender: {
      name: 'Nguyễn Văn A',
      email: 'student1@example.com',
      avatar: null,
      studentId: 'SV001'
    },
    subject: 'Thắc mắc về bài tập đạo hàm',
    content: 'Thầy ơi, em không hiểu cách tính đạo hàm của hàm hợp. Thầy có thể giải thích chi tiết hơn không ạ?',
    timestamp: '2024-09-18T10:30:00Z',
    isRead: false,
    isStarred: false,
    isArchived: false,
    priority: 'normal',
    attachments: [],
    replies: [
      {
        id: 'r1',
        sender: 'Nguyễn Văn Giáo',
        content: 'Chào em! Thầy sẽ gửi video giải thích chi tiết cho em nhé.',
        timestamp: '2024-09-18T11:00:00Z'
      }
    ]
  },
  {
    id: '2',
    sender: {
      name: 'Trần Thị B',
      email: 'student2@example.com',
      avatar: null,
      studentId: 'SV002'
    },
    subject: 'Xin nghỉ học buổi thứ 3',
    content: 'Thầy ơi, em bị ốm nên không thể tham gia buổi học thứ 3 tuần này. Em xin phép nghỉ học ạ.',
    timestamp: '2024-09-17T14:20:00Z',
    isRead: true,
    isStarred: true,
    isArchived: false,
    priority: 'high',
    attachments: [],
    replies: []
  },
  {
    id: '3',
    sender: {
      name: 'Lê Minh C',
      email: 'student3@example.com',
      avatar: null,
      studentId: 'SV003'
    },
    subject: 'Gửi bài tập về nhà',
    content: 'Thầy ơi, em đã hoàn thành bài tập về nhà và gửi file đính kèm. Thầy kiểm tra giúp em ạ.',
    timestamp: '2024-09-16T16:45:00Z',
    isRead: true,
    isStarred: false,
    isArchived: false,
    priority: 'normal',
    attachments: ['baitap_daoham.pdf'],
    replies: []
  },
  {
    id: '4',
    sender: {
      name: 'Phạm Thị D',
      email: 'student4@example.com',
      avatar: null,
      studentId: 'SV004'
    },
    subject: 'Đăng ký tham gia lớp học',
    content:
      'Thầy ơi, em muốn đăng ký tham gia lớp Toán học 12A1. Em đã học qua chương trình cơ bản và muốn học nâng cao.',
    timestamp: '2024-09-15T09:15:00Z',
    isRead: false,
    isStarred: false,
    isArchived: false,
    priority: 'high',
    attachments: [],
    replies: []
  }
]

const mockAnnouncements = [
  {
    id: '1',
    title: 'Thông báo lịch kiểm tra giữa kỳ',
    content: 'Các em lưu ý, lịch kiểm tra giữa kỳ sẽ được tổ chức vào ngày 25/9/2024. Các em chuẩn bị ôn tập kỹ nhé.',
    timestamp: '2024-09-18T08:00:00Z',
    recipients: 'Toán học 12A1',
    isPinned: true
  },
  {
    id: '2',
    title: 'Gửi tài liệu ôn tập',
    content: 'Thầy đã upload tài liệu ôn tập chương 1-3. Các em tải về và ôn tập kỹ nhé.',
    timestamp: '2024-09-17T15:30:00Z',
    recipients: 'Toán học 12A2',
    isPinned: false
  }
]

export function Messages() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [replyContent, setReplyContent] = useState('')

  const filteredMessages = mockMessages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFilter = true
    switch (filter) {
      case 'unread':
        matchesFilter = !message.isRead
        break
      case 'starred':
        matchesFilter = message.isStarred
        break
      case 'high':
        matchesFilter = message.priority === 'high'
        break
      case 'archived':
        matchesFilter = message.isArchived
        break
    }

    return matchesSearch && matchesFilter
  })

  const unreadCount = mockMessages.filter((m) => !m.isRead).length
  const starredCount = mockMessages.filter((m) => m.isStarred).length

  const handleReply = (messageId: string) => {
    // Logic to send reply
    console.log('Replying to message:', messageId, replyContent)
    setReplyContent('')
  }

  const handleStar = (messageId: string) => {
    // Logic to toggle star
    console.log('Toggling star for message:', messageId)
  }

  const handleArchive = (messageId: string) => {
    // Logic to archive message
    console.log('Archiving message:', messageId)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString('vi-VN', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1>Tin nhắn</h1>
          <p className='text-muted-foreground'>Quản lý tin nhắn và thông báo với sinh viên</p>
        </div>

        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Soạn tin nhắn
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Soạn tin nhắn mới</DialogTitle>
              <DialogDescription>Gửi tin nhắn hoặc thông báo cho sinh viên</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Người nhận</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn người nhận' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả sinh viên</SelectItem>
                    <SelectItem value='math1'>Toán học 12A1</SelectItem>
                    <SelectItem value='math2'>Toán học 12A2</SelectItem>
                    <SelectItem value='physics'>Vật lý 11B1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Tiêu đề</Label>
                <Input placeholder='Nhập tiêu đề tin nhắn' />
              </div>
              <div className='space-y-2'>
                <Label>Nội dung</Label>
                <Textarea placeholder='Nhập nội dung tin nhắn...' rows={6} />
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsComposeOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsComposeOpen(false)}>
                  <Send className='h-4 w-4 mr-2' />
                  Gửi tin nhắn
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm tin nhắn...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Lọc tin nhắn' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả ({mockMessages.length})</SelectItem>
                <SelectItem value='unread'>Chưa đọc ({unreadCount})</SelectItem>
                <SelectItem value='starred'>Đã gắn sao ({starredCount})</SelectItem>
                <SelectItem value='high'>Ưu tiên cao</SelectItem>
                <SelectItem value='archived'>Đã lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Messages List */}
        <div className='lg:col-span-2 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tin nhắn từ sinh viên</CardTitle>
              <CardDescription>Danh sách tin nhắn và yêu cầu từ sinh viên</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='space-y-1'>
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedMessage === message.id ? 'bg-muted' : ''
                    } ${!message.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setSelectedMessage(message.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarFallback>
                          {message.sender.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className={`font-medium truncate ${!message.isRead ? 'font-semibold' : ''}`}>
                            {message.sender.name}
                          </h3>
                          <Badge variant='outline' className='text-xs'>
                            {message.sender.studentId}
                          </Badge>
                          {message.priority === 'high' && (
                            <Badge variant='destructive' className='text-xs'>
                              Ưu tiên cao
                            </Badge>
                          )}
                          {!message.isRead && <div className='w-2 h-2 bg-blue-600 rounded-full'></div>}
                        </div>
                        <p className='text-sm font-medium text-muted-foreground mb-1'>{message.subject}</p>
                        <p className='text-sm text-muted-foreground line-clamp-2'>{message.content}</p>
                        <div className='flex items-center gap-4 text-xs text-muted-foreground mt-2'>
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.attachments.length > 0 && <span>📎 {message.attachments.length} tệp đính kèm</span>}
                          {message.replies.length > 0 && <span>💬 {message.replies.length} phản hồi</span>}
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStar(message.id)
                          }}
                        >
                          {message.isStarred ? (
                            <Star className='h-4 w-4 text-yellow-500 fill-current' />
                          ) : (
                            <StarOff className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleArchive(message.id)
                          }}
                        >
                          <Archive className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className='space-y-4'>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Chi tiết tin nhắn</CardTitle>
                  <div className='flex gap-1'>
                    <Button variant='outline' size='sm'>
                      <Reply className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm'>
                      <Forward className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const message = mockMessages.find((m) => m.id === selectedMessage)
                  if (!message) return null

                  return (
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback>
                              {message.sender.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium'>{message.sender.name}</p>
                            <p className='text-sm text-muted-foreground'>{message.sender.email}</p>
                          </div>
                        </div>
                        <h3 className='font-semibold'>{message.subject}</h3>
                        <p className='text-sm text-muted-foreground'>{formatTimestamp(message.timestamp)}</p>
                      </div>

                      <div className='border-t pt-4'>
                        <p className='whitespace-pre-wrap'>{message.content}</p>
                      </div>

                      {message.attachments.length > 0 && (
                        <div className='border-t pt-4'>
                          <h4 className='font-medium mb-2'>Tệp đính kèm</h4>
                          <div className='space-y-2'>
                            {message.attachments.map((file, index) => (
                              <div key={index} className='flex items-center gap-2 p-2 border rounded'>
                                <span>📎</span>
                                <span className='text-sm'>{file}</span>
                                <Button variant='outline' size='sm'>
                                  <Download className='h-4 w-4' />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.replies.length > 0 && (
                        <div className='border-t pt-4'>
                          <h4 className='font-medium mb-2'>Phản hồi</h4>
                          <div className='space-y-2'>
                            {message.replies.map((reply) => (
                              <div key={reply.id} className='p-3 bg-muted/50 rounded'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <span className='font-medium text-sm'>{reply.sender}</span>
                                  <span className='text-xs text-muted-foreground'>
                                    {formatTimestamp(reply.timestamp)}
                                  </span>
                                </div>
                                <p className='text-sm'>{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className='border-t pt-4'>
                        <div className='space-y-2'>
                          <Label>Phản hồi</Label>
                          <Textarea
                            placeholder='Nhập phản hồi...'
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={3}
                          />
                          <Button size='sm' onClick={() => handleReply(message.id)} disabled={!replyContent.trim()}>
                            <Send className='h-4 w-4 mr-2' />
                            Gửi phản hồi
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='p-8 text-center text-muted-foreground'>
                <MessageSquare className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Chọn một tin nhắn để xem chi tiết</p>
              </CardContent>
            </Card>
          )}

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Thông báo đã gửi</CardTitle>
              <CardDescription>Các thông báo đã gửi cho sinh viên</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {mockAnnouncements.map((announcement) => (
                  <div key={announcement.id} className='p-3 border rounded-lg'>
                    <div className='flex items-start justify-between'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-medium text-sm'>{announcement.title}</h4>
                          {announcement.isPinned && (
                            <Badge variant='secondary' className='text-xs'>
                              Ghim
                            </Badge>
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {announcement.recipients} • {formatTimestamp(announcement.timestamp)}
                        </p>
                        <p className='text-sm text-muted-foreground line-clamp-2'>{announcement.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
