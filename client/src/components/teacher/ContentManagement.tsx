import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  Plus,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Target,
  BookOpen,
  Calendar,
  Users,
  BarChart3,
  Paperclip,
  X,
} from 'lucide-react';

const mockChapters = [
  {
    id: "1",
    title: "Chương 1: Hàm số và đồ thị",
    order: 1,
    documents: 5,
    quizzes: 3,
    flashcards: 15,
    completion: 85,
  },
  {
    id: "2",
    title: "Chương 2: Đạo hàm",
    order: 2,
    documents: 4,
    quizzes: 2,
    flashcards: 12,
    completion: 70,
  },
  {
    id: "3",
    title: "Chương 3: Ứng dụng đạo hàm",
    order: 3,
    documents: 3,
    quizzes: 1,
    flashcards: 8,
    completion: 45,
  },
];

const mockDocuments = [
  {
    id: '1',
    title: 'Bài giảng: Hàm số bậc nhất',
    type: 'pdf',
    size: '2.5 MB',
    subject: 'Toán học 12A1',
    chapter: 'Chương 1: Hàm số và đồ thị',
    uploadDate: '2024-09-15',
    downloads: 32,
    status: 'published',
  },
  {
    id: '2',
    title: 'Video: Cách vẽ đồ thị hàm số',
    type: 'video',
    size: '15.2 MB',
    subject: 'Toán học 12A1',
    chapter: 'Chương 1: Hàm số và đồ thị',
    uploadDate: '2024-09-14',
    downloads: 28,
    status: 'published',
  },
  {
    id: '3',
    title: 'Bài tập: Đạo hàm cơ bản',
    type: 'pdf',
    size: '1.8 MB',
    subject: 'Toán học 12A2',
    chapter: 'Chương 2: Đạo hàm',
    uploadDate: '2024-09-13',
    downloads: 45,
    status: 'draft',
  },
];

const mockQuizzes = [
  {
    id: '1',
    title: 'Quiz: Hàm số cơ bản',
    subject: 'Toán học 12A1',
    chapter: 'Chương 1: Hàm số và đồ thị',
    questions: 15,
    attempts: 45,
    avgScore: 85.2,
    createdDate: '2024-09-15',
    status: 'active',
  },
  {
    id: '2',
    title: 'Kiểm tra: Đạo hàm',
    subject: 'Toán học 12A2',
    chapter: 'Chương 2: Đạo hàm',
    questions: 20,
    attempts: 38,
    avgScore: 78.5,
    createdDate: '2024-09-13',
    status: 'active',
  },
  {
    id: '3',
    title: 'Quiz: Ứng dụng đạo hàm',
    subject: 'Toán học 12A1',
    chapter: 'Chương 3: Ứng dụng đạo hàm',
    questions: 12,
    attempts: 0,
    avgScore: 0,
    createdDate: '2024-09-12',
    status: 'draft',
  },
];

