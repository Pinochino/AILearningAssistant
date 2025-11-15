import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
    Search,
    Plus,
    FileText,
    Video,
    Image,
    Download,
    Edit,
    Trash2,
    Eye,
    Filter,
    Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export function ContentManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // State for real data
    const [documents, setDocuments] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API fetching functions
    const fetchAllMaterials = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/materials', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            // Handle different response structures
            const materialsData = response.data?.data?.items || response.data?.items || response.data?.data || response.data || [];
            console.log('Materials response:', response.data);
            setDocuments(Array.isArray(materialsData) ? materialsData : []);
        } catch (error: any) {
            console.error('Error fetching materials:', error);
            toast.error('Không thể tải tài liệu');
            setDocuments([]); // Ensure it's an array on error
        }
    };

    const fetchAllQuizzes = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/quizzes', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            // Handle response format: { items: [...], pagination: {...} }
            const quizzesData = response.data?.data?.items || response.data?.items || response.data || [];
            console.log('Quizzes response:', response.data);
            setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        } catch (error: any) {
            console.error('Error fetching quizzes:', error);
            toast.error('Không thể tải quiz');
            setQuizzes([]); // Ensure it's an array on error
        }
    };

    const fetchAllFlashcards = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/flashcard-sets', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            // Handle response format: { items: [...], pagination: {...} }
            const flashcardsData = response.data?.data?.items || response.data?.items || response.data || [];
            console.log('Flashcards response:', response.data);
            setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : []);
        } catch (error: any) {
            console.error('Error fetching flashcards:', error);
            toast.error('Không thể tải flashcard');
            setFlashcards([]); // Ensure it's an array on error
        }
    };

    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([fetchAllMaterials(), fetchAllQuizzes(), fetchAllFlashcards()]);
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

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Thêm nội dung
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm nội dung mới</DialogTitle>
                            <DialogDescription>
                                Tạo tài liệu, quiz hoặc flashcard mới
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contentType">Loại nội dung</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại nội dung" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="document">Tài liệu</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                        <SelectItem value="flashcard">Flashcard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề</Label>
                                <Input id="title" placeholder="Nhập tiêu đề" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Môn học</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn môn học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="math">Toán học</SelectItem>
                                        <SelectItem value="physics">Vật lý</SelectItem>
                                        <SelectItem value="chemistry">Hóa học</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={() => setIsCreateDialogOpen(false)}>
                                    Tạo mới
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
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
                                <SelectItem value="math">Toán học</SelectItem>
                                <SelectItem value="physics">Vật lý</SelectItem>
                                <SelectItem value="chemistry">Hóa học</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="documents" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="documents">Tài liệu ({documents.length})</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz ({quizzes.length})</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcard ({flashcards.length})</TabsTrigger>
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
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Chưa có tài liệu nào trong hệ thống</p>
                                    </div>
                                ) : (
                                    documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-muted rounded">
                                                    {getTypeIcon(doc.type)}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{doc.title}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{doc.subject}</span>
                                                        <span>•</span>
                                                        <span>{doc.teacher}</span>
                                                        <span>•</span>
                                                        <span>{doc.size}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
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
                                    ))
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
                                ) : quizzes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Chưa có quiz nào trong hệ thống</p>
                                    </div>
                                ) : (
                                    quizzes.map((quiz: any) => (
                                        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{quiz.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{quiz.subject || 'Không có môn học'}</span>
                                                    <span>•</span>
                                                    <span>{quiz.createdBy?.name || quiz.teacher || 'Không có giáo viên'}</span>
                                                    <span>•</span>
                                                    <span>{quiz.questions?.length || quiz.questionCount || 0} câu hỏi</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{quiz.attempts || 0} lượt làm</span>
                                                    <span>•</span>
                                                    <span>Điểm TB: {quiz.avgScore || 0}%</span>
                                                    <span>•</span>
                                                    <span>{new Date(quiz.createdAt || quiz.createdDate).toLocaleDateString('vi-VN')}</span>
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
                                ) : flashcards.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Chưa có flashcard nào trong hệ thống</p>
                                    </div>
                                ) : (
                                    flashcards.map((flashcard: any) => (
                                        <div key={flashcard.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{flashcard.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{flashcard.subject || 'Không có môn học'}</span>
                                                    <span>•</span>
                                                    <span>{flashcard.createdBy?.name || flashcard.teacher || 'Không có giáo viên'}</span>
                                                    <span>•</span>
                                                    <span>{flashcard.flashcards?.length || flashcard.cardCount || 0} thẻ</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{flashcard.studyCount || 0} lượt học</span>
                                                    <span>•</span>
                                                    <span>{new Date(flashcard.createdAt || flashcard.createdDate).toLocaleDateString('vi-VN')}</span>
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
