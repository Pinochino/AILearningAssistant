import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useNavigation } from '../../hooks/useNavigation';
import { ChevronLeft, Trophy, Users, CheckCircle, XCircle, BarChart3, TrendingUp, Brain } from 'lucide-react';

interface FlashcardAttempt {
    _id: string;
    userId: string | { _id: string; name: string; };
    flashcardSetId: string;
    score: number;
    totalCards: number;
    correctCards: number;
    incorrectCards: number;
    timeSpentMinutes: number;
    startedAt: string;
    completedAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    cards: Array<{
        cardIndex: number;
        isCorrect: boolean;
        timeSpentSeconds: number;
        difficulty: string;
    }>;
}

interface FlashcardStats {
    cardIndex: number;
    frontText: string;
    backText: string;
    correctCount: number;
    incorrectCount: number;
    correctPercentage: number;
    averageTimeSpent: number;
}

export function TeacherFlashcardResultsOverview() {
    const { navigateTo, currentParams } = useNavigation();
    const [attempts, setAttempts] = useState<FlashcardAttempt[]>([]);
    const [flashcardSet, setFlashcardSet] = useState<any>(null);
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [flashcardStats, setFlashcardStats] = useState<FlashcardStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const flashcardId = currentParams?.flashcardId;
                console.log('Client flashcardId from params:', flashcardId);
                if (!flashcardId) {
                    setError('Không tìm thấy flashcard ID');
                    setLoading(false);
                    return;
                }

                // Fetch flashcard set details
                const flashcardResponse = await axios.get(
                    `http://localhost:9000/api/flashcard-sets/${flashcardId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );

                const flashcardData = flashcardResponse.data?.data;
                setFlashcardSet(flashcardData);
                setFlashcards(flashcardData.flashcards || []);

                // Fetch all attempts for this flashcard set
                console.log('Fetching attempts from API...');
                let attemptsResponse;
                try {
                    attemptsResponse = await axios.get(
                        `http://localhost:9000/api/flashcards/${flashcardId}/attempts`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                            }
                        }
                    );
                    console.log('Attempts API response status:', attemptsResponse.status);
                    console.log('Attempts API response data:', attemptsResponse.data);
                } catch (attemptsError: any) {
                    console.error('Error fetching attempts:', attemptsError);
                    console.error('Error response:', attemptsError.response?.data);
                    console.error('Error status:', attemptsError.response?.status);
                }

                const attemptsData = attemptsResponse?.data?.data?.attempts || [];
                console.log('Flashcard attempts data from API:', attemptsResponse?.data?.data);
                console.log('Flashcard attempts array from API:', attemptsData);
                console.log('Type of attemptsData:', typeof attemptsData);
                console.log('Is attemptsData an array?', Array.isArray(attemptsData));

                // Log structure of first attempt to check userId
                if (attemptsData.length > 0) {
                    console.log('First flashcard attempt structure:', attemptsData[0]);
                    console.log('First flashcard attempt userId:', attemptsData[0].userId);
                    console.log('First flashcard attempt user._id:', attemptsData[0].user?._id);
                    console.log('First flashcard attempt user.id:', attemptsData[0].user?.id);
                    console.log('First flashcard attempt cards:', attemptsData[0].cards);
                    console.log('First flashcard attempt cards length:', attemptsData[0].cards?.length);
                    console.log('First flashcard attempt cards structure:', JSON.stringify(attemptsData[0].cards, null, 2));
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
    }, [currentParams?.flashcardId]);

    // Calculate flashcard statistics from best attempts when attempts change
    useEffect(() => {
        if (attempts.length > 0 && flashcardSet) {
            console.log('Calculating flashcard stats from best attempts:', bestAttemptsByUser.length);
            const stats = calculateFlashcardStats(bestAttemptsByUser, flashcardSet.flashcards || []);
            setFlashcardStats(stats);
        }
    }, [attempts, flashcardSet]);

    const calculateFlashcardStats = (attempts: FlashcardAttempt[], flashcards: any[]): FlashcardStats[] => {
        if (!Array.isArray(attempts) || attempts.length === 0 || !Array.isArray(flashcards)) {
            return [];
        }

        return flashcards.map((flashcard, index) => {
            console.log(`Processing card ${index}:`, flashcard);
            const cardAttempts = attempts.map(attempt => {
                console.log(`Attempt ${attempt.userId} cards:`, attempt.cards);
                return attempt.cards?.find(card => card.cardIndex === index);
            }).filter(card => card !== undefined);

            console.log(`Card ${index} attempts:`, cardAttempts);

            const correctCount = cardAttempts.filter(card => card?.isCorrect).length;
            const incorrectCount = cardAttempts.length - correctCount;
            const correctPercentage = cardAttempts.length > 0 ? (correctCount / cardAttempts.length) * 100 : 0;

            const averageTimeSpent = cardAttempts.length > 0
                ? cardAttempts.reduce((sum, card) => sum + (card?.timeSpentSeconds || 0), 0) / cardAttempts.length
                : 0;

            return {
                cardIndex: index,
                frontText: flashcard.front,
                backText: flashcard.back,
                correctCount,
                incorrectCount,
                correctPercentage,
                averageTimeSpent
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
    console.log('Original flashcard attempts count:', attempts.length);
    console.log('Best flashcard attempts by user count:', bestAttemptsByUser.length);
    console.log('Best flashcard attempts:', bestAttemptsByUser.map(a => ({
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

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
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
                        <h1 className="text-2xl font-bold">{flashcardSet?.title || 'Flashcard Overview'}</h1>
                        <p className="text-muted-foreground">Thống kê kết quả ôn tập sinh viên</p>
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
                                <Brain className="w-5 h-5 text-purple-600" />
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
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Thời gian TB</p>
                                    <p className="text-2xl font-bold">
                                        {Array.isArray(bestAttemptsByUser) && bestAttemptsByUser.length > 0 ? Math.round(bestAttemptsByUser.reduce((sum, a) => sum + a.timeSpentMinutes, 0) / bestAttemptsByUser.length) : 0}m
                                    </p>
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
                                            <p className="text-sm text-muted-foreground">{attempt.correctCards}/{attempt.totalCards} thuộc</p>
                                        </div>
                                        <Badge className={getGradeColor(attempt.score)}>
                                            {getGradeText(attempt.score)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card >

                {/* Flashcard Statistics */}
                < Card >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Thống kê theo thẻ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {flashcardStats.map((stat, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium mb-2">Thẻ {index + 1}</h4>
                                            <div className="bg-gray-50 rounded p-3 mb-3">
                                                <p className="text-sm font-medium text-gray-800 mb-1">Mặt trước:</p>
                                                <p className="text-sm text-gray-600 mb-2">{stat.frontText}</p>
                                                <p className="text-sm font-medium text-gray-800 mb-1">Mặt sau:</p>
                                                <p className="text-sm text-gray-600">{stat.backText}</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    {stat.correctCount} thuộc ({stat.correctPercentage.toFixed(1)}%)
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                    {stat.incorrectCount} chưa thuộc
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                                    TB: {formatTime(stat.averageTimeSpent)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground mb-1">Tỷ lệ thuộc</div>
                                            <div className="text-lg font-bold text-green-600">{stat.correctPercentage.toFixed(1)}%</div>
                                        </div>
                                    </div>

                                    <Progress value={stat.correctPercentage} className="mb-4" />

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-2 bg-green-50 rounded">
                                            <div className="text-lg font-bold text-green-600">{stat.correctCount}</div>
                                            <div className="text-xs text-muted-foreground">Đã thuộc</div>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 rounded">
                                            <div className="text-lg font-bold text-red-600">{stat.incorrectCount}</div>
                                            <div className="text-xs text-muted-foreground">Chưa thuộc</div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 rounded">
                                            <div className="text-lg font-bold text-blue-600">{formatTime(stat.averageTimeSpent)}</div>
                                            <div className="text-xs text-muted-foreground">Thời gian TB</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card >
            </div >
        </div >
    );
}

export default TeacherFlashcardResultsOverview;
