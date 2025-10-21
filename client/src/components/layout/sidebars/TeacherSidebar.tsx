import { Brain, BookOpen, Users, FileText, BarChart3, MessageSquare, Calendar, Plus } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useNavigation } from '../../../hooks/useNavigation';

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
    id: 'subjects',
    label: 'Môn học của tôi',
    icon: BookOpen,
    badge: '3',
  },
  {
    id: 'students',
    label: 'Học sinh',
    icon: Users,
    badge: null,
  },
  {
    id: 'content',
    label: 'Nội dung học tập',
    icon: FileText,
    badge: null,
  },
  {
    id: 'schedule',
    label: 'Lịch học',
    icon: Calendar,
    badge: null,
  },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: MessageSquare,
    badge: '5',
  },
];

export function TeacherSidebar({ isOpen }: TeacherSidebarProps) {
  const { currentPage, navigateTo } = useNavigation();

  const handleItemClick = (itemId: string) => {
    navigateTo(itemId);
  };

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

      {/* Quick Actions */}
      {isOpen && (
        <div className="px-4 mb-4">
          <Button className="w-full gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Tạo nội dung mới
          </Button>
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
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
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