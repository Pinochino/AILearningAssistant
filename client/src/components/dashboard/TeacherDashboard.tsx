import React, { useState } from 'react';
import { AnnouncementSection, Announcement } from '../dashboard/AnnouncementSection';
import { AnnouncementCreator } from '../dashboard/AnnouncementCreator';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Plus,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Eye
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigation } from '../../hooks/useNavigation';
import { AnnouncementService } from '../../services/announcements';
import { useAuth } from '../../hooks/useAuth';

const mySubjects = [
  {
    id: '1',
    name: 'Toán học 12A1',
    students: 35,
    completion: 78,
    nextClass: '2024-09-19 07:30',
    pendingQuizzes: 3,
    newMessages: 5,
  },
  {
    id: '2',
    name: 'Toán học 12A2',
    students: 32,
    completion: 82,
    nextClass: '2024-09-19 09:15',
    pendingQuizzes: 1,
    newMessages: 2,
  },
  {
    id: '3',
    name: 'Toán nâng cao',
    students: 18,
    completion: 91,
    nextClass: '2024-09-20 14:00',
    pendingQuizzes: 0,
    newMessages: 1,
  },
];

const recentActivities = [
  {
    student: 'Nguyễn Văn A',
    action: 'hoàn thành quiz "Đạo hàm cơ bản"',
    score: 95,
    time: '2 giờ trước',
    avatar: 'NA',
  },
  {
    student: 'Trần Thị B',
    action: 'gửi câu hỏi về bài "Tích phân"',
    time: '3 giờ trước',
    avatar: 'TB',
  },
  {
    student: 'Lê Minh C',
    action: 'hoàn thành flashcard "Lượng giác"',
    score: 88,
    time: '5 giờ trước',
    avatar: 'LC',
  },
  {
    student: 'Phạm Thị D',
    action: 'tải lên bài tập về nhà',
    time: '6 giờ trước',
    avatar: 'PD',
  },
];

const upcomingClasses = [
  {
    subject: 'Toán học 12A1',
    time: '07:30 - 08:15',
    room: 'Phòng 201',
    topic: 'Ứng dụng đạo hàm',
  },
  {
    subject: 'Toán học 12A2',
    time: '09:15 - 10:00',
    room: 'Phòng 201',
    topic: 'Bài tập tổng hợp',
  },
  {
    subject: 'Toán nâng cao',
    time: '14:00 - 15:30',
    room: 'Phòng 301',
    topic: 'Phương trình vi phân',
  },
];

const mockOverallStats = {
  totalStudents: 85,
  totalSubjects: 3,
  totalQuizzes: 24,
  totalFlashcards: 89,
  avgQuizScore: 82.5,
  completionRate: 78.3,
  activeStudents: 72,
  avgStudyTime: 2.4,
};

const mockSubjectStats = [
  {
    id: '1',
    name: 'Toán học 12A1',
    students: 35,
    avgScore: 85.2,
    completionRate: 82.1,
    quizCount: 8,
    flashcardCount: 45,
    lastActivity: '2024-09-18',
    trend: 'up',
    trendValue: 5.2,
  },
  {
    id: '2',
    name: 'Toán học 12A2',
    students: 32,
    avgScore: 78.9,
    completionRate: 75.4,
    quizCount: 6,
    flashcardCount: 32,
    lastActivity: '2024-09-17',
    trend: 'up',
    trendValue: 2.1,
  },
  {
    id: '3',
    name: 'Toán nâng cao',
    students: 18,
    avgScore: 91.3,
    completionRate: 88.8,
    quizCount: 10,
    flashcardCount: 28,
    lastActivity: '2024-09-16',
    trend: 'down',
    trendValue: -1.5,
  },
];

const mockStudentPerformance = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    studentId: 'SV001',
    subject: 'Toán học 12A1',
    quizScore: 92,
    completionRate: 95,
    studyTime: 3.2,
    lastActive: '2024-09-18',
    status: 'excellent',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    studentId: 'SV002',
    subject: 'Toán học 12A1',
    quizScore: 88,
    completionRate: 87,
    studyTime: 2.8,
    lastActive: '2024-09-17',
    status: 'good',
  },
  {
    id: '3',
    name: 'Lê Minh C',
    studentId: 'SV003',
    subject: 'Toán học 12A2',
    quizScore: 75,
    completionRate: 65,
    studyTime: 1.5,
    lastActive: '2024-09-15',
    status: 'needs_attention',
  },
];

