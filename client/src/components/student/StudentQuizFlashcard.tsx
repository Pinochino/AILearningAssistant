import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Paperclip, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
    Plus,
    Target,
    BookOpen,
    Users,
    Eye,
    Edit,
    Trash2,
    Play,
    BarChart3,
    Clock,
    Star,
    Globe,
    Lock
} from 'lucide-react';
import { EditQuizDialog } from './EditQuizDialog';
import { EditFlashcardDialog } from './EditFlashcardDialog';

const mockChapters = [
    {
        id: '1',
        title: 'Chương 1: Hàm số và đồ thị',
        order: 1,
        documents: 5,
        quizzes: 3,
        flashcards: 15,
        completion: 85,
    },
    {
        id: '2',
        title: 'Chương 2: Đạo hàm',
        order: 2,
        documents: 4,
        quizzes: 2,
        flashcards: 12,
        completion: 70,
    },
    {
        id: '3',
        title: 'Chương 3: Ứng dụng đạo hàm',
        order: 3,
        documents: 3,
        quizzes: 1,
        flashcards: 8,
        completion: 45,
    },
];

const mockPublicQuizzes = [
    {
        id: '1',
        title: 'Quiz: Hàm số bậc nhất',
        description: 'Bài quiz về hàm số bậc nhất và đồ thị',
        creator: 'Nguyễn Văn A',
        subject: 'Toán học 12A1',
        chapterIds: ['1'],
        chapterNames: ['Chương 1: Hàm số và đồ thị'],
        questions: 15,
        attempts: 45,
        avgScore: 85.2,
        createdDate: '2024-09-15',
        difficulty: 'Trung bình',
    },
    {
        id: '2',
        title: 'Kiểm tra: Đạo hàm cơ bản',
        description: 'Bài kiểm tra về các quy tắc đạo hàm cơ bản',
        creator: 'Trần Thị B',
        subject: 'Toán học 12A1',
        chapterIds: ['2'],
        chapterNames: ['Chương 2: Đạo hàm'],
        questions: 20,
        attempts: 38,
        avgScore: 78.9,
        createdDate: '2024-09-13',
        difficulty: 'Khó',
    },
];

const mockPublicFlashcards = [
    {
        id: '1',
        title: 'Flashcard: Công thức đạo hàm',
        description: 'Bộ flashcard về các công thức đạo hàm cơ bản',
        creator: 'Lê Minh C',
        subject: 'Toán học 12A1',
        chapterIds: ['2'],
        chapterNames: ['Chương 2: Đạo hàm'],
        cards: 25,
        reviews: 156,
        avgRetention: 89.5,
        createdDate: '2024-09-14',
        difficulty: 'Trung bình',
    },
    {
        id: '2',
        title: 'Flashcard: Hàm số lượng giác',
        description: 'Bộ flashcard về hàm số lượng giác và các tính chất',
        creator: 'Phạm Thị D',
        subject: 'Toán học 12A1',
        chapterIds: ['1'],
        chapterNames: ['Chương 1: Hàm số và đồ thị'],
        cards: 18,
        reviews: 98,
        avgRetention: 85.2,
        createdDate: '2024-09-12',
        difficulty: 'Khó',
    },
];

const mockPrivateQuizzes = [
    {
        id: '3',
        title: 'Quiz cá nhân: Tích phân',
        description: 'Quiz tự tạo để ôn tập tích phân',
        creator: 'Bạn',
        subject: 'Toán học 12A1',
        chapterIds: ['3'],
        chapterNames: ['Chương 3: Ứng dụng đạo hàm'],
        questions: 12,
        attempts: 5,
        avgScore: 90.0,
        createdDate: '2024-09-16',
        difficulty: 'Trung bình',
    },
];

const mockPrivateFlashcards = [
    {
        id: '3',
        title: 'Flashcard cá nhân: Vật lý cơ bản',
        description: 'Bộ flashcard tự tạo để ôn tập vật lý',
        creator: 'Bạn',
        subject: 'Vật lý 11B1',
        chapterIds: ['1'],
        chapterNames: ['Chương 1: Cơ học cơ bản'],
        cards: 15,
        reviews: 25,
        avgRetention: 92.0,
        createdDate: '2024-09-17',
        difficulty: 'Dễ',
    },
];

