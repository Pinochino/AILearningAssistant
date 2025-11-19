import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ChevronLeft, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import axios from 'axios';

const QuizAttemptReview = () => {
    const { navigateTo, currentParams } = useNavigation();
    const [attempt, setAttempt] = useState<any>(null);
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔍 Debug - QuizAttemptReview mounted');
        console.log('🔍 Debug - currentParams:', currentParams);
        console.log('🔍 Debug - currentParams.attemptId:', currentParams.attemptId);
        fetchAttemptData();
    }, [currentParams.attemptId]);

    const fetchAttemptData = async () => {
        console.log('🔍 Debug - fetchAttemptData called');
        if (!currentParams.attemptId) {
            console.log('🔍 Debug - No attemptId found');
            setError('Không tìm thấy ID lần làm');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('🔍 Debug - Fetching attempt with ID:', currentParams.attemptId);
            const response = await axios.get(
                `http://localhost:9000/api/quizzes/attempts/${currentParams.attemptId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            console.log('🔍 Debug - Attempt response:', response);
            const attemptData = response.data.data;
            console.log('🔍 Debug - Attempt data:', attemptData);
            setAttempt(attemptData);
            setQuiz(attemptData.quizId);
        } catch (error: any) {
            console.error('🔍 Debug - Error fetching attempt:', error);
            setError(error?.response?.data?.message || 'Không thể tải dữ liệu lần làm');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours} giờ ${mins} phút`;
        }
        return `${mins} phút`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 90) return { grade: 'Xuất sắc', color: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 80) return { grade: 'Giỏi', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (percentage >= 70) return { grade: 'Khá', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        if (percentage >= 60) return { grade: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50' };
        return { grade: 'Yếu', color: 'text-red-600', bg: 'bg-red-50' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })} variant="outline">
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    if (!attempt || !quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không tìm thấy dữ liệu</p>
                    <Button onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })} variant="outline">
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    const gradeInfo = getGrade(attempt.score);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })}
                    className="mb-6 flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại
                </Button>

                {/* Header */}
                <Card className="mb-6" style={{ marginBottom: '3rem' }}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
                                <p className="text-muted-foreground mb-4">{quiz.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>Lúc làm: {formatDate(attempt.completedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Thời gian: {formatTime(attempt.timeSpentMinutes)}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge className={gradeInfo.bg + ' ' + gradeInfo.color}>
                                {gradeInfo.grade}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Score Overview */}
                <Card className="mb-6" style={{ marginBottom: '3rem' }}>
                    <CardContent className="p-6">
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold mb-6">Kết quả</h2>
                            <div className="grid grid-cols-3 items-center gap-8 px-12">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">{attempt.score}%</div>
                                    <div className="text-sm text-muted-foreground">Điểm số</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold text-green-600 mb-2">{attempt.correctAnswers}</div>
                                    <div className="text-sm text-muted-foreground">Đúng</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold text-red-600 mb-2">{attempt.totalQuestions - attempt.correctAnswers}</div>
                                    <div className="text-sm text-muted-foreground">Sai</div>
                                </div>
                            </div>
                        </div>
                        <Progress value={attempt.score} className="h-3" />
                    </CardContent>
                </Card>

                {/* Question Review */}
                <div className="space-y-4" style={{ marginTop: '3rem' }}>
                    <h2 className="text-xl font-semibold mb-4">Chi tiết các câu hỏi</h2>
                    {quiz.questions?.map((question: any, index: number) => {
                        const answer = attempt.answers.find((a: any) => a.questionIndex === index);
                        const userAnswer = answer?.selectedAnswer;
                        const isCorrect = answer?.isCorrect;
                        const correctAnswer = answer?.correctAnswer ?? question.correctAnswer;

                        return (
                            <Card
                                key={question._id || index}
                                className={`overflow-hidden transition-all duration-200 ${isCorrect
                                    ? 'border-l-4 border-l-green-500'
                                    : userAnswer === -1
                                        ? 'border-l-4 border-l-gray-400'
                                        : 'border-l-4 border-l-red-500'
                                    }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        {isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : userAnswer === -1 ? (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <div className="mb-2">
                                                <span className="text-sm text-muted-foreground">Câu {index + 1}</span>
                                            </div>
                                            <p className="mb-3 font-medium">{question.question}</p>

                                            <div className="space-y-2 mb-3">
                                                {question.answers?.map((ans: string, ansIndex: number) => (
                                                    <div
                                                        key={ansIndex}
                                                        className={`p-3 rounded-lg border ${ansIndex === correctAnswer
                                                            ? 'bg-green-50 border-green-300'
                                                            : ansIndex === userAnswer && userAnswer !== -1
                                                                ? 'bg-red-50 border-red-300'
                                                                : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {ansIndex === correctAnswer && (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            )}
                                                            {ansIndex === userAnswer && userAnswer !== -1 && !isCorrect && (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            )}
                                                            <span className="text-sm">{ans}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {userAnswer !== -1 && (
                                                <div className={`text-sm p-2 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    <span className="font-medium">
                                                        {isCorrect ? 'Bạn đã trả lời đúng!' : 'Bạn đã trả lời sai'}
                                                    </span>
                                                </div>
                                            )}

                                            {userAnswer === -1 && (
                                                <div className="text-sm p-2 rounded bg-gray-100 text-gray-700">
                                                    <span className="font-medium">Bạn đã bỏ qua câu hỏi này</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizAttemptReview;
