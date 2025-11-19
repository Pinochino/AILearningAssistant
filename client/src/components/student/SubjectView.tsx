import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Play,
  FileText,
  Clock,
  Target,
  BookOpen,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  BookOpen as BookOpenIcon,
  Headphones,
  Upload,
  Plus,
  X
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { StudentQuizFlashcard } from './StudentQuizFlashcard'
import { useNavigation } from '../../hooks/useNavigation'
import { enrollmentApi, classApi, type Class } from '../../services/api'
import axios from 'axios'
import { toast } from 'sonner'

const mockSubjects = [
  {
    id: '1',
    name: 'Toán học',
    description: 'Chương trình Toán học lớp 12 - Học kỳ 1',
    teacher: 'GV. Nguyễn Văn Giáo',
    progress: 78,
    totalLessons: 45,
    completedLessons: 35,
    upcomingDeadline: '2024-09-25'
  },
  {
    id: '2',
    name: 'Vật lý',
    description: 'Chương trình Vật lý lớp 12 - Học kỳ 1',
    teacher: 'GV. Lê Văn Phúc',
    progress: 65,
    totalLessons: 38,
    completedLessons: 25,
    upcomingDeadline: '2024-09-28'
  },
  {
    id: '3',
    name: 'Hóa học',
    description: 'Chương trình Hóa học lớp 12 - Học kỳ 1',
    teacher: 'GV. Trần Thị Hóa',
    progress: 82,
    totalLessons: 42,
    completedLessons: 34,
    upcomingDeadline: '2024-09-30'
  }
]

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

