import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

interface FlashcardViewProps {
    flashcardSet: {
        _id: string
        title: string
        description?: string
        chapters: Array<{ _id: string; title: string }>
        flashcards?: Array<{
            front: string
            back: string
        }>
    }
    onClose: () => void
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcardSet, onClose }) => {
    const flashcards = flashcardSet.flashcards || []

    if (flashcards.length === 0) {
        return (
            <div className="text-center py-8">
                <p>Không có flashcard nào trong bộ này</p>
                <Button variant="outline" onClick={onClose} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại
                </Button>
                <div>
                    <h2 className="text-xl font-semibold">{flashcardSet.title}</h2>
                    {flashcardSet.description && (
                        <p className="text-sm text-muted-foreground">{flashcardSet.description}</p>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số thẻ</p>
                                <p className="text-2xl font-bold">{flashcards.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số chương</p>
                                <p className="text-2xl font-bold">{flashcardSet.chapters.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chapters */}
            <div>
                <h3 className="text-lg font-medium mb-3">Chương học liên quan</h3>
                <div className="flex flex-wrap gap-2">
                    {flashcardSet.chapters.map((chapter) => (
                        <Badge key={chapter._id} variant="secondary">
                            {chapter.title}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* All Cards */}
            <div>
                <h3 className="text-lg font-medium mb-4">Danh sách các thẻ ({flashcards.length})</h3>
                <div className="space-y-4">
                    {flashcards.map((card, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <span className="font-medium">Thẻ {index + 1}</span>
                                    </div>

                                    {/* Front Side */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-blue-700 mb-2">Mặt trước:</p>
                                        <p className="text-base leading-relaxed">{card.front}</p>
                                    </div>

                                    {/* Back Side */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-green-700 mb-2">Mặt sau:</p>
                                        <p className="text-base leading-relaxed">{card.back}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlashcardView
