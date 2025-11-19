import React, { useEffect, useState } from 'react';
import { Brain, BookOpen, Users, FileText, BarChart3, MessageSquare, Calendar, Plus } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useNavigation } from '../../../hooks/useNavigation';
import { MessagesService } from '../../../services/messages';
import { useAuth } from '../../../hooks/useAuth';
import { ensureSocketConnected, getSocket } from '../../../lib/socket';
import { teacherApi } from '../../../services/api';

interface TeacherSidebarProps {
  isOpen: boolean;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Trang chủ',
    icon: BarChart3,
    badge: null,
  },
  {
    id: 'classes',
    label: 'Lớp học của tôi',
    icon: BookOpen,
    badge: null,
  },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: MessageSquare,
    badge: null,
  },
];

export function TeacherSidebar({ isOpen }: TeacherSidebarProps) {
  const { currentPage, navigateTo } = useNavigation();
  const { isLoading: isAuthLoading, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);

  const handleItemClick = (itemId: string) => {
    navigateTo(itemId);
  };

  // Fetch class count
  useEffect(() => {
    const fetchClassCount = async () => {
      if (!user?.id) return;
      try {
        const response = await teacherApi.getClasses(user.id);
        if (response.success && response.data?.items) {
          setClassCount(response.data.items.length);
        }
      } catch (error) {
        console.error('Failed to fetch class count:', error);
      }
    };

    fetchClassCount();
  }, [user?.id]);

  // Fetch unread conversations count and keep it updated on new messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isAuthLoading) return;
      try {
        const res: any = await MessagesService.getConversations();
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        const unread = (list || []).filter((c: any) => Number(c?.unreadCount || 0) > 0).length;
        if (!cancelled) setUnreadCount(unread);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    })();

    (async () => {
      try { await ensureSocketConnected(); } catch { }
      const s = getSocket();
      if (!s) return;
      const refresh = async () => {
        try {
          const res: any = await MessagesService.getConversations();
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
          const unread = (list || []).filter((c: any) => Number(c?.unreadCount || 0) > 0).length;
          if (!cancelled) setUnreadCount(unread);
        } catch { }
      };
      s.on('new_message', refresh);
      return () => { try { s.off('new_message', refresh); } catch { } };
    })();

    return () => { cancelled = true; };
  }, [isAuthLoading]);

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary rounded-lg p-2">
            <Brain className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">AI Learning</h1>
              <p className="text-xs text-sidebar-foreground/70">Giáo viên</p>
            </div>
          )}
        </div>
      </div>

      <nav className="px-2 space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={currentPage === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                !isOpen && 'px-2',
                currentPage === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
              onClick={() => handleItemClick(item.id)}
            >
              <item.icon className={cn('h-5 w-5', !isOpen && 'mx-auto')} />
              {isOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {(item.id === 'messages' ? (unreadCount > 0 ? String(unreadCount) : null) :
                    item.id === 'subjects' ? (classCount > 0 ? String(classCount) : null) : item.badge) && (
                      <Badge variant="secondary" className="text-xs">
                        {item.id === 'messages' ? unreadCount : (item.id === 'subjects' ? classCount : item.badge)}
                      </Badge>
                    )}
                </>
              )}
            </Button>

          </div>
        ))}
      </nav>
    </aside>
  );
}