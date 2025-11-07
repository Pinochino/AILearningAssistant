
// src/services/quizService.ts
import { Chapter } from '../models/Chapter'
import { Quiz, IQuizQuestion } from '../models/Quiz'
import AIService from './aiService'
import { Types } from 'mongoose'

export class QuizService {
  private aiService: typeof AIService

  constructor() {
    this.aiService = AIService
  }
  async createManual(data: {
    title: string
    chapters: string[]
    questions: IQuizQuestion[]
    createdBy: string
    durationMinutes?: number
    difficulty?: 'easy' | 'medium' | 'hard'
  }) {
    // Validate chapters exist and belong to same class
    const chapters = await Chapter.find({
      _id: { $in: data.chapters }
    }).populate('classId')
    
    if (chapters.length === 0) throw new Error('No valid chapters')
    
    // Ensure all chapters belong to same class
    const classId = chapters[0].classId
    if (!chapters.every(c => c.classId.equals(classId))) {
      throw new Error('All chapters must belong to same class')
    }

    return Quiz.create({
      ...data,
      class: classId,
      isAIGenerated: false
    })
  }

  // Tạo quiz bằng AI
  async createWithAI(data: {
    title: string
    chapters: string[]
    createdBy: string
    aiPrompt?: string
    numberOfQuestions?: number
    difficulty?: 'easy' | 'medium' | 'hard'
  }) {
    const chapters = await Chapter.find({
      _id: { $in: data.chapters }
    }).populate(['documents', 'classId'])

    // Generate questions using AI
    const questions = await this.aiService.generateQuizQuestions({
      materials: (chapters as any[]).flatMap((c: any) => c.documents || []),
      prompt: data.aiPrompt,
      count: data.numberOfQuestions,
      difficulty: data.difficulty
    })

    return Quiz.create({
      ...data,
      class: chapters[0].classId,
      questions,
      isAIGenerated: true
    })
  }

  // Theo dõi kết quả làm quiz
  async submitQuizAttempt(data: {
    quizId: string
    userId: string
    answers: Array<{
      questionIndex: number
      selectedAnswer: number
    }>
    timeSpentMinutes: number
  }) {
    const quiz = await Quiz.findById(data.quizId)
    if (!quiz) throw new Error('Quiz not found')

    // Tính điểm và đánh dấu câu trả lời đúng/sai
    const results = data.answers.map(answer => ({
      ...answer,
      isCorrect: quiz.questions[answer.questionIndex]?.correctAnswer === answer.selectedAnswer,
      correctAnswer: quiz.questions[answer.questionIndex]?.correctAnswer
    }))

    const score = (results.filter(r => r.isCorrect).length / results.length) * 100


  }
}