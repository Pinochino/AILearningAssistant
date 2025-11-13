import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Plus,
  FileText,
  Users,
  BookOpen,
  MessageSquare,
  Download,
  Upload,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle,
  Clock,
  Search,
  Paperclip,
  BookPlus,
  Target,
  Loader2,
  Eye,
  Play
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { TeacherQuizFlashcard } from './TeacherQuizFlashcard'
import { teacherApi, type Class } from '../../services/api'

const mockSubjects = [
  {
    id: '1',
    name: 'Toán học 12A1',
    description: 'Chương trình Toán học lớp 12A1 - Học kỳ 1',
    studentCount: 35,
    progress: 78
  },
  {
    id: '2',
    name: 'Toán học 12A2',
    description: 'Chương trình Toán học lớp 12A2 - Học kỳ 1',
    studentCount: 33,
    progress: 82
  },
  {
    id: '3',
    name: 'Vật lý 11B1',
    description: 'Chương trình Vật lý lớp 11B1 - Học kỳ 1',
    studentCount: 38,
    progress: 65
  }
]

const mockChapters = [
  {
    id: '1',
    title: 'Chương 1: Hàm số và đồ thị',
    order: 1,
    documents: 5,
    quizzes: 3,
    flashcards: 15,
    completion: 85
  },
  {
    id: '2',
    title: 'Chương 2: Đạo hàm',
    order: 2,
    documents: 4,
    quizzes: 2,
    flashcards: 12,
    completion: 70
  },
  {
    id: '3',
    title: 'Chương 3: Ứng dụng đạo hàm',
    order: 3,
    documents: 3,
    quizzes: 1,
    flashcards: 8,
    completion: 45
  }
]

const mockStudents = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'student1@example.com',
    studentId: 'SV001',
    progress: 85,
    quizScore: 92,
    lastActive: '2024-09-18',
    status: 'active'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'student2@example.com',
    studentId: 'SV002',
    progress: 78,
    quizScore: 88,
    lastActive: '2024-09-17',
    status: 'active'
  },
  {
    id: '3',
    name: 'Lê Minh C',
    email: 'student3@example.com',
    studentId: 'SV003',
    progress: 65,
    quizScore: 75,
    lastActive: '2024-09-15',
    status: 'inactive'
  }
]

const mockAvailableStudents = [
  {
    id: '7',
    name: 'Trần Văn G',
    email: 'student7@example.com',
    studentId: 'SV007',
    class: '12A3'
  },
  {
    id: '8',
    name: 'Lê Thị H',
    email: 'student8@example.com',
    studentId: 'SV008',
    class: '12A4'
  },
  {
    id: '9',
    name: 'Phạm Văn I',
    email: 'student9@example.com',
    studentId: 'SV009',
    class: '12A5'
  }
]