export function StudentQuizFlashcard() {
    const [aiPrompt, setAiPrompt] = useState("");   // giữ nội dung text prompt
    const [aiFile, setAiFile] = useState<File | null>(null);  // giữ file upload

    const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
    const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizSubject, setQuizSubject] = useState('');
    const [quizDifficulty, setQuizDifficulty] = useState('');
    const [quizIsPublic, setQuizIsPublic] = useState(false);
    const [quizDuration, setQuizDuration] = useState('');
    const [flashcardTitle, setFlashcardTitle] = useState('');
    const [flashcardDescription, setFlashcardDescription] = useState('');
    const [flashcardSubject, setFlashcardSubject] = useState('');
    const [flashcardDifficulty, setFlashcardDifficulty] = useState('');
    const [flashcardIsPublic, setFlashcardIsPublic] = useState(false);
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    // Quiz form states
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [quizMode, setQuizMode] = useState<'manual' | 'ai'>('manual');
    // Flashcard form states
    const [selectedFlashcardChapters, setSelectedFlashcardChapters] = useState<string[]>([]);
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
        { id: '1', front: '', back: '' }
    ]);
    const [flashcardMode, setFlashcardMode] = useState<'manual' | 'ai'>('manual');

    // Edit states
    const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
    const [isEditFlashcardOpen, setIsEditFlashcardOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<any>(null);
    const [editingFlashcard, setEditingFlashcard] = useState<any>(null);
    const [privateQuizzes, setPrivateQuizzes] = useState(mockPrivateQuizzes);
    const [privateFlashcards, setPrivateFlashcards] = useState(mockPrivateFlashcards);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) setAiFile(file);
    };

    const removeFile = () => {
        setAiFile(null);
        // reset input value (optional, nếu muốn cho phép upload cùng file lần nữa)
        const inp = document.getElementById("file-upload") as HTMLInputElement | null;
        if (inp) inp.value = "";
    };
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Dễ': return 'bg-green-100 text-green-800';
            case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
            case 'Khó': return 'bg-orange-100 text-orange-800';
            case 'Rất khó': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCreateQuiz = () => {
        console.log('Creating quiz:', {
            title: quizTitle,
            description: quizDescription,
            subject: quizSubject,
            difficulty: quizDifficulty,
            isPublic: quizIsPublic,
        });
        setIsCreateQuizOpen(false);
        setQuizTitle('');
        setQuizDescription('');
        setQuizSubject('');
        setQuizDifficulty('');
        setQuizIsPublic(false);
    };

    const handleChapterSelect = (chapterId: string, checked: boolean) => {
        if (checked) {
            setSelectedChapters([...selectedChapters, chapterId]);
        } else {
            setSelectedChapters(selectedChapters.filter(id => id !== chapterId));
        }
    };

    const handleFlashcardChapterSelect = (chapterId: string, checked: boolean) => {
        if (checked) {
            setSelectedFlashcardChapters([...selectedFlashcardChapters, chapterId]);
        } else {
            setSelectedFlashcardChapters(selectedFlashcardChapters.filter(id => id !== chapterId));
        }
    };
    const handleCreateFlashcard = () => {
        console.log('Creating flashcard:', {
            title: flashcardTitle,
            description: flashcardDescription,
            subject: flashcardSubject,
            difficulty: flashcardDifficulty,
            isPublic: flashcardIsPublic,
        });
        setIsCreateFlashcardOpen(false);
        setFlashcardTitle('');
        setFlashcardDescription('');
        setFlashcardSubject('');
        setFlashcardDifficulty('');
        setFlashcardIsPublic(false);
    };

    interface QuizQuestion {
        id: string;
        question: string;
        answers: string[];
        correctAnswer: number;
    }

    interface FlashcardItem {
        id: string;
        front: string;
        back: string;
    }
    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: Date.now().toString(),
            question: '',
            answers: ['', '', '', ''],
            correctAnswer: 0
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (questionId: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== questionId));
        }
    };

    const updateQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
        setQuestions(questions.map(q =>
            q.id === questionId ? { ...q, [field]: value } : q
        ));
    };

    const updateAnswer = (questionId: string, answerIndex: number, value: string) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, answers: q.answers.map((ans, idx) => idx === answerIndex ? value : ans) }
                : q
        ));
    };
    const addFlashcard = () => {
        const newFlashcard: FlashcardItem = {
            id: Date.now().toString(),
            front: '',
            back: ''
        };
        setFlashcards([...flashcards, newFlashcard]);
    };

    const removeFlashcard = (flashcardId: string) => {
        if (flashcards.length > 1) {
            setFlashcards(flashcards.filter(f => f.id !== flashcardId));
        }
    };

    const updateFlashcard = (flashcardId: string, field: keyof FlashcardItem, value: string) => {
        setFlashcards(flashcards.map(f =>
            f.id === flashcardId ? { ...f, [field]: value } : f
        ));
    };

    const resetQuizForm = () => {
        setQuizTitle('');
        setSelectedChapters([]);
        setQuestions([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }]);
        setQuizMode('manual');
    };

    const resetFlashcardForm = () => {
        setFlashcardTitle('');
        setSelectedFlashcardChapters([]);
        setFlashcards([{ id: '1', front: '', back: '' }]);
        setFlashcardMode('manual');
    };

    // Edit handlers
    const handleEditQuiz = (quiz: any) => {
        setEditingQuiz(quiz);
        setIsEditQuizOpen(true);
    };

    const handleEditFlashcard = (flashcard: any) => {
        setEditingFlashcard(flashcard);
        setIsEditFlashcardOpen(true);
    };

    const handleSaveQuiz = (updatedQuiz: any) => {
        setPrivateQuizzes(privateQuizzes.map(quiz =>
            quiz.id === updatedQuiz.id ? updatedQuiz : quiz
        ));
        console.log('Quiz updated:', updatedQuiz);
    };

    const handleSaveFlashcard = (updatedFlashcard: any) => {
        setPrivateFlashcards(privateFlashcards.map(flashcard =>
            flashcard.id === updatedFlashcard.id ? updatedFlashcard : flashcard
        ));
        console.log('Flashcard updated:', updatedFlashcard);
    };

    const handleDeleteQuiz = (quizId: string) => {
        setPrivateQuizzes(privateQuizzes.filter(quiz => quiz.id !== quizId));
        console.log('Quiz deleted:', quizId);
    };

    const handleDeleteFlashcard = (flashcardId: string) => {
        setPrivateFlashcards(privateFlashcards.filter(flashcard => flashcard.id !== flashcardId));
        console.log('Flashcard deleted:', flashcardId);
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1>Quiz & Flashcard của học sinh</h1>
                    <p className="text-muted-foreground">
                        Tạo và chia sẻ quiz, flashcard với bạn bè
                    </p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={isCreateQuizOpen} onOpenChange={(open) => {
                        setIsCreateQuizOpen(open);
                        if (!open) resetQuizForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo Quiz
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Tạo Quiz mới</DialogTitle>
                                <DialogDescription>
                                    Tạo quiz từ nhiều chương học
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Tiêu đề quiz</Label>
                                    <Input
                                        placeholder="Nhập tiêu đề quiz"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Chọn chương học</Label>
                                    <div className="grid grid-cols-1 gap-2 border rounded p-3">
                                        {mockChapters.map((chapter) => (
                                            <div key={chapter.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`chapter-${chapter.id}`}
                                                    checked={selectedChapters.includes(chapter.id)}
                                                    onCheckedChange={(checked) => handleChapterSelect(chapter.id, checked as boolean)}
                                                />
                                                <Label htmlFor={`chapter-${chapter.id}`}>{chapter.title}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Thời gian (phút)</Label>
                                    <Input
                                        type="number"
                                        placeholder="30"
                                        value={quizDuration}
                                        onChange={(e) => setQuizDuration(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Chế độ tạo</Label>
                                    <Select value={quizMode} onValueChange={(value: 'manual' | 'ai') => setQuizMode(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Thủ công</SelectItem>
                                            <SelectItem value="ai">AI tự động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {quizMode === 'ai' ? (
                                    <div className="space-y-2">
                                        <div className="space-y-2">
                                            <Label>Số câu hỏi</Label>
                                            <Input type="number" placeholder="Nhập số lượng câu hỏi" />
                                        </div>
                                        {/* UI prompt + paperclip */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Prompt cho AI</label>

                                            {/* wrapper có viền: textarea + icon nằm bên trong viền */}
                                            <div className="relative">
                                                <div className="relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-400">
                                                    {/* textarea thực sự nằm trong container (không có border riêng) */}
                                                    <textarea
                                                        value={aiPrompt}
                                                        onChange={(e) => setAiPrompt(e.target.value)}
                                                        rows={4}
                                                        placeholder="Mô tả nội dung quiz bạn muốn AI tạo..."
                                                        aria-label="Prompt cho AI"
                                                        className="w-full min-h-[6rem] resize-none bg-transparent px-4 py-3 pr-12 text-sm outline-none placeholder:text-gray-400"
                                                    />

                                                    {/* icon paperclip nằm BÊN TRONG khung (absolute, phía phải) */}
                                                    {/* label sẽ trigger input[type=file] */}
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/80 p-1 text-gray-500 shadow-sm hover:text-blue-600 hover:scale-105 transition cursor-pointer"
                                                        title="Đính kèm tài liệu"
                                                    >
                                                        <Paperclip className="h-5 w-5" />
                                                    </label>

                                                    {/* hidden file input */}
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        aria-label="Upload document"
                                                    />
                                                </div>
                                            </div>

                                            {/* file đã chọn (tách hẳn, không dính sát icon) */}
                                            {aiFile && (
                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                                                        <span>📄</span>
                                                        <span className="max-w-[40ch] truncate font-medium text-gray-700">{aiFile.name}</span>
                                                    </div>

                                                    <div className="ml-auto flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500 text-xs">{(aiFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        <button
                                                            type="button"
                                                            onClick={removeFile}
                                                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>



                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Câu hỏi</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                                                <Plus className="h-4 w-4 mr-1" />
                                                Thêm câu hỏi
                                            </Button>
                                        </div>

                                        <div className="space-y-6">
                                            {questions.map((question, qIndex) => (
                                                <Card key={question.id}>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-base">Câu hỏi {qIndex + 1}</CardTitle>
                                                            {questions.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeQuestion(question.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Nội dung câu hỏi</Label>
                                                            <Textarea
                                                                placeholder="Nhập câu hỏi..."
                                                                value={question.question}
                                                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label>Các đáp án</Label>
                                                            {question.answers.map((answer, ansIndex) => (
                                                                <div key={ansIndex} className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${question.id}`}
                                                                            checked={question.correctAnswer === ansIndex}
                                                                            onChange={() => updateQuestion(question.id, 'correctAnswer', ansIndex)}
                                                                            className="w-4 h-4"
                                                                        />
                                                                        <Label className="text-sm">Đáp án {String.fromCharCode(65 + ansIndex)}</Label>
                                                                    </div>
                                                                    <Input
                                                                        placeholder={`Nhập đáp án ${String.fromCharCode(65 + ansIndex)}`}
                                                                        value={answer}
                                                                        onChange={(e) => updateAnswer(question.id, ansIndex, e.target.value)}
                                                                        className="flex-1"
                                                                    />
                                                                </div>
                                                            ))}
                                                            <p className="text-xs text-muted-foreground">
                                                                * Chọn radio button để đánh dấu đáp án đúng
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsCreateQuizOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button onClick={() => setIsCreateQuizOpen(false)}>
                                        Tạo Quiz
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Global Flashcard Button */}
                    <Dialog open={isCreateFlashcardOpen} onOpenChange={(open) => {
                        setIsCreateFlashcardOpen(open);
                        if (!open) resetFlashcardForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo Flashcard
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Tạo Flashcard mới</DialogTitle>
                                <DialogDescription>
                                    Tạo bộ flashcard từ nhiều chương học
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Tiêu đề bộ flashcard</Label>
                                    <Input
                                        placeholder="Nhập tiêu đề bộ flashcard"
                                        value={flashcardTitle}
                                        onChange={(e) => setFlashcardTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Chọn chương học</Label>
                                    <div className="grid grid-cols-1 gap-2 border rounded p-3">
                                        {mockChapters.map((chapter) => (
                                            <div key={chapter.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`flashcard-chapter-${chapter.id}`}
                                                    checked={selectedFlashcardChapters.includes(chapter.id)}
                                                    onCheckedChange={(checked) => handleFlashcardChapterSelect(chapter.id, checked as boolean)}
                                                />
                                                <Label htmlFor={`flashcard-chapter-${chapter.id}`}>{chapter.title}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Chế độ tạo</Label>
                                    <Select value={flashcardMode} onValueChange={(value: 'manual' | 'ai') => setFlashcardMode(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Thủ công</SelectItem>
                                            <SelectItem value="ai">AI tự động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {flashcardMode === 'ai' ? (
                                    <div className="space-y-2">
                                        <div className="space-y-2">
                                            <Label>Số cards</Label>
                                            <Input type="number" placeholder="Nhập số lượng cards" />
                                        </div>
                                        {/* UI prompt + paperclip */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Prompt cho AI</label>

                                            {/* wrapper có viền: textarea + icon nằm bên trong viền */}
                                            <div className="relative">
                                                <div className="relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-400">
                                                    {/* textarea thực sự nằm trong container (không có border riêng) */}
                                                    <textarea
                                                        value={aiPrompt}
                                                        onChange={(e) => setAiPrompt(e.target.value)}
                                                        rows={4}
                                                        placeholder="Mô tả nội dung quiz bạn muốn AI tạo..."
                                                        aria-label="Prompt cho AI"
                                                        className="w-full min-h-[6rem] resize-none bg-transparent px-4 py-3 pr-12 text-sm outline-none placeholder:text-gray-400"
                                                    />

                                                    {/* icon paperclip nằm BÊN TRONG khung (absolute, phía phải) */}
                                                    {/* label sẽ trigger input[type=file] */}
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/80 p-1 text-gray-500 shadow-sm hover:text-blue-600 hover:scale-105 transition cursor-pointer"
                                                        title="Đính kèm tài liệu"
                                                    >
                                                        <Paperclip className="h-5 w-5" />
                                                    </label>

                                                    {/* hidden file input */}
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        aria-label="Upload document"
                                                    />
                                                </div>
                                            </div>

                                            {/* file đã chọn (tách hẳn, không dính sát icon) */}
                                            {aiFile && (
                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                                                        <span>📄</span>
                                                        <span className="max-w-[40ch] truncate font-medium text-gray-700">{aiFile.name}</span>
                                                    </div>

                                                    <div className="ml-auto flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500 text-xs">{(aiFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        <button
                                                            type="button"
                                                            onClick={removeFile}
                                                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>


                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Flashcard</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addFlashcard}>
                                                <Plus className="h-4 w-4 mr-1" />
                                                Thêm flashcard
                                            </Button>
                                        </div>

                                        <div className="space-y-6">
                                            {flashcards.map((flashcard, fIndex) => (
                                                <Card key={flashcard.id}>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-base">Flashcard {fIndex + 1}</CardTitle>
                                                            {flashcards.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeFlashcard(flashcard.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Mặt trước (Câu hỏi)</Label>
                                                                <Textarea
                                                                    placeholder="Nhập nội dung mặt trước..."
                                                                    value={flashcard.front}
                                                                    onChange={(e) => updateFlashcard(flashcard.id, 'front', e.target.value)}
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Mặt sau (Câu trả lời)</Label>
                                                                <Textarea
                                                                    placeholder="Nhập nội dung mặt sau..."
                                                                    value={flashcard.back}
                                                                    onChange={(e) => updateFlashcard(flashcard.id, 'back', e.target.value)}
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsCreateFlashcardOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button onClick={() => setIsCreateFlashcardOpen(false)}>
                                        Tạo Flashcard
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="quizzes" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="quizzes">Quiz</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcard</TabsTrigger>
                </TabsList>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {[...mockPublicQuizzes, ...mockPrivateQuizzes].map((quiz) => (
                            <Card key={quiz.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Target className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{quiz.title}</h3>
                                                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                                                        {quiz.difficulty}
                                                    </Badge>

                                                </div>
                                                <p className="text-sm text-muted-foreground">{quiz.description}</p>

                                                {/* Chapters */}
                                                <div className="flex flex-wrap gap-1">
                                                    {quiz.chapterNames.map((chapter, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {chapter}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{quiz.questions} câu hỏi</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">

                                            <Button size="sm">
                                                <Play className="h-4 w-4 mr-2" />
                                                Làm quiz
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Flashcards Tab */}
                <TabsContent value="flashcards" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {[...mockPublicFlashcards, ...mockPrivateFlashcards].map((flashcard) => (
                            <Card key={flashcard.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <BookOpen className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{flashcard.title}</h3>
                                                    <Badge className={getDifficultyColor(flashcard.difficulty)}>
                                                        {flashcard.difficulty}
                                                    </Badge>

                                                </div>
                                                <p className="text-sm text-muted-foreground">{flashcard.description}</p>

                                                {/* Chapters */}
                                                <div className="flex flex-wrap gap-1">
                                                    {flashcard.chapterNames.map((chapter, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {chapter}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{flashcard.cards} thẻ</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditFlashcard(flashcard)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteFlashcard(flashcard.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm">
                                                <Play className="h-4 w-4 mr-2" />
                                                Ôn tập
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Dialogs */}
            <EditQuizDialog
                isOpen={isEditQuizOpen}
                onOpenChange={setIsEditQuizOpen}
                quiz={editingQuiz}
                onSave={handleSaveQuiz}
            />

            <EditFlashcardDialog
                isOpen={isEditFlashcardOpen}
                onOpenChange={setIsEditFlashcardOpen}
                flashcard={editingFlashcard}
                onSave={handleSaveFlashcard}
            />
        </div>
    );
}