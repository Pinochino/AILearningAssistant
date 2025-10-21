import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Plus, X } from 'lucide-react';

interface QuizQuestion {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    subject: string;
    chapterIds: string[];
    chapterNames: string[];
    questions: QuizQuestion[];
    difficulty: string;
    isPublic: boolean;
}

interface EditQuizDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    quiz: Quiz | null;
    onSave: (quiz: Quiz) => void;
}

const mockChapters = [
    {
        id: '1',
        title: 'Chương 1: Hàm số và đồ thị',
    },
    {
        id: '2',
        title: 'Chương 2: Đạo hàm',
    },
    {
        id: '3',
        title: 'Chương 3: Ứng dụng đạo hàm',
    },
];

// Mock data cho quiz questions
const mockQuestions: QuizQuestion[] = [
    {
        id: '1',
        question: 'Đạo hàm của hàm số y = x² là gì?',
        answers: ['2x', 'x', 'x²', '2'],
        correctAnswer: 0
    },
    {
        id: '2',
        question: 'Giới hạn của (x²-1)/(x-1) khi x tiến về 1 là?',
        answers: ['0', '1', '2', '∞'],
        correctAnswer: 2
    }
];

export function EditQuizDialog({ isOpen, onOpenChange, quiz, onSave }: EditQuizDialogProps) {
    const [title, setTitle] = useState(quiz?.title || '');
    const [description, setDescription] = useState(quiz?.description || '');
    const [selectedChapters, setSelectedChapters] = useState<string[]>(quiz?.chapterIds || []);
    const [questions, setQuestions] = useState<QuizQuestion[]>(
        quiz?.questions?.length ? quiz.questions : mockQuestions
    );
    const [visibility, setVisibility] = useState<'private' | 'public'>(
        quiz?.isPublic ? 'public' : 'private'
    );

    const handleChapterSelect = (chapterId: string, checked: boolean) => {
        if (checked) {
            setSelectedChapters([...selectedChapters, chapterId]);
        } else {
            setSelectedChapters(selectedChapters.filter(id => id !== chapterId));
        }
    };

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

    const handleSave = () => {
        if (!quiz) return;

        const updatedQuiz: Quiz = {
            ...quiz,
            title,
            description,
            chapterIds: selectedChapters,
            chapterNames: selectedChapters.map(id => {
                const chapter = mockChapters.find(c => c.id === id);
                return chapter?.title || '';
            }),
            questions,
            isPublic: visibility === 'public'
        };

        onSave(updatedQuiz);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa Quiz</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Tiêu đề quiz</Label>
                        <Input
                            placeholder="Nhập tiêu đề quiz"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            placeholder="Nhập mô tả quiz"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Chọn chương học</Label>
                        <div className="grid grid-cols-1 gap-2 border rounded p-3">
                            {mockChapters.map((chapter) => (
                                <div key={chapter.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`edit-chapter-${chapter.id}`}
                                        checked={selectedChapters.includes(chapter.id)}
                                        onCheckedChange={(checked) => handleChapterSelect(chapter.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`edit-chapter-${chapter.id}`}>{chapter.title}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

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

                        <div className="space-y-4">
                            <Label>Chế độ hiển thị</Label>
                            <RadioGroup
                                value={visibility}
                                onValueChange={setVisibility}
                                className="flex flex-row gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="private" id="edit-private" />
                                    <Label htmlFor="edit-private">Chỉ mình tôi</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="public" id="edit-public" />
                                    <Label htmlFor="edit-public">Công khai</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}