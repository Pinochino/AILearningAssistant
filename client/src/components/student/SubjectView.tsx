import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { StudentQuizFlashcard } from './StudentQuizFlashcard';
import { useNavigation } from '../../hooks/useNavigation';
import { enrollmentApi, classApi, type Class } from '../../services/api';

const mockSubjects = [
  {
    id: '1',
    name: 'Toán học',
    description: 'Chương trình Toán học lớp 12 - Học kỳ 1',
    teacher: 'GV. Nguyễn Văn Giáo',
    progress: 78,
    totalLessons: 45,
    completedLessons: 35,
    upcomingDeadline: '2024-09-25',
  },
  {
    id: '2',
    name: 'Vật lý',
    description: 'Chương trình Vật lý lớp 12 - Học kỳ 1',
    teacher: 'GV. Lê Văn Phúc',
    progress: 65,
    totalLessons: 38,
    completedLessons: 25,
    upcomingDeadline: '2024-09-28',
  },
  {
    id: '3',
    name: 'Hóa học',
    description: 'Chương trình Hóa học lớp 12 - Học kỳ 1',
    teacher: 'GV. Trần Thị Hóa',
    progress: 82,
    totalLessons: 42,
    completedLessons: 34,
    upcomingDeadline: '2024-09-30',
  },
];

const mockChapters = [
  {
    id: '1',
    title: 'Chương 1: Hàm số và đồ thị',
    progress: 85,
    lessons: 12,
    completedLessons: 10,
    quizzes: 3,
    completedQuizzes: 2,
    flashcards: 15,
    studiedFlashcards: 12,
    isUnlocked: true,
  },
  {
    id: '2',
    title: 'Chương 2: Đạo hàm',
    progress: 70,
    lessons: 10,
    completedLessons: 7,
    quizzes: 2,
    completedQuizzes: 1,
    flashcards: 12,
    studiedFlashcards: 8,
    isUnlocked: true,
  },
  {
    id: '3',
    title: 'Chương 3: Ứng dụng đạo hàm',
    progress: 45,
    lessons: 8,
    completedLessons: 4,
    quizzes: 1,
    completedQuizzes: 0,
    flashcards: 8,
    studiedFlashcards: 3,
    isUnlocked: true,
  },
  {
    id: '4',
    title: 'Chương 4: Tích phân',
    progress: 0,
    lessons: 15,
    completedLessons: 0,
    quizzes: 4,
    completedQuizzes: 0,
    flashcards: 20,
    studiedFlashcards: 0,
    isUnlocked: false,
  },
];

const mockRecentActivities = [
  {
    id: '1',
    type: 'quiz',
    title: 'Quiz: Hàm số bậc nhất',
    score: 85,
    completedAt: '2024-09-17',
    chapter: 'Chương 1',
  },
  {
    id: '2',
    type: 'flashcard',
    title: 'Ôn tập: Công thức đạo hàm',
    progress: 75,
    completedAt: '2024-09-16',
    chapter: 'Chương 2',
  },
  {
    id: '3',
    type: 'lesson',
    title: 'Bài học: Đồ thị hàm số',
    completed: true,
    completedAt: '2024-09-15',
    chapter: 'Chương 1',
  },
];

const mockUpcomingTasks = [
  {
    id: '1',
    type: 'quiz',
    title: 'Kiểm tra 15 phút - Đạo hàm',
    dueDate: '2024-09-25',
    chapter: 'Chương 2',
    priority: 'high',
  },
  {
    id: '2',
    type: 'assignment',
    title: 'Bài tập về nhà - Ứng dụng đạo hàm',
    dueDate: '2024-09-28',
    chapter: 'Chương 3',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'flashcard',
    title: 'Ôn tập flashcard chương 1',
    dueDate: '2024-09-30',
    chapter: 'Chương 1',
    priority: 'low',
  },
];

// Mock data for documents
const mockDocuments = [
  {
    id: '1',
    title: 'Bài giảng Chương 1: Hàm số và đồ thị',
    type: 'pdf',
    size: '2.5 MB',
    uploadDate: '2024-09-15',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    chapter: '1',
  },
  {
    id: '2',
    title: 'Video bài giảng: Đạo hàm cơ bản',
    type: 'video',
    size: '45.2 MB',
    uploadDate: '2024-09-14',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    chapter: '2',
  },
  {
    id: '3',
    title: 'Bài tập về nhà - Chương 1',
    type: 'pdf',
    size: '1.2 MB',
    uploadDate: '2024-09-13',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    chapter: '1',
  },
  {
    id: '4',
    title: 'Hình ảnh minh họa: Đồ thị các hàm số',
    type: 'image',
    size: '3.8 MB',
    uploadDate: '2024-09-12',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    chapter: '1',
  },
];