export function SubjectView() {
  const { navigateTo, currentParams } = useNavigation()
  const [hasClasses, setHasClasses] = useState(false)
  const [selectedTab, setSelectedTab] = useState('chapters')

  // Real data states
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [quizzesLoading, setQuizzesLoading] = useState(false)
  const [flashcardsLoading, setFlashcardsLoading] = useState(false)

  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [quizDuration, setQuizDuration] = useState('')
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false)
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
  const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] = useState(false)
  const [quizMode, setQuizMode] = useState<'manual' | 'ai'>('manual')
  const [flashcardMode, setFlashcardMode] = useState<'manual' | 'ai'>('manual')
  const [flashcardLoading, setFlashcardLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [chapters, setChapters] = useState<any[]>([])
  const [chapterDocuments, setChapterDocuments] = useState<any[]>([]) // Lưu tài liệu của chương
  const [chLoading, setChLoading] = useState(false)
  const [chError, setChError] = useState<string | null>(null)
  const [aiQuestionCount, setAiQuestionCount] = useState('10')
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [subjects, setSubjects] = useState(mockSubjects)

  // Flashcard state variables
  const [flashcardTitle, setFlashcardTitle] = useState('')
  const [selectedFlashcardChapters, setSelectedFlashcardChapters] = useState<string[]>([])
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([{ id: '1', front: '', back: '' }])
  const [aiFlashcardCount, setAiFlashcardCount] = useState('10')
  const [flashcardList, setFlashcardList] = useState<any[]>([])

  // Quiz state variables
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [quizTitle, setQuizTitle] = useState('')
  const [questions, setQuestions] = useState<
    { id: string; question: string; answers: string[]; correctAnswer: number }[]
  >([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  // Get current user ID
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        return user.id || user._id
      } catch (e) {
        return null
      }
    }
    return null
  }

  // Load real classes from API
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const userId = getCurrentUserId()
        console.log('👤 Current User ID:', userId)

        if (!userId) {
          console.warn('⚠️ No user ID found in localStorage')
          setLoading(false)
          return
        }

        console.log('🔄 Fetching all classes for student:', userId)

        // Get all classes where student is a member (from studentIds array)
        const allClassesResponse = await classApi.getAll({})
        const allClasses = allClassesResponse.data?.items || []

        // Filter classes where student is in studentIds array
        const memberClasses = allClasses.filter((cls: any) => {
          return Array.isArray(cls.studentIds) && cls.studentIds.some((id: any) => id?._id === userId || id === userId)
        })

        console.log('📚 All member classes:', memberClasses)
        console.log('📊 Total member classes count:', memberClasses.length)

        // Get approved enrollments for reference
        const enrollmentsResponse = await enrollmentApi.getStudentEnrollments(userId, 'approved')
        const approvedEnrollments = enrollmentsResponse.data || []
        // Create a map of classId to enrollment status
        const enrollmentMap = new Map()
        approvedEnrollments.forEach((enrollment: any) => {
          const classId = typeof enrollment.classId === 'object' ? enrollment.classId._id : enrollment.classId
          enrollmentMap.set(classId, 'approved')
        })

        // Map classes with their enrollment status
        const classes = memberClasses.map((cls: any) => ({
          ...cls,
          enrollmentStatus: enrollmentMap.has(cls._id) ? 'approved' : 'direct_add'
        })) as Array<Class & { enrollmentStatus: string }>
        console.log('📖 Loaded classes:', classes)

        // Map classes to subjects format
        if (classes.length > 0) {
          const mappedSubjects = classes.map((cls, index) => ({
            id: cls._id,
            name: cls.name,
            description: `Môn: ${cls.subject}${cls.grade ? ` - ${cls.grade}` : ''} (${getStatusText(cls.enrollmentStatus)})`,
            teacher: 'Giáo viên',
            progress: 0,
            totalLessons: 0,
            completedLessons: 0,
            upcomingDeadline: new Date().toISOString().split('T')[0],
            status: cls.enrollmentStatus
          }))
          setSubjects(mappedSubjects)
          if (!currentSubjectId) {
            setCurrentSubjectId(mappedSubjects[0].id)
          }
          setHasClasses(true)
          console.log('✅ Subjects set:', mappedSubjects)
        } else {
          console.log('⚠️ No classes found')
          setSubjects([])
          setHasClasses(false)
        }
      } catch (err) {
        console.error('❌ Failed to load classes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  // Handle tab parameter from navigation
  useEffect(() => {
    if (currentParams?.tab) {
      if (currentParams.tab === 'quiz' || currentParams.tab === 'flashcard') {
        setSelectedTab('student-content')
      }
    }
  }, [currentParams])

  // Fetch real data when currentSubjectId changes
  useEffect(() => {
    if (currentSubjectId && hasClasses) {
      fetchChapters()
      fetchQuizzes()
      fetchFlashcards()
      fetchMaterials()
    }
  }, [currentSubjectId, hasClasses])

  const currentSubject = currentSubjectId
    ? subjects.find((s) => s.id === currentSubjectId) || subjects[0] || { id: '', name: 'Loading...', description: '' }
    : subjects[0] || { id: '', name: 'Loading...', description: '' }
  const currentSubjectIndex = currentSubjectId ? subjects.findIndex((s) => s.id === currentSubjectId) : 0

  const handleSubjectChange = (subjectId: string) => {
    setCurrentSubjectId(subjectId)
  }

  const handlePrevSubject = () => {
    const prevIndex = currentSubjectIndex > 0 ? currentSubjectIndex - 1 : subjects.length - 1
    setCurrentSubjectId(subjects[prevIndex].id)
  }

  const handleNextSubject = () => {
    const nextIndex = currentSubjectIndex < subjects.length - 1 ? currentSubjectIndex + 1 : 0
    setCurrentSubjectId(subjects[nextIndex].id)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className='h-4 w-4 text-red-500' />
      case 'video':
        return <Play className='h-4 w-4 text-blue-500' />
      case 'image':
        return <FileText className='h-4 w-4 text-green-500' />
      case 'powerpoint':
        return <FileText className='h-4 w-4 text-orange-500' />
      case 'audio':
        return <Headphones className='h-4 w-4 text-black-500' />
      default:
        return <FileText className='h-4 w-4 text-gray-500' />
    }
  }

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF'
      case 'video':
        return 'Video'
      case 'image':
        return 'Hình ảnh'
      case 'powerpoint':
        return 'PowerPoint'
      case 'audio':
        return 'Âm thanh'
      default:
        return type.toUpperCase()
    }
  }

  // Đóng mở phần xem tài liệu
  const handleToggleDocuments = async (chapterId: string) => {
    // Nếu chương đã mở, chúng ta sẽ đóng lại
    if (expandedChapter === chapterId) {
      setExpandedChapter(null)
    } else {
      // Nếu chưa mở, gửi yêu cầu API để lấy tài liệu cho chapterId và classId
      try {
        const response = await axios.get(
          `http://localhost:9000/api/materials/class/${currentSubjectId}/chapter/${chapterId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo có token
            }
          }
        )

        // Cập nhật dữ liệu tài liệu cho chương
        setChapterDocuments(response.data.data)

        // Mở tài liệu của chương này
        setExpandedChapter(chapterId)
        fetchMaterials()
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast.error('Lỗi khi tải tài liệu')
      }
    }
  }

  // Fetch functions for real data
  const fetchChapters = async () => {
    if (!currentSubjectId) return

    console.log('📚 Fetching chapters for classId:', currentSubjectId)
    setChaptersLoading(true)
    try {
      const response = await axios.get(`http://localhost:9000/api/chapters/class/${currentSubjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      console.log('📖 Chapters response:', response.data)

      if (response.data?.data) {
        setChapters(response.data.data)
        setChError(null)
      } else {
        setChapters([])
        setChError('Không có chương nào được tìm thấy')
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setChapters([])
      setChError('Không thể tải chương học. Vui lòng thử lại sau.')
    } finally {
      setChaptersLoading(false)
    }
  }

  useEffect(() => {
    if (currentSubjectId) {
      fetchChapters()
      fetchQuizzes()
      fetchFlashcards()
      fetchMaterials()
    }
  }, [currentSubjectId])

  const fetchFlashcards = async () => {
    if (!currentSubjectId) return

    setFlashcardsLoading(true)
    try {
      const response = await axios.get(`http://localhost:9000/api/flashcard-sets/class/${currentSubjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      setFlashcards(response.data?.data?.items || [])
    } catch (error: any) {
      if (error.response?.status === 404) {
        setFlashcards([])
      } else {
        console.error('Error fetching flashcards:', error)
        setFlashcards([])
      }
    } finally {
      setFlashcardsLoading(false)
    }
  }

  const fetchMaterials = async (chapterId?: string) => {
    if (!currentSubjectId) return

    setMaterialsLoading(true)
    try {
      let url = `http://localhost:9000/api/materials/class/${currentSubjectId}`
      if (chapterId) {
        url += `/chapter/${chapterId}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      setMaterials(response.data?.data?.items || [])
    } catch (error: any) {
      if (error.response?.status === 404) {
        setMaterials([])
      } else {
        console.error('Error fetching materials:', error)
        setMaterials([])
      }
    } finally {
      setMaterialsLoading(false)
    }
  }

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

  const handleChapterSelect = (chapterId: string, checked: boolean) => {
    if (checked) {
      setSelectedChapters([...selectedChapters, chapterId])
    } else {
      setSelectedChapters(selectedChapters.filter((id) => id !== chapterId))
    }
  }

  // Handler functions for material operations
  const handleDownloadMaterial = async (material: any) => {
    try {
      if (material.fileUrl) {
        // Create a temporary link to download the file
        const link = document.createElement('a')
        link.href = material.fileUrl
        link.download = material.fileName || material.title
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Tải xuống tài liệu thành công')
      } else {
        toast.error('Không tìm thấy file để tải xuống')
      }
    } catch (error) {
      toast.error('Lỗi khi tải xuống tài liệu')
    }
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
        q.id === questionId
          ? {
            ...q,
            answers: q.answers.map((ans, idx) => (idx === answerIndex ? value : ans))
          }
          : q
      )
    )
  }

  const resetQuizForm = () => {
    setQuizTitle('')
    setSelectedChapters([])
    setQuestions([
      {
        id: '1',
        question: '',
        answers: ['', '', '', ''],
        correctAnswer: 0
      }
    ])
    setQuizMode('manual')
  }

  // Add new flashcard set to state for real-time updates
  const addFlashcardSet = (newSet: any) => {
    setFlashcardList((prev) => [newSet, ...prev])
  }

  const resetFlashcardForm = () => {
    setFlashcardTitle('')
    setSelectedFlashcardChapters([])
    setFlashcards([{ id: '1', front: '', back: '' }])
    setFlashcardMode('manual')
    setAiFlashcardCount('10')
  }

  const createFlashcardManual = async () => {
    setFlashcardLoading(true)

    try {
      if (!flashcardTitle.trim()) {
        toast.error('Tiêu đề flashcard không được để trống!')
        return
      }

      if (selectedFlashcardChapters.length === 0) {
        toast.error('Bạn phải chọn ít nhất 1 chương!')
        return
      }

      if (flashcards.length === 0) {
        toast.error('Bạn phải tạo ít nhất 1 flashcard!')
        return
      }

      for (const f of flashcards) {
        if (!f.front.trim() || !f.back.trim()) {
          toast.error('Tất cả các mặt của flashcard phải có nội dung!')
          return
        }
      }

      const payload = {
        title: flashcardTitle,
        classId: currentSubjectId,
        chapters: selectedFlashcardChapters,
        isAIGenerated: false,
        flashcards: flashcards.map((f) => ({
          front: f.front.trim(),
          back: f.back.trim(),
          isAIGenerated: false
        }))
      }

      const res = await axios.post('http://localhost:9000/api/flashcard-sets', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })

      toast.success('Tạo flashcard thủ công thành công!')
      setIsCreateFlashcardOpen(false)
      resetFlashcardForm()

      // Add new flashcard set to state immediately for real-time update
      if (res.data?.data) {
        addFlashcardSet(res.data.data)
      }

      fetchFlashcards()
    } catch (err: any) {
      console.error('Create Flashcard Error:', err)
      toast.error(err?.response?.data?.message || 'Lỗi khi tạo flashcard')
    } finally {
      setFlashcardLoading(false)
    }
  }

  const createAIFlashcard = async () => {
    setFlashcardLoading(true)

    try {
      const chapterIds = selectedFlashcardChapters

      if (!flashcardTitle.trim()) {
        toast.error('Tiêu đề flashcard không được để trống!')
        return
      }

      if (chapterIds.length === 0) {
        toast.error('Bạn phải chọn ít nhất 1 chương!')
        return
      }

      const materialIds = await getMaterialsBySelectedChapters(chapterIds)
      if (materialIds.length === 0) {
        toast.error('Các chương này chưa có tài liệu. Không thể tạo flashcard AI.')
        return
      }

      const payload = {
        title: flashcardTitle,
        classId: currentSubjectId,
        chapterIds,
        materialIds,
        count: Number(aiFlashcardCount),
        prompt: aiPrompt
      }

      const res = await axios.post('http://localhost:9000/api/ai/generate-flashcards', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })

      toast.success('Tạo flashcard bằng AI thành công!')
      setIsCreateFlashcardOpen(false)
      resetFlashcardForm()

      // Add new flashcard set to state immediately for real-time update
      if (res.data?.data?.flashcardSet) {
        addFlashcardSet(res.data.data.flashcardSet)
      }

      fetchFlashcards()
    } catch (err: any) {
      console.error('AI Flashcard Error:', err)
      toast.error(err?.response?.data?.message || 'Lỗi khi tạo flashcard bằng AI')
    } finally {
      setFlashcardLoading(false)
    }
  }

  const handleFlashcardChapterSelect = (chapterId: string, checked: boolean) => {
    if (checked) {
      setSelectedFlashcardChapters([...selectedFlashcardChapters, chapterId])
    } else {
      setSelectedFlashcardChapters(selectedFlashcardChapters.filter((id) => id !== chapterId))
    }
  }

  const removeFlashcard = (flashcardId: string) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter((f) => f.id !== flashcardId))
    }
  }

  const updateFlashcard = (flashcardId: string, field: keyof FlashcardItem, value: string) => {
    setFlashcards(flashcards.map((f) => (f.id === flashcardId ? { ...f, [field]: value } : f)))
  }

  const addFlashcard = () => {
    const newFlashcard: FlashcardItem = {
      id: Date.now().toString(),
      front: '',
      back: ''
    }
    setFlashcards([...flashcards, newFlashcard])
  }

  const handleCreateFlashcard = () => {
    if (flashcardMode === 'ai') {
      createAIFlashcard()
    } else {
      createFlashcardManual()
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

  // No need for status text since we only show approved classes now
  const getStatusText = (status?: string) => {
    return status === 'approved' ? 'Đã được duyệt' : 'Đã tham gia'
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!hasClasses || subjects.length === 0) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='p-12'>
            <div className='text-center'>
              <BookOpen className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
              <h2 className='text-2xl font-bold mb-2'>Chưa có lớp học nào</h2>
              <p className='text-muted-foreground mb-6'>
                Bạn chưa được duyệt tham gia lớp học nào hoặc chưa đăng ký lớp học nào.
              </p>
              <div className='space-x-4'>
                <Button onClick={() => navigateTo('subject-search')}>
                  <BookOpen className='h-4 w-4 mr-2' />
                  Tìm kiếm lớp học
                </Button>
                <Button variant='outline' onClick={() => window.location.reload()}>
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Tải lại trang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Subject Navigation */}
      <div className='flex items-center justify-between bg-muted/30 p-4 rounded-lg'>
        <Button variant='ghost' size='sm' onClick={handlePrevSubject} className='gap-2'>
          <ChevronLeft className='h-4 w-4' />
          Môn trước
        </Button>

        <div className='flex items-center gap-4'>
          <span className='text-sm text-muted-foreground font-semibold'>
            {currentSubjectIndex + 1} / {subjects.length}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className='flex items-center gap-2 border rounded-md px-3 py-2 text-sm font-semibold'
                style={{ background: 'white' }}
              >
                <BookOpen className='h-4 w-4' />
                {currentSubject.name}
                <ChevronDown className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>

            {/* 💡 Thêm z-index để tránh bị che */}
            <DropdownMenuContent className='w-64 z-[9999] space-y-1 rounded-xl'>
              {subjects.map((subject) => (
                <DropdownMenuItem
                  key={subject.id}
                  onClick={() => handleSubjectChange(subject.id)}
                  className={currentSubject.id === subject.id ? 'bg-accent' : ''}
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>{subject.name}</span>
                    <span className='text-xs text-muted-foreground'>{subject.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant='ghost' size='sm' onClick={handleNextSubject} className='gap-2'>
          Môn sau
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1>{currentSubject.name}</h1>
        <p className='text-muted-foreground'>{currentSubject.name}</p>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='chapters'>Chương học</TabsTrigger>
          <TabsTrigger value='student-content'>Quiz & Flashcard</TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value='chapters' className='space-y-4' style={{ paddingTop: '32px' }}>
          {chapters.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium'>Chưa có chương học nào trong lớp</h3>
              <p className='text-sm text-muted-foreground mt-1'>Chương học sẽ xuất hiện ở đây sau khi giáo viên tạo</p>
            </div>
          ) : (
            chapters.map((chapter) => (
              <Card key={chapter._id}>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-lg font-semibold'>{chapter.title}</CardTitle>
                      <CardDescription className='text-sm pt-2'>
                        {chapter.documents?.length || 0} tài liệu
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='flex gap-2'>
                    <div className='flex gap-2'>
                      {/* Nút Xem tài liệu */}
                      <Button
                        variant='outline'
                        size='sm'
                        className='gap-2'
                        onClick={() => handleToggleDocuments(chapter._id)} // Dùng chapter._id để mở tài liệu
                      >
                        <FileText className='h-4 w-4' />
                        Xem tài liệu ({chapter.documents?.length || 0})
                      </Button>
                    </div>
                  </div>

                  {/* Mở rộng tài liệu khi expandedChapter trùng với chapter._id */}
                  {expandedChapter === chapter._id && (
                    <div className='mt-4 p-4 bg-muted/30 rounded-lg'>
                      <h4 className='font-medium mb-3 flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        Tài liệu chương
                      </h4>

                      {chapterDocuments.length > 0 ? (
                        <div className='space-y-2'>
                          {chapterDocuments.map((doc) => (
                            <div
                              key={doc._id}
                              className='flex items-center justify-between p-3 bg-background rounded-lg border'
                            >
                              <div className='flex items-center gap-3'>
                                {getFileIcon(doc.type)}
                                <div>
                                  <h5 className='font-medium text-sm'>{doc.title}</h5>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                    <span>{getFileTypeLabel(doc.type)}</span>
                                    <span>•</span>
                                    <span>{(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span>{doc.createdAt.slice(0, 10)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Button size='sm' variant='outline' onClick={() => handleDownloadMaterial(doc)}>
                                  <Download className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-sm text-muted-foreground text-center py-4'>
                          Chưa có tài liệu nào cho chương này
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Student Content Tab */}
        <TabsContent value='student-content' className='space-y-4'>
          <StudentQuizFlashcard
            quizzesData={quizzes}
            flashcardsData={flashcards}
            quizzesLoading={quizzesLoading}
            flashcardsLoading={flashcardsLoading}
            chapters={chapters}
            chaptersLoading={chaptersLoading}
            currentSubjectId={currentSubjectId}
            initialTab={currentParams?.tab || 'quiz'}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
