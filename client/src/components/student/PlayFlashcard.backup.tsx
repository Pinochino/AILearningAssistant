import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useNavigation } from '../../hooks/useNavigation';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, Shuffle, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardData {
    id: string;
    front: string;
    back: string;
}

export function PlayFlashcard() {
    const { navigateTo, currentParams } = useNavigation();
    const [flashcard, setFlashcard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
    const [difficultCards, setDifficultCards] = useState<Set<string>>(new Set());
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [showSummary, setShowSummary] = useState(false);
    const [startTime] = useState(Date.now());
    const [flashcardAttempt, setFlashcardAttempt] = useState<any>(null);

    // Fetch flashcard data from API
    useEffect(() => {
        const fetchFlashcardData = async () => {
            console.log('CurrentParams:', currentParams);

            try {
                const flashcardId = currentParams?.flashcardId;
                console.log('FlashcardId from params:', flashcardId);

                if (!flashcardId) {
                    setError('Không tìm thấy flashcard ID');
                    setLoading(false);
                    return;
                }

                console.log('Fetching flashcard data for ID:', flashcardId);
                const response = await axios.get(`http://localhost:9000/api/flashcard-sets/${flashcardId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                console.log('Flashcard API response:', response.data);
                const flashcardData = response.data?.data;

                if (!flashcardData) {
                    setError('Không tìm thấy flashcard');
                    setLoading(false);
                    return;
                }

                // Set flashcard info
                setFlashcard({
                    title: flashcardData.title || 'Flashcard',
                    difficulty: flashcardData.difficulty || 'Trung bình',
                    cards: flashcardData.totalCards || flashcardData.flashcards?.length || 0,
                    chapterNames: flashcardData.chapters?.map((ch: any) => ch.title) || [],
                    tags: flashcardData.tags || []
                });

                // Convert flashcards to the expected format
                const formattedCards = flashcardData.flashcards?.map((card: any, index: number) => ({
                    id: card._id || index.toString(),
                    front: card.front || '',
                    back: card.back || ''
                })) || [];

                console.log('Formatted cards:', formattedCards);
                setCards(formattedCards);
                setLoading(false);
            } catch (error: any) {
                console.error('Error fetching flashcard:', error);
                setError(error.response?.data?.message || 'Không thể tải flashcard');
                setLoading(false);
            }
        };

        fetchFlashcardData();
    }, [currentParams?.flashcardId]);

    const currentCardData = cards[currentCard] || { id: '', front: '', back: '' };
    const progress = cards.length > 0 ? Math.round(((currentCard + 1) / cards.length) * 100) : 0;

    const handleFlip = () => setIsFlipped(!isFlipped);
    const handleNext = () => {
        if (currentCard < cards.length - 1) {
            setCurrentCard(currentCard + 1);
            setIsFlipped(false);
        } else {
            setShowSummary(true); // Chuyển sang màn hình kết quả
        }
    };
    const handlePrev = () => {
        if (currentCard > 0) {
            setCurrentCard(currentCard - 1);
            setIsFlipped(false);
        }
    };
    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentCard(0);
        setIsFlipped(false);
    };
    const handleMastered = () => {
        setMasteredCards(new Set([...masteredCards, currentCardData.id]));
        handleNext();
    };
    const handleDifficult = () => {
        setDifficultCards(new Set([...difficultCards, currentCardData.id]));
        handleNext();
    };
    const handleReset = () => {
        setCurrentCard(0);
        setIsFlipped(false);
        setMasteredCards(new Set());
        setDifficultCards(new Set());
        setShowSummary(false);
        setFlashcardAttempt(null);
    };

    const submitFlashcardAttempt = async () => {
        try {
            const flashcardSetId = currentParams?.flashcardId;
            if (!flashcardSetId) return;

            const endTime = Date.now();
            const timeSpentMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));

            // Tạo cards array với kết quả từng thẻ
            const cardsData = cards.map((card, index) => ({
                cardIndex: index,
                isCorrect: masteredCards.has(card.id),
                timeSpentSeconds: 0, // Có thể thêm logic tracking thởi gian từng thẻ
                difficulty: 'medium' as const
            }));

            const score = Math.round((masteredCards.size / cards.length) * 100);

            const attemptData: any = {
                flashcardSetId,
                cards: cardsData,
                timeSpentMinutes,
                startedAt: new Date(startTime).toISOString(),
                sessionId: `session_${Date.now()}`
            };

            console.log('=== Flashcard Attempt Data ===');
            console.log('flashcardSetId:', flashcardSetId);
            console.log('cards:', cardsData);
            console.log('cards length:', cardsData.length);
            console.log('timeSpentMinutes:', timeSpentMinutes);
            console.log('startedAt:', attemptData.startedAt);
            console.log('sessionId:', attemptData.sessionId);
            console.log('Full attemptData:', attemptData);

            const response = await axios.post(
                `http://localhost:9000/api/flashcards/${flashcardSetId}/submit`,
                attemptData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );

            console.log('Flashcard attempt saved:', response.data);
            setFlashcardAttempt(response.data.data);

            // Dispatch custom event to notify parent component to refresh attempts
            window.dispatchEvent(new CustomEvent('flashcardAttemptSaved', {
                detail: {
                    flashcardSetId,
                    attempt: response.data.data
                }
            }));

        } catch (error: any) {
            console.error('Error saving flashcard attempt:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
                console.error('Status:', error.response.status);
            }
        }
    };

    useEffect(() => {
        if (showSummary && !flashcardAttempt) {
            submitFlashcardAttempt();
        }
    }, [showSummary]);

    // ===== LOADING AND ERROR STATES =====
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

    if (error) {
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

    // ===== SUMMARY SCREEN =====
    if (showSummary) {
        const masteredCount = masteredCards.size;
        const difficultCount = difficultCards.size;
        const total = cards.length;
        const percent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'flashcard' })}
                        className="mb-6 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </Button>

                    {/* Results Card */}
                    <Card className="mb-8 shadow-xl rounded-3xl">
                        <CardContent className="p-12 text-center">
                            <h1 className="text-2xl font-semibold mb-4 pb-8 mt-6">Hoàn thành Flashcard!</h1>
                            <p className="text-black mb-6">{flashcard?.title}</p>

                            {/* Progress */}
                            <div className="mb-8 text-center">
                                <p className="text-gray-700 text-sm mb-2">Tỷ lệ ghi nhớ: {percent}%</p>
                                <Progress value={percent} className="h-2 max-w-md mx-auto mb-6" />
                            </div>

                            {/* Stats Grid */}
                            <div className="mb-8 mt-6">
                                <div className="inline-flex justify-center gap-6 w-full max-w-xs mx-auto">
                                    {/* Đã thuộc */}
                                    <div className="rounded-xl p-4 text-center border bg-green-50 border-green-200 shadow-sm w-56">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <div className="text-xl font-semibold text-green-700">{masteredCount}</div>
                                        </div>
                                        <div className="text-sm text-green-700 font-medium">Đã thuộc</div>
                                    </div>

                                    {/* Cần ôn lại */}
                                    <div className="rounded-xl p-4 text-center border bg-orange-50 border-orange-200 shadow-sm w-56">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <RotateCcw className="w-4 h-4 text-orange-600" />
                                            <div className="text-xl font-semibold text-orange-700">{difficultCount}</div>
                                        </div>
                                        <div className="text-sm text-orange-700 font-medium">Cần ôn lại</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-6 max-w-md mx-auto mt-6 pb-2">
                                <Button
                                    onClick={handleReset}
                                    className="flex-1 max-w-[200px] gap-2 py-3 rounded-xl"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Học lại từ đầu
                                </Button>
                                <Button
                                    onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'flashcard' })}
                                    variant="outline"
                                    className="flex-1 max-w-[200px] py-3 rounded-xl"
                                >
                                    Quay lại danh sách
                                </Button>
                            </div>

                            {/* Chi tiết các thẻ */}
                            <div className="mt-8 space-y-6">
                                {/* Đã thuộc */}
                                {masteredCards.size > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                            <Check className="w-5 h-5" />
                                            Đã thuộc ({masteredCards.size})
                                        </h3>
                                        <div className="space-y-2">
                                            {Array.from(masteredCards).map(cardId => {
                                                const card = cards.find(c => c.id === cardId);
                                                return card ? (
                                                    <div key={cardId} className="bg-white rounded-lg p-3 border border-green-300">
                                                        <p className="text-sm font-medium text-gray-800">{card.front}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{card.back}</p>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Cần ôn lại */}
                                {difficultCards.size > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                                            <RotateCcw className="w-5 h-5" />
                                            Cần ôn lại ({difficultCards.size})
                                        </h3>
                                        <div className="space-y-2">
                                            {Array.from(difficultCards).map(cardId => {
                                                const card = cards.find(c => c.id === cardId);
                                                return card ? (
                                                    <div key={cardId} className="bg-white rounded-lg p-3 border border-orange-300">
                                                        <p className="text-sm font-medium text-gray-800">{card.front}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{card.back}</p>
                                                        backfaceVisibility: 'hidden',
                                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                        transition: 'transform 0.6s',
                                                        opacity: isFlipped ? 0 : 1,
                                                        padding: '2rem',
                                                        textAlign: 'center',
                                                        maxWidth: '100%',
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'break-word'
                            }}>
                                                        <div style={{
                                                            width: '100%',
                                                            maxWidth: '90%',
                                                            margin: '0 auto',
                                                            padding: '1rem 2rem',
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word',
                                                            lineHeight: '1.6'
                                                        }}>
                                                            <h2 className="text-2xl font-semibold leading-relaxed" style={{
                                                                background: 'linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)',
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                                backgroundClip: 'text',
                                                                margin: 0,
                                                                padding: '0.5rem 0'
                                                            }}>
                                                                {currentCardData.front}
                                                            </h2>
                                                            <div className="mt-6 text-base font-medium flex items-center justify-center gap-2 text-indigo-600 whitespace-nowrap">
                                                                <EyeOff className="w-5 h-5 flex-shrink-0" />
                                                                Mặt sau
                                                            </div>
                                                        </div>

                                                        {/* Back side */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backfaceVisibility: 'hidden',
                                                            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                                                            transition: 'transform 0.6s',
                                                            opacity: isFlipped ? 1 : 0,
                                                            padding: '2rem',
                                                            textAlign: 'center',
                                                            transformStyle: 'preserve-3d',
                                                            maxWidth: '100%',
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word'
                                                        }}>
                                                            <div style={{
                                                                width: '100%',
                                                                maxWidth: '90%',
                                                                margin: '0 auto',
                                                                padding: '1rem 2rem',
                                                                wordBreak: 'break-word',
                                                                overflowWrap: 'break-word',
                                                                lineHeight: '1.6',
                                                                transform: 'rotateY(180deg)'
                                                            }}>
                                                                <h2 className="text-2xl font-bold leading-relaxed" style={{
                                                                    margin: 0,
                                                                    background: 'linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)',
                                                                    WebkitBackgroundClip: 'text',
                                                                    WebkitTextFillColor: 'transparent',
                                                                    backgroundClip: 'text',
                                                                    padding: '0.5rem 0'
                                                                }}>
                                                                    {currentCardData.back}
                                                                </h2>
                                                                <div className="mt-6 text-base font-semibold flex items-center justify-center gap-2 text-gray-700 whitespace-nowrap">
                                                                    <Eye className="w-5 h-5 flex-shrink-0" />
                                                                    Mặt trước
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </div>
                                    </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

                        {/* Navigation Buttons */ }
        <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-4 pt-4">
            <Button
                onClick={handlePrev}
                disabled={currentCard === 0}
                variant="outline"
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(4px)'
                }}
                className="px-6 py-3 hover:bg-opacity-40 transition-all duration-200 font-medium"
            >
                <ChevronLeft className="w-5 h-5 mr-2" /> Trước
            </Button>

            {isFlipped && (
                <>
                    <Button
                        onClick={handleDifficult}
                        variant="outline"
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: 'white',
                            backdropFilter: 'blur(4px)'
                        }}
                        className="px-6 py-3 hover:bg-opacity-50 transition-all duration-200 font-medium"
                    >
                        <X className="w-5 h-5 mr-2" /> Chưa thuộc
                    </Button>

                    <Button
                        onClick={handleMastered}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        className="px-6 py-3 hover:opacity-95 hover:shadow-md transition-all duration-200 font-medium"
                    >
                        <Check className="w-5 h-5 mr-2" /> Đã thuộc
                    </Button>
                </>
            )}

            <Button
                onClick={currentCard === cards.length - 1 ? () => setShowSummary(true) : handleNext}
                variant="outline"
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(4px)'
                }}
                className="px-6 py-3 hover:bg-opacity-40 transition-all duration-200 font-medium"
            >
                {currentCard === cards.length - 1 ? "Kết thúc" : "Sau"} <ChevronRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
                onClick={handleShuffle}
                variant="outline"
                style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: 'white',
                    backdropFilter: 'blur(4px)'
                }}
                className="px-6 py-3 hover:bg-opacity-40 transition-all duration-200"
            >
                <Shuffle className="w-4 h-4 mr-2" /> Xáo trộn
            </Button>
        </div>
                </div >
            </div >
        );
    }

    export default PlayFlashcard;