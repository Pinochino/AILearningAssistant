import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useNavigation } from '../../hooks/useNavigation';
import { ChevronLeft, Clock, Check, X, RotateCcw, User, CheckCircle, XCircle } from 'lucide-react';

interface FlashcardAttemptData {
    id: string;
    flashcardSetId: string;
    userId: string;
    classId: string;
    cards: Array<{
        cardIndex: number;
        isCorrect: boolean;
        timeSpentSeconds: number;
        difficulty: string;
    }>;
    score: number;
    totalCards: number;
    correctCards: number;
    incorrectCards: number;
    timeSpentMinutes: number;
    startedAt: string;
    completedAt: string;
    sessionId: string;
}

interface FlashcardData {
    _id?: string;
    id: string;
    front: string;
    back: string;
}

export function FlashcardAttemptReview() {
    const { navigateTo, currentParams } = useNavigation();
    const [attempt, setAttempt] = useState<FlashcardAttemptData | null>(null);
    const [flashcardSet, setFlashcardSet] = useState<any>(null);
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttemptData = async () => {
            try {
                const attemptId = currentParams?.attemptId;
                if (!attemptId) {
                    setError('Không tìm thấy attempt ID');
                    setLoading(false);
                    return;
                }

                // Fetch attempt by ID
                const attemptResponse = await axios.get(
                    `http://localhost:9000/api/flashcard-attempts/${attemptId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );

                console.log('=== Full API Response ===');
                console.log('Response status:', attemptResponse.status);
                console.log('Response data:', attemptResponse.data);
                console.log('Response data structure:', JSON.stringify(attemptResponse.data, null, 2));

                const attemptData = attemptResponse.data?.data?.attempt;
                console.log('=== Attempt Data from API ===');
                console.log('attemptData:', attemptData);
                console.log('attemptData.flashcardSet:', attemptData?.flashcardSet);
                console.log('attemptData.flashcardSetId:', attemptData?.flashcardSetId);
                console.log('Full structure:', JSON.stringify(attemptData, null, 2));

                if (!attemptData) {
                    setError('Chưa có lần ôn tập nào');
                    setLoading(false);
                    return;
                }

                setAttempt(attemptData);

                // Fetch flashcard set details
                // Handle multiple formats:
                // 1. flashcardSet as string (from backend response)
                // 2. flashcardSetId as string (not populated)
                // 3. flashcardSetId as object (populated) 
                // 4. flashcardSet as object (from latest endpoint)
                let flashcardSetId;

                if (typeof attemptData.flashcardSet === 'string') {
                    flashcardSetId = attemptData.flashcardSet;
                } else if (typeof attemptData.flashcardSetId === 'string') {
                    flashcardSetId = attemptData.flashcardSetId;
                } else if (attemptData.flashcardSetId?._id) {
                    flashcardSetId = attemptData.flashcardSetId._id;
                } else if (attemptData.flashcardSet?._id) {
                    flashcardSetId = attemptData.flashcardSet._id;
                }

                console.log('=== Flashcard Set ID Resolution ===');
                console.log('attemptData.flashcardSet (type):', typeof attemptData.flashcardSet);
                console.log('attemptData.flashcardSet:', attemptData.flashcardSet);
                console.log('attemptData.flashcardSetId (type):', typeof attemptData.flashcardSetId);
                console.log('attemptData.flashcardSetId:', attemptData.flashcardSetId);
                console.log('Final flashcardSetId:', flashcardSetId);

                if (!flashcardSetId) {
                    setError('Không tìm thấy flashcard set ID');
                    setLoading(false);
                    return;
                }

                const flashcardResponse = await axios.get(
                    `http://localhost:9000/api/flashcard-sets/${flashcardSetId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );

                const flashcardData = flashcardResponse.data?.data;
                setFlashcardSet(flashcardData);

                // Format flashcards
                const formattedCards = flashcardData.flashcards?.map((card: any, index: number) => ({
                    id: card._id || index.toString(),
                    front: card.front || '',
                    back: card.back || ''
                })) || [];

                setFlashcards(formattedCards);
                setLoading(false);

            } catch (error: any) {
                console.error('Error fetching attempt data:', error);
                setError(error.response?.data?.message || 'Không thể tải dữ liệu');
                setLoading(false);
            }
        };

        fetchAttemptData();
    }, [currentParams?.attemptId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center h-32">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'flashcard' })}>
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const masteredCards = attempt.cards ? attempt.cards.filter(card => card.isCorrect) : [];
    const difficultCards = attempt.cards ? attempt.cards.filter(card => !card.isCorrect) : [];

    const getGrade = (percentage: number) => {
        if (percentage >= 90) return { grade: 'Xuất sắc', color: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 80) return { grade: 'Giỏi', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (percentage >= 70) return { grade: 'Khá', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        if (percentage >= 60) return { grade: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50' };
        return { grade: 'Cần cải thiện', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const gradeInfo = getGrade(attempt.score);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'flashcards' })}
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
                                <h1 className="text-2xl font-bold mb-2">{flashcardSet?.title || 'Flashcard Review'}</h1>
                                <p className="text-muted-foreground mb-4">{flashcardSet?.description || 'Xem lại kết quả ôn tập flashcard'}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>Lúc làm: {new Date(attempt.completedAt).toLocaleString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Thời gian: {attempt.timeSpentMinutes} phút</span>
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
                                    <div className="text-2xl font-semibold text-green-600 mb-2">{attempt.correctCards}</div>
                                    <div className="text-sm text-muted-foreground">Đã thuộc</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-semibold text-red-600 mb-2">{attempt.incorrectCards}</div>
                                    <div className="text-sm text-muted-foreground">Cần ôn lại</div>
                                </div>
                            </div>
                        </div>
                        <Progress value={attempt.score} className="h-3" />
                    </CardContent>
                </Card>

                {/* Card Review */}
                <div className="space-y-4" style={{ marginTop: '3rem' }}>
                    <h2 className="text-xl font-semibold mb-4">Chi tiết các thẻ</h2>
                    {flashcards.map((flashcard, index) => {
                        const cardResult = attempt.cards.find((c: any) => c.cardIndex === index);
                        const isCorrect = cardResult?.isCorrect;

                        return (
                            <Card
                                key={flashcard._id || index}
                                className={`overflow-hidden transition-all duration-200 ${isCorrect
                                    ? 'border-l-4 border-l-green-500'
                                    : 'border-l-4 border-l-red-500'
                                    }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        {isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <div className="mb-2">
                                                <span className="text-sm text-muted-foreground">Thẻ {index + 1}</span>
                                            </div>
                                            <div className="mb-3">
                                                <p className="font-medium text-gray-800 mb-2">{flashcard.front}</p>
                                                <p className="text-sm text-gray-600">{flashcard.back}</p>
                                            </div>

                                            <div className={`text-sm p-2 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className="font-medium">
                                                    {isCorrect ? 'Bạn đã thuộc thẻ này!' : 'Bạn cần ôn lại thẻ này'}
                                                </span>
                                            </div>
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
}

export default FlashcardAttemptReview;
