import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import axios from 'axios';



const PlayQuiz = () => {
    const { navigateTo, currentParams } = useNavigation();
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [timer, setTimer] = useState(0);
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchQuizData();
    }, [currentParams.quizId]);

    const fetchQuizData = async () => {
        console.log('🔍 Debug - currentParams:', currentParams);
        console.log('🔍 Debug - quizId:', currentParams.quizId);

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

            console.log('🔍 Debug - API response:', response);
            console.log('🔍 Debug - response.data:', response.data);

            const quizData = response.data.data || response.data;
            console.log('🔍 Debug - quizData:', quizData);
            console.log('🔍 Debug - quizData.questions:', quizData.questions);
            console.log('🔍 Debug - quizData.questions[0]:', quizData.questions?.[0]);
            if (quizData.questions?.[0]) {
                console.log('🔍 Debug - question keys:', Object.keys(quizData.questions[0]));
                console.log('🔍 Debug - question options:', quizData.questions[0].options);
                console.log('🔍 Debug - question answers:', quizData.questions[0].answers);
            }

            setQuiz(quizData);
            setQuestions(quizData.questions || []);
            setSelectedAnswers(new Array(quizData.questions?.length || 0).fill(null));
        } catch (err: any) {
            console.error('Error fetching quiz:', err);
            setError(err?.response?.data?.message || 'Không thể tải quiz');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showResults) {
            const interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [showResults]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...(selectedAnswers || [])];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const toggleFlag = () => {
        const newFlagged = new Set(flaggedQuestions);
        if (flaggedQuestions.has(currentQuestion)) {
            newFlagged.delete(currentQuestion);
        } else {
            newFlagged.add(currentQuestion);
        }
        setFlaggedQuestions(newFlagged);
    };

    const handleSubmit = () => {
        setShowResults(true);
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
        setSelectedAnswers(new Array(questions?.length || 0).fill(null));
        setShowResults(false);
        setTimer(0);
        setFlaggedQuestions(new Set());
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Dễ': return 'bg-green-100 text-green-800';
            case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
            case 'Khó': return 'bg-orange-100 text-orange-800';
            case 'Rất khó': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                    <p className="text-gray-600">Đang tải quiz...</p>
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

    if (!quiz || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không tìm thấy quiz</p>
                    <Button onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })} variant="outline">
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const results = calculateResults();
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
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="rounded-xl p-8 text-center border bg-green-50 border-green-200 shadow-sm w-32 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <div className="text-2xl font-semibold text-green-700">{results.correct}</div>
                                    </div>
                                    <div className="text-sm text-green-700 font-medium">Đúng</div>
                                </div>

                                <div className="rounded-xl p-8 text-center border bg-red-50 border-red-200 shadow-sm w-32 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                        <div className="text-2xl font-semibold text-red-700">{results.incorrect}</div>
                                    </div>
                                    <div className="text-sm text-red-700 font-medium">Sai</div>
                                </div>

                                <div className="rounded-xl p-8 text-center border bg-blue-50 border-blue-200 shadow-sm w-32 h-32 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                        <div className="text-2xl font-semibold text-blue-700">{formatTime(timer)}</div>
                                    </div>
                                    <div className="text-sm text-blue-700 font-medium">Thời gian</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-6 mt-6"> {/* cách ra khỏi 3 ô trên */}
                                <Button
                                    onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })}
                                    variant="outline"
                                    className="px-10 py-3 rounded-xl"
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
                        <div className="space-y-6 pb-8  mt-6  ">
                            {questions?.map((question, index) => {
                                const userAnswer = selectedAnswers?.[index] ?? null;
                                const isCorrect = userAnswer === question.correctAnswer;
                                // ... các Card câu hỏi


                                return (
                                    <Card
                                        key={question._id || question.id}
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

    const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
    const answeredCount = selectedAnswers?.filter((a) => a !== null).length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <Card className="shadow-sm">
                    <CardContent className="sm:p-5" style={{ paddingTop: '24px' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigateTo('classes', { subjectId: currentParams.subjectId, tab: 'quiz' })}
                                    className="hover:bg-slate-100"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <div>
                                    <h1 className="text-lg sm:text-xl mb-1">{quiz?.title || 'Quiz'}</h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={getDifficultyColor(quiz?.difficulty || 'medium')}>
                                            {quiz?.difficulty || 'Medium'}
                                        </Badge>
                                        {quiz?.chapters?.map((chapter: any, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {typeof chapter === 'string' ? chapter : chapter.name || chapter.title || `Chapter ${index + 1}`}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-md text-sm">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-700">{formatTime(timer)}</span>
                                </div>
                            </div>
                        </div>


                    </CardContent>
                </Card>



                {/* Progress Bar */}
                <div className="space-y-2.5 mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground pb-3">
                        <span>Tiến độ: {answeredCount}/{questions.length} câu</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>



                <div className="flex-1 max-w-3xl mx-auto">
                    <Card className="w-full">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <Badge variant="outline" className="h-7 text-xs sm:text-sm flex items-center">
                                    Câu {currentQuestion + 1}/{questions.length}
                                </Badge>
                                <Button
                                    variant={flaggedQuestions.has(currentQuestion) ? "default" : "outline"}
                                    size="icon"
                                    onClick={toggleFlag}
                                    className={`h-7 w-7 ${flaggedQuestions.has(currentQuestion) ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                                >
                                    <Flag className="w-3 h-3" />
                                </Button>
                            </div>
                            <div className="pl-1 mt-1">
                                <h2 className="text-lg sm:text-xl leading-relaxed tracking-wide">{questions[currentQuestion]?.question || ''}</h2>
                            </div>

                            {/* Answer Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
                                {(questions[currentQuestion]?.answers || []).map((option: string, index: number) => {
                                    const isSelected = (selectedAnswers?.[currentQuestion] ?? null) === index;
                                    const optionLetter = String.fromCharCode(65 + index);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(index)}
                                            className={`p-3 sm:p-4 h-full min-h-0 rounded-lg border text-left transition-all duration-150 flex items-center ${isSelected
                                                ? 'bg-gray-100 border-gray-400 text-gray-900'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-colors ${isSelected
                                                            ? 'bg-gray-400 border border-gray-500 text-gray-900'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {optionLetter}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-gray-900 whitespace-normal break-words leading-relaxed text-sm sm:text-base">
                                                        {option}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Flagged Questions Counter */}
                            {flaggedQuestions.size > 0 && (
                                <div className="flex justify-center mt-4">
                                    <div className="inline-flex items-center px-4 py-2 bg-orange-50 rounded-full">
                                        <Flag className="w-4 h-4 mr-2 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-700">
                                            Đã đánh dấu {flaggedQuestions.size} câu
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button (only show on last question) */}
                            {currentQuestion === questions.length - 1 && (
                                <div className="flex justify-center mt-6">
                                    <Button
                                        onClick={handleSubmit}
                                        className="gap-2 h-10 px-6 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        <span className="text-sm font-medium">Nộp bài</span>
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>

                {/* Navigation and Card Container */}
                <div className="relative w-full max-w-5xl mx-auto mb-6 sm:mb-8">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left Navigation Button */}
                        <div className="w-16 flex-shrink-0 flex justify-center">
                            <Button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-full shadow-md bg-white hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-7 h-7" />
                            </Button>
                        </div>

                        {/* Quiz Card - This will be moved here */}

                        {/* Right Navigation Button */}
                        <div className="w-16 flex-shrink-0 flex justify-center">
                            <Button
                                onClick={handleNext}
                                disabled={currentQuestion === questions.length - 1}
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-full shadow-md bg-white hover:bg-gray-50"
                            >
                                <ChevronRight className="w-7 h-7" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default PlayQuiz;