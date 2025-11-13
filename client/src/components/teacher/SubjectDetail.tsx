import { useState, useEffect } from "react";
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { TeacherQuizFlashcard } from "./TeacherQuizFlashcard";
import { teacherApi, enrollmentApi, classApi, type Class } from '../../services/api';
import { UsersService } from '../../services/users';

const mockSubjects = [
  {
    id: "1",
    name: "Toán học 12A1",
    description: "Chương trình Toán học lớp 12A1 - Học kỳ 1",
    studentCount: 35,
    progress: 78,
  },
  {
    id: "2",
    name: "Toán học 12A2",
    description: "Chương trình Toán học lớp 12A2 - Học kỳ 1",
    studentCount: 33,
    progress: 82,
  },
  {
    id: "3",
    name: "Vật lý 11B1",
    description: "Chương trình Vật lý lớp 11B1 - Học kỳ 1",
    studentCount: 38,
    progress: 65,
  },
];

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

const mockStudents = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "student1@example.com",
    studentId: "SV001",
    progress: 85,
    quizScore: 92,
    lastActive: "2024-09-18",
    status: "active",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "student2@example.com",
    studentId: "SV002",
    progress: 78,
    quizScore: 88,
    lastActive: "2024-09-17",
    status: "active",
  },
  {
    id: "3",
    name: "Lê Minh C",
    email: "student3@example.com",
    studentId: "SV003",
    progress: 65,
    quizScore: 75,
    lastActive: "2024-09-15",
    status: "inactive",
  },
];

const mockPendingStudents = [
  {
    id: "4",
    name: "Phạm Thị D",
    email: "student4@example.com",
    studentId: "SV004",
    requestDate: "2024-09-18",
    message:
      "Em muốn tham gia lớp học để nâng cao kiến thức toán học",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "student5@example.com",
    studentId: "SV005",
    requestDate: "2024-09-17",
    message:
      "Em đã học qua chương trình cơ bản và muốn học nâng cao",
  },
  {
    id: "6",
    name: "Nguyễn Thị F",
    email: "student6@example.com",
    studentId: "SV006",
    requestDate: "2024-09-16",
    message: "Em cần học lại để chuẩn bị cho kỳ thi cuối kỳ",
  },
];

const mockAvailableStudents = [
  {
    id: "7",
    name: "Trần Văn G",
    email: "student7@example.com",
    studentId: "SV007",
    class: "12A3",
  },
  {
    id: "8",
    name: "Lê Thị H",
    email: "student8@example.com",
    studentId: "SV008",
    class: "12A4",
  },
  {
    id: "9",
    name: "Phạm Văn I",
    email: "student9@example.com",
    studentId: "SV009",
    class: "12A5",
  },
];

