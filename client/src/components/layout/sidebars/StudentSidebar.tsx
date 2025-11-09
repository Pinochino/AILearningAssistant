import React, { useEffect, useState } from 'react';
import { SquareLibrary, Brain, BookOpen, Calendar, BarChart3, MessageSquare, Trophy, Target, Clock } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { useNavigation } from '../../../hooks/useNavigation';
import { MessagesService } from '../../../services/messages';
import { useAuth } from '../../../hooks/useAuth';
import { getSocket, ensureSocketConnected } from '../../../lib/socket';

interface StudentSidebarProps {
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
    id: 'subjects',
    label: 'Môn học',
    icon: BookOpen,
    badge: '5',
  },
  {
    id: 'subject-search',
    label: 'Tìm kiếm môn học',
    icon: SquareLibrary,
    badge: null,
  },
  {
    id: 'schedule',
    label: 'Thời khóa biểu',
    icon: Calendar,
    badge: null,
  },

  {
    id: 'ai-tutor',
    label: 'Gia sư AI',
    icon: Brain,
    badge: null,
  },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: MessageSquare,
    badge: null,
  },
  {
    id: 'achievements',
    label: 'Thành tích',
    icon: Trophy,
    badge: null,
  },
];

export function StudentSidebar({ isOpen }: StudentSidebarProps) {
  const { currentPage, navigateTo } = useNavigation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isLoading: isAuthLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string) => {
    navigateTo(itemId);
  };

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

    // Listen to realtime new messages to refresh count
    (async () => {
      try {
        await ensureSocketConnected();
      } catch { }
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

    // Listen to local event when a conversation is marked as read to decrement immediately
    const onConvRead = () => {
      setUnreadCount((prev) => Math.max(0, Number(prev || 0) - 1));
    };
    try { window.addEventListener('conversation_read', onConvRead as any); } catch { }

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
              <p className="text-xs text-sidebar-foreground/70">Học sinh</p>
            </div>
          )}
        </div>
      </div>

      {/* Study Progress Widget */}
      {isOpen && (
        <div className="px-4 mb-4">
          <div className="bg-sidebar-accent rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sidebar-accent-foreground" />
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                Tiến độ hôm nay
              </span>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-xs text-sidebar-accent-foreground/70">
              65% hoàn thành - Còn 2 bài quiz
            </p>
          </div>
        </div>
      )}

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
                  {(item.id === 'messages' ? (unreadCount > 0 ? String(unreadCount) : null) : item.badge) && (
                    <Badge
                      variant={(item.id === 'ai-tutor' && item.badge === 'New') ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.id === 'messages' ? unreadCount : item.badge}
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