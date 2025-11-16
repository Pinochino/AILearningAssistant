import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Target,
  Activity,
  Clock,
  Award,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AnnouncementSection, Announcement } from '../dashboard/AnnouncementSection'
import { AnnouncementCreator } from '../dashboard/AnnouncementCreator'
import { AnnouncementService } from "../../services/announcements";
import { handleApi } from '../../api/handleApi'
import GetRoleCountByName from '../../hooks/getRoleCount'
import { Skeleton } from '../ui/skeleton'
import { classApi } from "../../services/api";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

// Analytics data from the original Analytics component
const mockOverallStats = {
  totalUsers: 1247,
  totalCourses: 45,
  totalQuizzes: 892,
  totalFlashcards: 3247,
  activeUsers: 1089,
  completionRate: 78.5,
  avgStudyTime: 2.4,
};

const mockQuizStats = [
  {
    subject: "Toán học",
    totalQuizzes: 156,
    completed: 1247,
    avgScore: 85.2,
    trend: "up",
    trendValue: 5.2,
  },
  {
    subject: "Vật lý",
    totalQuizzes: 128,
    completed: 986,
    avgScore: 78.9,
    trend: "up",
    trendValue: 2.1,
  },
  {
    subject: "Hóa học",
    totalQuizzes: 142,
    completed: 854,
    avgScore: 82.1,
    trend: "down",
    trendValue: -1.3,
  },
];

const mockFlashcardStats = [
  {
    subject: "Toán học",
    totalCards: 892,
    reviewed: 12450,
    avgRetention: 89.5,
    dailyReviews: 340,
  },
  {
    subject: "Vật lý",
    totalCards: 756,
    reviewed: 9876,
    avgRetention: 85.2,
    dailyReviews: 285,
  },
  {
    subject: "Hóa học",
    totalCards: 683,
    reviewed: 8234,
    avgRetention: 87.1,
    dailyReviews: 256,
  },
];

const mockLearningProgress = [
  {
    class: "Lớp 12A1",
    students: 35,
    avgProgress: 78.5,
    completedLessons: 145,
    totalLessons: 185,
    activeStudents: 32,
  },
  {
    class: "Lớp 12A2",
    students: 33,
    avgProgress: 82.1,
    completedLessons: 156,
    totalLessons: 190,
    activeStudents: 30,
  },
  {
    class: "Lớp 11B1",
    students: 38,
    avgProgress: 65.4,
    completedLessons: 89,
    totalLessons: 136,
    activeStudents: 35,
  },
];

const subjectStats = [
  {
    name: "Toán học",
    students: 342,
    teachers: 12,
    quizzes: 156,
    completion: 78,
  },
  {
    name: "Vật lý",
    students: 298,
    teachers: 8,
    quizzes: 134,
    completion: 82,
  },
  {
    name: "Hóa học",
    students: 276,
    teachers: 10,
    quizzes: 142,
    completion: 75,
  },
  {
    name: "Sinh học",
    students: 234,
    teachers: 7,
    quizzes: 98,
    completion: 88,
  },
  {
    name: "Văn học",
    students: 387,
    teachers: 15,
    quizzes: 178,
    completion: 71,
  },
];

const monthlyData = [
  { month: "T1", users: 980, quizzes: 1200, flashcards: 2300 },
  { month: "T2", users: 1050, quizzes: 1400, flashcards: 2800 },
  { month: "T3", users: 1180, quizzes: 1650, flashcards: 3200 },
  { month: "T4", users: 1250, quizzes: 1800, flashcards: 3600 },
  { month: "T5", users: 1339, quizzes: 2100, flashcards: 4200 },
];

