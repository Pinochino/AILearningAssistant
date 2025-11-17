import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useNavigation } from '../../hooks/useNavigation';
import { ChevronLeft, Trophy, Users, CheckCircle, XCircle, BarChart3, TrendingUp } from 'lucide-react';

interface QuizAttempt {
    _id: string;
    userId: string | { _id: string; name: string; };
    quizId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpentMinutes: number;
    startedAt: string;
    completedAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    answers: Array<{
        questionIndex: number;
        selectedOption: number;
        isCorrect: boolean;
    }>;
}

interface QuestionStats {
    questionIndex: number;
    questionText: string;
    correctCount: number;
    incorrectCount: number;
    correctPercentage: number;
    options: Array<{
        text: string;
        selectedCount: number;
        isCorrect: boolean;
    }>;
}

export function TeacherQuizResultsOverview() {
    const { navigateTo, currentParams } = useNavigation();
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [quiz, setQuiz] = useState<any>(null);
    const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quizId = currentParams?.quizId;
                console.log('TeacherQuizResultsOverview - quizId:', quizId);
                console.log('quizId type:', typeof quizId);
                console.log('quizId length:', quizId?.length);

                if (!quizId) {
                    setError('Không tìm thấy quiz ID');
                    setLoading(false);
                    return;
                }

                // Fetch quiz details
                const quizResponse = await axios.get(
                    `http://localhost:9000/api/quizzes/${quizId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );

                setQuiz(quizResponse.data?.data);
                console.log('Quiz data from API:', quizResponse.data?.data);
                console.log('Quiz questions:', quizResponse.data?.data?.questions);
                console.log('Type of questions:', typeof quizResponse.data?.data?.questions);
                console.log('Is questions an array?', Array.isArray(quizResponse.data?.data?.questions));

                // Fetch all attempts for this quiz
                const attemptsResponse = await axios.get(
                    `http://localhost:9000/api/quizzes/${quizId}/attempts`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );

                const attemptsData = attemptsResponse.data?.data?.attempts || [];
                console.log('Attempts data from API:', attemptsResponse.data?.data);
                console.log('Attempts array from API:', attemptsData);
                console.log('Type of attemptsData:', typeof attemptsData);
                console.log('Is attemptsData an array?', Array.isArray(attemptsData));

                // Log structure of first attempt to check userId
                if (attemptsData.length > 0) {
                    console.log('First attempt structure:', attemptsData[0]);
                    console.log('First attempt userId:', attemptsData[0].userId);
                    console.log('First attempt user._id:', attemptsData[0].user?._id);
                    console.log('First attempt user.id:', attemptsData[0].user?.id);
                }

                setAttempts(attemptsData);

                setLoading(false);
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError(error.response?.data?.message || 'Không thể tải dữ liệu');
                setLoading(false);
            }
        };

        fetchData();
    }, [currentParams?.quizId]);

    // Calculate question statistics from best attempts when attempts change
    useEffect(() => {
        if (attempts.length > 0) {
            console.log('Calculating question stats from best attempts:', bestAttemptsByUser.length);
            const stats = calculateQuestionStats(bestAttemptsByUser, quiz?.questions || []);
            setQuestionStats(stats);
        }
    }, [attempts, quiz]);

    const calculateQuestionStats = (attempts: QuizAttempt[], questions: any[]): QuestionStats[] => {
        if (!Array.isArray(attempts) || attempts.length === 0 || !Array.isArray(questions) || questions.length === 0) {
            return [];
        }

        return questions.map((question, index) => {
            const correctCount = attempts.filter(attempt =>
                attempt.answers[index]?.isCorrect
            ).length;

            const incorrectCount = attempts.length - correctCount;
            const correctPercentage = attempts.length > 0 ? (correctCount / attempts.length) * 100 : 0;

            // Calculate option statistics
            const options = Array.isArray(question.options) ? question.options.map((option: any, optIndex: number) => {
                const selectedCount = attempts.filter(attempt =>
                    attempt.answers[index]?.selectedOption === optIndex
                ).length;

                return {
                    text: option.text || '',
                    selectedCount,
                    isCorrect: option.isCorrect || false
                };
            }) : [];

            return {
                questionIndex: index,
                questionText: question.text || `Câu ${index + 1}`,
                correctCount,
                incorrectCount,
                correctPercentage,
                options
            };
        });
    };

    const sortedAttempts = Array.isArray(attempts) ? [...attempts].sort((a, b) => b.score - a.score) : [];

    // Chỉ lấy lần làm cao nhất của mỗi sinh viên
    const bestAttemptsByUser = Array.isArray(attempts) ? attempts.reduce((acc: any[], attempt) => {
        // userId có thể là string hoặc object có _id
        const attemptUserId = typeof attempt.userId === 'string'
            ? attempt.userId
            : attempt.userId?._id || attempt.userId;

        const existingUserIndex = acc.findIndex(item => {
            const itemUserId = typeof item.userId === 'string'
                ? item.userId
                : item.userId?._id || item.userId;
            return itemUserId === attemptUserId;
        });

        if (existingUserIndex === -1) {
            acc.push(attempt);
        } else if (attempt.score > acc[existingUserIndex].score) {
            acc[existingUserIndex] = attempt;
        }
        return acc;
    }, []).sort((a, b) => b.score - a.score) : [];

    // Log để kiểm tra kết quả lọc
    console.log('Original attempts count:', attempts.length);
    console.log('Best attempts by user count:', bestAttemptsByUser.length);
    console.log('Best attempts:', bestAttemptsByUser.map(a => ({
        userId: typeof a.userId === 'string' ? a.userId : a.userId?._id,
        userName: a.user?.name || a.userId?.name,
        score: a.score
    })));

    const getGradeColor = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-800';
        if (score >= 80) return 'bg-blue-100 text-blue-800';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800';
        if (score >= 60) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getGradeText = (score: number) => {
        if (score >= 90) return 'Xuất sắc';
        if (score >= 80) return 'Giỏi';
        if (score >= 70) return 'Khá';
        if (score >= 60) return 'Trung bình';
        return 'Cần cải thiện';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center justify-center h-32">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={() => navigateTo('content')}>
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigateTo('content')}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{quiz?.title || 'Quiz Overview'}</h1>
                        <p className="text-muted-foreground">Thống kê kết quả sinh viên</p>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng số sinh viên</p>
                                    <p className="text-2xl font-bold">{Array.isArray(bestAttemptsByUser) ? bestAttemptsByUser.length : 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                                    <p className="text-2xl font-bold">
                                        {Array.isArray(bestAttemptsByUser) && bestAttemptsByUser.length > 0 ? Math.round(bestAttemptsByUser.reduce((sum, a) => sum + a.score, 0) / bestAttemptsByUser.length) : 0}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Điểm cao nhất</p>
                                    <p className="text-2xl font-bold">{Array.isArray(bestAttemptsByUser) && bestAttemptsByUser.length > 0 ? Math.max(...bestAttemptsByUser.map(a => a.score)) : 0}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Hoàn thành</p>
                                    <p className="text-2xl font-bold">{Array.isArray(bestAttemptsByUser) ? bestAttemptsByUser.length : 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rankings */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Bảng xếp hạng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bestAttemptsByUser.map((attempt, index) => (
                                <div key={attempt._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                            index === 1 ? 'bg-gray-100 text-gray-800' :
                                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-50 text-gray-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{attempt.user?.name || attempt.userId?.name || attempt.user?.username || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">{attempt.user?.email || attempt.user?.username || ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{attempt.score}%</p>
                                            <p className="text-sm text-muted-foreground">{attempt.correctAnswers}/{attempt.totalQuestions} đúng</p>
                                        </div>
                                        <Badge className={getGradeColor(attempt.score)}>
                                            {getGradeText(attempt.score)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Question Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Thống kê theo câu hỏi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {questionStats.map((stat, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium mb-2">Câu {index + 1}: {stat.questionText}</h4>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    {stat.correctCount} đúng ({stat.correctPercentage.toFixed(1)}%)
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                    {stat.incorrectCount} sai
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground mb-1">Tỷ lệ đúng</div>
                                            <div className="text-lg font-bold text-green-600">{stat.correctPercentage.toFixed(1)}%</div>
                                        </div>
                                    </div>

                                    <Progress value={stat.correctPercentage} className="mb-4" />

                                    <div className="grid grid-cols-2 gap-2">
                                        {stat.options.map((option, optIndex) => (
                                            <div key={optIndex} className={`p-2 rounded border ${option.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{option.text}</span>
                                                    <div className="flex items-center gap-2">
                                                        {option.isCorrect && <CheckCircle className="w-3 h-3 text-green-600" />}
                                                        <span className="text-xs text-muted-foreground">{option.selectedCount} lượt chọn</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default TeacherQuizResultsOverview;