const mockDocuments = [
  {
    id: "1",
    title: "Bài giảng: Hàm số bậc nhất",
    type: "pdf",
    size: "2.5 MB",
    chapterId: "1",
    chapterName: "Chương 1: Hàm số và đồ thị",
    uploadDate: "2024-09-15",
    downloads: 32,
  },
  {
    id: "2",
    title: "Video: Cách vẽ đồ thị hàm số",
    type: "video",
    size: "15.2 MB",
    chapterId: "1",
    chapterName: "Chương 1: Hàm số và đồ thị",
    uploadDate: "2024-09-14",
    downloads: 28,
  },
  {
    id: "3",
    title: "Bài tập: Đạo hàm cơ bản",
    type: "pdf",
    size: "1.8 MB",
    chapterId: "2",
    chapterName: "Chương 2: Đạo hàm",
    uploadDate: "2024-09-13",
    downloads: 45,
  },
  {
    id: "4",
    title: "Slide: Ứng dụng đạo hàm trong thực tế",
    type: "pptx",
    size: "5.2 MB",
    chapterId: "3",
    chapterName: "Chương 3: Ứng dụng đạo hàm",
    uploadDate: "2024-09-12",
    downloads: 23,
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

export function SubjectDetail() {
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState(mockSubjects);
  const [loading, setLoading] = useState(true);
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [quizDuration, setQuizDuration] = useState('');
  const [isCreateChapterOpen, setIsCreateChapterOpen] =
    useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] =
    useState(false);
  const [isCreateFlashcardOpen, setIsCreateFlashcardOpen] =
    useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] =
    useState(false);
  const [isPendingStudentsOpen, setIsPendingStudentsOpen] =
    useState(false);
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';
  // Flashcard form states
  const [flashcardTitle, setFlashcardTitle] = useState("");
  const [
    selectedFlashcardChapters,
    setSelectedFlashcardChapters,
  ] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(
    [{ id: "1", front: "", back: "" }],
  );

  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Prefer username over name as it's more likely to be unique
        return user.username || user.id || user._id;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  };

  // Function to load enrolled students for a class
  const loadEnrolledStudents = async (classId: string) => {
    if (!classId) {
      console.log('No classId provided');
      setEnrolledStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      console.log(`Fetching students for class ${classId}...`);
      setEnrolledStudents([]);

      // First try to get the class with populated students
      console.log('Fetching class data with populated students for ID:', classId);
      const classResponse = await classApi.getById(classId, { populate: 'students' });

      if (!classResponse.success || !classResponse.data) {
        console.error('Class not found or error in response:', classResponse);
        toast.error('Không tìm thấy thông tin lớp học');
        return;
      }

      const classData = classResponse.data;
      console.log('Class data received:', classData);

      // Check if we have populated students in the response
      // The API might return students in different formats, so we need to check multiple possibilities
      const possibleStudentArrays = [
        classData.students,
        classData.studentIds, // Sometimes student objects might be directly in studentIds
        classData.enrollments?.map((e: any) => e.studentId), // Check enrollments if they exist
        classData.enrollments?.map((e: any) => e.student) // Check for populated student objects in enrollments
      ];

      for (const studentArray of possibleStudentArrays) {
        if (Array.isArray(studentArray) && studentArray.length > 0) {
          // Get the first element to check its structure
          const firstItem = studentArray[0];

          // If it's an object with _id, it's a student object
          if (firstItem && typeof firstItem === 'object' && (firstItem._id || firstItem.id)) {
            console.log('Found populated students in class data');
            const students = studentArray.map((student: any) => ({
              id: student._id || student.id || '',
              name: student.fullName || student.name || 'Không tên',
              username: student.username || '',
              studentId: student.studentId || 'N/A',
              progress: Math.floor(Math.random() * 100),
              quizScore: Math.floor(Math.random() * 30) + 70,
              lastActive: new Date().toISOString().split('T')[0],
              status: 'active',
            }));

            console.log(`Found ${students.length} students in class ${classId}`, students);
            setEnrolledStudents(students);
            return;
          }
        }
      }

      // If we don't have populated students, try to get student IDs from studentIds
      let studentIds: string[] = [];

      if (Array.isArray(classData.studentIds)) {
        studentIds = classData.studentIds.map((id: any) =>
          typeof id === 'object' ? (id._id || id.id || '') : String(id)
        ).filter(Boolean);
      }

      console.log('Extracted student IDs:', studentIds);

      if (studentIds.length === 0) {
        console.log('No students found in class');
        setEnrolledStudents([]);
        return;
      }

      // If we have student IDs but no populated data, try to fetch them using UsersService
      try {
        console.log('Fetching students data...');
        const studentsResponse = await Promise.allSettled(
          studentIds.map((id: string) => UsersService.getById(id))
        );

        const students = studentsResponse
          .filter((result): result is PromiseFulfilledResult<{ data: any }> =>
            result.status === 'fulfilled' &&
            result.value !== null &&
            result.value.data
          )
          .map(result => {
            const userData = result.value.data;
            return {
              id: userData._id || '',
              name: userData.fullName || userData.name || 'Không tên',
              username: userData.username || '',
              studentId: userData.studentId || 'N/A',
              progress: Math.floor(Math.random() * 100),
              quizScore: Math.floor(Math.random() * 30) + 70,
              lastActive: new Date().toISOString().split('T')[0],
              status: 'active',
            };
          });

        console.log(`Fetched ${students.length} students`, students);
        setEnrolledStudents(students);
        return;
      } catch (error) {
        console.error('Error fetching students:', error);
      }

      // If we couldn't get the students, show an empty list
      console.log('No students found or error fetching students');
      setEnrolledStudents([]);
      toast.error('Không thể tải danh sách học sinh. Vui lòng thử lại sau.');

    } catch (error: any) {
      console.error('Error in loadEnrolledStudents:', {
        message: error.message,
        response: error.response?.data,
        error: error
      });

      if (error.message.includes('404') || error.response?.status === 404) {
        console.error(`Class with ID ${classId} not found`);
        toast.error(`Không tìm thấy lớp học với ID: ${classId}`);
      } else if (error.message.includes('400') || error.response?.status === 400) {
        console.error('Validation error for class ID:', classId);
        toast.error('Lỗi dữ liệu: ID lớp học không hợp lệ');
      } else {
        console.error('Unexpected error:', error);
        toast.error(`Lỗi: ${error.message || 'Không thể tải thông tin lớp học'}`);
      }

      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load real classes from API
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const teacherId = getCurrentUserId();
        console.log('Current teacher ID:', teacherId);

        if (!teacherId) {
          console.error('No teacher ID found');
          setLoading(false);
          return;
        }

        const response = await teacherApi.getClasses(teacherId, {
          populate: 'students' // Make sure to populate students to get accurate count
        });
        console.log('Classes API response:', response);

        if (response.success && response.data?.items) {
          const mappedSubjects = response.data.items.map((cls: any) => {
            // Ensure we have an accurate student count
            const studentCount = Array.isArray(cls.students) ? cls.students.length : 0;

            return {
              id: cls._id,
              name: cls.name,
              description: `Môn: ${cls.subject}${cls.grade ? ` - ${cls.grade}` : ''}`,
              studentCount: studentCount,
              progress: 0,
              // Make sure to include all other necessary fields
              ...cls
            };
          });

          console.log('Mapped subjects with student counts:', mappedSubjects);
          setSubjects(mappedSubjects);
          if (mappedSubjects.length > 0) {
            setCurrentSubjectId(mappedSubjects[0].id);
          }
        } else {
          console.error('Unexpected API response format:', response);
          setSubjects([]);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  // Load enrolled students when current subject changes
  useEffect(() => {
    if (currentSubjectId) {
      loadEnrolledStudents(currentSubjectId);
    }
  }, [currentSubjectId]);

  const currentSubject =
    subjects.find((s) => s.id === currentSubjectId) ||
    subjects[0];
  const currentSubjectIndex = subjects.findIndex(
    (s) => s.id === currentSubjectId,
  );

  const refreshStudentCount = async (classId: string) => {
    try {
      const response = await classApi.getById(classId, { populate: 'students' });
      if (response.success && response.data) {
        const studentCount = Array.isArray(response.data.students)
          ? response.data.students.length
          : 0;

        setSubjects(prev =>
          prev.map(subj =>
            subj.id === classId
              ? { ...subj, studentCount }
              : subj
          )
        );

        // Also update the enrolled students list
        if (currentSubjectId === classId) {
          const students = Array.isArray(response.data.students) ? response.data.students : [];
          const formattedStudents = students.map((student: any) => ({
            id: student._id || student.id,
            name: student.fullName || student.name || 'Không tên',
            username: student.username,
            studentId: student.studentId || 'N/A',
            progress: Math.floor(Math.random() * 100),
            quizScore: Math.floor(Math.random() * 30) + 70,
            lastActive: new Date().toISOString().split('T')[0],
            status: 'active'
          }));
          setEnrolledStudents(formattedStudents);
        }
      }
    } catch (error) {
      console.error('Failed to refresh student count:', error);
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setCurrentSubjectId(subjectId);
  };

  const handlePrevSubject = () => {
    const prevIndex =
      currentSubjectIndex > 0
        ? currentSubjectIndex - 1
        : subjects.length - 1;
    setCurrentSubjectId(subjects[prevIndex].id);
  };

  const handleNextSubject = () => {
    const nextIndex =
      currentSubjectIndex < subjects.length - 1
        ? currentSubjectIndex + 1
        : 0;
    setCurrentSubjectId(subjects[nextIndex].id);
  };

  // Update the loadPendingEnrollments function
  const loadPendingEnrollments = async (classId: string) => {
    if (!classId) {
      console.log('No classId provided, skipping enrollment load');
      return;
    }

    try {
      setLoadingEnrollments(true);
      console.log('Loading enrollments for class:', classId);

      // First verify the teacher has access to this class
      const teacherId = getCurrentUserId();
      const teacherClasses = await teacherApi.getClasses(teacherId);

      const hasAccess = teacherClasses.data?.items?.some(
        (cls: any) => cls._id === classId
      );

      if (!hasAccess) {
        console.error('Teacher does not have access to this class');
        return;
      }

      // If they have access, fetch the enrollments
      const response = await classApi.getPendingEnrollments(classId);

      if (response.success) {
        console.log('Enrollments loaded:', response.data);
        setPendingEnrollments(response.data || []);
      } else {
        console.error('Failed to load enrollments:', response.message);
        toast.error('Không thể tải danh sách đăng ký chờ duyệt');
        setPendingEnrollments([]);
      }
    } catch (error) {
      console.error('Failed to load pending enrollments:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách đăng ký');
      setPendingEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Update the loadClasses function
  const loadClasses = async () => {
    try {
      setLoading(true);
      const teacherId = getCurrentUserId();
      console.log('Current teacher ID:', teacherId);

      if (!teacherId) {
        console.error('No teacher ID found');
        setLoading(false);
        return;
      }

      // Use the teacherApi with proper error handling
      const response = await teacherApi.getClasses(teacherId);
      console.log('Classes API response:', response);

      if (response.success && response.data?.items) {
        const mappedSubjects = response.data.items.map((cls: any) => ({
          id: cls._id,
          name: cls.name,
          description: `Môn: ${cls.subject}${cls.grade ? ` - ${cls.grade}` : ''}`,
          studentCount: cls.students?.length || 0,
          progress: 0,
        }));

        console.log('Mapped subjects:', mappedSubjects);
        setSubjects(mappedSubjects);
        if (mappedSubjects.length > 0) {
          setCurrentSubjectId(mappedSubjects[0].id);
        }
      } else {
        console.error('Unexpected API response format:', response);
        setSubjects([]);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleApproveEnrollment function
  const handleApproveEnrollment = async (enrollmentId: string) => {
    const toastId = toast.loading('Đang xử lý...');
    try {
      const response = await classApi.approveEnrollment(enrollmentId);
      console.log('Approve enrollment response:', response);

      if (response.success) {
        toast.success('Đã duyệt sinh viên thành công!', { id: toastId });
        // Refresh the student count after approval
        if (currentSubjectId) {
          await refreshStudentCount(currentSubjectId);
          // Also refresh the pending enrollments list
          await loadPendingEnrollments(currentSubjectId);
        }
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi duyệt đăng ký');
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(`Lỗi: ${error.message || 'Không thể xử lý yêu cầu'}`, {
        id: toastId,
        description: 'Vui lòng thử lại sau hoặc liên hệ quản trị viên nếu lỗi vẫn tiếp diễn'
      });
    }
  };

  // Reject enrollment
  const handleRejectEnrollment = async (enrollmentId: string) => {
    toast('Bạn có chắc muốn từ chối sinh viên này?', {
      action: {
        label: 'Xác nhận',
        onClick: async () => {
          const toastId = toast.loading('Đang xử lý...');
          try {
            const response = await fetch(`http://localhost:9000/api/enrollments/${enrollmentId}/reject`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason: 'Không đủ điều kiện' })
            });
            const data = await response.json();
            if (data.success) {
              toast.success('Đã từ chối sinh viên!', { id: toastId });
              // Reload pending enrollments
              loadPendingEnrollments(currentSubjectId);
            } else {
              toast.error(`Lỗi: ${data.message}`, { id: toastId });
            }
          } catch (error: any) {
            toast.error(`Lỗi: ${error.message}`, { id: toastId });
          }
        },
      },
      cancel: {
        label: 'Hủy',
        onClick: () => { }
      },
      duration: 10000
    });
  };

  // Load pending enrollments when component mounts, class changes, or dialog opens
  useEffect(() => {
    // Load immediately
    if (currentSubjectId) {
      loadPendingEnrollments(currentSubjectId);
    }

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      if (currentSubjectId) {
        loadPendingEnrollments(currentSubjectId);
      }
    }, 30000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [currentSubjectId]);

  const handleOpenPendingStudents = () => {
    setIsPendingStudentsOpen(true);
    loadPendingEnrollments(currentSubjectId);
  };

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

  const handleAddStudent = (studentId: string) => {
    // Logic to add student to subject
    console.log("Adding student:", studentId);
    setIsAddStudentOpen(false);
  };


  const filteredAvailableStudents =
    mockAvailableStudents.filter(
      (student) =>
        student.name
          .toLowerCase()
          .includes(studentSearchTerm.toLowerCase()) ||
        student.studentId
          .toLowerCase()
          .includes(studentSearchTerm.toLowerCase()) ||
        student.email
          .toLowerCase()
          .includes(studentSearchTerm.toLowerCase()),
    );

  return (
    <div className="space-y-6">
      {/* Subject Navigation */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevSubject}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Môn trước
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {currentSubjectIndex + 1} / {subjects.length}
          </span>
          <Button
            variant="outline"
            className="gap-2 min-w-48 hover:bg-accent hover:text-accent-foreground"
          >
            <BookOpen className="h-4 w-4" />
            {currentSubject.name}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextSubject}
          className="gap-2"
        >
          Môn sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{currentSubject.name}</h1>
          <p className="text-muted-foreground">
            {currentSubject.description}
          </p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      <div className="flex items-center justify-between">

        {/* Add Student Button */}
        <Dialog
          open={isAddStudentOpen}
          onOpenChange={setIsAddStudentOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Thêm sinh viên
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Thêm sinh viên vào môn học
              </DialogTitle>
              <DialogDescription>
                Tìm kiếm và thêm sinh viên vào môn học này
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tìm kiếm sinh viên</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên hoặc username"
                    value={studentSearchTerm}
                    onChange={(e) =>
                      setStudentSearchTerm(e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredAvailableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.studentId} •{" "}
                          {student.username} • {student.class}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddStudent(student.id)
                      }
                    >
                      Thêm
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pending Students Button */}
        <Dialog
          open={isPendingStudentsOpen}
          onOpenChange={setIsPendingStudentsOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2" onClick={handleOpenPendingStudents}>
              <Clock className="h-4 w-4" />
              Duyệt sinh viên ({pendingEnrollments.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Duyệt đăng ký tham gia lớp học
              </DialogTitle>
              <DialogDescription>
                Xem xét và phê duyệt các yêu cầu tham gia lớp
                học
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {loadingEnrollments ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  {pendingEnrollments.map((enrollment: any) => {
                    const student = enrollment.studentId || {};
                    const studentName = student?.name || student?.fullName || student?.username || 'Không tên';
                    const username = student?.username || 'unknown';
                    const email = student?.email || '';

                    return (
                      <div
                        key={enrollment._id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar>
                              <AvatarFallback>
                                {studentName
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {studentName}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                @{username}
                                {email && ` • ${email}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Đăng ký: {new Date(enrollment.requestedAt).toLocaleDateString('vi-VN')}
                              </p>
                              {enrollment.message && (
                                <p className="text-xs mt-1 p-2 bg-muted/50 rounded">
                                  {enrollment.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveEnrollment(enrollment._id);
                              }}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectEnrollment(enrollment._id);
                              }}
                            >
                              Từ chối
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {pendingEnrollments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        Không có yêu cầu đăng ký nào đang chờ
                        duyệt
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isCreateChapterOpen}
          onOpenChange={setIsCreateChapterOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <BookPlus className="h-4 w-4" />
              Tạo Chương
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Chương mới</DialogTitle>
              <DialogDescription>
                Thêm chương học cho môn học
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên chương</Label>
                <Input placeholder="Nhập tên chương (VD: Chương 4: Tích phân)" />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setIsCreateChapterOpen(false)
                  }
                >
                  Hủy
                </Button>
                <Button
                  onClick={() =>
                    setIsCreateChapterOpen(false)
                  }
                >
                  Tạo Chương
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Global Quiz Button */}
        <Dialog
          open={isCreateQuizOpen}
          onOpenChange={(open) => {
            setIsCreateQuizOpen(open);
            if (!open) resetQuizForm();
          }}
        >
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
                  onChange={(e) =>
                    setQuizTitle(e.target.value)
                  }
                />
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

        {/* Global Flashcard Button */}
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
                Tạo bộ flashcard từ nhiều chương học
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Học sinh
                </p>
                <p className="text-xl font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    currentSubject?.studentCount || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Chương
                </p>
                <p className="text-xl font-semibold">
                  {mockChapters.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Tài liệu
                </p>
                <p className="text-xl font-semibold">
                  {mockDocuments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng số Quiz
                </p>
                <p className="text-xl font-semibold">
                  {mockDocuments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng số Flashcard
                </p>
                <p className="text-xl font-semibold">
                  {mockDocuments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chapters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chapters">Chương học</TabsTrigger>
          <TabsTrigger value="students">Học sinh</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          <TabsTrigger value="quiz-flashcard">
            <Target className="h-4 w-4 mr-1" />
            Quiz & Flashcard
          </TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value="chapters" className="space-y-4">
          {mockChapters.map((chapter) => (
            <Card key={chapter.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {chapter.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{chapter.documents} tài liệu</span>
                      <span>•</span>
                      <span>{chapter.quizzes} quiz</span>
                      <span>•</span>
                      <span>
                        {chapter.flashcards} flashcard
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {chapter.completion}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Dialog
                    open={isUploadDocOpen}
                    onOpenChange={setIsUploadDocOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Thêm tài liệu
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Thêm tài liệu mới
                        </DialogTitle>
                        <DialogDescription>
                          Upload tài liệu cho {chapter.title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tiêu đề tài liệu</Label>
                          <Input placeholder="Nhập tiêu đề tài liệu" />
                        </div>
                        <div className="space-y-2">
                          <Label>File tài liệu</Label>
                          <Input type="file" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="public" />
                          <Label htmlFor="public">
                            Công khai cho tất cả học sinh
                          </Label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setIsUploadDocOpen(false)
                            }
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={() =>
                              setIsUploadDocOpen(false)
                            }
                          >
                            Upload
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Quiz & Flashcard Tab */}
        <TabsContent value="quiz-flashcard">
          <TeacherQuizFlashcard subjectId={currentSubjectId} />
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách học sinh ({enrolledStudents.length})
              </CardTitle>
              <CardDescription>
                Theo dõi tiến độ học tập của từng học sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Đang tải danh sách học sinh...</p>
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Chưa có học sinh nào trong lớp</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Học sinh sẽ xuất hiện ở đây sau khi đăng ký và được duyệt
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {(student.name?.charAt(0) || student.username?.charAt(0) || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {student.name || student.username || 'Không tên'}
                            </h3>
                            <Badge
                              variant={
                                student.status === "active"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {student.status === "active"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span>Username: {student.username}</span>
                            <span>•</span>
                            <span>
                              Hoạt động cuối:{" "}
                              {new Date(
                                student.lastActive
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
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
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tài liệu học tập</CardTitle>
                  <CardDescription>
                    Quản lý tài liệu cho môn học
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload tài liệu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {doc.chapterName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Kích thước: {doc.size}</span>
                          <span>•</span>
                          <span>
                            Upload:{" "}
                            {new Date(
                              doc.uploadDate,
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}