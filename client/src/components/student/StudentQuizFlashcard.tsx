import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Paperclip, X } from 'lucide-react'
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
} from 'lucide-react'
import QuizView from '../teacher/QuizView'
import FlashcardView from '../teacher/FlashcardView'
import Spinner from '../layout/spinner/Spinner'
import axios from 'axios'
import { toast } from 'sonner'
import { useNavigation } from '../../hooks/useNavigation'

interface StudentQuizFlashcardProps {
    quizzesData?: any[]
    flashcardsData?: any[]
    quizzesLoading?: boolean
    flashcardsLoading?: boolean
    chapters?: any[]
    chaptersLoading?: boolean
    currentSubjectId?: string | null
}

export function StudentQuizFlashcard({
    quizzesData = [],
    flashcardsData = [],
    chapters = [],
    chaptersLoading = false,
    currentSubjectId = null
}: StudentQuizFlashcardProps) {
    const { navigateTo } = useNavigation()
    const [quizLoading, setQuizLoading] = useState(false)
    const [quizError, setQuizError] = useState<string | null>(null)
    const [flashcardError, setFlashcardError] = useState<string | null>(null)
    const [quizzes, setQuizzes] = useState<any[]>([])

    const [quizDescription, setQuizDescription] = useState('')
    const [quizSubject, setQuizSubject] = useState('')
    const [quizDifficulty, setQuizDifficulty] = useState('')
    const [quizIsPublic, setQuizIsPublic] = useState(false)
    const [flashcardDescription, setFlashcardDescription] = useState('')
    const [flashcardSubject, setFlashcardSubject] = useState('')
    const [flashcardDifficulty, setFlashcardDifficulty] = useState('')
    const [flashcardIsPublic, setFlashcardIsPublic] = useState(false)
    const [quizDuration, setQuizDuration] = useState('')
    const [aiPrompt, setAiPrompt] = useState<string>('')
    const [aiQuestionCount, setAiQuestionCount] = useState('5')
    const [aiFlashcardCount, setAiFlashcardCount] = useState('5')
    const [aiFlashcardPrompt, setAiFlashcardPrompt] = useState<string>('')

    const [isEditQuizOpen, setIsEditQuizOpen] = useState(false)
    const [isEditFlashcardOpen, setIsEditFlashcardOpen] = useState(false)
    const [editingQuiz, setEditingQuiz] = useState<any>(null)
    const [editingFlashcard, setEditingFlashcard] = useState<any>(null)

    // View content states
    const [viewingQuiz, setViewingQuiz] = useState<any>(null)
    const [viewingFlashcard, setViewingFlashcard] = useState<any>(null)

    // Tab selection
    const [selectedTab, setSelectedTab] = useState('quizzes')

    // Delete dialog states
    const [isDeleteFlashcardDialogOpen, setIsDeleteFlashcardDialogOpen] = useState(false)
    const [deletingFlashcard, setDeletingFlashcard] = useState<any>(null)

    // Real data states
    const [quizzesLoading, setQuizzesLoading] = useState(false)
    const [flashcardsLoading, setFlashcardsLoading] = useState(false)

    const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
    const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] = useState(false)
    const [quizMode, setQuizMode] = useState<'manual' | 'ai'>('manual')
    const [flashcardMode, setFlashcardMode] = useState<'manual' | 'ai'>('manual')
    const [flashcardLoading, setFlashcardLoading] = useState(false)
    const [creatingQuiz, setCreatingQuiz] = useState(false)

    // Flashcard state variables
    const [flashcardTitle, setFlashcardTitle] = useState('')
    const [selectedFlashcardChapters, setSelectedFlashcardChapters] = useState<string[]>([])
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>([{ id: '1', front: '', back: '' }])

    // Quiz state variables
    const [selectedChapters, setSelectedChapters] = useState<string[]>([])
    const [quizTitle, setQuizTitle] = useState('')
    const [questions, setQuestions] = useState<
        { id: string; question: string; answers: string[]; correctAnswer: number }[]
    >([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])

    // Fetch quizzes data when component mounts
    useEffect(() => {
        fetchQuizzes()
    }, [currentSubjectId])

    // Fetch flashcards data when component mounts
    useEffect(() => {
        fetchFlashcards()
    }, [currentSubjectId])

    const getMaterialsBySelectedChapters = async (chapterIds: string[]) => {
        let allMaterialIds: string[] = []

        for (const chapterId of chapterIds) {
            const res = await axios.get(
                `http://localhost:9000/api/materials/class/${currentSubjectId}/chapter/${chapterId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                }
            )

            const docs = res.data.data || []

            // Lấy ID của tất cả tài liệu
            const ids = docs.map((d: any) => d._id)

            allMaterialIds = [...allMaterialIds, ...ids]
        }

        return allMaterialIds
    }

    const createAIQuiz = async () => {
        setCreatingQuiz(true)

        try {
            // 1. Lấy chương đã chọn
            const chapterIds = selectedChapters
            if (chapterIds.length === 0) {
                toast.error('Bạn phải chọn ít nhất 1 chương!')
                return
            }

            // 2. Lấy tất cả tài liệu của các chương đã chọn
            const materialIds = await getMaterialsBySelectedChapters(chapterIds)
            if (materialIds.length === 0) {
                toast.error('Các chương này chưa có tài liệu. Không thể tạo quiz AI.')
                return
            }

            // 3. Build payload
            const payload = {
                title: quizTitle,
                classId: currentSubjectId,
                chapterIds,
                materialIds,
                count: Number(aiQuestionCount),
                prompt: aiPrompt,
                durationMinutes: Number(quizDuration)
            }

            // 4. CALL API
            const res = await axios.post('http://localhost:9000/api/ai/generate-quiz', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            })

            toast.success('Tạo quiz thành công!')

            // 5. Đóng dialog + Refresh quiz list
            setIsCreateQuizOpen(false)
            resetQuizForm()
            fetchQuizzes()
        } catch (err: any) {
            console.error('Create AI Quiz Error:', err)
            toast.error(err?.response?.data?.message || 'Lỗi khi tạo quiz')
        } finally {
            setCreatingQuiz(false)
        }
    }

    const createManualQuiz = async () => {
        setCreatingQuiz(true)

        try {
            // Validate
            if (!quizTitle.trim()) {
                toast.error('Bạn phải nhập tiêu đề quiz')
                return
            }

            if (selectedChapters.length === 0) {
                toast.error('Bạn phải chọn ít nhất 1 chương')
                return
            }

            if (questions.length === 0) {
                toast.error('Bạn phải có ít nhất 1 câu hỏi')
                return
            }

            for (const q of questions) {
                if (!q.question.trim()) {
                    toast.error('Một câu hỏi chưa có nội dung')
                    return
                }
                if (q.answers.some((a) => !a.trim())) {
                    toast.error('Một câu hỏi có đáp án bị trống')
                    return
                }
            }

            const payload = {
                title: quizTitle,
                classId: currentSubjectId,
                chapters: selectedChapters,
                durationMinutes: Number(quizDuration),
                isAIGenerated: false,
                questions: questions.map((q) => ({
                    question: q.question.trim(),
                    answers: q.answers.map((a) => a.trim()),
                    correctAnswer: q.correctAnswer
                }))
            }

            await axios.post('http://localhost:9000/api/quizzes', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            })

            toast.success('Tạo quiz thủ công thành công!')

            setIsCreateQuizOpen(false)
            resetQuizForm()
            fetchQuizzes()
        } catch (err: any) {
            console.error('Create Manual Quiz Error:', err)
            toast.error(err?.response?.data?.message || 'Lỗi khi tạo quiz')
        } finally {
            setCreatingQuiz(false)
        }
    }

    const fetchQuizzes = async () => {
        if (!currentSubjectId) return

        setQuizLoading(true)
        setQuizError(null)

        try {
            const res = await axios.get(`http://localhost:9000/api/quizzes/class/${currentSubjectId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })

            // res.data.data.items là array quiz BE trả về
            setQuizzes(res.data.data.items || [])
        } catch (err: any) {
            console.error('Error loading quizzes:', err)
            setQuizError(err?.response?.data?.message || 'Không thể tải danh sách quiz')
        } finally {
            setQuizLoading(false)
        }
    }

    const fetchFlashcards = async () => {
        if (!currentSubjectId) return

        setFlashcardsLoading(true)
        setFlashcardError(null)

        try {
            const res = await axios.get(`http://localhost:9000/api/flashcard-sets/class/${currentSubjectId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })

            // res.data.data.items là array flashcard sets BE trả về
            // Note: This will update the parent's flashcardsData through props
        } catch (err: any) {
            console.error('Error loading flashcards:', err)
            setFlashcardError(err?.response?.data?.message || 'Không thể tải danh sách flashcards')
        } finally {
            setFlashcardsLoading(false)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Dễ':
                return 'bg-green-100 text-green-800'
            case 'Trung bình':
                return 'bg-yellow-100 text-yellow-800'
            case 'Khó':
                return 'bg-orange-100 text-orange-800'
            case 'Rất khó':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const handleCreateQuiz = () => {
        console.log('Creating quiz:', {
            title: quizTitle,
            description: quizDescription,
            subject: quizSubject,
            difficulty: quizDifficulty,
            isPublic: quizIsPublic
        })
        setIsCreateQuizOpen(false)
        setQuizTitle('')
        setQuizDescription('')
        setQuizSubject('')
        setQuizDifficulty('')
        setQuizIsPublic(false)
    }

    const handleChapterSelect = (chapterId: string, checked: boolean) => {
        if (checked) {
            setSelectedChapters([...selectedChapters, chapterId])
        } else {
            setSelectedChapters(selectedChapters.filter((id) => id !== chapterId))
        }
    }

    const handleFlashcardChapterSelect = (chapterId: string, checked: boolean) => {
        if (checked) {
            setSelectedFlashcardChapters([...selectedFlashcardChapters, chapterId])
        } else {
            setSelectedFlashcardChapters(selectedFlashcardChapters.filter((id) => id !== chapterId))
        }
    }
    const handleCreateFlashcard = () => {
        // This function is now handled by the button onClick directly
        // which calls flashcardMode === 'ai' ? createAIFlashcard : createManualFlashcard
    }

    interface QuizQuestion {
        id: string
        question: string
        answers: string[]
        correctAnswer: number
    }

    interface FlashcardItem {
        id: string
        front: string
        back: string
    }
    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: Date.now().toString(),
            question: '',
            answers: ['', '', '', ''],
            correctAnswer: 0
        }
        setQuestions([...questions, newQuestion])
    }

    const removeQuestion = (questionId: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((q) => q.id !== questionId))
        }
    }

    const updateQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
        setQuestions(questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)))
    }

    const updateAnswer = (questionId: string, answerIndex: number, value: string) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId ? { ...q, answers: q.answers.map((ans, idx) => (idx === answerIndex ? value : ans)) } : q
            )
        )
    }
    const addFlashcard = () => {
        const newFlashcard: FlashcardItem = {
            id: Date.now().toString(),
            front: '',
            back: ''
        }
        setFlashcards([...flashcards, newFlashcard])
    }

    const removeFlashcard = (flashcardId: string) => {
        if (flashcards.length > 1) {
            setFlashcards(flashcards.filter((f) => f.id !== flashcardId))
        }
    }

    const updateFlashcard = (flashcardId: string, field: keyof FlashcardItem, value: string) => {
        setFlashcards(flashcards.map((f) => (f.id === flashcardId ? { ...f, [field]: value } : f)))
    }

    const resetQuizForm = () => {
        setQuizTitle('')
        setSelectedChapters([])
        setQuestions([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
        setQuizMode('manual')
    }

    const resetFlashcardForm = () => {
        setFlashcardTitle('')
        setSelectedFlashcardChapters([])
        setFlashcards([{ id: '1', front: '', back: '' }])
        setFlashcardMode('manual')
    }

    const createManualFlashcard = async () => {
        setFlashcardLoading(true)

        try {
            // Validate
            if (!flashcardTitle.trim()) {
                toast.error('Bạn phải nhập tiêu đề bộ flashcard')
                return
            }

            if (selectedFlashcardChapters.length === 0) {
                toast.error('Bạn phải chọn ít nhất 1 chương')
                return
            }

            if (flashcards.length === 0) {
                toast.error('Bạn phải có ít nhất 1 thẻ flashcard')
                return
            }

            for (const f of flashcards) {
                if (!f.front.trim()) {
                    toast.error('Một thẻ flashcard chưa có nội dung mặt trước')
                    return
                }
                if (!f.back.trim()) {
                    toast.error('Một thẻ flashcard chưa có nội dung mặt sau')
                    return
                }
            }

            const payload = {
                title: flashcardTitle,
                description: flashcardDescription,
                classId: currentSubjectId,
                chapters: selectedFlashcardChapters,
                flashcards: flashcards.map((f) => ({
                    front: f.front.trim(),
                    back: f.back.trim()
                })),
                difficulty: flashcardDifficulty || 'medium'
            }

            const res = await axios.post('http://localhost:9000/api/flashcard-sets', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.data.success) {
                toast.success('Tạo flashcard thành công!')
                setIsCreateFlashcardOpen(false)
                resetFlashcardForm()
                fetchFlashcards()
                // Parent component will handle data refresh
            }
        } catch (err: any) {
            console.error('Create Manual Flashcard Error:', err)
            toast.error(err?.response?.data?.message || 'Lỗi khi tạo flashcard')
        } finally {
            setFlashcardLoading(false)
        }
    }

    const createAIFlashcard = async () => {
        setFlashcardLoading(true)

        try {
            // Validate
            if (!flashcardTitle.trim()) {
                toast.error('Bạn phải nhập tiêu đề bộ flashcard')
                return
            }

            if (selectedFlashcardChapters.length === 0) {
                toast.error('Bạn phải chọn ít nhất 1 chương')
                return
            }

            if (!aiFlashcardCount || Number(aiFlashcardCount) < 1) {
                toast.error('Số lượng thẻ flashcard phải lớn hơn 0')
                return
            }

            // Get materials for selected chapters
            const materialIds = await getMaterialsBySelectedChapters(selectedFlashcardChapters)
            if (materialIds.length === 0) {
                toast.error('Các chương này chưa có tài liệu. Không thể tạo flashcard AI.')
                return
            }

            const payload = {
                title: flashcardTitle,
                description: flashcardDescription,
                classId: currentSubjectId,
                chapterIds: selectedFlashcardChapters,
                materialIds: materialIds,
                count: Number(aiFlashcardCount),
                prompt: aiFlashcardPrompt,
                difficulty: 'medium'
            }

            const res = await axios.post('http://localhost:9000/api/ai/generate-flashcards', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.data.success) {
                toast.success('Tạo flashcard bằng AI thành công!')
                setIsCreateFlashcardOpen(false)
                resetFlashcardForm()
                fetchFlashcards()
                // Parent component will handle data refresh
            }
        } catch (err: any) {
            console.error('Create AI Flashcard Error:', err)
            toast.error(err?.response?.data?.message || 'Lỗi khi tạo flashcard bằng AI')
        } finally {
            setFlashcardLoading(false)
        }
    }

    const handleDeleteFlashcard = (flashcard: any) => {
        setDeletingFlashcard(flashcard)
        setIsDeleteFlashcardDialogOpen(true)
    }

    const handleViewContent = (item: any) => {
        if (selectedTab === 'quizzes') {
            setViewingQuiz(item)
        } else {
            setViewingFlashcard(item)
        }
    }

    // If viewing a quiz, show QuizView
    if (viewingQuiz) {
        return (
            <QuizView
                quiz={viewingQuiz}
                onClose={() => setViewingQuiz(null)}
            />
        )
    }

    // If viewing a flashcard set, show FlashcardView
    if (viewingFlashcard) {
        return (
            <FlashcardView
                flashcardSet={viewingFlashcard}
                onClose={() => setViewingFlashcard(null)}
            />
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1>Quiz & Flashcard</h1>
                    <p className='text-muted-foreground'>Tạo quiz, flashcard với bạn bè</p>
                </div>

                <div className='flex gap-2'>
                    {/* Global Quiz Button */}
                    <Dialog
                        open={isCreateQuizOpen}
                        onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
                            setIsCreateQuizOpen(open)
                            if (!open) resetQuizForm()
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className='gap-2' variant='outline'>
                                <Plus className='h-4 w-4' />
                                Tạo Quiz
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                            <DialogHeader>
                                <DialogTitle>Tạo Quiz mới</DialogTitle>
                                <DialogDescription className='pb-6'>Tạo quiz từ nhiều chương học</DialogDescription>
                            </DialogHeader>
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label>Tiêu đề quiz</Label>
                                    <Input
                                        placeholder='Nhập tiêu đề quiz'
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label>Chọn chương học</Label>
                                    {chaptersLoading && (
                                        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                                            <Spinner />
                                            <p>Đang tải chương...</p>
                                        </div>
                                    )}
                                    {!chaptersLoading && chapters.length === 0 && (
                                        <p className='text-sm text-muted-foreground'>Chưa có chương nào</p>
                                    )}
                                    <div className='grid grid-cols-1 gap-2 border rounded-lg p-3'>
                                        {chapters.map((c) => (
                                            <div key={c._id} className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id={`chapter-${c._id}`}
                                                    checked={selectedChapters.includes(c._id)}
                                                    onCheckedChange={(checked: boolean) => handleChapterSelect(c._id, !!checked)}
                                                />
                                                <Label htmlFor={`chapter-${c._id}`}>{c.title}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Thời gian (phút)</Label>
                                    <Input
                                        type='number'
                                        placeholder='Nhập thời gian làm quiz'
                                        value={quizDuration}
                                        onChange={(e) => setQuizDuration(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Chế độ tạo</Label>
                                    <Select value={quizMode} onValueChange={(value: 'manual' | 'ai') => setQuizMode(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='manual'>Thủ công</SelectItem>
                                            <SelectItem value='ai'>AI tự động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {quizMode === 'ai' ? (
                                    <div className='space-y-2'>
                                        <div className='space-y-2 pb-2'>
                                            <Label>Số câu hỏi</Label>
                                            <Input
                                                type='number'
                                                placeholder='Nhập số lượng câu hỏi'
                                                value={aiQuestionCount}
                                                onChange={(e) => setAiQuestionCount(e.target.value)}
                                            />
                                        </div>

                                        {/* UI prompt */}
                                        <div className='space-y-2'>
                                            <label className='block text-sm font-medium text-gray-700 pt-2'>Prompt cho AI</label>

                                            {/* wrapper có viền: textarea + icon nằm bên trong viền */}
                                            <div className='relative'>
                                                <div className='relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-400'>
                                                    {/* textarea thực sự nằm trong container (không có border riêng) */}
                                                    <textarea
                                                        value={aiPrompt}
                                                        onChange={(e) => setAiPrompt(e.target.value)}
                                                        rows={4}
                                                        placeholder='Mô tả nội dung quiz bạn muốn AI tạo...'
                                                        aria-label='Prompt cho AI'
                                                        className='w-full min-h-[6rem] resize-none bg-transparent px-4 py-3 pr-12 text-sm outline-none placeholder:text-gray-400'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <Label>Câu hỏi</Label>
                                            <Button type='button' variant='outline' size='sm' onClick={addQuestion}>
                                                <Plus className='h-4 w-4 mr-1' />
                                                Thêm câu hỏi
                                            </Button>
                                        </div>

                                        <div className='space-y-4'>
                                            {questions.map((question, qIndex) => (
                                                <Card key={question.id}>
                                                    <CardHeader className='pb-3'>
                                                        <div className='flex items-center justify-between'>
                                                            <CardTitle className='text-base font-semibold'>Câu hỏi {qIndex + 1}</CardTitle>
                                                            {questions.length > 1 && (
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() => removeQuestion(question.id)}
                                                                >
                                                                    <X className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className='space-y-4'>
                                                        <div className='space-y-2'>
                                                            <Label className='pb-2'>Nội dung câu hỏi</Label>
                                                            <Textarea
                                                                placeholder='Nhập câu hỏi...'
                                                                value={question.question}
                                                                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className='space-y-3'>
                                                            <Label className='pt-2'>Các đáp án</Label>
                                                            {question.answers.map((answer, ansIndex) => (
                                                                <div key={ansIndex} className='flex items-center gap-3'>
                                                                    <div className='flex items-center gap-2'>
                                                                        <input
                                                                            type='radio'
                                                                            name={`correct-${question.id}`}
                                                                            checked={question.correctAnswer === ansIndex}
                                                                            onChange={() => updateQuestion(question.id, 'correctAnswer', ansIndex)}
                                                                            className='w-4 h-4'
                                                                        />
                                                                        <Label className='text-sm'>Đáp án {String.fromCharCode(65 + ansIndex)}</Label>
                                                                    </div>
                                                                    <Input
                                                                        placeholder={`Nhập đáp án ${String.fromCharCode(65 + ansIndex)}`}
                                                                        value={answer}
                                                                        onChange={(e) => updateAnswer(question.id, ansIndex, e.target.value)}
                                                                        className='flex-1'
                                                                    />
                                                                </div>
                                                            ))}
                                                            <p className='p-2 text-xs text-muted-foreground'>
                                                                * Chọn radio button để đánh dấu đáp án đúng
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <Button type='button' variant='outline' size='sm' onClick={addQuestion} className='w-full'>
                                                <Plus className='h-4 w-4 mr-1' />
                                                Thêm câu hỏi
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className='flex justify-end gap-2'>
                                    <Button variant='outline' onClick={() => setIsCreateQuizOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button disabled={creatingQuiz} onClick={quizMode === 'ai' ? createAIQuiz : createManualQuiz}>
                                        {creatingQuiz && <Spinner />}
                                        {creatingQuiz ? 'Đang tạo...' : 'Tạo Quiz'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Global Flashcard Button */}
                    <Dialog
                        open={isCreateFlashcardOpen}
                        onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
                            setIsCreateFlashcardOpen(open)
                            if (!open) resetFlashcardForm()
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant='outline' className='gap-2'>
                                <Plus className='h-4 w-4' />
                                Tạo Flashcard
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                            <DialogHeader>
                                <DialogTitle>Tạo Flashcard mới</DialogTitle>
                                <DialogDescription className='pb-6'>Tạo bộ flashcard từ nhiều chương học</DialogDescription>
                            </DialogHeader>
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label>Tiêu đề bộ flashcard</Label>
                                    <Input
                                        placeholder='Nhập tiêu đề bộ flashcard'
                                        value={flashcardTitle}
                                        onChange={(e) => setFlashcardTitle(e.target.value)}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label>Chọn chương học</Label>
                                    {chaptersLoading && (
                                        <div>
                                            <Spinner />
                                            <p className='text-sm text-muted-foreground'>Đang tải chương...</p>
                                        </div>
                                    )}
                                    <div className='grid grid-cols-1 gap-2 border rounded p-3'>
                                        {chapters.map((chapter) => (
                                            <div key={chapter._id} className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id={`flashcard-chapter-${chapter._id}`}
                                                    checked={selectedFlashcardChapters.includes(chapter._id)}
                                                    onCheckedChange={(checked: boolean) =>
                                                        handleFlashcardChapterSelect(chapter._id, checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor={`flashcard-chapter-${chapter._id}`}>{chapter.title}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {!chaptersLoading && chapters.length === 0 && (
                                        <p className='text-sm text-muted-foreground'>Chưa có chương nào trong lớp học này</p>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label>Chế độ tạo</Label>
                                    <Select value={flashcardMode} onValueChange={(value: 'manual' | 'ai') => setFlashcardMode(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='manual'>Thủ công</SelectItem>
                                            <SelectItem value='ai'>AI tự động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {flashcardMode === 'ai' ? (
                                    <div className='space-y-2'>
                                        <div className='space-y-2'>
                                            <Label>Số thẻ</Label>
                                            <Input
                                                type='number'
                                                placeholder='Nhập số lượng thẻ'
                                                value={aiFlashcardCount}
                                                onChange={(e) => setAiFlashcardCount(e.target.value)}
                                            />
                                        </div>
                                        {/* UI prompt*/}
                                        <div className='space-y-2'>
                                            <label className='block text-sm font-medium text-gray-700'>Prompt cho AI</label>

                                            {/* wrapper có viền: textarea + icon nằm bên trong viền */}
                                            <div className='relative'>
                                                <div className='relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-400'>
                                                    {/* textarea thực sự nằm trong container (không có border riêng) */}
                                                    <textarea
                                                        value={aiFlashcardPrompt}
                                                        onChange={(e) => setAiFlashcardPrompt(e.target.value)}
                                                        rows={4}
                                                        placeholder='Mô tả nội dung flashcard bạn muốn AI tạo...'
                                                        aria-label='Prompt cho AI'
                                                        className='w-full min-h-[6rem] resize-none bg-transparent px-4 py-3 pr-12 text-sm outline-none placeholder:text-gray-400'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <Label>Flashcard</Label>
                                            <Button type='button' variant='outline' size='sm' onClick={addFlashcard}>
                                                <Plus className='h-4 w-4 mr-1' />
                                                Thêm flashcard
                                            </Button>
                                        </div>

                                        <div className='space-y-6'>
                                            {flashcards.map((flashcard, fIndex) => (
                                                <Card key={flashcard.id}>
                                                    <CardHeader className='pb-3'>
                                                        <div className='flex items-center justify-between'>
                                                            <CardTitle className='text-base font-semibold'>Flashcard {fIndex + 1}</CardTitle>
                                                            {flashcards.length > 1 && (
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() => removeFlashcard(flashcard.id)}
                                                                >
                                                                    <X className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className='space-y-4'>
                                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                            <div className='space-y-2'>
                                                                <Label>Mặt trước (Câu hỏi)</Label>
                                                                <Textarea
                                                                    placeholder='Nhập nội dung mặt trước...'
                                                                    value={flashcard.front}
                                                                    onChange={(e) => updateFlashcard(flashcard.id, 'front', e.target.value)}
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <Label>Mặt sau (Câu trả lời)</Label>
                                                                <Textarea
                                                                    placeholder='Nhập nội dung mặt sau...'
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

                                <div className='flex justify-end gap-2'>
                                    <Button variant='outline' onClick={() => setIsCreateFlashcardOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button disabled={flashcardLoading} onClick={flashcardMode === 'ai' ? createAIFlashcard : createManualFlashcard}>
                                        {flashcardLoading && <Spinner />}
                                        {flashcardLoading ? 'Đang tạo...' : 'Tạo Flashcard'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-4'>
                <TabsList>
                    <TabsTrigger value='quizzes'>Quiz</TabsTrigger>
                    <TabsTrigger value='flashcards'>Flashcard</TabsTrigger>
                </TabsList>

                {/* Quizzes Tab */}
                <TabsContent value='quizzes' className='space-y-4'>
                    {quizzesLoading ? (
                        <div className='flex items-center justify-center h-32'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                        </div>
                    ) : quizzesData.length > 0 ? (
                        <div className='grid grid-cols-1 gap-4'>
                            {quizzesData.map((quiz) => (
                                <Card key={quiz._id || quiz.id}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center justify-between gap-4'>
                                            {/* BÊN TRÁI: icon + info */}
                                            <div className='flex items-center gap-4'>
                                                <div className='p-2 bg-purple-100 rounded-lg'>
                                                    <Target className='h-5 w-5 text-purple-600' />
                                                </div>

                                                <div className='space-y-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <h3 className='font-medium'>{quiz.title}</h3>
                                                        <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                                                    </div>

                                                    <p className='text-sm text-muted-foreground'>{quiz.description}</p>

                                                    {/* Chapters */}
                                                    <div className='flex flex-wrap gap-1'>
                                                        {quiz.chapterNames?.map((chapter: string, index: number) => (
                                                            <Badge key={index} variant='secondary' className='text-xs'>
                                                                {chapter}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                                        <span>{quiz.questions?.length || 0} câu hỏi</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BÊN PHẢI: nút làm quiz */}
                                            <div className='flex items-center gap-2'>
                                                <Button variant='outline' size='sm' onClick={() => handleViewContent(quiz)}>
                                                    <Eye className='h-4 w-4 mr-1' />
                                                    Xem nội dung
                                                </Button>
                                                <Button size='sm' onClick={() => {
                                                    console.log('🔍 Debug - quiz object:', quiz);
                                                    console.log('🔍 Debug - quiz._id:', quiz._id);
                                                    console.log('🔍 Debug - quiz.id:', quiz.id);
                                                    console.log('🔍 Debug - all keys:', Object.keys(quiz));
                                                    Object.entries(quiz).forEach(([key, value]) => {
                                                        console.log(`🔍 ${key}:`, value);
                                                    });
                                                    navigateTo('play-quiz', { quizId: quiz._id });
                                                }}>
                                                    <Play className='h-4 w-4 mr-2' />
                                                    Làm quiz
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <Target className='h-12 w-12 text-muted-foreground mb-4' />
                            <h3 className='text-lg font-medium'>Chưa có quiz nào cho lớp này</h3>
                            <p className='text-sm text-muted-foreground mt-1'>Quiz sẽ xuất hiện ở đây sau khi giáo viên tạo</p>
                        </div>
                    )}
                </TabsContent>

                {/* Flashcards Tab */}
                <TabsContent value='flashcards' className='space-y-4'>
                    {flashcardsLoading ? (
                        <div className='flex items-center justify-center h-32'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                        </div>
                    ) : flashcardsData.length > 0 ? (
                        <div className='grid grid-cols-1 gap-4'>
                            {flashcardsData.map((flashcard) => {
                                console.log('Flashcard keys:', Object.keys(flashcard));
                                console.log('Flashcard values:', Object.values(flashcard));
                                console.log('Flashcard full object:', JSON.stringify(flashcard, null, 2));
                                console.log('Flashcard ID (id):', flashcard.id);
                                console.log('Flashcard ID (_id):', flashcard._id);
                                return (
                                    <Card key={flashcard._id}>
                                        <CardContent className='p-4'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='p-2 bg-orange-100 rounded-lg'>
                                                        <BookOpen className='h-5 w-5 text-orange-600' />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <div className='flex items-center gap-2'>
                                                            <h3 className='font-medium'>{flashcard.title}</h3>
                                                            <Badge className={getDifficultyColor(flashcard.difficulty)}>{flashcard.difficulty}</Badge>
                                                        </div>
                                                        <p className='text-sm text-muted-foreground'>{flashcard.description}</p>

                                                        {/* Chapters */}
                                                        <div className='flex flex-wrap gap-1'>
                                                            {flashcard.chapterNames &&
                                                                flashcard.chapterNames.map((chapter: string, index: number) => (
                                                                    <Badge key={index} variant='secondary' className='text-xs'>
                                                                        {chapter}
                                                                    </Badge>
                                                                ))}
                                                        </div>

                                                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                                            <span>{flashcard.totalCards || flashcard.flashcards?.length || 0} thẻ</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <Button variant='outline' size='sm' onClick={() => handleViewContent(flashcard)}>
                                                        <Eye className='h-4 w-4 mr-1' />
                                                        Xem nội dung
                                                    </Button>
                                                    <Button size='sm' onClick={() => {
                                                        console.log('Flashcard object:', flashcard);
                                                        console.log('Flashcard ID:', flashcard._id);
                                                        navigateTo('play-flashcard', { flashcardId: flashcard._id })
                                                    }}>
                                                        <Play className='h-4 w-4 mr-2' />
                                                        Ôn tập
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
                            <h3 className='text-lg font-medium'>Chưa có flashcard nào cho lớp này</h3>
                            <p className='text-sm text-muted-foreground mt-1'>Flashcard sẽ xuất hiện ở đây sau khi giáo viên tạo</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
