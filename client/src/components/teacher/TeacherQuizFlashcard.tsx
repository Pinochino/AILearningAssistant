import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Search,
    Edit,
    Trash2,
    Share2,
    Copy,
    Eye,
    BarChart3,
    Users,
    Clock,
    Target,
    Globe,
    Lock,
    Calendar,
    TrendingUp,
    FileText,
    BookOpen
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';

const mockChapters = [
    {
        id: '1',
        title: 'Chương 1: Hàm số và đồ thị',
        order: 1,
    },
    {
        id: '2',
        title: 'Chương 2: Đạo hàm',
        order: 2,
    },
    {
        id: '3',
        title: 'Chương 3: Ứng dụng đạo hàm',
        order: 3,
    },
];

const mockQuizzes = [
    {
        id: '1',
        title: 'Quiz: Hàm số bậc nhất và bậc hai',
        description: 'Bài quiz về hàm số bậc nhất, bậc hai và đồ thị',
        chapterIds: ['1'],
        chapterNames: ['Chương 1: Hàm số và đồ thị'],
        questions: 15,
        attempts: 45,
        avgScore: 85.2,
        maxScore: 95,
        minScore: 65,
        createdDate: '2024-09-15',
        lastModified: '2024-09-16',
        difficulty: 'Trung bình',
        duration: 30,
    },
    {
        id: '2',
        title: 'Kiểm tra: Đạo hàm cơ bản',
        description: 'Bài kiểm tra về các quy tắc đạo hàm cơ bản và ứng dụng',
        chapterIds: ['2'],
        chapterNames: ['Chương 2: Đạo hàm'],
        questions: 20,
        attempts: 38,
        avgScore: 78.9,
        maxScore: 100,
        minScore: 45,
        createdDate: '2024-09-13',
        lastModified: '2024-09-14',
        difficulty: 'Khó',
        duration: 45,
    },
    {
        id: '3',
        title: 'Quiz: Ứng dụng đạo hàm trong thực tế',
        description: 'Quiz về ứng dụng đạo hàm tìm cực trị, khảo sát hàm số',
        chapterIds: ['2', '3'],
        chapterNames: ['Chương 2: Đạo hàm', 'Chương 3: Ứng dụng đạo hàm'],
        questions: 12,
        attempts: 22,
        avgScore: 72.5,
        maxScore: 88,
        minScore: 50,
        createdDate: '2024-09-10',
        lastModified: '2024-09-11',
        difficulty: 'Khó',
        duration: 35,
    },
];

const mockFlashcards = [
    {
        id: '1',
        title: 'Flashcard: Công thức đạo hàm cơ bản',
        description: 'Bộ flashcard tổng hợp các công thức đạo hàm cơ bản',
        chapterIds: ['2'],
        chapterNames: ['Chương 2: Đạo hàm'],
        cards: 25,
        reviews: 156,
        avgRetention: 89.5,
        createdDate: '2024-09-14',
        lastModified: '2024-09-15',
        difficulty: 'Trung bình',
    },
    {
        id: '2',
        title: 'Flashcard: Hàm số lượng giác',
        description: 'Bộ flashcard về hàm số lượng giác và các tính chất',
        chapterIds: ['1'],
        chapterNames: ['Chương 1: Hàm số và đồ thị'],
        cards: 18,
        reviews: 98,
        avgRetention: 85.2,
        createdDate: '2024-09-12',
        lastModified: '2024-09-13',
        difficulty: 'Khó',
    },
    {
        id: '3',
        title: 'Flashcard: Ứng dụng đạo hàm',
        description: 'Bộ flashcard về ứng dụng đạo hàm trong khảo sát hàm số',
        chapterIds: ['3'],
        chapterNames: ['Chương 3: Ứng dụng đạo hàm'],
        cards: 15,
        reviews: 67,
        avgRetention: 78.3,
        createdDate: '2024-09-08',
        lastModified: '2024-09-09',
        difficulty: 'Khó',
    },
];

const mockRecentActivity = [
    {
        id: '1',
        type: 'quiz_attempt',
        title: 'Nguyễn Văn A đã hoàn thành quiz "Hàm số bậc nhất"',
        score: 85,
        time: '2 giờ trước',
        avatar: 'NVA',
    },
    {
        id: '2',
        type: 'flashcard_review',
        title: 'Trần Thị B đã học 15 thẻ flashcard "Công thức đạo hàm"',
        retention: 92,
        time: '3 giờ trước',
        avatar: 'TTB',
    },
    {
        id: '3',
        type: 'quiz_attempt',
        title: 'Lê Minh C đã hoàn thành quiz "Đạo hàm cơ bản"',
        score: 78,
        time: '5 giờ trước',
        avatar: 'LMC',
    },
];

