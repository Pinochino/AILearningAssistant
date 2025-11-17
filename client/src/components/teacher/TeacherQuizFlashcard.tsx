import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigation } from '../../hooks/useNavigation'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import QuizView from './QuizView'
import FlashcardView from './FlashcardView'
import {
  Search,
  Target,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Plus,
  ArrowLeft,
} from 'lucide-react'

interface TeacherQuizFlashcardProps {
  subjectId: string
  refreshFlashcards?: () => void
  addFlashcardSet?: (newSet: FlashcardSet) => void
}

interface Chapter {
  _id: string
  title: string
}

interface Quiz {
  _id: string
  title: string
  description: string
  chapters: Chapter[]
  questions: any[]
  durationMinutes?: number
  difficulty?: string
  createdAt: string
}

interface FlashcardSet {
  _id: string
  title: string
  description?: string
  chapters: Chapter[]
  difficulty?: string
  createdAt: string
  totalCards?: number
  flashcards?: {
    front: string
    back: string
    difficulty?: string
  }[]
}

interface FlashcardItem {
  id: string
  front: string
  back: string
}

export default function TeacherQuizFlashcard({ subjectId, refreshFlashcards, addFlashcardSet: parentAddFlashcardSet }: TeacherQuizFlashcardProps) {
  const { navigateTo, currentParams } = useNavigation()
  const [selectedTab, setSelectedTab] = useState('quizzes')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('all')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null)
  const [viewingFlashcard, setViewingFlashcard] = useState<FlashcardSet | null>(null)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardSet | null>(null)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Edit form states
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [quizDuration, setQuizDuration] = useState('')
  const [selectedChapters, setQuizSelectedChapters] = useState<string[]>([])
  const [questions, setQuizQuestions] = useState<{ id: string; question: string; answers: string[]; correctAnswer: number }[]>([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
  const [flashcardTitle, setFlashcardTitle] = useState('')
  const [flashcardDescription, setFlashcardDescription] = useState('')
  const [selectedFlashcardChapters, setFlashcardSelectedChapters] = useState<string[]>([])
  const [flashcardList, setFlashcardList] = useState<FlashcardItem[]>([{ id: '1', front: '', back: '' }])
  const [updating, setUpdating] = useState(false)

  // Add new flashcard set to state (for real-time updates)
  const addFlashcardSet = (newSet: FlashcardSet) => {
    setFlashcards(prev => [newSet, ...prev])
    // Also call parent function if provided
    if (parentAddFlashcardSet) {
      parentAddFlashcardSet(newSet)
    }
  }

  // Fetch data
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/quizzes/class/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      console.log('Quizzes API response:', response.data)
      const quizzesData = response.data?.data?.items || []
      console.log('Quizzes data:', quizzesData, 'Type:', typeof quizzesData, 'Is array:', Array.isArray(quizzesData))
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setQuizzes([])
    }
  }

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/flashcard-sets/class/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      console.log('Flashcard Sets API response:', response.data)
      const flashcardsData = response.data?.data?.items || []
      console.log('Flashcard Sets data:', flashcardsData, 'Type:', typeof flashcardsData, 'Is array:', Array.isArray(flashcardsData))
      setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : [])

      // Call parent refresh function if provided
      if (refreshFlashcards) {
        refreshFlashcards()
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error)
      setFlashcards([])
    }
  }

  const fetchChapters = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/chapters/class/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      console.log('Chapters API response:', response.data)
      // Chapters might not be paginated, check if it has items or is direct array
      const chaptersData = response.data?.data?.items || response.data?.data || []
      console.log('Chapters data:', chaptersData, 'Type:', typeof chaptersData, 'Is array:', Array.isArray(chaptersData))
      setChapters(Array.isArray(chaptersData) ? chaptersData : [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setChapters([])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchQuizzes(), fetchFlashcards(), fetchChapters()])
      setLoading(false)
    }
    fetchData()
  }, [subjectId])

  // Filter functions
  const filteredQuizzes = Array.isArray(quizzes) ? quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChapter = selectedChapter === 'all' || quiz.chapters?.some((ch: any) => ch._id === selectedChapter)
    return matchesSearch && matchesChapter
  }) : []

  const filteredFlashcards = Array.isArray(flashcards) ? flashcards.filter((flashcard) => {
    const matchesSearch =
      flashcard.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flashcard.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChapter = selectedChapter === 'all' || flashcard.chapters?.some((ch: any) => ch._id === selectedChapter)
    return matchesSearch && matchesChapter
  }) : []

  // Helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Handler functions
  const handleViewContent = (item: any) => {
    if (selectedTab === 'quizzes') {
      setViewingQuiz(item)
    } else {
      setViewingFlashcard(item)
    }
  }

  const handleViewResults = (item: any) => {
    if (selectedTab === 'quizzes') {
      // Navigate to quiz results overview
      navigateTo('quiz-results-overview', {
        quizId: item._id,
        subjectId: currentParams.subjectId
      })
    } else if (selectedTab === 'flashcards') {
      // Navigate to flashcard results overview
      navigateTo('flashcard-results-overview', {
        flashcardId: item._id,
        subjectId: currentParams.subjectId
      })
    }
  }

  const handleEdit = (item: any) => {
    if (selectedTab === 'quizzes') {
      // Populate quiz form
      setQuizTitle(item.title || '')
      setQuizDescription(item.description || '')
      setQuizDuration(item.durationMinutes?.toString() || '')
      setQuizSelectedChapters(item.chapters?.map((ch: any) => ch._id) || [])
      setQuizQuestions(item.questions?.map((q: any, index: number) => ({
        id: (index + 1).toString(),
        question: q.question || '',
        answers: q.answers || ['', '', '', ''],
        correctAnswer: q.correctAnswer || 0
      })) || [{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
      setEditingQuiz(item)
    } else {
      // Populate flashcard form
      setFlashcardTitle(item.title || '')
      setFlashcardDescription(item.description || '')
      setFlashcardSelectedChapters(item.chapters?.map((ch: any) => ch._id) || [])
      setFlashcardList(item.flashcards?.map((f: any, index: number) => ({
        id: (index + 1).toString(),
        front: f.front || '',
        back: f.back || ''
      })) || [{ id: '1', front: '', back: '' }])
      setEditingFlashcard(item)
    }
  }

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      const token = localStorage.getItem('accessToken')
      const endpoint = selectedTab === 'quizzes'
        ? `http://localhost:9000/api/quizzes/${itemToDelete._id}`
        : `http://localhost:9000/api/flashcards/${itemToDelete._id}`

      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success(`Xóa ${selectedTab === 'quizzes' ? 'quiz' : 'bộ flashcard'} thành công`)

      // Update local state
      if (selectedTab === 'quizzes') {
        setQuizzes(prev => prev.filter(q => q._id !== itemToDelete._id))
      } else {
        setFlashcards(prev => prev.filter(f => f._id !== itemToDelete._id))
      }

      // Close dialog and reset
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)

    } catch (err: any) {
      console.error('Delete error:', err)
      toast.error(err?.response?.data?.message || `Lỗi khi xóa ${selectedTab === 'quizzes' ? 'quiz' : 'bộ flashcard'}`)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleUpdateQuiz = async () => {
    if (!editingQuiz) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('accessToken')
      const payload = {
        title: quizTitle,
        description: quizDescription,
        durationMinutes: Number(quizDuration),
        chapters: selectedChapters,
        questions: questions.map((q) => ({
          question: q.question.trim(),
          answers: q.answers.map((a) => a.trim()),
          correctAnswer: q.correctAnswer
        }))
      }

      await axios.patch(`http://localhost:9000/api/quizzes/${editingQuiz._id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success('Cập nhật quiz thành công')

      // Update local state with proper structure
      setQuizzes(prev => prev.map(q => q._id === editingQuiz._id ? {
        ...q,
        title: quizTitle,
        description: quizDescription,
        durationMinutes: Number(quizDuration),
        chapters: q.chapters, // Keep original chapters structure
        questions: questions.map((q) => ({
          question: q.question.trim(),
          answers: q.answers.map((a) => a.trim()),
          correctAnswer: q.correctAnswer
        }))
      } : q))

      // Reset edit state
      setEditingQuiz(null)
      resetQuizForm()

    } catch (err: any) {
      console.error('Update quiz error:', err)
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật quiz')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateFlashcard = async () => {
    if (!editingFlashcard) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('accessToken')
      const payload = {
        title: flashcardTitle,
        description: flashcardDescription,
        chapters: selectedFlashcardChapters,
        flashcards: flashcardList.map((f) => ({
          front: f.front.trim(),
          back: f.back.trim()
        }))
      }

      await axios.patch(`http://localhost:9000/api/flashcard-sets/${editingFlashcard._id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success('Cập nhật bộ flashcard thành công')

      // Update local state with proper structure
      setFlashcards(prev => prev.map(f => f._id === editingFlashcard._id ? {
        ...f,
        title: flashcardTitle,
        description: flashcardDescription,
        chapters: f.chapters, // Keep original chapters structure
        flashcards: flashcardList.map((card) => ({
          front: card.front.trim(),
          back: card.back.trim()
        }))
      } : f))

      // Reset edit state
      setEditingFlashcard(null)
      resetFlashcardForm()

    } catch (err: any) {
      console.error('Update flashcard error:', err)
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật bộ flashcard')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingQuiz(null)
    setEditingFlashcard(null)
    resetQuizForm()
    resetFlashcardForm()
  }

  const resetQuizForm = () => {
    setQuizTitle('')
    setQuizDescription('')
    setQuizDuration('')
    setQuizSelectedChapters([])
    setQuizQuestions([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
  }

  const resetFlashcardForm = () => {
    setFlashcardTitle('')
    setFlashcardDescription('')
    setFlashcardSelectedChapters([])
    setFlashcardList([{ id: '1', front: '', back: '' }])
  }

  // Quiz question management
  const addQuestion = () => {
    const newId = (questions.length + 1).toString()
    setQuizQuestions([...questions, { id: newId, question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuizQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuizQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  // Flashcard management
  const addFlashcard = () => {
    const newId = (flashcardList.length + 1).toString()
    setFlashcardList([...flashcardList, { id: newId, front: '', back: '' }])
  }

  const removeFlashcard = (id: string) => {
    if (flashcardList.length > 1) {
      setFlashcardList(flashcardList.filter(f => f.id !== id))
    }
  }

  const updateFlashcard = (id: string, field: string, value: string) => {
    setFlashcardList(flashcardList.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const handleChapterSelect = (chapterId: string, isSelected: boolean, isFlashcard: boolean = false) => {
    if (isFlashcard) {
      if (isSelected) {
        setFlashcardSelectedChapters([...selectedFlashcardChapters, chapterId])
      } else {
        setFlashcardSelectedChapters(selectedFlashcardChapters.filter(id => id !== chapterId))
      }
    } else {
      if (isSelected) {
        setQuizSelectedChapters([...selectedChapters, chapterId])
      } else {
        setQuizSelectedChapters(selectedChapters.filter(id => id !== chapterId))
      }
    }
  }

  const getCurrentUserId = () => {
    // Try multiple sources - check currentUser first (new key)
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user')
    console.log('LocalStorage keys:', Object.keys(localStorage))
    console.log('User string from localStorage (currentUser/user):', userStr)

    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        console.log('Current user parsed:', user)
        return user._id || user.id || user.userId
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
      }
    }

    // Fallback: try to get from other storage keys
    const userId = localStorage.getItem('userId') || localStorage.getItem('user_id')
    console.log('Fallback userId from localStorage:', userId)
    if (userId) return userId

    return null
  }

  const canEdit = (item: any) => {
    // Teachers can edit all quizzes and flashcards
    return true
  }

  const canDelete = (item: any) => {
    // Teachers can delete all quizzes and flashcards
    return true
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
      {/* Header & Search */}
      <div className='space-y-4'>
        <div>
          <h2>Quiz & Flashcard của môn học</h2>
          <p className='text-muted-foreground'>Quản lý và theo dõi quiz, flashcard đã tạo cho môn học này</p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm quiz, flashcard...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9'
            />
          </div>

          {/* Filters */}
          <div className='flex gap-2'>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Tất cả chương' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả chương</SelectItem>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter._id} value={chapter._id}>
                    {chapter.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Target className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Tổng Quiz</p>
                <p className='text-xl font-semibold'>{Array.isArray(quizzes) ? quizzes.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <BookOpen className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Tổng Flashcard</p>
                <p className='text-xl font-semibold'>{Array.isArray(flashcards) ? flashcards.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='quizzes'>Quiz</TabsTrigger>
          <TabsTrigger value='flashcards'>Flashcard</TabsTrigger>
        </TabsList>

        {/* Quiz Tab */}
        <TabsContent value='quizzes' className='space-y-4'>
          {filteredQuizzes.length === 0 ? (
            <Card>
              <CardContent style={{ padding: '32px' }} className="text-center">
                <Target className='h-12 w-12 mx-auto mb-4 text-muted-foreground/50' />
                <h3 className='text-lg font-medium mb-2'>Chưa có quiz nào</h3>
                <p className='text-muted-foreground mb-4'>
                  {searchTerm ? 'Không tìm thấy quiz phù hợp' : 'Bắt đầu tạo quiz đầu tiên cho môn học này'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4'>
              {filteredQuizzes.map((quiz) => (
                <Card key={quiz._id} className='hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 space-y-3'>
                        {/* Header */}
                        <div className='flex items-start gap-3'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h3 className='font-medium'>{quiz.title}</h3>
                              {quiz.difficulty && (
                                <Badge variant='outline' className={getDifficultyColor(quiz.difficulty)}>
                                  {quiz.difficulty === 'easy' ? 'Dễ' : quiz.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                </Badge>
                              )}
                            </div>
                            <p className='text-sm text-muted-foreground'>{quiz.description}</p>
                          </div>
                        </div>

                        {/* Chapters */}
                        {quiz.chapters && quiz.chapters.length > 0 && (
                          <div className='flex flex-wrap gap-1'>
                            {quiz.chapters.map((chapter: any, index: number) => (
                              <Badge key={index} variant='secondary' className='text-xs'>
                                {chapter.title || `Chương ${index + 1}`}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                          <div className='flex items-center gap-1'>
                            <FileText className='h-4 w-4 text-muted-foreground' />
                            <span>{quiz.questions?.length || 0} câu hỏi</span>
                          </div>
                          {quiz.durationMinutes && (
                            <div className='flex items-center gap-1'>
                              <Clock className='h-4 w-4 text-muted-foreground' />
                              <span>{quiz.durationMinutes} phút</span>
                            </div>
                          )}
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4 text-muted-foreground' />
                            <span>{new Date(quiz.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex flex-col gap-2 ml-4'>
                        <Button variant='outline' size='sm' onClick={() => handleViewContent(quiz)}>
                          <Eye className='h-4 w-4 mr-1' />
                          Xem nội dung
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleViewResults(quiz)}>
                          <FileText className='h-4 w-4 mr-1' />
                          Xem kết quả
                        </Button>
                        <div className='flex gap-1'>
                          {canEdit(quiz) && (
                            <Button variant='ghost' size='sm' onClick={() => handleEdit(quiz)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                          )}
                          {canDelete(quiz) && (
                            <Button variant='ghost' size='sm' onClick={() => handleDeleteClick(quiz)}>
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          )}
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
        <TabsContent value='flashcards' className='space-y-4'>
          {filteredFlashcards.length === 0 ? (
            <Card>
              <CardContent style={{ padding: '32px' }} className="p-8 text-center">
                <BookOpen className='h-12 w-12 mx-auto mb-4 text-muted-foreground/50' />
                <h3 className='text-lg font-medium mb-2'>Chưa có bộ flashcard nào</h3>
                <p className='text-muted-foreground mb-4'>
                  {searchTerm ? 'Không tìm thấy bộ flashcard phù hợp' : 'Bắt đầu tạo bộ flashcard đầu tiên cho môn học này'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4'>
              {filteredFlashcards.map((flashcardSet) => (
                <Card key={flashcardSet._id} className='hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 space-y-3'>
                        {/* Header */}
                        <div className='flex items-start gap-3'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h3 className='font-medium'>{flashcardSet.title}</h3>
                              {flashcardSet.difficulty && (
                                <Badge variant='outline' className={getDifficultyColor(flashcardSet.difficulty)}>
                                  {flashcardSet.difficulty === 'easy' ? 'Dễ' : flashcardSet.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                </Badge>
                              )}
                            </div>
                            <p className='text-sm text-muted-foreground'>{flashcardSet.description}</p>
                          </div>
                        </div>

                        {/* Chapters */}
                        {flashcardSet.chapters && flashcardSet.chapters.length > 0 && (
                          <div className='flex flex-wrap gap-1'>
                            {flashcardSet.chapters.map((chapter: any, index: number) => (
                              <Badge key={index} variant='secondary' className='text-xs'>
                                {chapter.title || `Chương ${index + 1}`}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                          <div className='flex items-center gap-1'>
                            <BookOpen className='h-4 w-4 text-muted-foreground' />
                            <span>{flashcardSet.totalCards || flashcardSet.flashcards?.length || 0} flashcards</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Target className='h-4 w-4 text-muted-foreground' />
                            <span>Bộ flashcard</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4 text-muted-foreground' />
                            <span>{new Date(flashcardSet.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex flex-col gap-2 ml-4'>
                        <Button variant='outline' size='sm' onClick={() => handleViewContent(flashcardSet)}>
                          <Eye className='h-4 w-4 mr-1' />
                          Xem nội dung
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleViewResults(flashcardSet)}>
                          <FileText className='h-4 w-4 mr-1' />
                          Xem chi tiết
                        </Button>
                        <div className='flex gap-1'>
                          {canEdit(flashcardSet) && (
                            <Button variant='ghost' size='sm' onClick={() => handleEdit(flashcardSet)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                          )}
                          {canDelete(flashcardSet) && (
                            <Button variant='ghost' size='sm' onClick={() => handleDeleteClick(flashcardSet)}>
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          )}
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

      {/* Edit Quiz Form - Modal */}
      {editingQuiz && (
        <Dialog open={!!editingQuiz} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Quiz</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin và câu hỏi quiz
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Tiêu đề quiz</Label>
                <Input
                  placeholder="Nhập tiêu đề quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  placeholder="Nhập mô tả quiz"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Thời gian làm bài (phút)</Label>
                <Input
                  type="number"
                  placeholder="Nhập thời gian làm bài"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Chọn chương học</Label>
                <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 max-h-40 overflow-y-auto">
                  {chapters.map((chapter) => (
                    <div key={chapter._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-chapter-${chapter._id}`}
                        checked={selectedChapters.includes(chapter._id)}
                        onCheckedChange={(checked: any) => handleChapterSelect(chapter._id, !!checked, false)}
                      />
                      <Label htmlFor={`edit-chapter-${chapter._id}`}>{chapter.title}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Câu hỏi</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm câu hỏi
                  </Button>
                </div>

                {questions.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Câu {index + 1}</Label>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Textarea
                        placeholder="Nhập câu hỏi"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      />

                      <div className="space-y-2">
                        <Label>Đáp án</Label>
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex items-center space-x-2">
                            <Checkbox
                              checked={question.correctAnswer === answerIndex}
                              onCheckedChange={() => updateQuestion(question.id, 'correctAnswer', answerIndex)}
                            />
                            <Input
                              placeholder={`Đáp án ${answerIndex + 1}`}
                              value={answer}
                              onChange={(e) => {
                                const newAnswers = [...question.answers]
                                newAnswers[answerIndex] = e.target.value
                                updateQuestion(question.id, 'answers', newAnswers)
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit}>
                Hủy
              </Button>
              <Button onClick={handleUpdateQuiz} disabled={updating}>
                {updating ? 'Đang cập nhật...' : 'Cập nhật Quiz'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Flashcard Form - Modal */}
      {editingFlashcard && (
        <Dialog open={!!editingFlashcard} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Bộ Flashcard</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin và thẻ flashcard
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Tiêu đề bộ flashcard</Label>
                <Input
                  placeholder="Nhập tiêu đề bộ flashcard"
                  value={flashcardTitle}
                  onChange={(e) => setFlashcardTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  placeholder="Nhập mô tả bộ flashcard"
                  value={flashcardDescription}
                  onChange={(e) => setFlashcardDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Chọn chương học</Label>
                <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 max-h-40 overflow-y-auto">
                  {chapters.map((chapter) => (
                    <div key={chapter._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-flashcard-chapter-${chapter._id}`}
                        checked={selectedFlashcardChapters.includes(chapter._id)}
                        onCheckedChange={(checked: any) => handleChapterSelect(chapter._id, !!checked, true)}
                      />
                      <Label htmlFor={`edit-flashcard-chapter-${chapter._id}`}>{chapter.title}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Thẻ Flashcard</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFlashcard}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thẻ
                  </Button>
                </div>

                {flashcardList.map((flashcard, index) => (
                  <Card key={flashcard.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Thẻ {index + 1}</Label>
                        {flashcardList.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFlashcard(flashcard.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Mặt trước</Label>
                          <Textarea
                            placeholder="Nhập nội dung mặt trước"
                            value={flashcard.front}
                            onChange={(e) => updateFlashcard(flashcard.id, 'front', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mặt sau</Label>
                          <Textarea
                            placeholder="Nhập nội dung mặt sau"
                            value={flashcard.back}
                            onChange={(e) => updateFlashcard(flashcard.id, 'back', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit}>
                Hủy
              </Button>
              <Button onClick={handleUpdateFlashcard} disabled={updating}>
                {updating ? 'Đang cập nhật...' : 'Cập nhật Bộ Flashcard'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa {selectedTab === 'quizzes' ? 'quiz' : 'bộ flashcard'}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn xóa {selectedTab === 'quizzes' ? 'quiz' : 'bộ flashcard'} này?</p>
              {itemToDelete && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{itemToDelete.title || 'Không có tên'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTab === 'quizzes'
                      ? `${itemToDelete.questions?.length || 0} câu hỏi`
                      : `${itemToDelete.flashcards?.length || 0} thẻ flashcard`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {itemToDelete.chapters?.map((ch: any) => ch.title).join(', ') || 'Không có chương'}
                  </p>
                </div>
              )}
              <p className="text-destructive font-medium">Hành động này không thể hoàn tác!</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
