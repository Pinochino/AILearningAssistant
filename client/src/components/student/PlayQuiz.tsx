import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, RotateCcw, Zap, Star, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

interface Quiz {
    _id: string;
    title: string;
    difficulty: string;
    duration?: number; // duration in minutes
    questions: Question[];
}

interface Question {
    _id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
}

interface QuizResult {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpentMinutes: number;
    answers: Answer[];

    results?: {
        correctAnswers: number;
        incorrectAnswers: number;
        totalQuestions: number;
        score: number;
    };
}

interface Answer {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect?: boolean;
    correctAnswer?: number;
}

const PlayQuiz = () => {
    const { navigateTo, currentParams } = useNavigation();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [timer, setTimer] = useState(0);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [showAnswerAnimation, setShowAnswerAnimation] = useState(false);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number }>>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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

    const fetchQuizData = useCallback(async () => {
        console.log(' Debug - currentParams:', currentParams);
        console.log(' Debug - quizId:', currentParams.quizId);

        if (!currentParams.quizId) {
            setError('Không tìm thấy ID quiz');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:9000/api/quizzes/${currentParams.quizId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            console.log(' Debug - API response:', response);
            console.log(' Debug - response.data:', response.data);

            const quizData = response.data.data || response.data;
            console.log(' Debug - quizData:', quizData);
            console.log(' Debug - quizData.questions:', quizData.questions);
            console.log(' Debug - quizData.questions[0]:', quizData.questions?.[0]);
            if (quizData.questions?.[0]) {
                console.log(' Debug - question keys:', Object.keys(quizData.questions[0]));
                console.log(' Debug - question options:', quizData.questions[0].options);
                console.log(' Debug - question answers:', quizData.questions[0].answers);
            }

            setQuiz(quizData);
            setQuestions(quizData.questions || []);
            setSelectedAnswers(new Array(quizData.questions.length).fill(null));
        } catch (err: unknown) {
            console.error('Error fetching quiz:', err);
            setError((err as Error)?.message || 'Không thể tải quiz');
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    useEffect(() => {
        fetchQuizData();
    }, [fetchQuizData]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (quiz && !showResults) {
            const totalSeconds = (quiz.duration || 30) * 60; // Default to 30 minutes if no duration
            const interval = setInterval(() => {
                setTimer((prev: number) => {
                    if (prev >= totalSeconds) {
                        handleSubmit(); // Auto-submit when time's up
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [quiz, showResults]);

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

    const formatTime = (seconds: number) => {
        if (!quiz) return '0:00';
        const totalSeconds = (quiz.duration || 30) * 60;
        const remainingSeconds = Math.max(0, totalSeconds - seconds);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (answerIndex: number) => {
        // Prevent changing answer if already selected
        if (selectedAnswers[currentQuestion] !== null) {
            return;
        }

        const newAnswers = [...(selectedAnswers || [])];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);

        // Check if answer is correct and show animation
        const correct = answerIndex === questions[currentQuestion].correctAnswer;
        setShowAnswerAnimation(true);

        if (correct) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) {
                setMaxStreak(newStreak);
            }
            createParticles();
            playSound('correct');
        } else {
            setStreak(0);
            playSound('incorrect');
        }

        // Hide animation after 1.5 seconds and move to next question
        setTimeout(() => {
            setShowAnswerAnimation(false);
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            }
        }, 1500);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const createParticles = () => {
        const newParticles = Array.from({ length: 8 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100,
            y: Math.random() * 100
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000);
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 90) return { grade: 'Xuất sắc', color: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 80) return { grade: 'Giỏi', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (percentage >= 70) return { grade: 'Khá', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        if (percentage >= 60) return { grade: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50' };
        return { grade: 'Yếu', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const playSound = (type: 'correct' | 'incorrect' | 'complete') => {
        // Create sound effects using Web Audio API
        const context = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
        } else if (type === 'incorrect') {
            oscillator.frequency.setValueAtTime(349.23, context.currentTime); // F4
            oscillator.frequency.setValueAtTime(293.66, context.currentTime + 0.1); // D4
        } else {
            oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
            oscillator.frequency.setValueAtTime(1046.50, context.currentTime + 0.3); // C6
        }

        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const timeSpentMinutes = Math.floor(timer / 60);
            const answers: Answer[] = selectedAnswers.map((answer, index) => ({
                questionIndex: index,
                selectedAnswer: answer ?? -1,
            }));

            console.log('🔍 Debug - Submitting quiz:', {
                quizId: currentParams.quizId,
                timeSpentMinutes,
                answers,
                startedAt: new Date(Date.now() - timer * 1000).toISOString()
            });

            const response = await axios.post(
                `http://localhost:9000/api/quizzes/${currentParams.quizId}/submit`,
                {
                    answers,
                    timeSpentMinutes,
                    startedAt: new Date(Date.now() - timer * 1000).toISOString(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            console.log('🔍 Debug - Submit response:', response);
            console.log('🔍 Debug - Response data:', response.data);

            const result = response.data.data;
            console.log('🔍 Debug - Result from server:', result);
            setQuizResult(result);
            setShowResults(true);
            playSound('complete');
        } catch (error: unknown) {
            console.error('Error submitting quiz:', error);
            console.log('🔍 Debug - Using fallback calculation');
            // Fallback to client-side calculation if server fails
            const results = calculateResults();
            setQuizResult({
                score: results.percentage,
                correctAnswers: results.correct,
                totalQuestions: results.total,
                timeSpentMinutes: Math.floor(timer / 60),
                answers: questions.map((q, index) => ({
                    questionIndex: index,
                    selectedAnswer: selectedAnswers[index] ?? -1,
                    isCorrect: (selectedAnswers[index] ?? null) === q.correctAnswer,
                    correctAnswer: q.correctAnswer,
                })),
            });
            setShowResults(true);
            playSound('complete');
        }
    };

    const calculateResults = () => {
        console.log('🔍 Debug - questions:', questions);
        console.log('🔍 Debug - selectedAnswers:', selectedAnswers);

        if (!questions || questions.length === 0) {
            return {
                correct: 0,
                incorrect: 0,
                total: 0,
                percentage: 0
            };
        }

        let correct = 0;
        questions.forEach((question, index) => {
            console.log(`🔍 Debug - Q${index}: user=${selectedAnswers[index]}, correct=${question.correctAnswer}`);
            if ((selectedAnswers?.[index] ?? null) === question.correctAnswer) {
                correct++;
            }
        });

        const results = {
            correct,
            incorrect: questions.length - correct,
            total: questions.length,
            percentage: Math.round((correct / questions.length) * 100)
        };

        console.log('🔍 Debug - results:', results);
        return results;
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedAnswers(new Array(questions.length).fill(null));
        setShowResults(false);
        setTimer(0);
        setStreak(0);
        setMaxStreak(0);
        setQuizResult(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-red-500 text-6xl mb-4"
                        >
                            ⚠️
                        </motion.div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => window.history.back()} className="w-full">
                            Quay lại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No quiz state
    if (!quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-gray-400 text-6xl mb-4"
                        >
                            📝
                        </motion.div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy quiz</h2>
                        <p className="text-gray-600 mb-4">Quiz không tồn tại hoặc đã bị xóa</p>
                        <Button onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })} >
                            Quay lại nội dung
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Results screen
    if (showResults && quizResult) {
        // Use server result if available, otherwise fall back to client calculation
        const results = quizResult && quizResult.results ? {
            correct: quizResult.results.correctAnswers,
            incorrect: quizResult.results.totalQuestions - quizResult.results.correctAnswers,
            total: quizResult.results.totalQuestions,
            percentage: quizResult.results.score
        } : {
            correct: quizResult.correctAnswers,
            incorrect: quizResult.totalQuestions - quizResult.correctAnswers,
            total: quizResult.totalQuestions,
            percentage: quizResult.score
        };

        const gradeInfo = getGrade(results.percentage);

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

                    {/* Results Card */}
                    <Card className="w-full max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
                        <CardContent className="text-center p-0">
                            <h1 className="font-semibold mb-2 mt-6 text-2xl" style={{ lineHeight: '1.2' }}>
                                Hoàn thành Quiz!
                            </h1>
                            <p className="text-muted-foreground mb-6">{quiz?.title}</p>

                            {/* Score Progress (Medium, Tách ra) */}
                            <div className="mb-8 flex flex-col items-center">
                                <div className="flex justify-between w-48 mb-2 text-sm font-medium">
                                    <span>{results.percentage}%</span>
                                    <span className={gradeInfo.color}>{gradeInfo.grade}</span>
                                </div>
                                <Progress value={results.percentage} className="h-3 w-48 rounded-lg" />
                            </div>

                            {/* Stats Grid */}
                            <div className="flex justify-center gap-4 mt-4">
                                <div className="rounded-xl p-6 text-center border bg-green-50 border-green-200 shadow-sm w-28 h-28 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div className="text-xl font-semibold text-green-700">{results.correct}</div>
                                    </div>
                                    <div className="text-xs text-green-700 font-medium">Đúng</div>
                                </div>

                                <div className="rounded-xl p-6 text-center border bg-red-50 border-red-200 shadow-sm w-28 h-28 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <div className="text-xl font-semibold text-red-700">{results.incorrect}</div>
                                    </div>
                                    <div className="text-xs text-red-700 font-medium">Sai</div>
                                </div>

                                <div className="rounded-xl p-6 text-center border bg-blue-50 border-blue-200 shadow-sm w-28 h-28 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <div className="text-xl font-semibold text-blue-700">{formatTime(timer)}</div>
                                    </div>
                                    <div className="text-xs text-blue-700 font-medium">Thời gian</div>
                                </div>

                                <div className="rounded-xl p-6 text-center border bg-purple-50 border-purple-200 shadow-sm w-28 h-28 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Zap className="w-5 h-5 text-purple-600" />
                                        <div className="text-xl font-semibold text-purple-700">{maxStreak}</div>
                                    </div>
                                    <div className="text-xs text-purple-700 font-medium">Streak cao nhất</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-6 mt-6">
                                <Button
                                    onClick={() => navigateTo('content')}
                                    variant="outline"
                                    className="max-w-[200px] py-3 rounded-xl"
                                >
                                    Quay lại danh sách
                                </Button>

                                <Button
                                    onClick={handleRetry}
                                    variant="outline"
                                    className="flex items-center gap-2 px-10 py-3 rounded-xl"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Làm lại
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answer Review */}
                    <div className="w-full">
                        <h2 className="text-2xl font-semibold px-6 mt-6 mb-6">Xem lại đáp án</h2>
                        <div className="space-y-6 pb-8 mt-6">
                            {questions?.map((question, index) => {
                                const userAnswer = selectedAnswers?.[index] ?? null;
                                const isCorrect = userAnswer === question.correctAnswer;

                                return (
                                    <Card
                                        key={question._id}
                                        className={`w-full overflow-hidden transition-all duration-200 ${isCorrect
                                            ? 'border-l-4 border-l-green-500 hover:shadow-md'
                                            : userAnswer === null
                                                ? 'border-l-4 border-l-gray-400 hover:shadow-md'
                                                : 'border-l-4 border-l-red-500 hover:shadow-md'
                                            }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-3">
                                                {isCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                ) : userAnswer === null ? (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="mb-2">
                                                        <span className="text-sm text-muted-foreground">Câu {index + 1}</span>
                                                    </div>
                                                    <p className="mb-3">{question.question}</p>

                                                    {userAnswer !== null && (
                                                        <div className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                            <span className="opacity-70">Bạn chọn: </span>
                                                            <span className="font-medium">{question.answers[userAnswer]}</span>
                                                        </div>
                                                    )}

                                                    {!isCorrect && (
                                                        <div className="text-sm text-green-700">
                                                            <span className="opacity-70">Đáp án đúng: </span>
                                                            <span className="font-medium">{question.answers[question.correctAnswer]}</span>
                                                        </div>
                                                    )}

                                                    {userAnswer === null && (
                                                        <div className="text-sm text-muted-foreground">
                                                            <span className="opacity-70">Chưa trả lời - Đáp án đúng: </span>
                                                            <span className="font-medium">{question.answers[question.correctAnswer]}</span>
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
            </div>
        );
    }

    // Main quiz interface
    return (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fda085 100%)' }} className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} p-4`}>
            <div className={`${isFullscreen ? 'h-full flex items-center justify-center' : 'max-w-4xl mx-auto'}`}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                    className="rounded-2xl p-6 mb-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4 relative">
                        <button
                            onClick={toggleFullscreen}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                position: isFullscreen ? 'fixed' : 'absolute',
                                top: isFullscreen ? '20px' : '2px',
                                right: isFullscreen ? '20px' : '50%'
                            }}
                            className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-30 transition-all z-50"
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <h1 style={{ color: 'white' }} className="text-2xl font-bold">{quiz.title}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} className="text-sm">
                                {quiz.difficulty}
                            </div>
                            <div style={{ color: 'white' }} className={`flex items-center ${timer >= (quiz?.duration || 30) * 60 - 60 ? 'text-yellow-300 font-bold' : ''}`}>
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(timer)}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div style={{ color: 'rgba(255,255,255,0.9)' }} className="flex justify-between text-sm">
                            <span>Câu hỏi {currentQuestion + 1} của {questions.length}</span>
                            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)' }} className="w-full rounded-full h-2">
                            <motion.div
                                style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 100%)' }}
                                className="h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        {/* Streak*/}
                        {(streak > 0) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex gap-4 mt-4"
                            >
                                {streak > 0 && (
                                    <div style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', padding: '8px 16px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} className="text-sm">
                                        <Zap className="w-4 h-4" />
                                        <span>Chuỗi {streak}</span>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    {!showResults && questions.length > 0 && currentQuestion < questions.length && (
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: isFullscreen ? 0 : 50 }}
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
                                x: isFullscreen ? 0 : -50,
                                transition: {
                                    duration: 0.3,
                                    ease: [0.4, 0, 0.2, 1]
                                }
                            }}
                        >
                            <Card style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="mb-6">
                                        <h2 style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} className="text-xl font-semibold mb-4">
                                            Câu hỏi {currentQuestion + 1}: {questions[currentQuestion]?.question}
                                        </h2>

                                        {/* Answer Options */}
                                        <div className="space-y-3">
                                            {questions[currentQuestion]?.answers?.map((option, index) => {
                                                const isSelected = selectedAnswers[currentQuestion] === index;
                                                const isCorrect = questions[currentQuestion]?.correctAnswer === index;
                                                const showResult = showAnswerAnimation && isSelected;
                                                const isDisabled = selectedAnswers[currentQuestion] !== null;

                                                // Generate vibrant colors for each option
                                                const optionColors = [
                                                    'from-pink-400 to-rose-500',
                                                    'from-purple-400 to-indigo-500',
                                                    'from-blue-400 to-cyan-500',
                                                    'from-green-400 to-emerald-500',
                                                    'from-yellow-400 to-orange-500',
                                                    'from-red-400 to-pink-500'
                                                ];
                                                const colorClass = optionColors[index % optionColors.length];

                                                return (
                                                    <motion.div
                                                        key={index}
                                                        whileHover={!isDisabled ? { scale: 1.02 } : {}}
                                                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                                        onClick={() => !isDisabled && handleAnswerSelect(index)}
                                                        className={`
                                                            relative p-4 rounded-xl border-2 cursor-pointer transition-all overflow-hidden
                                                            ${showResult && isCorrect ? 'border-green-500 bg-green-50' : ''}
                                                            ${showResult && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                                                            ${!showResult && isSelected ? 'border-blue-500 bg-blue-50 shadow-lg' : ''}
                                                            ${!showResult && !isSelected && !isDisabled ? 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md' : ''}
                                                            ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        {/* Background gradient overlay */}
                                                        {!showResult && !isSelected && !isDisabled && (
                                                            <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-0 hover:opacity-10 transition-opacity`} />
                                                        )}

                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center">
                                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold flex-shrink-0
                                                                    ${showResult && isCorrect ? 'border-green-500 bg-green-100 text-green-600' : ''}
                                                                    ${showResult && !isCorrect ? 'border-red-500 bg-red-100 text-red-600' : ''}
                                                                    ${!showResult && isSelected ? 'border-blue-500 bg-blue-100 text-blue-600' : ''}
                                                                    ${!showResult && !isSelected && !isDisabled ? 'border-gray-300 bg-gray-100 text-gray-600' : 'border-gray-200 bg-gray-50 text-gray-400'}
                                                                `}>
                                                                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                                    {showResult && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                                                    {!showResult && String.fromCharCode(65 + index)}
                                                                </div>
                                                                <span style={{ marginLeft: '32px' }} className={`font-medium ${showResult && isCorrect ? 'text-green-700' :
                                                                    showResult && !isCorrect ? 'text-red-700' :
                                                                        isSelected ? 'text-blue-700' :
                                                                            'text-gray-800'
                                                                    }`}>{option}</span>
                                                            </div>
                                                            {showResult && (
                                                                <motion.span
                                                                    initial={{ opacity: 0, scale: 0 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'
                                                                        }`}
                                                                >
                                                                    {isCorrect ? '✨ Đúng!' : '❌ Sai!'}
                                                                </motion.span>
                                                            )}
                                                        </div>

                                                        {/* Decorative elements */}
                                                        {isSelected && !showResult && (
                                                            <motion.div
                                                                className="absolute top-2 right-2"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                            >
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between">
                                        <Button
                                            onClick={handlePrevious}
                                            disabled={currentQuestion === 0}
                                            variant="outline"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-2" />
                                            Câu trước
                                        </Button>

                                        <div className="flex gap-2">
                                            {currentQuestion === questions.length - 1 ? (
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="bg-green-500 hover:bg-green-600"
                                                >
                                                    Nộp bài
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleNext}
                                                    disabled={selectedAnswers[currentQuestion] === null}
                                                >
                                                    Câu tiếp
                                                    <ChevronRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Particles Effect */}
                <AnimatePresence>
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            initial={{
                                opacity: 1,
                                scale: 0,
                                x: `${particle.x}%`,
                                y: `${particle.y}%`
                            }}
                            animate={{
                                opacity: 0,
                                scale: 2,
                                x: `${particle.x + (Math.random() - 0.5) * 100}%`,
                                y: `${particle.y - 50}%`
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="fixed pointer-events-none z-50"
                        >
                            <Star className="w-6 h-6 text-yellow-400" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlayQuiz;