export function AdminDashboard() {
  const [openCreate, setOpenCreate] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  const mapToAnnouncement = (n: any): Announcement => ({
    id: n._id || n.id,
    title: String(n.title || n.type || "Thông báo"),
    content: String(n.content || n.message || ""),
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
      }
      if (typeof n.author === 'string' && n.author.trim()) return n.author.trim();
      return 'Hệ thống';
    })(),
    date: new Date(n.createdAt || n.timestamp || Date.now()).toLocaleString("vi-VN"),
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = (await AnnouncementService.list()) as any; // { items }
        const list = Array.isArray(res?.items) ? res.items : [];
        if (!mounted) return;
        setAnnouncements(list.map(mapToAnnouncement));
      } catch {
        if (!mounted) return;
        setAnnouncements([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateAnnouncement = async (
    title: string,
    content: string,
  ) => {
    try {
      await AnnouncementService.create({ title, content, scope: 'school' });
      const res = (await AnnouncementService.list()) as any; // { items }
      const list = Array.isArray(res?.items) ? res.items : [];
      setAnnouncements(list.map(mapToAnnouncement));
      setOpenCreate(false);
      toast.success('Đã tạo thông báo');
    } catch (e) {
      toast.error('Tạo thông báo thất bại');
    }
  }

  const { data: userCount } = GetRoleCountByName("STUDENT");
  const { data: adminCount } = GetRoleCountByName("ADMIN");
  const { data: teacherCount } = GetRoleCountByName("TEACHER");
  const [totalClasses, setTotalClasses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total users
  const totalUsers = (userCount?.data || 0) + (teacherCount?.data || 0) + (adminCount?.data || 0);

  // User stats for the chart
  const userStats = [
    { role: 'Học sinh', count: userCount?.data || 0, color: '#3b82f6' },
    { role: 'Giáo viên', count: teacherCount?.data || 0, color: '#10b981' },
    { role: 'Admin', count: adminCount?.data || 0, color: '#f59e0b' }
  ];

  // Load total classes count
  useEffect(() => {
    const loadClassesCount = async () => {
      try {
        const response = await classApi.getAll({
          page: 1,
          limit: 1, // We only need the count, so limit to 1
        });

        if (response?.data?.pagination?.totalItems !== undefined) {
          setTotalClasses(response.data.pagination.totalItems);
        } else if (response?.data && Array.isArray(response.data)) {
          setTotalClasses(response.data.length);
        } else if (Array.isArray(response)) {
          setTotalClasses(response.length);
        }
      } catch (error) {
        console.error('Error loading classes count:', error);
        setTotalClasses(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassesCount();
  }, []);

  // Load total quizzes and flashcards count
  useEffect(() => {
    const loadStatsCount = async () => {
      try {
        setStatsLoading(true);

        // Fetch total quizzes - use admin endpoint with pagination to get all
        const quizzesRes = await axios.get('http://localhost:9000/api/quizzes?limit=1000&page=1', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        // Fetch total flashcards - use admin endpoint with pagination to get all
        const flashcardsRes = await axios.get('http://localhost:9000/api/flashcard-sets?limit=1000&page=1', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        console.log('Quizzes response:', quizzesRes.data);
        console.log('Flashcards response:', flashcardsRes.data);

        const totalQuizCount = quizzesRes.data?.pagination?.totalItems || quizzesRes.data?.data?.items?.length || quizzesRes.data?.items?.length || quizzesRes.data?.data?.length || quizzesRes.data?.length || 0;
        const totalFlashcardCount = flashcardsRes.data?.pagination?.totalItems || flashcardsRes.data?.data?.items?.length || flashcardsRes.data?.items?.length || flashcardsRes.data?.data?.length || flashcardsRes.data?.length || 0;

        setTotalQuizzes(totalQuizCount);
        setTotalFlashcards(totalFlashcardCount);
      } catch (error) {
        console.error('Error loading stats count:', error);
        setTotalQuizzes(0);
        setTotalFlashcards(0);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStatsCount();
  }, []);

  const isDataLoading = !userCount || !adminCount || !teacherCount || isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi hoạt động của nền tảng AI
            Learning Assistant
          </p>
        </div>
        <div className="lg:col-span-1">
          <Dialog
            open={openCreate}
            onOpenChange={setOpenCreate}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tạo thông báo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo thông báo mới</DialogTitle>
              </DialogHeader>
              <AnnouncementCreator
                onCreate={handleCreateAnnouncement}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-3">
          <AnnouncementSection
            announcements={announcements}
            canManage
            currentUser={null}
            onEdit={(id) => {
              const target = (announcements || []).find(a => a.id === id);
              setEditingId(id);
              setFormTitle(target?.title || "");
              setFormContent(target?.content || "");
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sửa thông báo</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Tiêu đề" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              <Textarea placeholder="Nội dung" rows={4} value={formContent} onChange={(e) => setFormContent(e.target.value)} />
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
                  } catch (e) {
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
                  setAnnouncements(prev => prev.filter(a => a.id !== editingId));
                  toast.success('Đã xóa thông báo');
                  setDeleteOpen(false);
                } catch (e) {
                  toast.error('Xóa thất bại');
                }
              }}>Xóa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from(userStats || []).map((stat, index: number) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.role}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className='text-2xl font-bold'>{stat.count}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động theo tháng</CardTitle>
            <CardDescription>
              Thống kê người dùng, quiz và flashcard theo tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="users"
                  fill="#3b82f6"
                  name="Người dùng"
                />
                <Bar
                  dataKey="quizzes"
                  fill="#10b981"
                  name="Quiz"
                />
                <Bar
                  dataKey="flashcards"
                  fill="#f59e0b"
                  name="Flashcard"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố môn học</CardTitle>
            <CardDescription>
              Số lượng học sinh theo từng môn học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, students }) =>
                    `${name}: ${students}`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {subjectStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng người dùng
                </p>
                {isDataLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-semibold">
                    {totalUsers.toLocaleString()}
                  </p>
                )}
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
                <p className="text-sm text-muted-foreground">
                  Lớp học
                </p>
                {isDataLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-semibold">
                    {totalClasses.toLocaleString()}
                  </p>
                )}
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
                <p className="text-sm text-muted-foreground">
                  Tổng số Quiz
                </p>
                {statsLoading ? (
                  <div className="animate-pulse h-6 w-8 bg-gray-200 rounded"></div>
                ) : (
                  <p className="text-xl font-semibold">
                    {totalQuizzes}
                  </p>
                )}
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
                <p className="text-sm text-muted-foreground">
                  Tổng số Flashcard
                </p>
                {statsLoading ? (
                  <div className="animate-pulse h-6 w-8 bg-gray-200 rounded"></div>
                ) : (
                  <p className="text-xl font-semibold">
                    {totalFlashcards}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div >

    </div >
  );
}