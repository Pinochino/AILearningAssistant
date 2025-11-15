import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Video, Image, Download, Edit, Trash2, Eye, Brain, BookOpen, HelpCircle, Layers, CheckSquare, SquareStack } from 'lucide-react';

// Types
interface Material {
    _id: string;
    title: string;
    description: string;
    classId: string;
    chapter: any;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
    type: string;
    uploadedBy: string;
    createdAt: string;
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    classId: string;
    createdBy: any;
    questions: any[];
    attempts: number;
    durationMinutes: number;
    difficulty: string;
    isPublic: boolean;
    createdAt: string;
}

interface Flashcard {
    _id: string;
    title: string;
    description: string;
    classId: string;
    createdBy: any;
    flashcards: any[];
    totalCards: number;
    studyCount: number;
    difficulty: string;
    isPublic: boolean;
    createdAt: string;
}

interface Class {
    _id: string;
    name: string;
    subject: string;
}

interface User {
    _id: string;
    username: string;
    name?: string;
}

export function ContentManagement() {
    const [documents, setDocuments] = useState<Material[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState('all');

    // Cache for classes and users
    const [classesCache, setClassesCache] = useState<Record<string, Class>>({});
    const [usersCache, setUsersCache] = useState<Record<string, User>>({});

    // Helper functions to get class and user info
    const getClassName = async (classId: string): Promise<string> => {
        if (classesCache[classId]) {
            return classesCache[classId].name;
        }

        try {
            const response = await axios.get(`http://localhost:9000/api/classes/${classId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const classData = response.data?.data || response.data;
            setClassesCache(prev => ({ ...prev, [classId]: classData }));
            return classData.name || 'Không có lớp';
        } catch (error) {
            return 'Không có lớp';
        }
    };

    const getUserName = async (userId: string): Promise<string> => {
        if (usersCache[userId]) {
            return usersCache[userId].username || usersCache[userId].name || 'Không có tên';
        }

        try {
            // Try different possible endpoints
            const endpoints = [
                `http://localhost:9000/api/users/profile/${userId}`,
                `http://localhost:9000/api/auth/user/${userId}`,
                `http://localhost:9000/api/user/${userId}`
            ];

            let userData = null;
            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(endpoint, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                    });
                    userData = response.data?.data || response.data;
                    if (userData) break;
                } catch (e) {
                    // Try next endpoint
                    continue;
                }
            }

            if (userData) {
                setUsersCache(prev => ({ ...prev, [userId]: userData }));
                return userData.username || userData.name || 'Không có tên';
            }

            // If all endpoints fail, return the userId as fallback
            return userId;
        } catch (error) {
            return userId; // Return userId as fallback instead of error message
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const fetchAllMaterials = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/materials', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const materialsData = response.data?.data?.items || response.data?.items || response.data?.data || response.data || [];
            console.log('Materials response:', response.data);
            console.log('Materials sample:', materialsData[0]);
            setDocuments(Array.isArray(materialsData) ? materialsData : []);
        } catch (error: any) {
            console.error('Error fetching materials:', error);
            toast.error('Không thể tải tài liệu');
            setDocuments([]);
        }
    };

    const fetchAllQuizzes = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/quizzes', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const quizzesData = response.data?.data?.items || response.data?.items || response.data || [];
            console.log('Quizzes response:', response.data);
            console.log('Quizzes sample:', quizzesData[0]);
            setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        } catch (error: any) {
            console.error('Error fetching quizzes:', error);
            toast.error('Không thể tải quiz');
            setQuizzes([]);
        }
    };

    const fetchAllFlashcards = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/flashcard-sets', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const flashcardsData = response.data?.data?.items || response.data?.items || response.data || [];
            console.log('Flashcards response:', response.data);
            console.log('Flashcards sample:', flashcardsData[0]);
            setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : []);
        } catch (error: any) {
            console.error('Error fetching flashcards:', error);
            toast.error('Không thể tải flashcard');
            setFlashcards([]);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/classes', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const classesData = response.data?.data?.items || response.data?.items || response.data || [];
            console.log('Classes response:', response.data);
            console.log('Classes sample:', classesData[0]);
            setClasses(Array.isArray(classesData) ? classesData : []);
        } catch (error: any) {
            console.error('Error fetching classes:', error);
            toast.error('Không thể tải lớp học');
            setClasses([]);
        }
    };

    // Component to display class and user info with async loading
    const ClassUserInfo: React.FC<{ classId: string; userId?: string; uploadedBy?: any }> = ({ classId, userId, uploadedBy }) => {
        const [className, setClassName] = useState<string>('Đang tải...');
        const [userName, setUserName] = useState<string>('Đang tải...');

        useEffect(() => {
            getClassName(classId).then(setClassName);

            if (uploadedBy) {
                // uploadedBy can be object (from materials) or just username string
                if (typeof uploadedBy === 'object') {
                    setUserName(uploadedBy.username || uploadedBy.name || 'Không có tên');
                } else {
                    setUserName(uploadedBy);
                }
            } else if (userId) {
                // userId can be string ID or object (after populate)
                if (typeof userId === 'object') {
                    setUserName(userId.username || userId.name || 'Không có tên');
                } else {
                    getUserName(userId).then(setUserName);
                }
            }
        }, [classId, userId, uploadedBy]);

        return (
            <>
                <span>{className}</span>
                <span>•</span>
                <span>{userName}</span>
            </>
        );
    };

    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([fetchAllMaterials(), fetchAllQuizzes(), fetchAllFlashcards(), fetchClasses()]);
            } catch (error) {
                setError('Failed to load content data');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
            case 'video': return <Video className="h-4 w-4 text-blue-600" />;
            case 'image': return <Image className="h-4 w-4 text-green-600" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    // Filter content by selected class
    const filteredDocuments = selectedClass === 'all'
        ? documents
        : documents.filter(doc => doc.classId === selectedClass);

    const filteredQuizzes = selectedClass === 'all'
        ? quizzes
        : quizzes.filter(quiz => quiz.classId === selectedClass);

    const filteredFlashcards = selectedClass === 'all'
        ? flashcards
        : flashcards.filter(flashcard => flashcard.classId === selectedClass);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1>Quản lý nội dung</h1>
                    <p className="text-muted-foreground">
                        Quản lý tài liệu, quiz và flashcard trong hệ thống
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Lọc theo lớp học" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả lớp học</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="documents" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="documents">Tài liệu ({filteredDocuments.length})</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz ({filteredQuizzes.length})</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcard ({filteredFlashcards.length})</TabsTrigger>
                </TabsList>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tài liệu học tập</CardTitle>
                            <CardDescription>Quản lý tất cả tài liệu trong hệ thống</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : filteredDocuments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {selectedClass === 'all' ? 'Không có tài liệu nào' : 'Không có tài liệu nào cho lớp học này'}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredDocuments.map((doc) => (
                                            <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-muted rounded">
                                                        {getTypeIcon(doc.type)}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium">{doc.title}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <ClassUserInfo classId={doc.classId} uploadedBy={doc.uploadedBy} />
                                                            <span>•</span>
                                                            <span>{formatFileSize(doc.size)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz và bài kiểm tra</CardTitle>
                            <CardDescription>Quản lý các quiz trong hệ thống</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : filteredQuizzes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>{selectedClass === 'all' ? 'Chưa có quiz nào trong hệ thống' : 'Không có quiz nào cho lớp học này'}</p>
                                    </div>
                                ) : (
                                    filteredQuizzes.map((quiz) => (
                                        <div key={quiz._id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-muted rounded">
                                                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{quiz.title}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <ClassUserInfo classId={quiz.classId} userId={quiz.createdBy} />
                                                        <span>•</span>
                                                        <span>{quiz.questions?.length || 0} câu hỏi</span>
                                                        <span>•</span>
                                                        <span>{quiz.attempts || 0} lượt làm</span>
                                                        <span>•</span>
                                                        <span>{quiz.durationMinutes ? `${quiz.durationMinutes} phút` : 'Không có thời gian'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{new Date(quiz.createdAt).toLocaleDateString('vi-VN')}</span>
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
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Flashcards Tab */}
                <TabsContent value="flashcards" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flashcard</CardTitle>
                            <CardDescription>Quản lý bộ flashcard trong hệ thống</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : filteredFlashcards.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <SquareStack className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>{selectedClass === 'all' ? 'Chưa có flashcard nào trong hệ thống' : 'Không có flashcard nào cho lớp học này'}</p>
                                    </div>
                                ) : (
                                    filteredFlashcards.map((flashcard) => (
                                        <div key={flashcard._id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-muted rounded">
                                                    <SquareStack className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{flashcard.title}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <ClassUserInfo classId={flashcard.classId} userId={flashcard.createdBy} />
                                                        <span>•</span>
                                                        <span>{flashcard.totalCards || flashcard.flashcards?.length || 0} thẻ</span>
                                                        <span>•</span>
                                                        <span>{flashcard.studyCount || 0} lượt học</span>
                                                        <span>•</span>
                                                        <span>{flashcard.difficulty || 'Không có độ khó'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{new Date(flashcard.createdAt).toLocaleDateString('vi-VN')}</span>
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
                                                    <Trash2 className="h-4 w-4 text-destructive" />
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
        </div>
    );
}
