import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    BookOpen,
    Target,
    Clock,
    Award,
    Activity,
    Download,
    Calendar,
    Star,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const mockOverallStats = {
    totalStudents: 106,
    totalSubjects: 3,
    totalQuizzes: 24,
    totalFlashcards: 89,
    avgQuizScore: 82.5,
    completionRate: 78.3,
    activeStudents: 89,
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
        students: 33,
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
        name: 'Vật lý 11B1',
        students: 38,
        avgScore: 81.3,
        completionRate: 77.8,
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
    {
        id: '4',
        name: 'Phạm Thị D',
        studentId: 'SV004',
        subject: 'Vật lý 11B1',
        quizScore: 85,
        completionRate: 80,
        studyTime: 2.1,
        lastActive: '2024-09-16',
        status: 'good',
    },
];

const mockQuizAnalytics = [
    {
        id: '1',
        title: 'Quiz: Hàm số cơ bản',
        subject: 'Toán học 12A1',
        attempts: 45,
        avgScore: 85.2,
        highestScore: 100,
        lowestScore: 60,
        completionRate: 92.3,
        avgTime: 15.5,
        difficulty: 'medium',
    },
    {
        id: '2',
        title: 'Kiểm tra: Đạo hàm',
        subject: 'Toán học 12A2',
        attempts: 38,
        avgScore: 78.9,
        highestScore: 95,
        lowestScore: 45,
        completionRate: 88.1,
        avgTime: 22.3,
        difficulty: 'hard',
    },
    {
        id: '3',
        title: 'Quiz: Vật lý cơ bản',
        subject: 'Vật lý 11B1',
        attempts: 42,
        avgScore: 81.3,
        highestScore: 98,
        lowestScore: 55,
        completionRate: 90.5,
        avgTime: 18.7,
        difficulty: 'easy',
    },
];

const mockFlashcardAnalytics = [
    {
        id: '1',
        title: 'Flashcard: Công thức đạo hàm',
        subject: 'Toán học 12A1',
        totalCards: 25,
        reviews: 156,
        avgRetention: 89.5,
        dailyReviews: 12,
        lastReview: '2024-09-18',
    },
    {
        id: '2',
        title: 'Flashcard: Hàm số lượng giác',
        subject: 'Toán học 12A2',
        totalCards: 18,
        reviews: 98,
        avgRetention: 85.2,
        dailyReviews: 8,
        lastReview: '2024-09-17',
    },
];

