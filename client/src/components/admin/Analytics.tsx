import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { BarChart3, Users, BookOpen, Target, TrendingUp, TrendingDown, Clock, Award, Activity } from 'lucide-react'

const mockOverallStats = {
  totalUsers: 1247,
  totalCourses: 45,
  totalQuizzes: 892,
  totalFlashcards: 3247,
  activeUsers: 1089,
  completionRate: 78.5,
  avgStudyTime: 2.4
}

const mockQuizStats = [
  {
    subject: 'Toán học',
    totalQuizzes: 156,
    completed: 1247,
    avgScore: 85.2,
    trend: 'up',
    trendValue: 5.2
  },
  {
    subject: 'Vật lý',
    totalQuizzes: 128,
    completed: 986,
    avgScore: 78.9,
    trend: 'up',
    trendValue: 2.1
  },
  {
    subject: 'Hóa học',
    totalQuizzes: 142,
    completed: 854,
    avgScore: 82.1,
    trend: 'down',
    trendValue: -1.3
  }
]

const mockFlashcardStats = [
  {
    subject: 'Toán học',
    totalCards: 892,
    reviewed: 12450,
    avgRetention: 89.5,
    dailyReviews: 340
  },
  {
    subject: 'Vật lý',
    totalCards: 756,
    reviewed: 9876,
    avgRetention: 85.2,
    dailyReviews: 285
  },
  {
    subject: 'Hóa học',
    totalCards: 683,
    reviewed: 8234,
    avgRetention: 87.1,
    dailyReviews: 256
  }
]

const mockLearningProgress = [
  {
    class: 'Lớp 12A1',
    students: 35,
    avgProgress: 78.5,
    completedLessons: 145,
    totalLessons: 185,
    activeStudents: 32
  },
  {
    class: 'Lớp 12A2',
    students: 33,
    avgProgress: 82.1,
    completedLessons: 156,
    totalLessons: 190,
    activeStudents: 30
  },
  {
    class: 'Lớp 11B1',
    students: 38,
    avgProgress: 65.4,
    completedLessons: 89,
    totalLessons: 136,
    activeStudents: 35
  }
]

export function Analytics() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1>Thống kê & Phân tích</h1>
        <p className='text-muted-foreground'>Báo cáo tổng quan về hoạt động học tập trong hệ thống</p>
      </div>

      {/* Overall Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Users className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Tổng người dùng</p>
                <p className='text-xl font-semibold'>{mockOverallStats.totalUsers.toLocaleString()}</p>
                <p className='text-xs text-green-600'>+12% so với tháng trước</p>
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
                <p className='text-sm text-muted-foreground'>Môn học</p>
                <p className='text-xl font-semibold'>{mockOverallStats.totalCourses}</p>
                <p className='text-xs text-green-600'>+3 môn mới</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <Target className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Quiz hoàn thành</p>
                <p className='text-xl font-semibold'>{mockOverallStats.totalQuizzes}</p>
                <p className='text-xs text-green-600'>+8% tuần này</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <Activity className='h-5 w-5 text-orange-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Người dùng hoạt động</p>
                <p className='text-xl font-semibold'>{mockOverallStats.activeUsers}</p>
                <p className='text-xs text-muted-foreground'>87% tổng số</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue='quiz' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='quiz'>Thống kê Quiz</TabsTrigger>
          <TabsTrigger value='flashcard'>Thống kê Flashcard</TabsTrigger>
          <TabsTrigger value='progress'>Tiến độ học tập</TabsTrigger>
        </TabsList>

        {/* Quiz Statistics */}
        <TabsContent value='quiz' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Thống kê Quiz theo môn học</CardTitle>
              <CardDescription>Số liệu về quiz và kết quả học tập của học sinh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockQuizStats.map((stat) => (
                  <div key={stat.subject} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='space-y-1'>
                      <h3 className='font-medium'>{stat.subject}</h3>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>{stat.totalQuizzes} quiz</span>
                        <span>•</span>
                        <span>{stat.completed} lượt làm</span>
                      </div>
                    </div>
                    <div className='text-right space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg font-semibold'>{stat.avgScore}%</span>
                        <div
                          className={`flex items-center gap-1 ${
                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {stat.trend === 'up' ? (
                            <TrendingUp className='h-4 w-4' />
                          ) : (
                            <TrendingDown className='h-4 w-4' />
                          )}
                          <span className='text-sm'>{Math.abs(stat.trendValue)}%</span>
                        </div>
                      </div>
                      <p className='text-xs text-muted-foreground'>Điểm trung bình</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flashcard Statistics */}
        <TabsContent value='flashcard' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Thống kê Flashcard theo môn học</CardTitle>
              <CardDescription>Số liệu về flashcard và tỷ lệ ghi nhớ của học sinh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockFlashcardStats.map((stat) => (
                  <div key={stat.subject} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='font-medium'>{stat.subject}</h3>
                      <Badge variant='secondary'>{stat.totalCards} thẻ</Badge>
                    </div>

                    <div className='grid grid-cols-3 gap-4 text-sm'>
                      <div className='text-center'>
                        <p className='text-lg font-semibold'>{stat.reviewed.toLocaleString()}</p>
                        <p className='text-muted-foreground'>Lượt ôn tập</p>
                      </div>
                      <div className='text-center'>
                        <p className='text-lg font-semibold'>{stat.avgRetention}%</p>
                        <p className='text-muted-foreground'>Tỷ lệ ghi nhớ</p>
                      </div>
                      <div className='text-center'>
                        <p className='text-lg font-semibold'>{stat.dailyReviews}</p>
                        <p className='text-muted-foreground'>Ôn tập/ngày</p>
                      </div>
                    </div>

                    <div className='mt-3'>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Tỷ lệ ghi nhớ</span>
                        <span>{stat.avgRetention}%</span>
                      </div>
                      <Progress value={stat.avgRetention} className='h-2' />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Progress */}
        <TabsContent value='progress' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ học tập theo lớp</CardTitle>
              <CardDescription>Tổng quan về tiến độ học tập của từng lớp học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockLearningProgress.map((progress) => (
                  <div key={progress.class} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between mb-3'>
                      <div>
                        <h3 className='font-medium'>{progress.class}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {progress.students} học sinh • {progress.activeStudents} đang hoạt động
                        </p>
                      </div>
                      <Badge variant='secondary'>{progress.avgProgress}%</Badge>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Tiến độ trung bình</span>
                        <span>{progress.avgProgress}%</span>
                      </div>
                      <Progress value={progress.avgProgress} className='h-2' />
                    </div>

                    <div className='flex items-center justify-between text-sm text-muted-foreground mt-3'>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        <span>
                          {progress.completedLessons}/{progress.totalLessons} bài học
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Award className='h-4 w-4' />
                        <span>{Math.round((progress.activeStudents / progress.students) * 100)}% tham gia</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
