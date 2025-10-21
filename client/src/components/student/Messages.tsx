import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Search,
  Send,
  MessageSquare,
  Users,
  Bell,
  Clock,
  Check,
  CheckCheck,
  Reply,
  MoreVertical,
  Filter,
  Archive,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

// Mock data for messages
const mockConversations = [
  {
    id: '1',
    name: 'GV. Nguyễn Văn Giáo',
    role: 'teacher',
    subject: 'Toán học',
    lastMessage: 'Chúc mừng bạn đã hoàn thành bài quiz với điểm số cao!',
    timestamp: '2024-09-18T10:30:00',
    unreadCount: 2,
    isOnline: true,
    avatar: null,
  },
  {
    id: '2',
    name: 'GV. Trần Thị Hóa',
    role: 'teacher',
    subject: 'Hóa học',
    lastMessage: 'Tài liệu bài giảng mới đã được đăng tải.',
    timestamp: '2024-09-18T09:15:00',
    unreadCount: 0,
    isOnline: false,
    avatar: null,
  },
  {
    id: '3',
    name: 'Lê Minh Học',
    role: 'student',
    subject: 'Bạn cùng lớp',
    lastMessage: 'Bạn có thể chia sẻ tài liệu ôn tập không?',
    timestamp: '2024-09-17T16:45:00',
    unreadCount: 1,
    isOnline: true,
    avatar: null,
  },
  {
    id: '4',
    name: 'Phòng Đào tạo',
    role: 'admin',
    subject: 'Thông báo chung',
    lastMessage: 'Lịch thi cuối kỳ đã được cập nhật.',
    timestamp: '2024-09-17T14:20:00',
    unreadCount: 0,
    isOnline: false,
    avatar: null,
  },
];

const mockMessages = [
  {
    id: '1',
    conversationId: '1',
    senderId: 'teacher1',
    senderName: 'GV. Nguyễn Văn Giáo',
    content: 'Chào em! Em có câu hỏi gì về bài học hôm nay không?',
    timestamp: '2024-09-18T10:00:00',
    isRead: true,
    isOwn: false,
  },
  {
    id: '2',
    conversationId: '1',
    senderId: 'student1',
    senderName: 'Bạn',
    content: 'Dạ thưa thầy, em muốn hỏi về cách giải bài tập số 5 trong chương 2.',
    timestamp: '2024-09-18T10:05:00',
    isRead: true,
    isOwn: true,
  },
  {
    id: '3',
    conversationId: '1',
    senderId: 'teacher1',
    senderName: 'GV. Nguyễn Văn Giáo',
    content: 'Được rồi, thầy sẽ gửi em video giải chi tiết bài đó nhé.',
    timestamp: '2024-09-18T10:10:00',
    isRead: true,
    isOwn: false,
  },
  {
    id: '4',
    conversationId: '1',
    senderId: 'teacher1',
    senderName: 'GV. Nguyễn Văn Giáo',
    content: 'Chúc mừng bạn đã hoàn thành bài quiz với điểm số cao!',
    timestamp: '2024-09-18T10:30:00',
    isRead: false,
    isOwn: false,
  },
];

const mockAnnouncements = [
  {
    id: '1',
    title: 'Lịch thi cuối kỳ học kỳ 1',
    content: 'Lịch thi cuối kỳ học kỳ 1 năm học 2024-2025 đã được cập nhật. Vui lòng kiểm tra lịch thi của mình.',
    author: 'Phòng Đào tạo',
    timestamp: '2024-09-17T14:20:00',
    isRead: false,
    priority: 'high',
  },
  {
    id: '2',
    title: 'Tài liệu ôn tập môn Toán',
    content: 'Tài liệu ôn tập tổng hợp môn Toán học kỳ 1 đã được đăng tải. Học sinh có thể tải về để ôn tập.',
    author: 'GV. Nguyễn Văn Giáo',
    timestamp: '2024-09-16T09:30:00',
    isRead: true,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Thông báo nghỉ lễ',
    content: 'Nhà trường thông báo nghỉ lễ Quốc khánh từ ngày 2/9 đến 4/9. Lịch học sẽ được điều chỉnh.',
    author: 'Ban Giám hiệu',
    timestamp: '2024-08-30T16:00:00',
    isRead: true,
    priority: 'low',
  },
];

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const currentConversation = mockConversations.find(c => c.id === selectedConversation);
  const currentMessages = mockMessages.filter(m => m.conversationId === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Simulate sending message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tin nhắn</h1>
        <p className="text-muted-foreground">
          Liên lạc với giáo viên và bạn bè
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cuộc trò chuyện</CardTitle>
              <Badge variant="secondary">{mockConversations.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                    selectedConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.subject}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2">
          {currentConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {currentConversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{currentConversation.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentConversation.subject}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Lưu trữ
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa cuộc trò chuyện
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.isOwn && (
                            <div className="flex items-center gap-1">
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chọn cuộc trò chuyện</h3>
                <p className="text-muted-foreground">
                  Chọn một cuộc trò chuyện để bắt đầu
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo
          </CardTitle>
          <CardDescription>
            Các thông báo quan trọng từ nhà trường và giáo viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 border rounded-lg ${
                  !announcement.isRead ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {getPriorityLabel(announcement.priority)}
                      </Badge>
                      {!announcement.isRead && (
                        <Badge variant="default" className="text-xs">Mới</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Từ: {announcement.author}</span>
                      <span>•</span>
                      <span>
                        {new Date(announcement.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Reply className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