export function SubjectView() {
  const { navigateTo } = useNavigation();
  const [currentSubjectId, setCurrentSubjectId] = useState('1');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<typeof mockSubjects>([]);
  const [loading, setLoading] = useState(true);
  const [hasClasses, setHasClasses] = useState(false);

  // Get current user ID
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Load real classes from API
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const userId = getCurrentUserId();
        console.log('👤 Current User ID:', userId);
        
        if (!userId) {
          console.warn('⚠️ No user ID found in localStorage');
          setLoading(false);
          return;
        }

        console.log('🔄 Fetching all classes for student:', userId);
        
        // Get all classes where student is a member (from studentIds array)
        const allClassesResponse = await classApi.getAll({});
        const allClasses = allClassesResponse.data?.items || [];
        
        // Filter classes where student is in studentIds array
        const memberClasses = allClasses.filter((cls: any) => {
          return Array.isArray(cls.studentIds) && 
            cls.studentIds.some((id: any) => 
              (id?._id === userId || id === userId)
            );
        });

        console.log('📚 All member classes:', memberClasses);
        console.log('📊 Total member classes count:', memberClasses.length);

        // Get approved enrollments for reference
        const enrollmentsResponse = await enrollmentApi.getStudentEnrollments(userId, 'approved');
        const approvedEnrollments = enrollmentsResponse.data || [];
        
        // Create a map of classId to enrollment status
        const enrollmentMap = new Map();
        approvedEnrollments.forEach((enrollment: any) => {
          const classId = typeof enrollment.classId === 'object' ? enrollment.classId._id : enrollment.classId;
          enrollmentMap.set(classId, 'approved');
        });

        // Map classes with their enrollment status
        const classes = memberClasses.map((cls: any) => ({
          ...cls,
          enrollmentStatus: enrollmentMap.has(cls._id) ? 'approved' : 'direct_add'
        })) as Array<Class & { enrollmentStatus: string }>;
        
        console.log('📖 Loaded classes:', classes);

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
          }));
          setSubjects(mappedSubjects);
          setCurrentSubjectId(mappedSubjects[0].id);
          setHasClasses(true);
          console.log('✅ Subjects set:', mappedSubjects);
        } else {
          console.log('⚠️ No classes found');
          setSubjects([]);
          setHasClasses(false);
        }
      } catch (err) {
        console.error('❌ Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const currentSubject = subjects.find(s => s.id === currentSubjectId) || subjects[0];
  const currentSubjectIndex = subjects.findIndex(s => s.id === currentSubjectId);

  const handleSubjectChange = (subjectId: string) => {
    setCurrentSubjectId(subjectId);
  };

  const handlePrevSubject = () => {
    const prevIndex = currentSubjectIndex > 0 ? currentSubjectIndex - 1 : subjects.length - 1;
    setCurrentSubjectId(subjects[prevIndex].id);
  };

  const handleNextSubject = () => {
    const nextIndex = currentSubjectIndex < subjects.length - 1 ? currentSubjectIndex + 1 : 0;
    setCurrentSubjectId(subjects[nextIndex].id);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '❓';
      case 'flashcard': return '📚';
      case 'lesson': return '📖';
      case 'assignment': return '📝';
      default: return '📚';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'video': return <Play className="h-4 w-4 text-blue-500" />;
      case 'image': return <FileText className="h-4 w-4 text-green-500" />;
      case 'powerpoint': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'video': return 'Video';
      case 'image': return 'Hình ảnh';
      case 'powerpoint': return 'PowerPoint';
      default: return type.toUpperCase();
    }
  };

  const handleToggleDocuments = (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const getDocumentsForChapter = (chapterId: string) => {
    return mockDocuments.filter(doc => doc.chapter === chapterId);
  };

  // No need for status text since we only show approved classes now
  const getStatusText = (status?: string) => {
    return status === 'approved' ? 'Đã được duyệt' : 'Đã tham gia';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasClasses || subjects.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Chưa có lớp học nào</h2>
              <p className="text-muted-foreground mb-6">
                Bạn chưa được duyệt tham gia lớp học nào hoặc chưa đăng ký lớp học nào.
              </p>
              <div className="space-x-4">
                <Button onClick={() => navigateTo('subject-search')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tìm kiếm lớp học
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tải lại trang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <button className='flex items-center gap-2 border rounded-md px-3 py-2 text-sm' style={{background: 'white'}}>
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
        <p className="text-muted-foreground">
          {currentSubject.description}x
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tiến độ tổng</p>
                <p className="text-xl font-semibold">{currentSubject.progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bài học</p>
                <p className="text-xl font-semibold">{currentSubject.completedLessons}/{currentSubject.totalLessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline gần nhất</p>
                <p className="text-xl font-semibold">
                  {new Date(currentSubject.upcomingDeadline).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Tình trạng</p>
                <Badge variant={currentSubject.progress >= 70 ? 'default' : 'secondary'}>
                  {currentSubject.progress >= 70 ? 'Đúng tiến độ' : 'Cần cố gắng'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chapters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chapters">Chương học</TabsTrigger>
          <TabsTrigger value="activities">Hoạt động gần đây</TabsTrigger>
          <TabsTrigger value="tasks">Nhiệm vụ</TabsTrigger>
          <TabsTrigger value="student-content">Quiz & Flashcard</TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value="chapters" className="space-y-4">
          {mockChapters.map((chapter) => (
            <Card key={chapter.id} className={!chapter.isUnlocked ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {chapter.title}
                      {!chapter.isUnlocked && <span className="text-muted-foreground">🔒</span>}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{chapter.completedLessons}/{chapter.lessons} bài học</span>
                      <span>•</span>
                      <span>{chapter.completedQuizzes}/{chapter.quizzes} quiz</span>
                      <span>•</span>
                      <span>{chapter.studiedFlashcards}/{chapter.flashcards} flashcard</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{chapter.progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ chương</span>
                    <span>{chapter.progress}%</span>
                  </div>
                  <Progress value={chapter.progress} className="h-2" />
                </div>

                {chapter.isUnlocked && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <Play className="h-4 w-4" />
                        Tiếp tục học
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleToggleDocuments(chapter.id)}
                      >
                        <FileText className="h-4 w-4" />
                        Xem tài liệu ({getDocumentsForChapter(chapter.id).length})
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Target className="h-4 w-4" />
                        Làm quiz
                      </Button>
                    </div>

                    {/* Documents Section */}
                    {expandedChapter === chapter.id && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Tài liệu chương
                        </h4>
                        {getDocumentsForChapter(chapter.id).length > 0 ? (
                          <div className="space-y-2">
                            {getDocumentsForChapter(chapter.id).map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                <div className="flex items-center gap-3">
                                  {getFileIcon(doc.type)}
                                  <div>
                                    <h5 className="font-medium text-sm">{doc.title}</h5>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{getFileTypeLabel(doc.type)}</span>
                                      <span>•</span>
                                      <span>{doc.size}</span>
                                      <span>•</span>
                                      <span>{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Chưa có tài liệu nào cho chương này
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!chapter.isUnlocked && (
                  <p className="text-sm text-muted-foreground">
                    Hoàn thành chương trước để mở khóa
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các hoạt động học tập bạn đã thực hiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{activity.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{activity.chapter}</Badge>
                        <span>•</span>
                        <span>{new Date(activity.completedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.type === 'quiz' && activity.score && (
                        <Badge variant="default">{activity.score}%</Badge>
                      )}
                      {activity.type === 'flashcard' && activity.progress && (
                        <Badge variant="secondary">{activity.progress}%</Badge>
                      )}
                      {activity.type === 'lesson' && activity.completed && (
                        <Badge variant="default">Hoàn thành</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhiệm vụ sắp tới</CardTitle>
              <CardDescription>
                Các bài tập và kiểm tra cần hoàn thành
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUpcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="text-2xl">{getActivityIcon(task.type)}</div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{task.chapter}</Badge>
                        <span>•</span>
                        <span>Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority === 'high' ? 'Cao' :
                          task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </Badge>
                      <Button size="sm">Bắt đầu</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Content Tab */}
        <TabsContent value="student-content" className="space-y-4">
          <StudentQuizFlashcard />
        </TabsContent>
      </Tabs>
    </div>
  );
}