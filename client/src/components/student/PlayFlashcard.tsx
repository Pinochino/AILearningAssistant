import React, { useState, useEffect, useRef } from 'react';

// Add Web Audio API type declarations
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useNavigation } from '../../hooks/useNavigation';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Eye, EyeOff, Maximize2, Minimize2, RotateCcw, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardData {
    id: string;
    front: string;
    back: string;
}

export function PlayFlashcard() {
    const { navigateTo, currentParams } = useNavigation();
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
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
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Initialize audio context on first user interaction
    useEffect(() => {
        const handleInitAudio = () => {
            if (!audioContext) {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                setAudioContext(context);
            }
        };

        // Add event listener for first interaction
        document.addEventListener('click', handleInitAudio, { once: true });

        return () => {
            document.removeEventListener('click', handleInitAudio);
        };
    }, [audioContext]);
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    // Sound effect function
    const playSound = (type: 'flip' | 'correct' | 'wrong' | 'complete' | 'click' | 'next' | 'back') => {
        if (!audioContext) return;

        const context = audioContext;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        // Different sound patterns for different actions
        switch (type) {
            case 'flip':
                // Upward slide sound for flip
                oscillator.frequency.setValueAtTime(240, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(580, context.currentTime + 0.2);
                break;
            case 'correct':
                // Happy chime for correct answer
                oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
                break;
            case 'wrong':
                // Sad sound for wrong answer
                oscillator.frequency.setValueAtTime(349.23, context.currentTime); // F4
                oscillator.frequency.setValueAtTime(293.66, context.currentTime + 0.1); // D4
                break;
            case 'complete':
                // Victory sound for completion
                oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
                oscillator.frequency.setValueAtTime(1046.50, context.currentTime + 0.3); // C6
                break;
            case 'click':
                // Short click sound
                oscillator.frequency.setValueAtTime(1000, context.currentTime);
                break;
            case 'next':
            case 'back':
                // Navigation sound
                const baseFreq = type === 'next' ? 440 : 350; // Higher for next, lower for back
                oscillator.frequency.setValueAtTime(baseFreq, context.currentTime);
                break;
        }

        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    };

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

    const handleFlip = () => {
        playSound('flip');
        setIsFlipped(!isFlipped);
    };
    const handleNext = () => {
        playSound('next');
        if (currentCard < cards.length - 1) {
            setCurrentCard(currentCard + 1);
            setIsFlipped(false);
        } else {
            setShowSummary(true); // Chuyển sang màn hình kết quả
        }
    };
    const handlePrev = () => {
        if (currentCard > 0) {
            playSound('back');
        } else {
            playSound('click');
        }
        setCurrentCard(currentCard - 1);
        setIsFlipped(false);
    };

    const handleMastered = () => {
        playSound('correct');
        setMasteredCards(new Set([...masteredCards, currentCardData.id]));
        handleNext();
    };
    const handleDifficult = () => {
        playSound('wrong');
        setDifficultCards(new Set([...difficultCards, currentCardData.id]));
        handleNext();
    };
    const handleReset = () => {
        playSound('click');
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
                timeSpentSeconds: 0,
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
            playSound('complete');
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
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ===== MAIN FLASHCARD UI =====
    return (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fda085 100%)' }} className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} p-4`}>
            <div className={`${isFullscreen ? 'h-full flex flex-row items-center justify-center p-8 gap-12' : 'max-w-4xl mx-auto'}`}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                    className={`rounded-2xl p-6 text-white ${isFullscreen ? 'w-auto max-w-xs' : 'w-full mb-6'}`}
                >
                    <div className={`flex items-center ${isFullscreen ? 'gap-4' : 'justify-between'} mb-4`}>

                        <h1 className="text-2xl font-bold text-white">{flashcard?.title}</h1>


                        <div className="relative">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-30 transition-all z-50"
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    position: isFullscreen ? 'fixed' : 'relative',
                                    top: isFullscreen ? '20px' : '0',
                                    right: isFullscreen ? '20px' : '0'
                                }}
                                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                        </div>
                        <div style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} className="text-sm">
                            {flashcard?.difficulty || 'Trung bình'}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white text-opacity-90">
                            <span>Thẻ {currentCard + 1} của {cards.length}</span>
                            <span>{progress}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)' }} className="w-full rounded-full h-2">
                            <motion.div
                                style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 100%)' }}
                                className="h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </motion.div>
                {/* Flashcard */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1]
                            }
                        }}
                        exit={{
                            opacity: 0,
                            x: -50,
                            transition: {
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                            }
                        }}
                        className={`w-full ${isFullscreen ? 'w-[60%]' : 'max-w-3xl'} ${isFullscreen ? '' : 'mx-auto mb-8'}`}
                    >
                        {/* DIV FLIPPER CHA:*/}
                        <div
                            className="relative w-full cursor-pointer"
                            style={{
                                minHeight: '400px', // Bạn có thể dùng minHeight ở đây
                                transformStyle: 'preserve-3d',
                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                                transition: 'transform 0.6s',
                            }}
                            onClick={handleFlip}
                        >
                            {/* MẶT TRƯỚC:*/}
                            <div
                                className="absolute inset-0 w-full h-full p-8 flex flex-col items-center justify-center rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    backfaceVisibility: 'hidden',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    padding: '0 2rem',
                                    margin: '0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    flex: '1 0 auto',
                                    maxHeight: '100%'
                                }}>
                                    <h2
                                        style={{
                                            background: 'linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxHeight: '100%',
                                            overflowY: 'auto',
                                            fontSize: '1.25rem',
                                            lineHeight: '1.75rem',
                                            padding: '1.5rem',
                                            margin: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: '1 1 auto',
                                            minHeight: '0',
                                            width: '100%'
                                        }}
                                    >
                                        {currentCardData.front}
                                    </h2>
                                </div>
                                <div style={{
                                    padding: '1.5rem 0',
                                    textAlign: 'center',
                                    flexShrink: 0,
                                    width: '100%',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: '#4f46e5',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        padding: '0.5rem 0',
                                        margin: '0 auto',
                                        maxWidth: 'fit-content',
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem'
                                    }}>
                                        <EyeOff style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                                        Mặt sau
                                    </div>
                                </div>
                            </div>

                            {/* MẶT SAU:*/}
                            <div
                                className="absolute inset-0 w-full h-full p-8 flex flex-col items-center justify-center rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    padding: '0 2rem',
                                    margin: '0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    flex: '1 0 auto',
                                    maxHeight: '100%'
                                }}>
                                    <h2
                                        style={{
                                            background: 'linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxHeight: '100%',
                                            overflowY: 'auto',
                                            fontSize: '1.25rem',
                                            lineHeight: '1.75rem',
                                            padding: '1.5rem',
                                            margin: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: '1 1 auto',
                                            minHeight: '0',
                                            width: '100%'
                                        }}
                                    >
                                        {currentCardData.back}
                                    </h2>
                                </div>
                                <div style={{
                                    padding: '1.5rem 0',
                                    textAlign: 'center',
                                    flexShrink: 0,
                                    width: '100%',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: '#4f46e5',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        padding: '0.5rem 0',
                                        margin: '0 auto',
                                        maxWidth: 'fit-content',
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem'
                                    }}>
                                        <Eye style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                                        Mặt trước
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div style={{
                    width: isFullscreen ? 'auto' : '100%',
                    maxWidth: isFullscreen ? '300px' : '64rem',
                    margin: isFullscreen ? '0' : '2rem auto 0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1rem',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
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
                                className={`py-3 hover:bg-opacity-50 transition-all duration-200 font-medium px-6`}
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
                                className={`py-3 hover:opacity-95 hover:shadow-md transition-all duration-200 font-medium px-6`}
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

                </div>
            </div>
        </div>
    );
}

export default PlayFlashcard;