const mockFlashcards = [
  {
    id: '1',
    title: 'Flashcard: Công thức đạo hàm',
    subject: 'Toán học 12A1',
    chapter: 'Chương 2: Đạo hàm',
    cards: 25,
    reviews: 156,
    avgRetention: 89.5,
    createdDate: '2024-09-14',
    status: 'active',
  },
  {
    id: '2',
    title: 'Flashcard: Hàm số lượng giác',
    subject: 'Toán học 12A2',
    chapter: 'Chương 1: Hàm số và đồ thị',
    cards: 18,
    reviews: 98,
    avgRetention: 85.2,
    createdDate: '2024-09-12',
    status: 'active',
  },
];

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
export function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] = useState(false);
  const [quizDuration, setQuizDuration] = useState('');
  const [quizMode, setQuizMode] = useState<"manual" | "ai">(
    "manual",
  );
  const [flashcardMode, setFlashcardMode] = useState<
    "manual" | "ai"
  >("manual");
  const [studentSearchTerm, setStudentSearchTerm] =
    useState("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiFile, setAiFile] = useState<File | null>(null);
  // Quiz form states
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<
    string[]
  >([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      question: "",
      answers: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  // Flashcard form states
  const [flashcardTitle, setFlashcardTitle] = useState("");
  const [
    selectedFlashcardChapters,
    setSelectedFlashcardChapters,
  ] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(
    [{ id: "1", front: "", back: "" }],
  );
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesSubject && matchesType;
  });

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || quiz.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const filteredFlashcards = mockFlashcards.filter(flashcard => {
    const matchesSearch = flashcard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flashcard.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || flashcard.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });
  const handleChapterSelect = (
    chapterId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedChapters([...selectedChapters, chapterId]);
    } else {
      setSelectedChapters(
        selectedChapters.filter((id) => id !== chapterId),
      );
    }
  };

  const handleFlashcardChapterSelect = (
    chapterId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedFlashcardChapters([
        ...selectedFlashcardChapters,
        chapterId,
      ]);
    } else {
      setSelectedFlashcardChapters(
        selectedFlashcardChapters.filter(
          (id) => id !== chapterId,
        ),
      );
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      answers: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(
        questions.filter((q) => q.id !== questionId),
      );
    }
  };

  const updateQuestion = (
    questionId: string,
    field: keyof QuizQuestion,
    value: any,
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q,
      ),
    );
  };

  const updateAnswer = (
    questionId: string,
    answerIndex: number,
    value: string,
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            answers: q.answers.map((ans, idx) =>
              idx === answerIndex ? value : ans,
            ),
          }
          : q,
      ),
    );
  };

  const addFlashcard = () => {
    const newFlashcard: FlashcardItem = {
      id: Date.now().toString(),
      front: "",
      back: "",
    };
    setFlashcards([...flashcards, newFlashcard]);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (file) setAiFile(file);
  };

  const removeFile = () => {
    setAiFile(null);
    // reset input value (optional, nếu muốn cho phép upload cùng file lần nữa)
    const inp = document.getElementById(
      "file-upload",
    ) as HTMLInputElement | null;
    if (inp) inp.value = "";
  };

  const removeFlashcard = (flashcardId: string) => {
    if (flashcards.length > 1) {
      setFlashcards(
        flashcards.filter((f) => f.id !== flashcardId),
      );
    }
  };

  const updateFlashcard = (
    flashcardId: string,
    field: keyof FlashcardItem,
    value: string,
  ) => {
    setFlashcards(
      flashcards.map((f) =>
        f.id === flashcardId ? { ...f, [field]: value } : f,
      ),
    );
  };

  const resetQuizForm = () => {
    setQuizTitle("");
    setSelectedChapters([]);
    setQuestions([
      {
        id: "1",
        question: "",
        answers: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
    setQuizMode("manual");
  };

  const resetFlashcardForm = () => {
    setFlashcardTitle("");
    setSelectedFlashcardChapters([]);
    setFlashcards([{ id: "1", front: "", back: "" }]);
    setFlashcardMode("manual");
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'pptx': return '📊';
      default: return '📄';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return <Badge variant="default">Đã xuất bản</Badge>;
      case 'draft':
        return <Badge variant="secondary">Bản nháp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Nội dung học tập</h1>
          <p className="text-muted-foreground">
            Quản lý tài liệu, quiz và flashcard cho các môn học
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload tài liệu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload tài liệu mới</DialogTitle>
                <DialogDescription>
                  Thêm tài liệu học tập cho sinh viên
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề tài liệu</Label>
                  <Input placeholder="Nhập tiêu đề tài liệu" />
                </div>
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math1">Toán học 12A1</SelectItem>
                      <SelectItem value="math2">Toán học 12A2</SelectItem>
                      <SelectItem value="physics">Vật lý 11B1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chương học</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chương học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ch1">Chương 1: Hàm số và đồ thị</SelectItem>
                      <SelectItem value="ch2">Chương 2: Đạo hàm</SelectItem>
                      <SelectItem value="ch3">Chương 3: Ứng dụng đạo hàm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File tài liệu</Label>
                  <Input type="file" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="public" />
                  <Label htmlFor="public">Công khai cho tất cả sinh viên</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(false)}>
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isCreateQuizOpen}
            onOpenChange={(open) => {
              setIsCreateQuizOpen(open);
              if (!open) resetQuizForm();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Tạo Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo Quiz mới</DialogTitle>
                <DialogDescription>
                  Tạo quiz
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Tiêu đề quiz</Label>
                  <Input
                    placeholder="Nhập tiêu đề quiz"
                    value={quizTitle}
                    onChange={(e) =>
                      setQuizTitle(e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math1">Toán học 12A1</SelectItem>
                      <SelectItem value="math2">Toán học 12A2</SelectItem>
                      <SelectItem value="physics">Vật lý 11B1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chọn chương học</Label>
                  <div className="grid grid-cols-1 gap-2 border rounded p-3">
                    {mockChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`chapter-${chapter.id}`}
                          checked={selectedChapters.includes(
                            chapter.id,
                          )}
                          onCheckedChange={(checked) =>
                            handleChapterSelect(
                              chapter.id,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`chapter-${chapter.id}`}
                        >
                          {chapter.title}
                        </Label>
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
                  <Select
                    value={quizMode}
                    onValueChange={(value: "manual" | "ai") =>
                      setQuizMode(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">
                        Thủ công
                      </SelectItem>
                      <SelectItem value="ai">
                        AI tự động
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {quizMode === "ai" ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label>Số câu hỏi</Label>
                      <Input
                        type="number"
                        placeholder="Nhập số lượng câu hỏi"
                      />
                    </div>
                    {/* UI prompt + paperclip */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prompt cho AI
                      </label>

                      {/* wrapper có viền: textarea + icon nằm bên trong viền */}
                      <div className="relative">
                        <div className="relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-400">
                          {/* textarea thực sự nằm trong container (không có border riêng) */}
                          <textarea
                            value={aiPrompt}
                            onChange={(e) =>
                              setAiPrompt(e.target.value)
                            }
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
                            <span className="max-w-[40ch] truncate font-medium text-gray-700">
                              {aiFile.name}
                            </span>
                          </div>

                          <div className="ml-auto flex items-center gap-2 text-sm">
                            <span className="text-gray-500 text-xs">
                              {(
                                aiFile.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuestion}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm câu hỏi
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {questions.map((question, qIndex) => (
                        <Card key={question.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                Câu hỏi {qIndex + 1}
                              </CardTitle>
                              {questions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeQuestion(question.id)
                                  }
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
                                onChange={(e) =>
                                  updateQuestion(
                                    question.id,
                                    "question",
                                    e.target.value,
                                  )
                                }
                                rows={2}
                              />
                            </div>

                            <div className="space-y-3">
                              <Label>Các đáp án</Label>
                              {question.answers.map(
                                (answer, ansIndex) => (
                                  <div
                                    key={ansIndex}
                                    className="flex items-center gap-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={
                                          question.correctAnswer ===
                                          ansIndex
                                        }
                                        onChange={() =>
                                          updateQuestion(
                                            question.id,
                                            "correctAnswer",
                                            ansIndex,
                                          )
                                        }
                                        className="w-4 h-4"
                                      />
                                      <Label className="text-sm">
                                        Đáp án{" "}
                                        {String.fromCharCode(
                                          65 + ansIndex,
                                        )}
                                      </Label>
                                    </div>
                                    <Input
                                      placeholder={`Nhập đáp án ${String.fromCharCode(65 + ansIndex)}`}
                                      value={answer}
                                      onChange={(e) =>
                                        updateAnswer(
                                          question.id,
                                          ansIndex,
                                          e.target.value,
                                        )
                                      }
                                      className="flex-1"
                                    />
                                  </div>
                                ),
                              )}
                              <p className="text-xs text-muted-foreground">
                                * Chọn radio button để đánh dấu
                                đáp án đúng
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateQuizOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={() => setIsCreateQuizOpen(false)}
                  >
                    Tạo Quiz
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateFlashcardOpen}
            onOpenChange={(open) => {
              setIsCreateFlashcardOpen(open);
              if (!open) resetFlashcardForm();
            }}
          >
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
                  Tạo bộ flashcard cho sinh viên ôn tập
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Tiêu đề bộ flashcard</Label>
                  <Input
                    placeholder="Nhập tiêu đề bộ flashcard"
                    value={flashcardTitle}
                    onChange={(e) =>
                      setFlashcardTitle(e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math1">Toán học 12A1</SelectItem>
                      <SelectItem value="math2">Toán học 12A2</SelectItem>
                      <SelectItem value="physics">Vật lý 11B1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chọn chương học</Label>
                  <div className="grid grid-cols-1 gap-2 border rounded p-3">
                    {mockChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`flashcard-chapter-${chapter.id}`}
                          checked={selectedFlashcardChapters.includes(
                            chapter.id,
                          )}
                          onCheckedChange={(checked) =>
                            handleFlashcardChapterSelect(
                              chapter.id,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`flashcard-chapter-${chapter.id}`}
                        >
                          {chapter.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Chế độ tạo</Label>
                  <Select
                    value={flashcardMode}
                    onValueChange={(value: "manual" | "ai") =>
                      setFlashcardMode(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">
                        Thủ công
                      </SelectItem>
                      <SelectItem value="ai">
                        AI tự động
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {flashcardMode === "ai" ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label>Số cards</Label>
                      <Input
                        type="number"
                        placeholder="Nhập số lượng cards"
                      />
                    </div>
                    {/* UI prompt + paperclip */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prompt cho AI
                      </label>

                      {/* wrapper có viền: textarea + icon nằm bên trong viền */}
                      <div className="relative">
                        <div className="relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-400">
                          {/* textarea thực sự nằm trong container (không có border riêng) */}
                          <textarea
                            value={aiPrompt}
                            onChange={(e) =>
                              setAiPrompt(e.target.value)
                            }
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
                            <span className="max-w-[40ch] truncate font-medium text-gray-700">
                              {aiFile.name}
                            </span>
                          </div>

                          <div className="ml-auto flex items-center gap-2 text-sm">
                            <span className="text-gray-500 text-xs">
                              {(
                                aiFile.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFlashcard}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm flashcard
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {flashcards.map((flashcard, fIndex) => (
                        <Card key={flashcard.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                Flashcard {fIndex + 1}
                              </CardTitle>
                              {flashcards.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeFlashcard(
                                      flashcard.id,
                                    )
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>
                                  Mặt trước (Câu hỏi)
                                </Label>
                                <Textarea
                                  placeholder="Nhập nội dung mặt trước..."
                                  value={flashcard.front}
                                  onChange={(e) =>
                                    updateFlashcard(
                                      flashcard.id,
                                      "front",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>
                                  Mặt sau (Câu trả lời)
                                </Label>
                                <Textarea
                                  placeholder="Nhập nội dung mặt sau..."
                                  value={flashcard.back}
                                  onChange={(e) =>
                                    updateFlashcard(
                                      flashcard.id,
                                      "back",
                                      e.target.value,
                                    )
                                  }
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
                  <Button
                    variant="outline"
                    onClick={() =>
                      setIsCreateFlashcardOpen(false)
                    }
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={() =>
                      setIsCreateFlashcardOpen(false)
                    }
                  >
                    Tạo Flashcard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                <SelectItem value="Toán học 12A1">Toán học 12A1</SelectItem>
                <SelectItem value="Toán học 12A2">Toán học 12A2</SelectItem>
                <SelectItem value="Vật lý 11B1">Vật lý 11B1</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pptx">PowerPoint</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Tài liệu ({mockDocuments.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz ({mockQuizzes.length})</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcard ({mockFlashcards.length})</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getTypeIcon(doc.type)}</div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{doc.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {doc.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.chapter}
                          </Badge>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Kích thước: {doc.size}</span>
                          <span>•</span>
                          <span>Tải về: {doc.downloads} lần</span>
                          <span>•</span>
                          <span>Upload: {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {quiz.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {quiz.chapter}
                          </Badge>
                          {getStatusBadge(quiz.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{quiz.questions} câu hỏi</span>
                          <span>•</span>
                          <span>{quiz.attempts} lượt làm</span>
                          <span>•</span>
                          <span>Điểm TB: {quiz.avgScore}%</span>
                          <span>•</span>
                          <span>Tạo: {new Date(quiz.createdDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
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
            {filteredFlashcards.map((flashcard) => (
              <Card key={flashcard.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{flashcard.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {flashcard.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {flashcard.chapter}
                          </Badge>
                          {getStatusBadge(flashcard.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{flashcard.cards} thẻ</span>
                          <span>•</span>
                          <span>{flashcard.reviews} lượt ôn tập</span>
                          <span>•</span>
                          <span>Tỷ lệ ghi nhớ: {flashcard.avgRetention}%</span>
                          <span>•</span>
                          <span>Tạo: {new Date(flashcard.createdDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{mockDocuments.length}</div>
            <div className="text-sm text-muted-foreground">Tài liệu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{mockQuizzes.length}</div>
            <div className="text-sm text-muted-foreground">Quiz</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{mockFlashcards.length}</div>
            <div className="text-sm text-muted-foreground">Flashcard</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {mockDocuments.reduce((sum, doc) => sum + doc.downloads, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Lượt tải về</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
