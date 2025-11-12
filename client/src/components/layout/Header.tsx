import React, { useEffect, useState } from 'react';
import { Bell, Menu, Search, LogOut, User, Circle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { NotificationsService } from '../../services/notifications';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { navigateTo } = useNavigation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const markAsRead = async (id: string) => {
    try {
      await NotificationsService.markAsRead(id);
      setNotifications((prev) => prev.map((n: any) => ((n._id || n.id) === id ? { ...n, isRead: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch { }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [list, cnt] = await Promise.all([
          NotificationsService.getAll() as any,
          NotificationsService.getUnreadCount() as any,
        ]);
        // Expect { success, data }
        if (!mounted) return;
        const raw = Array.isArray(list?.data) ? list.data : (list?.data?.items || []);
        // filter out message-related notifications
        const filtered = raw.filter((n: any) => n?.type !== 'message' && n?.category !== 'message');
        setNotifications(filtered);
        // recompute unread locally based on filtered list
        const unreadCount = filtered.reduce((acc: number, n: any) => acc + ((n.isRead === true || n.read === true || n.status === 'read' || n.unread === false) ? 0 : 1), 0);
        setUnread(unreadCount);
      } catch (e) {
        // silently ignore in header
        setNotifications([]);
        setUnread(0);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);


  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học sinh';
      default: return role;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
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

        <div className="flex items-center gap-3">
          {user.role !== 'admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {(unread > 0) && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unread}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700"
                sideOffset={8}
                collisionPadding={16}
              >
                <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3">Không có thông báo nào</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => {
                      const id = n._id || n.id;
                      const isRead = (n.isRead === true) || (n.read === true) || (n.status === 'read') || (n.unread === false);
                      const title = n.title || n.type || 'Thông báo';
                      const link = n.link || n.url || n.href || n.target || n.path || n.destination;
                      const page = n.page || n.route || n.routeName; // preferred in-app destination
                      const params = n.params || n.query || n.meta || (n.payload && n.payload.params) || undefined;
                      return (
                        <div
                          key={id}
                          className={`px-3 py-2 rounded-md ${isRead ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/30'}`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              className="text-left flex-1 font-medium truncate hover:underline"
                              onClick={() => {
                                if (page) {
                                  navigateTo(page, params);
                                } else if (typeof link === 'string' && link.length > 0) {
                                  window.location.assign(link);
                                }
                                if (!isRead) markAsRead(String(id));
                              }}
                              title={title}
                            >
                              {title}
                            </button>
                            {!isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { markAsRead(String(id)); }}
                                title={'Đánh dấu đã đọc'}
                              >
                                <Circle className={`h-3 w-3 text-primary fill-primary`} />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigateTo('profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}