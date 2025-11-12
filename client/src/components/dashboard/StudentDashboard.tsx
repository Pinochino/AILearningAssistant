import React, { useState } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { AnnouncementSection, Announcement } from '../dashboard/AnnouncementSection';
import { AnnouncementService } from '../../services/announcements';

export function StudentDashboard() {
  const { navigateTo } = useNavigation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = (await AnnouncementService.list()) as any; // { items }
        const list = Array.isArray(res?.items) ? res.items : [];
        if (!mounted) return;
        setAnnouncements(list.map((n: any) => ({
          id: n._id || n.id,
          title: String(n.title || 'Thông báo'),
          content: String(n.content || ''),
          author: ((): string => {
            const direct = n?.authorName;
            if (typeof direct === 'string' && direct.trim()) return direct.trim();
            const a = n?.author;
            if (a) {
              const first = (a.firstName || '').toString().trim();
              const last = (a.lastName || '').toString().trim();
              const full = `${first} ${last}`.trim();
              if (full) return full;
              if (typeof a.name === 'string' && a.name.trim()) return a.name.trim();
              if (typeof a.email === 'string' && a.email.trim()) return a.email.trim();
            }
            if (typeof n.author === 'string' && n.author.trim()) return n.author.trim();
            return 'Hệ thống';
          })(),
          date: new Date(n.createdAt || Date.now()).toLocaleString('vi-VN'),
        })));
      } catch {
        if (!mounted) return;
        setAnnouncements([]);
      }
    })();
    return () => { mounted = false; };
  }, []);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Chào mừng trở lại!</h1>
          <p className="text-muted-foreground">
            Hôm nay là ngày tuyệt vời để học tập. Bạn đã sẵn sàng chưa?
          </p>
        </div>

      </div>
      {/* Announcement area (Student) */}
      <div className="mt-4">
        <AnnouncementSection announcements={announcements} />
      </div>
    </div>
  );
}