interface TeacherQuizFlashcardProps {
    subjectId?: string;
}

export function TeacherQuizFlashcard({ subjectId = "1" }: TeacherQuizFlashcardProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('all');
    const [selectedTab, setSelectedTab] = useState('quizzes');
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Dễ': return 'bg-green-100 text-green-800 border-green-200';
            case 'Trung bình': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Khó': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Rất khó': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredQuizzes = mockQuizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChapter = selectedChapter === 'all' || quiz.chapterIds.includes(selectedChapter);
        return matchesSearch && matchesChapter;
    });

    const filteredFlashcards = mockFlashcards.filter(flashcard => {
        const matchesSearch = flashcard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flashcard.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChapter = selectedChapter === 'all' || flashcard.chapterIds.includes(selectedChapter);
        return matchesSearch && matchesChapter;
    });

    const handleShare = (item: any) => {
        setSelectedItem(item);
        setShareDialogOpen(true);
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/share/${selectedItem?.id}`;
        navigator.clipboard.writeText(link);
        console.log('Link copied:', link);
    };

    const handleEdit = (item: any) => {
        console.log('Edit item:', item);
    };

    const handleDelete = (item: any) => {
        console.log('Delete item:', item);
    };

    const handleViewResults = (item: any) => {
        console.log('View results:', item);
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="space-y-4">
                <div>
                    <h2>Quiz & Flashcard của môn học</h2>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi quiz, flashcard đã tạo cho môn học này
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm quiz, flashcard..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tất cả chương" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả chương</SelectItem>
                                {mockChapters.map((chapter) => (
                                    <SelectItem key={chapter.id} value={chapter.id}>
                                        {chapter.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quizzes">Quiz ({filteredQuizzes.length})</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcard ({filteredFlashcards.length})</TabsTrigger>
                </TabsList>

                {/* Quiz Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    {filteredQuizzes.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-medium mb-2">Chưa có quiz nào</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm ? 'Không tìm thấy quiz phù hợp' : 'Bắt đầu tạo quiz đầu tiên cho môn học này'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredQuizzes.map((quiz) => (
                                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-medium">{quiz.title}</h3>
                                                            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                                                                {quiz.difficulty}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                                    </div>
                                                </div>

                                                {/* Chapters */}
                                                <div className="flex flex-wrap gap-1">
                                                    {quiz.chapterNames.map((chapter, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {chapter}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span>{quiz.questions} câu hỏi</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{quiz.attempts} lượt thử</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                        <span>TB: {quiz.avgScore.toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{quiz.duration} phút</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>{new Date(quiz.createdDate).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button variant="outline" size="sm" onClick={() => handleViewResults(quiz)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Xem kết quả
                                                </Button>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(quiz)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleShare(quiz)}>
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Flashcard Tab */}
                <TabsContent value="flashcards" className="space-y-4">
                    {filteredFlashcards.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-lg font-medium mb-2">Chưa có flashcard nào</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm ? 'Không tìm thấy flashcard phù hợp' : 'Bắt đầu tạo flashcard đầu tiên cho môn học này'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredFlashcards.map((flashcard) => (
                                <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-medium">{flashcard.title}</h3>
                                                            <Badge variant="outline" className={getDifficultyColor(flashcard.difficulty)}>
                                                                {flashcard.difficulty}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{flashcard.description}</p>
                                                    </div>
                                                </div>

                                                {/* Chapters */}
                                                <div className="flex flex-wrap gap-1">
                                                    {flashcard.chapterNames.map((chapter, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {chapter}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                        <span>{flashcard.cards} thẻ</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{flashcard.reviews} lượt học</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>{new Date(flashcard.createdDate).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button variant="outline" size="sm" onClick={() => handleViewResults(flashcard)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Xem thống kê
                                                </Button>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(flashcard)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleShare(flashcard)}>
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(flashcard)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chia sẻ {selectedItem?.title}</DialogTitle>
                        <DialogDescription>
                            Chia sẻ {selectedTab === 'quizzes' ? 'quiz' : 'flashcard'} này với học sinh hoặc giáo viên khác
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                Link chia sẻ sẽ cho phép người khác xem và sử dụng {selectedTab === 'quizzes' ? 'quiz' : 'flashcard'} này.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label>Link chia sẻ</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={`${window.location.origin}/share/${selectedItem?.id}`}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button variant="outline" onClick={handleCopyLink}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}