import React, { useState } from "react";
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
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AnnouncementSection,
  Announcement,
} from "../dashboard/AnnouncementSection";
import { AnnouncementCreator } from "../dashboard/AnnouncementCreator";

const userStats = [
  {
    role: "Học sinh",
    count: 1245,
    color: "#3b82f6",
    change: "+12%",
  },
  {
    role: "Giáo viên",
    count: 89,
    color: "#10b981",
    change: "+5%",
  },
  { role: "Admin", count: 5, color: "#f59e0b", change: "0%" },
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

export function AdminDashboard() {
  const [openCreate, setOpenCreate] = useState(false);
  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([
    {
      id: "init-admin",
      title: "Thông báo hệ thống",
      content: "Hệ thống sẽ bảo trì vào Chủ Nhật lúc 2:00 AM.",
      author: "Admin",
      date: new Date().toLocaleDateString(),
    },
  ]);

  const handleCreateAnnouncement = (
    title: string,
    content: string,
  ) => {
    const newAnn: Announcement = {
      id: Date.now().toString(),
      title,
      content,
      author: "Admin",
      date: new Date().toLocaleString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo môn học mới
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
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
        <div className="lg:col-span-3">
          <AnnouncementSection announcements={announcements} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStats.map((stat) => (
          <Card key={stat.role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.role}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.count.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  {stat.change}
                </span>{" "}
                so với tháng trước
              </p>
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

      {/* Subject Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết môn học</CardTitle>
          <CardDescription>
            Thông tin chi tiết về từng môn học trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectStats.map((subject) => (
              <div
                key={subject.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">
                      {subject.name}
                    </h3>
                    <Badge variant="secondary">
                      {subject.students} học sinh
                    </Badge>
                    <Badge variant="outline">
                      {subject.teachers} GV
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{subject.quizzes} quiz</span>
                    <span>•</span>
                    <span>
                      Tỷ lệ hoàn thành: {subject.completion}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Progress
                      value={subject.completion}
                      className="h-2"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">
              Quản lý người dùng
            </h3>
            <p className="text-sm text-muted-foreground">
              Thêm, chỉnh sửa thông tin giáo viên và học sinh
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Tạo môn học</h3>
            <p className="text-sm text-muted-foreground">
              Thiết lập môn học mới và phân quyền
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">
              Báo cáo chi tiết
            </h3>
            <p className="text-sm text-muted-foreground">
              Xem báo cáo và thống kê chi tiết
            </p>
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
                <p className="text-xl font-semibold">
                  {mockOverallStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +12% so với tháng trước
                </p>
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
                  Môn học
                </p>
                <p className="text-xl font-semibold">
                  {mockOverallStats.totalCourses}
                </p>
                <p className="text-xs text-green-600">
                  +3 môn mới
                </p>
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
                  Quiz hoàn thành
                </p>
                <p className="text-xl font-semibold">
                  {mockOverallStats.totalQuizzes}
                </p>
                <p className="text-xs text-green-600">
                  +8% tuần này
                </p>
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
                  Người dùng hoạt động
                </p>
                <p className="text-xl font-semibold">
                  {mockOverallStats.activeUsers}
                </p>
                <p className="text-xs text-muted-foreground">
                  87% tổng số
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="quiz" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quiz">Thống kê Quiz</TabsTrigger>
          <TabsTrigger value="flashcard">
            Thống kê Flashcard
          </TabsTrigger>
          <TabsTrigger value="progress">
            Tiến độ học tập
          </TabsTrigger>
        </TabsList>

        {/* Quiz Statistics */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê Quiz theo môn học</CardTitle>
              <CardDescription>
                Số liệu về quiz và kết quả học tập của học sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuizStats.map((stat) => (
                  <div
                    key={stat.subject}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {stat.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stat.totalQuizzes} quiz</span>
                        <span>•</span>
                        <span>{stat.completed} lượt làm</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {stat.avgScore}%
                        </span>
                        <div
                          className={`flex items-center gap-1 ${stat.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                            }`}
                        >
                          {stat.trend === "up" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm">
                            {Math.abs(stat.trendValue)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Điểm trung bình
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flashcard Statistics */}
        <TabsContent value="flashcard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Thống kê Flashcard theo môn học
              </CardTitle>
              <CardDescription>
                Số liệu về flashcard và tỷ lệ ghi nhớ của học
                sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFlashcardStats.map((stat) => (
                  <div
                    key={stat.subject}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">
                        {stat.subject}
                      </h3>
                      <Badge variant="secondary">
                        {stat.totalCards} thẻ
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {stat.reviewed.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">
                          Lượt ôn tập
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {stat.avgRetention}%
                        </p>
                        <p className="text-muted-foreground">
                          Tỷ lệ ghi nhớ
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {stat.dailyReviews}
                        </p>
                        <p className="text-muted-foreground">
                          Ôn tập/ngày
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tỷ lệ ghi nhớ</span>
                        <span>{stat.avgRetention}%</span>
                      </div>
                      <Progress
                        value={stat.avgRetention}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Progress */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ học tập theo lớp</CardTitle>
              <CardDescription>
                Tổng quan về tiến độ học tập của từng lớp học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLearningProgress.map((progress) => (
                  <div
                    key={progress.class}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">
                          {progress.class}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {progress.students} học sinh •{" "}
                          {progress.activeStudents} đang hoạt
                          động
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {progress.avgProgress}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ trung bình</span>
                        <span>{progress.avgProgress}%</span>
                      </div>
                      <Progress
                        value={progress.avgProgress}
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {progress.completedLessons}/
                          {progress.totalLessons} bài học
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>
                          {Math.round(
                            (progress.activeStudents /
                              progress.students) *
                            100,
                          )}
                          % tham gia
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}