const mockDocuments = [
  {
    id: '1',
    title: 'Bài giảng: Hàm số bậc nhất',
    type: 'pdf',
    size: '2.5 MB',
    chapterId: '1',
    chapterName: 'Chương 1: Hàm số và đồ thị',
    uploadDate: '2024-09-15',
    downloads: 32
  },
  {
    id: '2',
    title: 'Video: Cách vẽ đồ thị hàm số',
    type: 'video',
    size: '15.2 MB',
    chapterId: '1',
    chapterName: 'Chương 1: Hàm số và đồ thị',
    uploadDate: '2024-09-14',
    downloads: 28
  },
  {
    id: '3',
    title: 'Bài tập: Đạo hàm cơ bản',
    type: 'pdf',
    size: '1.8 MB',
    chapterId: '2',
    chapterName: 'Chương 2: Đạo hàm',
    uploadDate: '2024-09-13',
    downloads: 45
  },
  {
    id: '4',
    title: 'Slide: Ứng dụng đạo hàm trong thực tế',
    type: 'pptx',
    size: '5.2 MB',
    chapterId: '3',
    chapterName: 'Chương 3: Ứng dụng đạo hàm',
    uploadDate: '2024-09-12',
    downloads: 23
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

export function SubjectDetail() {
  const [currentSubjectId, setCurrentSubjectId] = useState('1')
  const [subjects, setSubjects] = useState(mockSubjects)
  const [loading, setLoading] = useState(true)
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [quizDuration, setQuizDuration] = useState('')
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false)
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
  const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] = useState(false)
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isPendingStudentsOpen, setIsPendingStudentsOpen] = useState(false)
  const [quizMode, setQuizMode] = useState<'manual' | 'ai'>('manual')
  const [flashcardMode, setFlashcardMode] = useState<'manual' | 'ai'>('manual')
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [aiFile, setAiFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null) // Lưu trữ tệp tin tải lên
  const [description, setDescription] = useState<string>('') // Lưu trữ mô tả tài liệu
  const [chapterId, setChapterId] = useState<string>('') // Lưu trữ chapterId
  const [chapterTitle, setChapterTitle] = useState<string>('') // Lưu title của chapter
  const [title, setTitle] = useState<string>('') // Lưu trữ tiêu đề tài liệu
  const [chapterDocuments, setChapterDocuments] = useState<any[]>([]) // Lưu tài liệu của chương

  // Hàm tạo chương mới
  const handleCreateChapter = async () => {
    // Bắt đầu thông báo loading
    const toastId = toast.loading('Đang tạo chương...', {
      duration: 0 // Duration set to 0 to keep the loading toast until it's done
    })

    try {
      console.log('Sending request to create chapter...')

      // Gửi yêu cầu tạo chương mới
      const response = await axios.post(
        'http://localhost:9000/api/chapters',
        {
          title,
          classId: currentSubjectId
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      )

      // Xử lý thành công
      console.log('Chapter created:', response.data)
      toast.success('Tạo chương thành công!', { id: toastId })

      setIsCreateChapterOpen(false) // Đóng dialog sau khi tạo thành công
      // Có thể cần cập nhật lại danh sách chương trong FE
    } catch (error: any) {
      console.error('Error creating chapter:', error)

      // Xử lý lỗi
      toast.error(`Lỗi: ${error.message}`, { id: toastId })
    }
  }

  // Hàm gọi API để lấy các chương
  const fetchChapters = async () => {
    setLoading(true)
    try {
      console.log(`Requesting API: http://localhost:9000/api/chapters/class/${currentSubjectId}`)

      const response = await axios.get(`http://localhost:9000/api/chapters/class/${currentSubjectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      console.log(response)

      // Kiểm tra nếu response có dữ liệu, chỉ lúc này mới cập nhật chapters và reset lỗi
      if (response.data && response.data.data) {
        setChapters(response.data.data) // Lưu danh sách chương vào state
        setError(null) // Reset lỗi khi có dữ liệu thành công
      } else {
        setError('Không có chương nào được tìm thấy')
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setError('Lỗi khi tải dữ liệu chương') // Thiết lập lỗi khi có lỗi xảy ra
      setLoading(false)
    }
  }

  // Gọi API khi component mount
  useEffect(() => {
    fetchChapters()
  }, [currentSubjectId])

  // Quiz form states
  const [quizTitle, setQuizTitle] = useState('')
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: '1',
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: 0
    }
  ])

  // Flashcard form states
  const [flashcardTitle, setFlashcardTitle] = useState('')
  const [selectedFlashcardChapters, setSelectedFlashcardChapters] = useState<string[]>([])
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([{ id: '1', front: '', back: '' }])

  // Get current user ID
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        // Use username instead of ObjectId for better compatibility
        return user.name || user.username || user.id || user._id
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
        if (!userId) {
          setLoading(false)
          return
        }

        const response = await teacherApi.getClasses(userId)
        const classes = response.data.items

        // Map classes to mockSubjects format
        if (classes.length > 0) {
          const mappedSubjects = classes.map((cls: Class) => ({
            id: cls._id,
            name: cls.name,
            description: `Môn: ${cls.subject}${cls.grade ? ` - ${cls.grade}` : ''}`,
            studentCount: cls.studentIds?.length || 0,
            progress: 0
          }))
          setSubjects(mappedSubjects)
          setCurrentSubjectId(mappedSubjects[0].id)
        }
      } catch (err) {
        console.error('Failed to load classes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  const currentSubject = subjects.find((s) => s.id === currentSubjectId) || subjects[0]
  const currentSubjectIndex = subjects.findIndex((s) => s.id === currentSubjectId)

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

  // Load pending enrollments for current class
  const loadPendingEnrollments = async (classId: string) => {
    try {
      setLoadingEnrollments(true)
      const response = await fetch(`http://localhost:9000/api/classes/${classId}/pending-enrollments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setPendingEnrollments(data.data)
      }
    } catch (error) {
      console.error('Failed to load pending enrollments:', error)
    } finally {
      setLoadingEnrollments(false)
    }
  }

  // Approve enrollment
  const handleApproveEnrollment = async (enrollmentId: string) => {
    const toastId = toast.loading('Đang xử lý...')
    try {
      const response = await fetch(`http://localhost:9000/api/enrollments/${enrollmentId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Đã duyệt sinh viên thành công!', { id: toastId })
        // Reload pending enrollments
        loadPendingEnrollments(currentSubjectId)
      } else {
        toast.error(`Lỗi: ${data.message}`, { id: toastId })
      }
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`, { id: toastId })
    }
  }

  // Reject enrollment
  const handleRejectEnrollment = async (enrollmentId: string) => {
    toast('Bạn có chắc muốn từ chối sinh viên này?', {
      action: {
        label: 'Xác nhận',
        onClick: async () => {
          const toastId = toast.loading('Đang xử lý...')
          try {
            const response = await fetch(`http://localhost:9000/api/enrollments/${enrollmentId}/reject`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason: 'Không đủ điều kiện' })
            })
            const data = await response.json()
            if (data.success) {
              toast.success('Đã từ chối sinh viên!', { id: toastId })
              // Reload pending enrollments
              loadPendingEnrollments(currentSubjectId)
            } else {
              toast.error(`Lỗi: ${data.message}`, { id: toastId })
            }
          } catch (error: any) {
            toast.error(`Lỗi: ${error.message}`, { id: toastId })
          }
        }
      },
      cancel: {
        label: 'Hủy',
        onClick: () => {}
      },
      duration: 10000
    })
  }

  // Load pending enrollments when dialog opens or class changes
  const handleOpenPendingStudents = () => {
    setIsPendingStudentsOpen(true)
    loadPendingEnrollments(currentSubjectId)
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
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast.error('Lỗi khi tải tài liệu')
      }
    }
  }

  // Lấy tất cả các tài liệu thuộc chương tương ứng
  const getDocumentsForChapter = (chapterId: string) => {
    return mockDocuments.filter((doc) => doc.chapterId === chapterId)
  }

  // Tải tài liệu lên
  const handleUploadMaterial = async () => {
    // Kiểm tra các trường bắt buộc
    if (!file || !title || !chapterId || !currentSubjectId) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description || '')
    formData.append('classId', currentSubjectId) // Đảm bảo rằng classId là currentSubjectId
    formData.append('chapterId', chapterId) // Đảm bảo rằng chapterId được truyền đúng
    formData.append('file', file) // Tệp tin tài liệu

    try {
      // Gửi yêu cầu POST lên BE để tải tài liệu
      const response = await axios.post(
        'http://localhost:9000/api/materials', // Đảm bảo đường dẫn đúng
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      )

      console.log('File uploaded successfully:', response.data)
      setIsUploadDocOpen(false) // Đóng dialog sau khi tải lên thành công
      toast.success('Tài liệu đã được tải lên thành công!')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Lỗi khi tải lên tài liệu')
    }
  }

  const handleOpenDialog = (chapter: any) => {
    setChapterId(chapter._id) // Lưu chapterId
    setChapterTitle(chapter.title) // Lưu chapter title
    setIsUploadDocOpen(true) // Mở dialog
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

  const addFlashcard = () => {
    const newFlashcard: FlashcardItem = {
      id: Date.now().toString(),
      front: '',
      back: ''
    }
    setFlashcards([...flashcards, newFlashcard])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      console.log('Selected file:', e.target.files[0]) // In ra tệp tin đã chọn
    }
  }

  const removeFile = () => {
    setAiFile(null)
    // reset input value (optional, nếu muốn cho phép upload cùng file lần nữa)
    const inp = document.getElementById('file-upload') as HTMLInputElement | null
    if (inp) inp.value = ''
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

  const resetFlashcardForm = () => {
    setFlashcardTitle('')
    setSelectedFlashcardChapters([])
    setFlashcards([{ id: '1', front: '', back: '' }])
    setFlashcardMode('manual')
  }

  const handleAddStudent = (studentId: string) => {
    // Logic to add student to subject
    console.log('Adding student:', studentId)
    setIsAddStudentOpen(false)
  }

  const filteredAvailableStudents = mockAvailableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  )

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'docx':
        return <FileText className='h-4 w-4 text-blue-500' />
      case 'doc':
        return <FileText className='h-4 w-4 text-blue-500' />
      case 'pdf':
        return <FileText className='h-4 w-4 text-red-500' />
      case 'video':
        return <Play className='h-4 w-4 text-blue-500' />
      case 'image':
        return <FileText className='h-4 w-4 text-green-500' />
      case 'powerpoint':
        return <FileText className='h-4 w-4 text-orange-500' />
      default:
        return <FileText className='h-4 w-4 text-gray-500' />
    }
  }

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'docx':
        return 'DOCX'
      case 'doc':
        return 'DOC'
      case 'pdf':
        return 'PDF'
      case 'video':
        return 'Video'
      case 'image':
        return 'Hình ảnh'
      case 'powerpoint':
        return 'PowerPoint'
      default:
        return type.toUpperCase()
    }
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
          <span className='text-sm text-muted-foreground'>
            {currentSubjectIndex + 1} / {subjects.length}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className='flex items-center gap-2 border rounded-md px-3 py-2 text-sm'
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
        <p className='text-muted-foreground'>{currentSubject.description}</p>
      </div>
      <div className='flex items-center justify-center'>
        <div className='flex gap-2'>
          {/* Pending Students Button */}
          <Dialog open={isPendingStudentsOpen} onOpenChange={setIsPendingStudentsOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' className='gap-2' onClick={handleOpenPendingStudents}>
                <Clock className='h-4 w-4' />
                Duyệt sinh viên ({pendingEnrollments.length})
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-4xl'>
              <DialogHeader>
                <DialogTitle>Duyệt đăng ký tham gia lớp học</DialogTitle>
                <DialogDescription>Xem xét và phê duyệt các yêu cầu tham gia lớp học</DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                {loadingEnrollments ? (
                  <div className='text-center py-8'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto' />
                  </div>
                ) : (
                  <>
                    {pendingEnrollments.map((enrollment: any) => {
                      const student = enrollment.studentId
                      return (
                        <div key={enrollment._id} className='p-4 border rounded-lg'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-10 w-10'>
                                <AvatarFallback>
                                  {(student?.username || student?.email || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className='space-y-1'>
                                <div className='flex items-center gap-2'>
                                  <h3 className='font-medium'>{student?.username || 'Unknown'}</h3>
                                </div>
                                <p className='text-sm text-muted-foreground'>{student?.email || 'No email'}</p>
                                <p className='text-sm text-muted-foreground'>
                                  Đăng ký: {new Date(enrollment.requestedAt).toLocaleDateString('vi-VN')}
                                </p>
                                {enrollment.message && (
                                  <p className='text-sm mt-2 p-2 bg-muted/50 rounded'>"{enrollment.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                onClick={(e: { stopPropagation: () => void }) => {
                                  e.stopPropagation()
                                  handleApproveEnrollment(enrollment._id)
                                }}
                                className='gap-1'
                              >
                                <CheckCircle className='h-4 w-4' />
                                Duyệt
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={(e: { stopPropagation: () => void }) => {
                                  e.stopPropagation()
                                  handleRejectEnrollment(enrollment._id)
                                }}
                              >
                                Từ chối
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {pendingEnrollments.length === 0 && (
                      <div className='text-center py-8 text-muted-foreground'>
                        <Clock className='h-12 w-12 mx-auto mb-4 opacity-50' />
                        <p>Không có yêu cầu đăng ký nào đang chờ duyệt</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Tạo chương */}
          <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <BookPlus className='h-4 w-4' />
                Tạo Chương
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo Chương mới</DialogTitle>
                <DialogDescription>Thêm chương học cho môn học</DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Tên chương</Label>
                  <Input placeholder='Nhập tên chương' value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                {/* Ẩn trường Class ID */}
                <div className='hidden'>
                  <Label>Class ID</Label>
                  <Input
                    placeholder='Nhập Class ID' // Trường này vẫn còn, nhưng ẩn đi
                    value={currentSubjectId}
                    onChange={() => {}} // Không cần thay đổi giá trị của nó
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setIsCreateChapterOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateChapter}>Tạo Chương</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Global Quiz Button */}
          <Dialog
            open={isCreateQuizOpen}
            onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
              setIsCreateQuizOpen(open)
              if (!open) resetQuizForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' />
                Tạo Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Tạo Quiz mới</DialogTitle>
                <DialogDescription>Tạo quiz từ nhiều chương học</DialogDescription>
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
                  <div className='grid grid-cols-1 gap-2 border rounded-lg p-3'>
                    {mockChapters.map((chapter) => (
                      <div key={chapter.id} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`chapter-${chapter.id}`}
                          checked={selectedChapters.includes(chapter.id)}
                          onCheckedChange={(checked: boolean) => handleChapterSelect(chapter.id, checked as boolean)}
                        />
                        <Label htmlFor={`chapter-${chapter.id}`}>{chapter.title}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label>Thời gian (phút)</Label>
                  <Input
                    type='number'
                    placeholder='30'
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
                    <div className='space-y-2'>
                      <Label>Số câu hỏi</Label>
                      <Input type='number' placeholder='Nhập số lượng câu hỏi' />
                    </div>
                    {/* UI prompt + paperclip */}
                    <div className='space-y-2'>
                      <label className='block text-sm font-medium text-gray-700'>Prompt cho AI</label>

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

                          {/* icon paperclip nằm BÊN TRONG khung (absolute, phía phải) */}
                          {/* label sẽ trigger input[type=file] */}
                          <label
                            htmlFor='file-upload'
                            className='absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/80 p-1 text-gray-500 shadow-sm hover:text-blue-600 hover:scale-105 transition cursor-pointer'
                            title='Đính kèm tài liệu'
                          >
                            <Paperclip className='h-5 w-5' />
                          </label>

                          {/* hidden file input */}
                          <input
                            id='file-upload'
                            type='file'
                            className='hidden'
                            onChange={handleFileChange}
                            aria-label='Upload document'
                          />
                        </div>
                      </div>

                      {/* file đã chọn (tách hẳn, không dính sát icon) */}
                      {aiFile && (
                        <div className='mt-2 flex items-center gap-3'>
                          <div className='inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm'>
                            <span>📄</span>
                            <span className='max-w-[40ch] truncate font-medium text-gray-700'>{aiFile.name}</span>
                          </div>

                          <div className='ml-auto flex items-center gap-2 text-sm'>
                            <span className='text-gray-500 text-xs'>{(aiFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type='button'
                              onClick={removeFile}
                              className='inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50'
                            >
                              <X className='h-4 w-4' />
                              Xóa
                            </button>
                          </div>
                        </div>
                      )}
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
                              <CardTitle className='text-base'>Câu hỏi {qIndex + 1}</CardTitle>
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
                              <Label>Các đáp án</Label>
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
                  <Button onClick={() => setIsCreateQuizOpen(false)}>Tạo Quiz</Button>
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
                <DialogDescription>Tạo bộ flashcard từ nhiều chương học</DialogDescription>
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
                  <div className='grid grid-cols-1 gap-2 border rounded p-3'>
                    {mockChapters.map((chapter) => (
                      <div key={chapter.id} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`flashcard-chapter-${chapter.id}`}
                          checked={selectedFlashcardChapters.includes(chapter.id)}
                          onCheckedChange={(checked: boolean) =>
                            handleFlashcardChapterSelect(chapter.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`flashcard-chapter-${chapter.id}`}>{chapter.title}</Label>
                      </div>
                    ))}
                  </div>
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
                      <Label>Số cards</Label>
                      <Input type='number' placeholder='Nhập số lượng cards' />
                    </div>
                    {/* UI prompt + paperclip */}
                    <div className='space-y-2'>
                      <label className='block text-sm font-medium text-gray-700'>Prompt cho AI</label>

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

                          {/* icon paperclip nằm BÊN TRONG khung (absolute, phía phải) */}
                          {/* label sẽ trigger input[type=file] */}
                          <label
                            htmlFor='file-upload'
                            className='absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white/80 p-1 text-gray-500 shadow-sm hover:text-blue-600 hover:scale-105 transition cursor-pointer'
                            title='Đính kèm tài liệu'
                          >
                            <Paperclip className='h-5 w-5' />
                          </label>

                          {/* hidden file input */}
                          <input
                            id='file-upload'
                            type='file'
                            className='hidden'
                            onChange={handleFileChange}
                            aria-label='Upload document'
                          />
                        </div>
                      </div>

                      {/* file đã chọn (tách hẳn, không dính sát icon) */}
                      {aiFile && (
                        <div className='mt-2 flex items-center gap-3'>
                          <div className='inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm'>
                            <span>📄</span>
                            <span className='max-w-[40ch] truncate font-medium text-gray-700'>{aiFile.name}</span>
                          </div>

                          <div className='ml-auto flex items-center gap-2 text-sm'>
                            <span className='text-gray-500 text-xs'>{(aiFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type='button'
                              onClick={removeFile}
                              className='inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50'
                            >
                              <X className='h-4 w-4' />
                              Xóa
                            </button>
                          </div>
                        </div>
                      )}
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
                              <CardTitle className='text-base'>Flashcard {fIndex + 1}</CardTitle>
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
                  <Button onClick={() => setIsCreateFlashcardOpen(false)}>Tạo Flashcard</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-primary' />
              <div>
                <p className='text-sm text-muted-foreground'>Học sinh</p>
                <p className='text-xl font-semibold'>{currentSubject.studentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Chương</p>
                <p className='text-xl font-semibold'>{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Tài liệu</p>
                <p className='text-xl font-semibold'>lấy sau</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Target className='h-5 w-5 text-purple-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Quiz & Flashcard</p>
                <p className='text-xl font-semibold'>lấy sau</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='chapters' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='chapters'>Chương học</TabsTrigger>
          <TabsTrigger value='students'>Học sinh</TabsTrigger>
          <TabsTrigger value='documents'>Tài liệu</TabsTrigger>
          <TabsTrigger value='quiz-flashcard'>Quiz & Flashcard</TabsTrigger>
          <TabsTrigger value='analytics'>Thống kê</TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value='chapters' className='space-y-4'>
          {chapters.map((chapter) => (
            <Card key={chapter._id}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{chapter.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='flex gap-2'>
                <div className='flex gap-2'>
                  {/* Nút Thêm tài liệu */}
                  <Dialog open={isUploadDocOpen} onOpenChange={setIsUploadDocOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='gap-2'
                        onClick={() => handleOpenDialog(chapter)} // Truyền chapter vào
                      >
                        <Upload className='h-4 w-4' />
                        Thêm tài liệu
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm tài liệu mới</DialogTitle>
                        <DialogDescription>Đăng tải tài liệu cho {chapterTitle}</DialogDescription>{' '}
                        {/* Sử dụng chapterTitle */}
                      </DialogHeader>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label>Tiêu đề tài liệu</Label>
                          <Input
                            placeholder='Nhập tiêu đề tài liệu'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Tài liệu</Label>
                          <Input type='file' onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                        </div>

                        {/* Ẩn trường Chapter ID */}
                        <div className='hidden'>
                          <Label>Chapter ID</Label>
                          <Input
                            placeholder='Nhập ID chương' // Trường này vẫn còn, nhưng ẩn đi
                            value={chapterId}
                            onChange={() => {}} // Không cần thay đổi giá trị của nó
                          />
                        </div>

                        <div className='flex justify-end gap-2'>
                          <Button variant='outline' onClick={() => setIsUploadDocOpen(false)}>
                            Hủy
                          </Button>
                          <Button onClick={handleUploadMaterial}>Đăng tải</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className='flex gap-2'>
                  {/* Nút Xem tài liệu */}
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-2'
                    onClick={() => handleToggleDocuments(chapter._id)} // Dùng chapter._id để mở tài liệu
                  >
                    <FileText className='h-4 w-4' />
                    Xem tài liệu ({chapter.documents.length})
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
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button size='sm' variant='outline'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='outline'>
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
          ))}
        </TabsContent>

        {/* Quiz & Flashcard Tab */}
        <TabsContent value='quiz-flashcard'>
          <TeacherQuizFlashcard subjectId={currentSubjectId} />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value='students' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Danh sách học sinh ({mockStudents.length})</CardTitle>
              <CardDescription>Theo dõi tiến độ học tập của từng học sinh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockStudents.map((student) => (
                  <div key={student.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center gap-4'>
                      <Avatar>
                        <AvatarFallback>
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-medium'>{student.name}</h3>
                          <Badge variant={student.status === 'active' ? 'secondary' : 'outline'}>
                            {student.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>{student.email}</p>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>Hoạt động cuối: {new Date(student.lastActive).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value='documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Tài liệu học tập</CardTitle>
                  <CardDescription>Quản lý tài liệu cho môn học</CardDescription>
                </div>
                <Button className='gap-2'>
                  <Upload className='h-4 w-4' />
                  Đăng tải tài liệu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center gap-4'>
                      <div className='p-2 bg-primary/10 rounded'>
                        <FileText className='h-5 w-5 text-primary' />
                      </div>
                      <div className='space-y-1'>
                        <h3 className='font-medium'>{doc.title}</h3>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='text-xs'>
                            {doc.chapterName}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>Kích thước: {doc.size}</span>
                          <span>•</span>
                          <span>Ngày đăng tải: {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle>Thống kê học tập</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span>Điểm trung bình quiz</span>
                    <span className='font-medium'>85.2</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tỷ lệ hoàn thành tài liệu</span>
                    <span className='font-medium'>78%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Học sinh hoạt động</span>
                    <span className='font-medium'>32/35</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xu hướng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span>Tăng trưởng điểm số</span>
                    <span className='font-medium text-green-600'>+5.2%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tham gia quiz</span>
                    <span className='font-medium text-green-600'>+12%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Thời gian học trung bình</span>
                    <span className='font-medium'>2.5h/ngày</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
