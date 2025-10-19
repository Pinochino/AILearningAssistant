import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import {
  Trophy,
  Award,
  Star,
  Target,
  BookOpen,
  Clock,
  Zap,
  Shield,
  Crown,
  Medal,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Circle,
  Lock
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Mock data for achievements
const mockAchievements = [
  {
    id: '1',
    title: 'Học sinh chăm chỉ',
    description: 'Học liên tục 7 ngày liên tiếp',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    points: 100,
    isEarned: true,
    earnedAt: '2024-09-15',
    progress: 100,
    requirement: 'Học 7 ngày liên tiếp',
  },
  {
    id: '2',
    title: 'Thi đấu xuất sắc',
    description: 'Đạt điểm trung bình trên 90% trong 5 quiz liên tiếp',
    icon: '🏆',
    category: 'academic',
    rarity: 'rare',
    points: 250,
    isEarned: true,
    earnedAt: '2024-09-10',
    progress: 100,
    requirement: 'Điểm TB ≥ 90% trong 5 quiz',
  },
  {
    id: '3',
    title: 'Người học nhanh',
    description: 'Hoàn thành 50 bài học trong một tháng',
    icon: '⚡',
    category: 'speed',
    rarity: 'epic',
    points: 500,
    isEarned: false,
    earnedAt: null,
    progress: 75,
    requirement: 'Hoàn thành 50 bài học',
  },
  {
    id: '4',
    title: 'Chuyên gia flashcard',
    description: 'Học thuộc 100 flashcard',
    icon: '📚',
    category: 'memory',
    rarity: 'common',
    points: 150,
    isEarned: false,
    earnedAt: null,
    progress: 60,
    requirement: 'Học 100 flashcard',
  },
  {
    id: '5',
    title: 'Vua tốc độ',
    description: 'Hoàn thành quiz trong thời gian kỷ lục',
    icon: '👑',
    category: 'speed',
    rarity: 'legendary',
    points: 1000,
    isEarned: false,
    earnedAt: null,
    progress: 30,
    requirement: 'Hoàn thành quiz < 2 phút',
  },
  {
    id: '6',
    title: 'Học sinh toàn diện',
    description: 'Đạt điểm A+ ở tất cả các môn học',
    icon: '🎯',
    category: 'academic',
    rarity: 'legendary',
    points: 2000,
    isEarned: false,
    earnedAt: null,
    progress: 40,
    requirement: 'Điểm A+ tất cả môn',
  },
  {
    id: '7',
    title: 'Người kiên trì',
    description: 'Học liên tục 30 ngày',
    icon: '🛡️',
    category: 'streak',
    rarity: 'epic',
    points: 750,
    isEarned: false,
    earnedAt: null,
    progress: 40,
    requirement: 'Học 30 ngày liên tiếp',
  },
  {
    id: '8',
    title: 'Thiên tài toán học',
    description: 'Đạt điểm tối đa trong 10 quiz toán liên tiếp',
    icon: '🧮',
    category: 'academic',
    rarity: 'rare',
    points: 300,
    isEarned: false,
    earnedAt: null,
    progress: 20,
    requirement: '100% điểm trong 10 quiz toán',
  },
];

const mockLeaderboard = [
  {
    id: '1',
    name: 'Lê Minh Học',
    avatar: null,
    totalPoints: 2450,
    rank: 1,
    achievements: 12,
    streak: 15,
  },
  {
    id: '2',
    name: 'Phạm Thị Thông',
    avatar: null,
    totalPoints: 2200,
    rank: 2,
    achievements: 10,
    streak: 8,
  },
  {
    id: '3',
    name: 'Nguyễn Văn A',
    avatar: null,
    totalPoints: 1950,
    rank: 3,
    achievements: 9,
    streak: 12,
  },
  {
    id: '4',
    name: 'Trần Thị B',
    avatar: null,
    totalPoints: 1800,
    rank: 4,
    achievements: 8,
    streak: 5,
  },
  {
    id: '5',
    name: 'Bạn',
    avatar: null,
    totalPoints: 1650,
    rank: 5,
    achievements: 6,
    streak: 7,
  },
];

const mockStats = {
  totalPoints: 1650,
  totalAchievements: 6,
  currentStreak: 7,
  longestStreak: 12,
  totalStudyTime: 45.5,
  averageScore: 85,
  rank: 5,
  totalStudents: 150,
};

export function Achievements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Thường';
      case 'rare': return 'Hiếm';
      case 'epic': return 'Huyền thoại';
      case 'legendary': return 'Huyền thoại';
      default: return 'Không xác định';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'streak': return <Clock className="h-4 w-4" />;
      case 'speed': return <Zap className="h-4 w-4" />;
      case 'memory': return <Target className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'academic': return 'Học tập';
      case 'streak': return 'Chuỗi ngày';
      case 'speed': return 'Tốc độ';
      case 'memory': return 'Ghi nhớ';
      default: return 'Khác';
    }
  };

  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const earnedAchievements = mockAchievements.filter(a => a.isEarned);
  const inProgressAchievements = mockAchievements.filter(a => !a.isEarned && a.progress > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Thành tích</h1>
        <p className="text-muted-foreground">
          Theo dõi thành tích và huy hiệu của bạn
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng điểm</p>
                <p className="text-xl font-semibold">{mockStats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Thành tích</p>
                <p className="text-xl font-semibold">
                  {mockStats.totalAchievements}/{mockAchievements.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Chuỗi ngày</p>
                <p className="text-xl font-semibold">{mockStats.currentStreak} ngày</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Xếp hạng</p>
                <p className="text-xl font-semibold">#{mockStats.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          <TabsTrigger value="leaderboard">Bảng xếp hạng</TabsTrigger>
          <TabsTrigger value="progress">Tiến độ</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm thành tích..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="academic">Học tập</SelectItem>
                    <SelectItem value="streak">Chuỗi ngày</SelectItem>
                    <SelectItem value="speed">Tốc độ</SelectItem>
                    <SelectItem value="memory">Ghi nhớ</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Độ hiếm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="common">Thường</SelectItem>
                    <SelectItem value="rare">Hiếm</SelectItem>
                    <SelectItem value="epic">Huyền thoại</SelectItem>
                    <SelectItem value="legendary">Huyền thoại</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`${
                  achievement.isEarned 
                    ? 'bg-green-50 border-green-200' 
                    : achievement.progress > 0 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">
                      {achievement.isEarned ? achievement.icon : '🔒'}
                    </div>
                    <div className="text-right">
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {getRarityLabel(achievement.rarity)}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">{achievement.points} điểm</p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getCategoryIcon(achievement.category)}
                    <span>{getCategoryLabel(achievement.category)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tiến độ</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {achievement.requirement}
                    </p>
                  </div>

                  {achievement.isEarned && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Đạt được: {new Date(achievement.earnedAt!).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng xếp hạng</CardTitle>
              <CardDescription>
                Top học sinh có thành tích tốt nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboard.map((student, index) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      student.name === 'Bạn' ? 'bg-primary/5 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                      {student.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{student.name}</h3>
                        {student.name === 'Bạn' && (
                          <Badge variant="default">Bạn</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{student.totalPoints} điểm</span>
                        <span>•</span>
                        <span>{student.achievements} thành tích</span>
                        <span>•</span>
                        <span>{student.streak} ngày liên tiếp</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {student.rank <= 3 && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="font-semibold">{student.totalPoints}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Thành tích đã đạt</CardTitle>
                <CardDescription>
                  {earnedAchievements.length} thành tích đã hoàn thành
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earnedAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(achievement.earnedAt!).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge variant="default">{achievement.points} điểm</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Đang phấn đấu</CardTitle>
                <CardDescription>
                  {inProgressAchievements.length} thành tích đang trong quá trình
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inProgressAchievements.map((achievement) => (
                    <div key={achievement.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">🔒</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.requirement}
                          </p>
                        </div>
                        <Badge variant="outline">{achievement.points} điểm</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Tiến độ</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
