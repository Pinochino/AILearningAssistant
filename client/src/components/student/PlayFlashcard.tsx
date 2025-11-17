import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { ArrowLeft, Eye, EyeOff, Check, X, Star, RotateCcw } from 'lucide-react'
import { useNavigation } from '../../hooks/useNavigation'
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

interface FlashcardData {
    id: string;
    front: string;
    back: string;
}

const mockFlashcards: FlashcardData[] = [
    { id: "1", front: "Định nghĩa đạo hàm tại một điểm", back: "Đạo hàm của hàm số..." },
    { id: "2", front: "Công thức đạo hàm của hàm hợp", back: "Nếu y = f(u)..." },
    { id: "3", front: "Đạo hàm của hàm số mũ y = aˣ", back: "y' = aˣ . ln(a)" },
    { id: "4", front: "Đạo hàm của hàm số logarit y = logₐx", back: "y' = 1/(x.ln(a))" },
    { id: "5", front: "Đạo hàm của hàm số lượng giác y = tan(x)", back: "y' = 1/cos²(x)" }
];

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
    };

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
                        <Button onClick={() => navigateTo('subject')}>
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
                        onClick={() => navigateTo('subject')}
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
                                {/* Chữ lên trên, nhỏ hơn */}
                                <p className="text-gray-700 text-sm mb-2">Tỷ lệ ghi nhớ: {percent}%</p>

                                {/* Thanh tiến độ, căn giữa */}
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
                                    onClick={() => navigateTo('subject')}
                                    variant="outline"
                                    className="flex-1 max-w-[200px] py-3 rounded-xl"
                                >
                                    Quay lại danh sách
                                </Button>
                            </div>


                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ===== MAIN FLASHCARD UI =====
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">

            {/* 🟦 Header */}
            <div className="w-full max-w-4xl mx-auto border-6 border-black rounded-2xl bg-white p-8 flex flex-col gap-4 shadow-md">
                {/* Nút điều khiển */}
                <div className="flex justify-between items-center">
                    <Button
                        onClick={() => navigateTo('subject')}
                        className="flex items-center gap-2 text-black bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg px-3 py-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> Quay lại
                    </Button>

                    <Button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-black bg-gray-100 hover:bg-gray-300 border-4 border-black rounded-lg px-3 py-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Làm lại
                    </Button>
                </div>

                {/* Tiêu đề flashcard */}
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-12">
                    Flashcard: {flashcard?.title}
                </h1>

                {/* Thanh tiến độ */}
                <div className="w-full border-2 border-black rounded-xl p-3 bg-gray-50">
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                        <span>Tiến độ: {currentCard + 1}/{cards.length}</span>
                        <Progress value={progress} className="w-full h-3 mt-2 rounded-lg" />

                        <span className="font-semibold text-indigo-600">{progress}%</span>
                    </div>

                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* 🟧 Flashcard */}
            <div className="w-full max-w-4xl mx-auto border-4 border-black rounded-2xl bg-white p-8 flex flex-col items-center justify-center shadow-md">
                <div
                    className="w-full bg-gradient-to-br from-white to-indigo-50 border-2 border-gray-300 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={handleFlip}
                    style={{ minHeight: "280px" }}
                >
                    <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed text-center">
                        {isFlipped ? currentCardData.back : currentCardData.front}
                    </h2>
                    <p className="mt-6 text-base text-indigo-600 font-medium flex items-center justify-center gap-2">
                        {isFlipped ? "🔁 Xem câu hỏi" : "💡 Xem đáp án"}
                    </p>
                </div>
            </div>

            {/* 🔹 Nút điều hướng nằm ngoài khung flashcard */}
            <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-4 mt-6">
                <Button
                    onClick={handlePrev}
                    disabled={currentCard === 0}
                    className="px-6 py-3 bg-blue-100 text-black border-2 border-black rounded-xl flex items-center justify-center gap-2 hover:bg-blue-200 active:scale-95 transition-all disabled:opacity-50"
                >
                    <ChevronLeft className="w-5 h-5" /> Trước
                </Button>

                {isFlipped && (
                    <>
                        <Button
                            onClick={handleDifficult}
                            className="px-6 py-3 bg-orange-100 text-black border-2 border-black rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 active:scale-95 transition-all"
                        >
                            <X className="w-5 h-5" /> Chưa thuộc
                        </Button>

                        <Button
                            onClick={handleMastered}
                            className="px-6 py-3 bg-green-100 text-black border-2 border-black rounded-xl flex items-center justify-center gap-2 hover:bg-green-200 active:scale-95 transition-all"
                        >
                            <Check className="w-5 h-5" /> Đã thuộc
                        </Button>
                    </>
                )}

                <Button
                    onClick={handleNext}
                    className="px-6 py-3 bg-indigo-100 text-black border-2 border-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-200 active:scale-95 transition-all"
                >
                    {currentCard === cards.length - 1 ? "Kết thúc" : "Sau"} <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                    onClick={handleShuffle}
                    className="px-6 py-3 bg-yellow-100 text-black border-2 border-black rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-200 active:scale-95 transition-all"
                >
                    <Shuffle className="w-4 h-4" /> Xáo trộn
                </Button>
            </div>

        </div>
    );
}

export default PlayFlashcard;