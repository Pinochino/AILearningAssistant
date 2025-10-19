import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  File,
  Video,
  Image,
  Archive,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Star
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';

// Mock data for documents
const mockDocuments = [
  {
    id: '1',
    title: 'Bài giảng Chương 1: Hàm số và đồ thị',
    type: 'pdf',
    size: '2.5 MB',
    uploadDate: '2024-09-15',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    description: 'Tài liệu bài giảng chi tiết về hàm số và đồ thị',
    downloadCount: 156,
    rating: 4.8,
    isPublic: true,
    chapter: 'Chương 1',
    tags: ['bài giảng', 'hàm số', 'đồ thị'],
  },
  {
    id: '2',
    title: 'Video bài giảng: Đạo hàm cơ bản',
    type: 'video',
    size: '45.2 MB',
    uploadDate: '2024-09-14',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    description: 'Video bài giảng về đạo hàm cơ bản với ví dụ minh họa',
    downloadCount: 89,
    rating: 4.9,
    isPublic: true,
    chapter: 'Chương 2',
    tags: ['video', 'đạo hàm', 'bài giảng'],
  },
  {
    id: '3',
    title: 'Bài tập về nhà - Chương 1',
    type: 'pdf',
    size: '1.2 MB',
    uploadDate: '2024-09-13',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    description: 'Tổng hợp các bài tập về hàm số và đồ thị',
    downloadCount: 203,
    rating: 4.7,
    isPublic: true,
    chapter: 'Chương 1',
    tags: ['bài tập', 'hàm số', 'thực hành'],
  },
  {
    id: '4',
    title: 'Hình ảnh minh họa: Đồ thị các hàm số',
    type: 'image',
    size: '3.8 MB',
    uploadDate: '2024-09-12',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    description: 'Bộ sưu tập hình ảnh minh họa các dạng đồ thị hàm số',
    downloadCount: 67,
    rating: 4.6,
    isPublic: true,
    chapter: 'Chương 1',
    tags: ['hình ảnh', 'đồ thị', 'minh họa'],
  },
  {
    id: '5',
    title: 'Tài liệu tham khảo: Giải tích nâng cao',
    type: 'pdf',
    size: '8.9 MB',
    uploadDate: '2024-09-10',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    description: 'Tài liệu tham khảo chuyên sâu về giải tích',
    downloadCount: 45,
    rating: 4.9,
    isPublic: true,
    chapter: 'Chương 3',
    tags: ['tham khảo', 'giải tích', 'nâng cao'],
  },
  {
    id: '6',
    title: 'Bài giảng PowerPoint: Ứng dụng đạo hàm',
    type: 'powerpoint',
    size: '12.3 MB',
    uploadDate: '2024-09-08',
    uploadBy: 'GV. Nguyễn Văn Giáo',
    description: 'Slide bài giảng về ứng dụng của đạo hàm trong thực tế',
    downloadCount: 134,
    rating: 4.8,
    isPublic: true,
    chapter: 'Chương 3',
    tags: ['powerpoint', 'ứng dụng', 'đạo hàm'],
  },
];

const mockChapters = [
  { id: '1', title: 'Chương 1: Hàm số và đồ thị', documentCount: 3 },
  { id: '2', title: 'Chương 2: Đạo hàm', documentCount: 2 },
  { id: '3', title: 'Chương 3: Ứng dụng đạo hàm', documentCount: 1 },
  { id: '4', title: 'Chương 4: Tích phân', documentCount: 0 },
];

export function DocumentsView() {
  const { navigateTo } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesChapter = selectedChapter === 'all' || doc.chapter === selectedChapter;
    return matchesSearch && matchesType && matchesChapter;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'video': return <Video className="h-5 w-5 text-blue-500" />;
      case 'image': return <Image className="h-5 w-5 text-green-500" />;
      case 'powerpoint': return <File className="h-5 w-5 text-orange-500" />;
      case 'word': return <FileText className="h-5 w-5 text-blue-600" />;
      default: return <Archive className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'video': return 'Video';
      case 'image': return 'Hình ảnh';
      case 'powerpoint': return 'PowerPoint';
      case 'word': return 'Word';
      default: return type.toUpperCase();
    }
  };

  const handleDownload = (documentId: string) => {
    // Simulate download
    console.log('Downloading document:', documentId);
  };

  const handleView = (documentId: string) => {
    // Simulate view
    console.log('Viewing document:', documentId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('subjects')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tài liệu môn học</h1>
            <p className="text-muted-foreground">
              Tài liệu, bài giảng và tài nguyên học tập
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Hình ảnh</SelectItem>
                <SelectItem value="powerpoint">PowerPoint</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chương học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chương</SelectItem>
                {mockChapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.title}>
                    {chapter.title} ({chapter.documentCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc.type)}
                  <Badge variant="outline" className="text-xs">
                    {getFileTypeLabel(doc.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{doc.rating}</span>
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {doc.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{doc.uploadBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <File className="h-3 w-3" />
                  <span>{doc.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-3 w-3" />
                  <span>{doc.downloadCount} lượt tải</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {doc.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleView(doc.id)}
                >
                  <Eye className="h-4 w-4" />
                  Xem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleDownload(doc.id)}
                >
                  <Download className="h-4 w-4" />
                  Tải
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy tài liệu</h3>
            <p className="text-muted-foreground text-center">
              Không có tài liệu nào phù hợp với bộ lọc của bạn.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
