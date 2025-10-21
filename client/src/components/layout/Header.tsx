import { Bell, Menu, Search, LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { navigateTo } = useNavigation();

  const notifications = [
    { id: '1', title: 'Hệ thống bảo trì', content: 'Hệ thống sẽ bảo trì lúc 2:00 AM Chủ Nhật.' },
    { id: '2', title: 'Quiz mới', content: 'Giáo viên Toán vừa đăng 1 quiz mới.' },
    { id: '3', title: 'Thông báo lớp học', content: 'Lịch học tuần tới đã được cập nhật.' },
    { id: '4', title: 'Tin tức', content: 'Trường tổ chức hội thao vào ngày 25/9.' },
  ];

  // ✅ Nếu user chưa có, không render header
  if (!user) return null;

  // ✅ Xử lý role an toàn
  const role = user.role || 'unknown';

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      default:
        return 'Người dùng';
    }
  };

  const handleLogout = () => logout();

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Nút toggle sidebar + thanh tìm kiếm */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex relative flex-1 max-w-3xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm môn học, tài liệu, quiz..."
              className="pl-9 bg-muted/30 w-full"
            />
          </div>
        </div>

        {/* Thông báo + Avatar người dùng */}
        <div className="flex items-center gap-3">
          {/* 🔔 Dropdown thông báo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80" forceMount>
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3">
                    Không có thông báo nào
                  </p>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start">
                      <span className="font-medium">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.content}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 👤 Dropdown người dùng */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback>
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name || 'Người dùng'}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigateTo('profile')}>
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