export function TeacherDashboard() {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  // Announcements (from backend notifications)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const mapToAnnouncement = (n: any): Announcement => ({
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
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await AnnouncementService.list() as any; // { items }
        const list = Array.isArray(res?.items) ? res.items : [];
        if (!mounted) return;
        setAnnouncements(list.map(mapToAnnouncement));
      } catch {
        if (!mounted) return;
        setAnnouncements([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreateAnnouncement = async (title: string, content: string) => {
    try {
      await AnnouncementService.create({ title, content, scope: 'school' });
      const res = await AnnouncementService.list() as any; // { items }
      const list = Array.isArray(res?.items) ? res.items : [];
      setAnnouncements(list.map(mapToAnnouncement));
      setOpenCreate(false);
      toast.success('Đã tạo thông báo');
    } catch (e) {
      toast.error('Tạo thông báo thất bại');
    }
  };

  const handleUpdateAnnouncement = async (id: string, title: string, content: string) => {
    try {
      await AnnouncementService.update(id, { title, content });
      const res = await AnnouncementService.list() as any; // { items }
      const list = Array.isArray(res?.items) ? res.items : [];
      setAnnouncements(list.map(mapToAnnouncement));
    } catch (e) {
      // TODO: show a toast
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await AnnouncementService.remove(id);
      const res = await AnnouncementService.list() as any; // { items }
      const list = Array.isArray(res?.items) ? res.items : [];
      setAnnouncements(list.map(mapToAnnouncement));
    } catch (e) {
      // TODO: show a toast
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Xuất sắc</Badge>;
      case 'good':
        return <Badge variant="secondary">Tốt</Badge>;
      case 'needs_attention':
        return <Badge variant="destructive">Cần chú ý</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSubjectStats = selectedSubject === 'all'
    ? mockSubjectStats
    : mockSubjectStats.filter(s => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Bảng điều khiển giáo viên</h1>
          <p className="text-muted-foreground">
            Quản lý lớp học và theo dõi tiến độ học tập của học sinh
          </p>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <div className="lg:col-span-1">
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Tạo thông báo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tạo thông báo mới</DialogTitle>
                  </DialogHeader>
                  <AnnouncementCreator onCreate={handleCreateAnnouncement} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
      {/* Announcement area for Teacher */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">


        <div className="lg:col-span-3">
          <AnnouncementSection
            announcements={announcements}
            canManage
            onEdit={(id) => {
              const target = (announcements || []).find(a => a.id === id);
              setEditingId(id);
              setFormTitle(target?.title || '');
              setFormContent(target?.content || '');
              setEditOpen(true);
            }}
            onDelete={(id) => {
              setEditingId(id);
              setDeleteOpen(true);
            }}
          />
        </div>

        {/* Edit Announcement Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sửa thông báo</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {(() => {
                const MAX_TITLE_CHARS = 80;
                const chars = formTitle.length;
                const remaining = Math.max(0, MAX_TITLE_CHARS - chars);
                return (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Tiêu đề (còn {remaining}/{MAX_TITLE_CHARS} ký tự)</div>
                    <Input
                      placeholder="Tiêu đề"
                      value={formTitle}
                      onChange={(e) => {
                        const raw = e.target.value || '';
                        if (raw.length <= MAX_TITLE_CHARS) {
                          setFormTitle(raw);
                        } else {
                          setFormTitle(raw.slice(0, MAX_TITLE_CHARS));
                        }
                      }}
                    />
                  </div>
                );
              })()}
              <Textarea placeholder="Nội dung" rows={6} value={formContent} onChange={(e) => setFormContent(e.target.value)} className="max-h-60 overflow-y-auto" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
                <Button onClick={async () => {
                  if (!editingId) return;
                  try {
                    await AnnouncementService.update(editingId, { title: formTitle.trim(), content: formContent.trim() });
                    const res = await AnnouncementService.list() as any;
                    const list = Array.isArray(res?.items) ? res.items : [];
                    setAnnouncements(list.map(mapToAnnouncement));
                    toast.success('Đã cập nhật thông báo');
                    setEditOpen(false);
                  } catch {
                    toast.error('Cập nhật thất bại');
                  }
                }}>Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa thông báo</DialogTitle>
            </DialogHeader>
            <p>Bạn có chắc muốn xóa thông báo này?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
              <Button variant="destructive" onClick={async () => {
                if (!editingId) return;
                try {
                  await AnnouncementService.remove(editingId);
                  const res = await AnnouncementService.list() as any;
                  const list = Array.isArray(res?.items) ? res.items : [];
                  setAnnouncements(list.map(mapToAnnouncement));
                  toast.success('Đã xóa thông báo');
                  setDeleteOpen(false);
                } catch {
                  toast.error('Xóa thất bại');
                }
              }}>Xóa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng sinh viên</p>
                <p className="text-xl font-semibold">{mockOverallStats.totalStudents}</p>
                <p className="text-xs text-green-600">+{mockOverallStats.activeStudents} đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Môn học</p>
                <p className="text-xl font-semibold">{mockOverallStats.totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Đang giảng dạy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Điểm TB Quiz</p>
                <p className="text-xl font-semibold">{mockOverallStats.avgQuizScore}%</p>
                <p className="text-xs text-green-600">+2.1% so với tháng trước</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                <p className="text-xl font-semibold">{mockOverallStats.completionRate}%</p>
                <p className="text-xs text-green-600">+3.2% so với tháng trước</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div >
  );
}