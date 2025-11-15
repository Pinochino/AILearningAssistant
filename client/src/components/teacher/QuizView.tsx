import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ArrowLeft, Clock, FileText } from 'lucide-react'

interface QuizViewProps {
    quiz: {
        _id: string
        title: string
        description: string
        chapters: Array<{ _id: string; title: string }>
        questions: Array<{
            question: string
            answers: string[]
            correctAnswer: number
        }>
        durationMinutes?: number
    }
    onClose: () => void
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, onClose }) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold">{quiz.title}</h2>
                        {quiz.description && (
                            <p className="text-sm text-muted-foreground">{quiz.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quiz Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số câu hỏi</p>
                                <p className="text-2xl font-bold">{quiz.questions.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {quiz.durationMinutes && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Thời gian</p>
                                    <p className="text-2xl font-bold">{quiz.durationMinutes} phút</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Số chương</p>
                                <p className="text-2xl font-bold">{quiz.chapters.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chapters */}
            <div>
                <h3 className="text-lg font-medium mb-3">Chương học liên quan</h3>
                <div className="flex flex-wrap gap-2">
                    {quiz.chapters.map((chapter) => (
                        <Badge key={chapter._id} variant="secondary">
                            {chapter.title}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Questions */}
            <div>
                <h3 className="text-lg font-medium mb-4">Đề bài</h3>
                <div className="space-y-6">
                    {quiz.questions.map((question, qIndex) => (
                        <Card key={qIndex}>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                                        {qIndex + 1}
                                    </span>
                                    {question.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {question.answers.map((answer, aIndex) => (
                                        <div
                                            key={aIndex}
                                            className={`flex items-center gap-3 p-3 rounded-lg border ${aIndex === question.correctAnswer
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div
                                                className={`h-4 w-4 rounded-full border-2 ${aIndex === question.correctAnswer
                                                        ? 'bg-green-500 border-green-500'
                                                        : 'border-gray-300'
                                                    }`}
                                            >
                                                {aIndex === question.correctAnswer && (
                                                    <div className="h-full w-full rounded-full bg-green-500 flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`font-medium ${aIndex === question.correctAnswer ? 'text-green-700' : 'text-gray-700'
                                                }`}>
                                                {String.fromCharCode(65 + aIndex)}. {answer}
                                            </span>
                                            {aIndex === question.correctAnswer && (
                                                <Badge variant="default" className="ml-auto">
                                                    Đáp án đúng
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default QuizView