export function Analytics() {
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('month');

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

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Dễ</Badge>;
            case 'medium':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
            case 'hard':
                return <Badge variant="secondary" className="bg-red-100 text-red-800">Khó</Badge>;
            default:
                return <Badge variant="outline">{difficulty}</Badge>;
        }
    };

    const filteredSubjectStats = selectedSubject === 'all'
        ? mockSubjectStats
        : mockSubjectStats.filter(s => s.id === selectedSubject);

    const filteredStudentPerformance = selectedSubject === 'all'
        ? mockStudentPerformance
        : mockStudentPerformance.filter(s => s.subject === mockSubjectStats.find(sub => sub.id === selectedSubject)?.name);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1>Báo cáo & Thống kê</h1>
                    <p className="text-muted-foreground">
                        Phân tích hiệu quả giảng dạy và tiến độ học tập của sinh viên
                    </p>
                </div>

                <div className="flex gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Tuần</SelectItem>
                            <SelectItem value="month">Tháng</SelectItem>
                            <SelectItem value="quarter">Quý</SelectItem>
                            <SelectItem value="year">Năm</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                    </Button>
                </div>
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

            {/* Detailed Analytics */}
            <Tabs defaultValue="subjects" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="subjects">Môn học</TabsTrigger>
                    <TabsTrigger value="students">Sinh viên</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcard</TabsTrigger>
                </TabsList>

                {/* Subjects Tab */}
                <TabsContent value="subjects" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {filteredSubjectStats.map((subject) => (
                            <Card key={subject.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-medium text-lg">{subject.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {subject.students} sinh viên • Hoạt động cuối: {new Date(subject.lastActivity).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1 ${subject.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {subject.trend === 'up' ? (
                                                    <TrendingUp className="h-4 w-4" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4" />
                                                )}
                                                <span className="text-sm font-medium">{Math.abs(subject.trendValue)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{subject.avgScore}%</p>
                                            <p className="text-sm text-muted-foreground">Điểm TB</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{subject.completionRate}%</p>
                                            <p className="text-sm text-muted-foreground">Hoàn thành</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{subject.quizCount}</p>
                                            <p className="text-sm text-muted-foreground">Quiz</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-orange-600">{subject.flashcardCount}</p>
                                            <p className="text-sm text-muted-foreground">Flashcard</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hiệu suất sinh viên</CardTitle>
                            <CardDescription>
                                Phân tích chi tiết về tiến độ học tập của từng sinh viên
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredStudentPerformance.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{student.name}</h3>
                                                    <Badge variant="outline" className="text-xs">{student.studentId}</Badge>
                                                    {getStatusBadge(student.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{student.subject}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>Điểm Quiz: {student.quizScore}%</span>
                                                    <span>•</span>
                                                    <span>Hoàn thành: {student.completionRate}%</span>
                                                    <span>•</span>
                                                    <span>Thời gian học: {student.studyTime}h/ngày</span>
                                                    <span>•</span>
                                                    <span>Hoạt động cuối: {new Date(student.lastActive).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-32">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Tiến độ</span>
                                                    <span>{student.completionRate}%</span>
                                                </div>
                                                <Progress value={student.completionRate} className="h-2" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-blue-600">{student.quizScore}%</p>
                                                <p className="text-xs text-muted-foreground">Điểm Quiz</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân tích Quiz</CardTitle>
                            <CardDescription>
                                Thống kê chi tiết về các bài kiểm tra và quiz
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockQuizAnalytics.map((quiz) => (
                                    <div key={quiz.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-medium">{quiz.title}</h3>
                                                <p className="text-sm text-muted-foreground">{quiz.subject}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getDifficultyBadge(quiz.difficulty)}
                                                <Badge variant="outline">{quiz.attempts} lượt làm</Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-blue-600">{quiz.avgScore}%</p>
                                                <p className="text-sm text-muted-foreground">Điểm TB</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-green-600">{quiz.highestScore}%</p>
                                                <p className="text-sm text-muted-foreground">Điểm cao nhất</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-red-600">{quiz.lowestScore}%</p>
                                                <p className="text-sm text-muted-foreground">Điểm thấp nhất</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-purple-600">{quiz.avgTime} phút</p>
                                                <p className="text-sm text-muted-foreground">Thời gian TB</p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Tỷ lệ hoàn thành</span>
                                                <span>{quiz.completionRate}%</span>
                                            </div>
                                            <Progress value={quiz.completionRate} className="h-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Flashcards Tab */}
                <TabsContent value="flashcards" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân tích Flashcard</CardTitle>
                            <CardDescription>
                                Thống kê về việc sử dụng và hiệu quả của flashcard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockFlashcardAnalytics.map((flashcard) => (
                                    <div key={flashcard.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-medium">{flashcard.title}</h3>
                                                <p className="text-sm text-muted-foreground">{flashcard.subject}</p>
                                            </div>
                                            <Badge variant="outline">{flashcard.totalCards} thẻ</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-blue-600">{flashcard.reviews}</p>
                                                <p className="text-sm text-muted-foreground">Lượt ôn tập</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-green-600">{flashcard.avgRetention}%</p>
                                                <p className="text-sm text-muted-foreground">Tỷ lệ ghi nhớ</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-purple-600">{flashcard.dailyReviews}</p>
                                                <p className="text-sm text-muted-foreground">Ôn tập/ngày</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-orange-600">
                                                    {new Date(flashcard.lastReview).toLocaleDateString('vi-VN')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Ôn tập cuối</p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Tỷ lệ ghi nhớ</span>
                                                <span>{flashcard.avgRetention}%</span>
                                            </div>
                                            <Progress value={flashcard.avgRetention} className="h-2" />
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
