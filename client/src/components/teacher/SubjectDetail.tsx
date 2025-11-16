import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
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
  BookText,
  Play,
  AlertTriangle,
  Headphones
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import TeacherQuizFlashcard from './TeacherQuizFlashcard'
import { teacherApi, enrollmentApi, classApi, type Class } from '../../services/api'
import { UsersService } from '../../services/users'
import axios from 'axios'
import Spinner from '../layout/spinner/Spinner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

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

  const [currentSubjectId, setCurrentSubjectId] = useState('1')
  const [materials, setMaterials] = useState<any[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
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
  const [flashcardLoading, setFlashcardLoading] = useState(false)
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
  const [chLoading, setChLoading] = useState(false)
  const [chError, setChError] = useState<string | null>(null)
  const [aiQuestionCount, setAiQuestionCount] = useState('10')
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [subjects, setSubjects] = useState(mockSubjects)

  // Flashcard state variables
  const [flashcardTitle, setFlashcardTitle] = useState('')
  const [flashcardList, setFlashcardList] = useState<any[]>([])
  const [selectedFlashcardChapters, setSelectedFlashcardChapters] = useState<string[]>([])
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([{ id: '1', front: '', back: '' }])
  const [aiFlashcardCount, setAiFlashcardCount] = useState('10')

  // Quiz state variables
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [quizTitle, setQuizTitle] = useState('')
  const [questions, setQuestions] = useState<
    { id: string; question: string; answers: string[]; correctAnswer: number }[]
  >([{ id: '1', question: '', answers: ['', '', '', ''], correctAnswer: 0 }])
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null)
  const [editMaterialTitle, setEditMaterialTitle] = useState('')
  const [isDeleteMaterialDialogOpen, setIsDeleteMaterialDialogOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<any | null>(null)

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
      fetchChapters() // Cập nhật tài liệu mới
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
      const response = await axios.get(`http://localhost:9000/api/chapters/class/${currentSubjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      if (response.data?.data) {
        setChapters(response.data.data)
        setError(null)
      } else {
        setError('Không có chương nào được tìm thấy')
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setError('Lỗi khi tải dữ liệu chương')
    } finally {
      setLoading(false)
    }
  }

  // lấy tài liệu theo chương đã chọn để tạo quiz flashcard bằng ai
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

  // lấy tất cả quiz theo lớp
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

  // Add new flashcard set to state for real-time updates
  const addFlashcardSet = (newSet: any) => {
    setFlashcardList((prev) => [newSet, ...prev])
  }

  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        // Return ID first, then fallback to username
        return user.id || user._id || user.username
      } catch (e) {
        return null
      }
    }
    return null
  }

  // Function to load enrolled students for a class
  const loadEnrolledStudents = async (classId: string) => {
    if (!classId) {
      console.log('No classId provided')
      setEnrolledStudents([])
      return
    }

    try {
      setLoadingStudents(true)
      console.log(`Fetching students for class ${classId}...`)
      setEnrolledStudents([])

      // First try to get the class with populated students
      console.log('Fetching class data with populated students for ID:', classId)
      const classResponse = await classApi.getById(classId, { populate: 'students' })

      if (!classResponse.success || !classResponse.data) {
        console.error('Class not found or error in response:', classResponse)
        toast.error('Không tìm thấy thông tin lớp học')
        return
      }

      const classData = classResponse.data
      console.log('Class data received:', classData)

      // Check if we have populated students in the response
      // The API might return students in different formats, so we need to check multiple possibilities
      const possibleStudentArrays = [
        classData.students,
        classData.studentIds, // Sometimes student objects might be directly in studentIds
        classData.enrollments?.map((e: any) => e.studentId), // Check enrollments if they exist
        classData.enrollments?.map((e: any) => e.student) // Check for populated student objects in enrollments
      ]

      for (const studentArray of possibleStudentArrays) {
        if (Array.isArray(studentArray) && studentArray.length > 0) {
          // Get the first element to check its structure
          const firstItem = studentArray[0]

          // If it's an object with _id, it's a student object
          if (firstItem && typeof firstItem === 'object' && (firstItem._id || firstItem.id)) {
            console.log('Found populated students in class data')
            const students = studentArray.map((student: any) => ({
              id: student._id || student.id || '',
              name: student.fullName || student.name || 'Không tên',
              username: student.username || '',
              studentId: student.studentId || 'N/A',
              quizScore: Math.floor(Math.random() * 30) + 70,
              lastActive: new Date().toISOString().split('T')[0],
              status: 'active'
            }))

            console.log(`Found ${students.length} students in class ${classId}`, students)
            setEnrolledStudents(students)
            return
          }
        }
      }

      // If we don't have populated students, try to get student IDs from studentIds
      let studentIds: string[] = []

      if (Array.isArray(classData.studentIds)) {
        studentIds = classData.studentIds
          .map((id: any) => (typeof id === 'object' ? id._id || id.id || '' : String(id)))
          .filter(Boolean)
      }

      console.log('Extracted student IDs:', studentIds)

      if (studentIds.length === 0) {
        console.log('No students found in class')
        setEnrolledStudents([])
        return
      }

      // If we have student IDs but no populated data, try to fetch them using UsersService
      try {
        console.log('Fetching students data...')
        const studentsResponse = await Promise.allSettled(studentIds.map((id: string) => UsersService.getById(id)))

        const students = studentsResponse
          .filter(
            (result): result is PromiseFulfilledResult<{ data: any }> =>
              result.status === 'fulfilled' && result.value !== null && result.value.data
          )
          .map((result) => {
            const userData = result.value.data
            return {
              id: userData._id || '',
              name: userData.fullName || userData.name || 'Không tên',
              username: userData.username || '',
              studentId: userData.studentId || 'N/A',
              quizScore: Math.floor(Math.random() * 30) + 70,
              lastActive: new Date().toISOString().split('T')[0],
              status: 'active'
            }
          })

        console.log(`Fetched ${students.length} students`, students)
        setEnrolledStudents(students)
        return
      } catch (error) {
        console.error('Error fetching students:', error)
      }

      // If we couldn't get the students, show an empty list
      console.log('No students found or error fetching students')
      setEnrolledStudents([])
      toast.error('Không thể tải danh sách học sinh. Vui lòng thử lại sau.')
    } catch (error: any) {
      console.error('Error in loadEnrolledStudents:', {
        message: error.message,
        response: error.response?.data,
        error: error
      })

      if (error.message.includes('404') || error.response?.status === 404) {
        console.error(`Class with ID ${classId} not found or no students enrolled`)
        // For 404, just set empty students (class might not have any students yet)
        setEnrolledStudents([])
      } else if (error.message.includes('400') || error.response?.status === 400) {
        console.error('Validation error for class ID:', classId)
        toast.error('Lỗi dữ liệu: ID lớp học không hợp lệ')
      } else {
        console.error('Unexpected error:', error)
        toast.error(`Lỗi: ${error.message || 'Không thể tải thông tin lớp học'}`)
      }

      setEnrolledStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Load real classes from API
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true)
        const teacherId = getCurrentUserId()
        console.log('Current teacher ID:', teacherId)

        if (!teacherId) {
          console.error('No teacher ID found')
          setLoading(false)
          return
        }

        const response = await teacherApi.getClasses(teacherId, {
          populate: 'students' // Make sure to populate students to get accurate count
        })
        console.log('Classes API response:', response)

        if (response.success && response.data?.items) {
          const mappedSubjects = response.data.items.map((cls: any) => {
            // Ensure we have an accurate student count
            const studentCount = Array.isArray(cls.students) ? cls.students.length : 0

            return {
              id: cls._id,
              name: cls.name,
              description: `Môn: ${cls.subject}${cls.grade ? ` - ${cls.grade}` : ''}`,
              studentCount: studentCount,
              ...cls
            }
          })

          console.log('Mapped subjects with student counts:', mappedSubjects)
          setSubjects(mappedSubjects)
          if (mappedSubjects.length > 0) {
            setCurrentSubjectId(mappedSubjects[0].id)
          }
        } else {
          console.error('Unexpected API response format:', response)
          // Fall back to mock subjects when API response is unexpected
          setSubjects(mockSubjects)
        }
      } catch (err) {
        console.error('Failed to load classes:', err)
        // Fall back to mock subjects when API fails
        setSubjects(mockSubjects)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  // Load enrolled students when current subject changes
  useEffect(() => {
    if (currentSubjectId) {
      loadEnrolledStudents(currentSubjectId)
      fetchChapters()
      fetchQuizzes()
      fetchFlashcards()
      fetchMaterials()
    }
  }, [currentSubjectId])

  const currentSubject = subjects.find((s) => s.id === currentSubjectId) ||
    subjects[0] || { id: '1', name: 'Loading...', description: '' }
  const currentSubjectIndex = subjects.findIndex((s) => s.id === currentSubjectId)

  const refreshStudentCount = async (classId: string) => {
    try {
      const response = await classApi.getById(classId, { populate: 'students' })
      if (response.success && response.data) {
        const studentCount = Array.isArray(response.data.students) ? response.data.students.length : 0

        setSubjects((prev) => prev.map((subj) => (subj.id === classId ? { ...subj, studentCount } : subj)))

        // Also update the enrolled students list
        if (currentSubjectId === classId) {
          const students = Array.isArray(response.data.students) ? response.data.students : []
          const formattedStudents = students.map((student: any) => ({
            id: student._id || student.id,
            name: student.fullName || student.name || 'Không tên',
            username: student.username,
            studentId: student.studentId || 'N/A',
            quizScore: Math.floor(Math.random() * 30) + 70,
            lastActive: new Date().toISOString().split('T')[0],
            status: 'active'
          }))
          setEnrolledStudents(formattedStudents)
        }
      }
    } catch (error) {
      console.error('Failed to refresh student count:', error)
    }
  }

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

  // Update the loadPendingEnrollments function
  const loadPendingEnrollments = async (classId: string) => {
    if (!classId) {
      console.log('No classId provided, skipping enrollment load')
      return
    }

    try {
      setLoadingEnrollments(true)
      console.log('Loading enrollments for class:', classId)

      // Check if we're using mock data (classId is '1', '2', or '3')
      if (['1', '2', '3'].includes(classId)) {
        // Use mock pending enrollments (empty for demo)
        setPendingEnrollments([])
        return
      }

      // First verify the teacher has access to this class
      const teacherId = getCurrentUserId()
      const teacherClasses = await teacherApi.getClasses(teacherId)

      const hasAccess = teacherClasses.data?.items?.some((cls: any) => cls._id === classId)

      if (!hasAccess) {
        console.error('Teacher does not have access to this class')
        return
      }

      // If they have access, fetch the enrollments
      const response = await classApi.getPendingEnrollments(classId)

      if (response.success) {
        console.log('Enrollments loaded:', response.data)
        setPendingEnrollments(response.data || [])
      } else {
        console.error('Failed to load enrollments:', response.message)
        toast.error('Không thể tải danh sách đăng ký chờ duyệt')
        setPendingEnrollments([])
      }
    } catch (error) {
      console.error('Failed to load pending enrollments:', error)
      toast.error('Có lỗi xảy ra khi tải danh sách đăng ký')
      setPendingEnrollments([])
    } finally {
      setLoadingEnrollments(false)
    }
  }

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

  // Update the handleApproveEnrollment function
  const handleApproveEnrollment = async (enrollmentId: string) => {
    const toastId = toast.loading('Đang xử lý...')
    try {
      const response = await classApi.approveEnrollment(enrollmentId)
      console.log('Approve enrollment response:', response)

      if (response.success) {
        toast.success('Đã duyệt sinh viên thành công!', { id: toastId })
        // Refresh the student count after approval
        if (currentSubjectId) {
          await refreshStudentCount(currentSubjectId)
          // Also refresh the pending enrollments list
          await loadPendingEnrollments(currentSubjectId)
        }
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi duyệt đăng ký')
      }
    } catch (error: any) {
      console.error('Approval error:', error)
      toast.error(`Lỗi: ${error.message || 'Không thể xử lý yêu cầu'}`, {
        id: toastId,
        description: 'Vui lòng thử lại sau hoặc liên hệ quản trị viên nếu lỗi vẫn tiếp diễn'
      })
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

  // Load pending enrollments when component mounts, class changes, or dialog opens
  useEffect(() => {
    // Load immediately
    if (currentSubjectId) {
      loadPendingEnrollments(currentSubjectId)
    }

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      if (currentSubjectId) {
        loadPendingEnrollments(currentSubjectId)
      }
    }, 30000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [currentSubjectId])

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
        fetchMaterials()
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast.error('Lỗi khi tải tài liệu')
      }
    }
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
      fetchChapters() // Cập nhật tài liệu mới
      fetchMaterials()
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

  // Fetch materials for the current subject
  const fetchMaterials = async () => {
    if (!currentSubjectId) return

    try {
      setMaterialsLoading(true)

      // Fetch from API
      const response = await axios.get(`http://localhost:9000/api/materials/class/${currentSubjectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      const materialsData = response.data?.data?.items || []
      setMaterials(Array.isArray(materialsData) ? materialsData : [])
    } catch (error) {
      console.error('Error fetching materials:', error)
      setMaterials([])
    } finally {
      setMaterialsLoading(false)
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

  const handleEditMaterial = (material: any) => {
    setEditingMaterial(material)
    setEditMaterialTitle(material.title || material.fileName || '')
  }

  const handleSaveEditMaterial = async () => {
    if (!editingMaterial || !editMaterialTitle.trim()) {
      toast.error('Tên tài liệu không được để trống')
      return
    }

    try {
      await axios.put(
        `http://localhost:9000/api/materials/${editingMaterial._id || editingMaterial.id}`,
        { title: editMaterialTitle.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      )

      toast.success('Cập nhật tài liệu thành công')
      setEditingMaterial(null)
      setEditMaterialTitle('')
      fetchMaterials() // Refresh the materials list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật tài liệu')
    }
  }

  const handleCancelEditMaterial = () => {
    setEditingMaterial(null)
    setEditMaterialTitle('')
  }

  const handleDeleteMaterial = (material: any) => {
    setMaterialToDelete(material)
    setIsDeleteMaterialDialogOpen(true)
  }

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return

    try {
      await axios.delete(`http://localhost:9000/api/materials/${materialToDelete._id || materialToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      toast.success('Xóa tài liệu thành công')
      setIsDeleteMaterialDialogOpen(false)
      setMaterialToDelete(null)
      fetchMaterials() // Refresh the materials list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa tài liệu')
    }
  }

  const cancelDeleteMaterial = () => {
    setIsDeleteMaterialDialogOpen(false)
    setMaterialToDelete(null)
  }

  const handleCreateFlashcard = () => {
    if (flashcardMode === 'ai') {
      createAIFlashcard()
    } else {
      createFlashcardManual()
    }
  }

  // Fetch flashcards for the current subject
  const fetchFlashcards = async () => {
    if (!currentSubjectId) return

    try {
      // Check if we're using mock data (classId is '1', '2', or '3')
      if (['1', '2', '3'].includes(currentSubjectId)) {
        // Use mock flashcards - create some mock data if needed
        const mockFlashcards: any[] = []
        setFlashcardList(mockFlashcards)
      } else {
        // Fetch from API
        const res = await axios.get(`http://localhost:9000/api/flashcard-sets/class/${currentSubjectId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        })

        // Set flashcards from API response
        setFlashcardList(res.data.data.items || [])
      }
    } catch (err: any) {
      // If it's a 404, just set empty flashcards (class might not have any flashcards yet)
      if (err.response?.status === 404) {
        setFlashcardList([])
      } else {
        console.error('Error loading flashcards:', err)
        // For other errors, fall back to mock data if using mock IDs
        if (['1', '2', '3'].includes(currentSubjectId)) {
          const mockFlashcards: any[] = []
          setFlashcardList(mockFlashcards)
        } else {
          toast.error('Lỗi khi tải flashcards')
        }
      }
    } finally {
      // No loading state for flashcards in this function
    }
  }

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
      case 'audio':
        return <Headphones className='h-4 w-4 text-blue-500' />
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
      case 'audio':
        return 'Âm thanh'
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
        <p className='text-muted-foreground'>{currentSubject.description}</p>
      </div>

      {/* Action Buttons Row */}
      <div className='flex items-center justify-center gap-2 flex-wrap'>
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
                                {(student?.name || student?.username || 'U').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className='space-y-1'>
                              <div className='flex items-center gap-2'>
                                <h3 className='font-medium'>{student?.name || student?.username || 'Unknown'}</h3>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                Tên đăng nhập: {student?.username || 'No username'}
                              </p>
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
              <DialogDescription className='pb-6'>Thêm chương học cho môn học</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Tên chương</Label>
                <Input placeholder='Nhập tên chương' value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className='space-y-4'>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setIsCreateChapterOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateChapter}>Tạo Chương</Button>
                </div>
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
                {chLoading && (
                  <div>
                    <Spinner />
                    <p className='text-sm text-muted-foreground'>Đang tải chương…</p>
                  </div>
                )}
                {chError && <p className='text-sm text-red-600'>{chError}</p>}

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
                  {!chLoading && !chError && chapters.length === 0 && (
                    <p className='text-sm text-muted-foreground'>Chưa có chương nào</p>
                  )}
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
                {chLoading && (
                  <div>
                    <Spinner />
                    <p className='text-sm text-muted-foreground'>Đang tải chương...</p>
                  </div>
                )}
                {chError && <p className='text-sm text-red-600'>{chError}</p>}
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
                {!chLoading && !chError && chapters.length === 0 && (
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
                <Button disabled={flashcardLoading} onClick={handleCreateFlashcard}>
                  {flashcardLoading && <Spinner />}
                  {flashcardLoading ? 'Đang tạo...' : 'Tạo Flashcard'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Overview Row */}
      <div className='grid grid-cols-3 md:grid-cols-3 gap-2'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-primary' />
              <div>
                <p className='text-sm text-muted-foreground'>Học sinh</p>
                <p className='text-xl font-semibold'>{enrolledStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <BookText className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Chương</p>
                <p className='text-xl font-semibold'>{chapters.length}</p>
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
                <p className='text-xl font-semibold'>
                  {(chapters ?? []).reduce((sum, c) => sum + (c.documents?.length ?? 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='chapters' className='space-y-4'>
        <div className='flex justify-center'>
          <TabsList>
            <TabsTrigger value='chapters'>Chương học</TabsTrigger>
            <TabsTrigger value='students'>Học sinh</TabsTrigger>
            <TabsTrigger value='documents'>Tài liệu</TabsTrigger>
            <TabsTrigger value='quiz-flashcard'>Quiz & Flashcard</TabsTrigger>
          </TabsList>
        </div>

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
                            <DialogDescription className='pb-6'>
                              Đăng tải tài liệu cho {chapterTitle}
                            </DialogDescription>{' '}
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
                                <Button variant='outline' size='sm' onClick={() => handleEditMaterial(doc)}>
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button size='sm' variant='outline' onClick={() => handleDownloadMaterial(doc)}>
                                  <Download className='h-4 w-4' />
                                </Button>
                                <Button variant='outline' size='sm' onClick={() => handleDeleteMaterial(doc)}>
                                  <Trash2 className='h-4 w-4 text-destructive' />
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

        {/* Quiz & Flashcard Tab */}
        <TabsContent value='quiz-flashcard'>
          <TeacherQuizFlashcard subjectId={currentSubjectId} addFlashcardSet={addFlashcardSet} />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value='students' className='space-y-4'>
          <Card className='flex-1 min-w-0'>
            <CardHeader>
              <CardTitle>Danh sách học sinh ({enrolledStudents.length})</CardTitle>
              <CardDescription>Theo dõi tiến độ học tập của từng học sinh</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className='flex flex-col items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
                  <p className='text-muted-foreground'>Đang tải danh sách học sinh...</p>
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <Users className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-medium'>Chưa có học sinh nào trong lớp</h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Học sinh sẽ xuất hiện ở đây sau khi đăng ký và được duyệt
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-4 flex-1'>
                        <Avatar>
                          <AvatarFallback>
                            {(student.name?.charAt(0) || student.username?.charAt(0) || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='space-y-1 flex-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>{student.name || student.username || 'Không tên'}</h3>
                            <Badge variant={student.status === 'active' ? 'secondary' : 'outline'}>
                              {student.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground'>{student.email}</p>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground flex-wrap'>
                            <span>Tên đăng nhập: {student.username}</span>
                            <span>•</span>
                            <span>Hoạt động cuối: {new Date(student.lastActive).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 ml-4'>
                        <Button variant='outline' size='sm'>
                          <MessageSquare className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {materialsLoading ? (
                  <div className='flex justify-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                  </div>
                ) : materials.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>Chưa có tài liệu nào cho môn học này</p>
                  </div>
                ) : (
                  materials.map((doc) => (
                    <div key={doc.id} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-4'>
                        <div className='p-2 bg-primary/10 rounded'>
                          <FileText className='h-5 w-5 text-primary' />
                        </div>
                        <div className='space-y-1'>
                          <h3 className='font-medium'>{doc.title}</h3>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs'>
                              {doc.chapter?.title || 'Không có chương'}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <span>Kích thước: {(doc.size / 1024 / 1024).toFixed(1)} MB</span>
                            <span>•</span>
                            <span>Ngày đăng tải: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleDownloadMaterial(doc)}>
                          <Download className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleEditMaterial(doc)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => handleDeleteMaterial(doc)}>
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Material Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={(open) => !open && handleCancelEditMaterial()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
            <DialogDescription className='pb-6'>Thay đổi tên tài liệu</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Input
                id='edit-title'
                value={editMaterialTitle}
                onChange={(e) => setEditMaterialTitle(e.target.value)}
                placeholder='Nhập tên tài liệu'
              />
            </div>
          </div>
          <DialogFooter className='pt-6'>
            <Button variant='outline' onClick={handleCancelEditMaterial}>
              Hủy
            </Button>
            <Button onClick={handleSaveEditMaterial}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Material Confirmation Dialog */}
      <Dialog open={isDeleteMaterialDialogOpen} onOpenChange={setIsDeleteMaterialDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-destructive' />
              Xác nhận xóa tài liệu
            </DialogTitle>
            <DialogDescription className='space-y-2'>
              <p>Bạn có chắc chắn muốn xóa tài liệu này?</p>
              {materialToDelete && (
                <div className='p-3 bg-muted rounded-lg'>
                  <p className='font-medium'>{materialToDelete.title || materialToDelete.fileName || 'Không có tên'}</p>
                  <p className='text-sm text-muted-foreground'>
                    {materialToDelete.chapter?.title || 'Không có chương'}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Kích thước: {(materialToDelete.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              )}
              <p className='text-sm text-destructive font-medium'>Hành động này không thể hoàn tác!</p>
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={cancelDeleteMaterial}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={confirmDeleteMaterial} className='gap-2'>
              <Trash2 className='h-4 w-4' />
              Xóa tài liệu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
