// AILearningAssistant\server\src\services\quizService.ts
import { Chapter } from '../models/Chapter'
import { Quiz, IQuizQuestion } from '../models/Quiz'
import { QuizAttempt } from '../models/QuizAttempt'
import AIService from './aiService'
import { Types } from 'mongoose'

export class QuizService {
  private aiService: typeof AIService

  constructor() {
    this.aiService = AIService
  }

  // ✅ Tạo quiz thủ công
  async createManual(data: {
    title: string
    description?: string
    chapters: string[]
    questions: IQuizQuestion[]
    createdBy: string
    durationMinutes?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    isPublic?: boolean
  }) {
    // Validate chapters exist and belong to same class
    const chapters = await Chapter.find({
      _id: { $in: data.chapters }
    }).populate('classId')

    if (chapters.length === 0) throw new Error('No valid chapters')

    // Ensure all chapters belong to same class
    const classId = chapters[0].classId
    if (!chapters.every((c) => c.classId.equals(classId))) {
      throw new Error('All chapters must belong to same class')
    }

    return Quiz.create({
      title: data.title,
      description: data.description,
      classId,
      chapters: data.chapters.map((id) => new Types.ObjectId(id)),
      questions: data.questions,
      createdBy: new Types.ObjectId(data.createdBy),
      durationMinutes: data.durationMinutes,
      difficulty: data.difficulty,
      isPublic: data.isPublic || false,
      isAIGenerated: false
    })
  }

  // ✅ Tạo quiz bằng AI
  async createWithAI(data: {
    title: string
    description?: string
    chapters: string[]
    createdBy: string
    aiPrompt?: string
    numberOfQuestions?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    durationMinutes?: number
    isPublic?: boolean
  }) {
    const chapters = await Chapter.find({
      _id: { $in: data.chapters }
    }).populate(['documents', 'classId'])

    if (chapters.length === 0) throw new Error('No valid chapters')

    const classId = chapters[0].classId
    if (!chapters.every((c: any) => c.classId.equals(classId))) {
      throw new Error('All chapters must belong to same class')
    }

    // Gộp tất cả tài liệu của các chương
    const allMaterials = chapters.flatMap((c: any) => c.documents || [])

    if (allMaterials.length === 0) {
      throw new Error('No materials found in the selected chapters')
    }

    // Generate questions using AI
    const questions = await this.aiService.generateQuizQuestions({
      materials: allMaterials,
      prompt: data.aiPrompt,
      count: data.numberOfQuestions || 10,
      difficulty: data.difficulty
    })

    if (questions.length === 0) {
      throw new Error('AI could not generate valid questions')
    }

    return Quiz.create({
      title: data.title,
      description: data.description,
      classId,
      chapters: data.chapters.map((id) => new Types.ObjectId(id)),
      questions,
      createdBy: new Types.ObjectId(data.createdBy),
      durationMinutes: data.durationMinutes,
      difficulty: data.difficulty,
      isPublic: data.isPublic || false,
      isAIGenerated: true
    })
  }

  // ✅ Submit quiz và chấm điểm
  async submitQuizAttempt(data: {
    quizId: string
    userId: string
    answers: Array<{
      questionIndex: number
      selectedAnswer: number
    }>
    timeSpentMinutes: number
    startedAt: Date
  }) {
    const quiz = await Quiz.findById(data.quizId)
    if (!quiz) throw new Error('Quiz not found')

    // Tính điểm và đánh dấu câu trả lời đúng/sai
    const results = data.answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex]
      const isCorrect = question ? question.correctAnswer === answer.selectedAnswer : false

      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        correctAnswer: question?.correctAnswer || 0
      }
    })

    const correctAnswers = results.filter((r) => r.isCorrect).length
    const totalQuestions = quiz.questions.length
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Lưu attempt
    const attempt = await QuizAttempt.create({
      userId: new Types.ObjectId(data.userId),
      quizId: new Types.ObjectId(data.quizId),
      classId: quiz.classId,
      answers: results,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      totalQuestions,
      correctAnswers,
      timeSpentMinutes: data.timeSpentMinutes,
      startedAt: data.startedAt,
      completedAt: new Date()
    })

    return {
      attempt,
      results: {
        score,
        correctAnswers,
        totalQuestions,
        percentage: Math.round(score),
        passed: score >= 60, // Có thể tùy chỉnh ngưỡng đỗ
        answers: results
      }
    }
  }

  // ✅ Lấy lịch sử làm quiz của user
  async getUserQuizHistory(data: {
    userId: string
    quizId?: string
    classId?: string
    page?: number
    limit?: number
  }) {
    const { userId, quizId, classId, page = 1, limit = 20 } = data

    const filter: any = { userId: new Types.ObjectId(userId) }
    if (quizId) filter.quizId = new Types.ObjectId(quizId)
    if (classId) filter.classId = new Types.ObjectId(classId)

    const skip = (page - 1) * limit

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(filter)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('quizId', 'title difficulty durationMinutes')
        .lean(),
      QuizAttempt.countDocuments(filter)
    ])

    return {
      attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // ✅ Lấy chi tiết một lần làm quiz
  async getAttemptDetail(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId')
      .populate('userId', 'name email')
      .lean()

    if (!attempt) throw new Error('Attempt not found')

    return attempt
  }

  // ✅ Thống kê quiz (cho giáo viên)
  async getQuizStatistics(quizId: string) {
    const attempts = await QuizAttempt.find({ quizId: new Types.ObjectId(quizId) }).lean()

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      }
    }

    const scores = attempts.map((a) => a.score)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const passedCount = scores.filter((s) => s >= 60).length

    return {
      totalAttempts: attempts.length,
      averageScore: Math.round((totalScore / attempts.length) * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: Math.round((passedCount / attempts.length) * 100)
    }
  }
}

export default new QuizService()