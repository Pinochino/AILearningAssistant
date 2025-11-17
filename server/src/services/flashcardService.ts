import { Chapter } from '../models/Chapter.js'
import { Flashcard } from '../models/Flashcard.js'
import { FlashcardAttempt } from '../models/FlashcardAttempt.js'
import AIService from './aiService.js'
import { Types } from 'mongoose'

interface INextInterval {
  interval: number
  easeFactor: number
}

const calculateNextInterval = (params: {
  currentInterval: number
  easeFactor: number
  difficulty: 'easy' | 'medium' | 'hard'
  isCorrect: boolean
}): INextInterval => {
  let { currentInterval, easeFactor } = params

  if (!params.isCorrect) {
    return { interval: 1, easeFactor: Math.max(1.3, easeFactor - 0.2) }
  }

  const difficultyFactor =
    params.difficulty === 'easy' ? 1.3 :
      params.difficulty === 'medium' ? 1 :
        0.7

  if (currentInterval === 0) currentInterval = 1
  else currentInterval = Math.round(currentInterval * easeFactor * difficultyFactor)

  easeFactor = easeFactor + (0.1 - (5 - difficultyFactor * 5) * (0.08 + (5 - difficultyFactor * 5) * 0.02))
  easeFactor = Math.max(1.3, Math.min(2.5, easeFactor))

  return { interval: currentInterval, easeFactor }
}

export class FlashcardService {
  private aiService: typeof AIService

  constructor() {
    this.aiService = AIService
  }

  // ✅ Tạo flashcard thủ công (vẫn chỉ 1 chapter)
  async createManual(data: {
    front: string
    back: string
    chapterIds: string[]
    createdBy: string
    difficulty?: 'easy' | 'medium' | 'hard'
  }) {
    const chapters = await Chapter.find({
      _id: { $in: data.chapterIds }
    }).populate('classId')

    if (!chapters.length) throw new Error('Chapters not found')

    const classId = chapters[0].classId

    return Flashcard.create({
      front: data.front,
      back: data.back,
      chapters: chapters.map(ch => ch._id),
      classId,
      createdBy: data.createdBy,
      difficulty: data.difficulty,
      isAIGenerated: false
    })
  }

  // ✅ Tạo flashcard bằng AI (từ nhiều chương)
  async createWithAI(data: {
    chapterIds: string[]
    createdBy: string
    aiPrompt?: string
    numberOfCards?: number
  }) {
    const chapters = await Chapter.find({
      _id: { $in: data.chapterIds }
    }).populate('documents')

    if (!chapters.length) throw new Error('No chapters found')

    const classId = chapters[0].classId

    // Gộp tất cả tài liệu của các chương
    const allMaterials = chapters.flatMap((c: any) => c.documents || [])

    // Gọi AI service generate flashcards
    const generatedCards = await this.aiService.generateFlashcards({
      materials: allMaterials,
      prompt: data.aiPrompt,
      count: data.numberOfCards
    })

    // Tạo flashcards
    const flashcards = await Promise.all(
      generatedCards.map((card: any) =>
        Flashcard.create({
          front: card.front,
          back: card.back,
          chapters: data.chapterIds.map(id => new Types.ObjectId(id)),
          classId,
          createdBy: data.createdBy,
          isAIGenerated: true,
          difficulty: card.difficulty || 'medium'
        })
      )
    )

    return flashcards
  }

  // ✅ Cập nhật tiến độ ôn tập (SuperMemo)
  async updateProgress(data: {
    flashcardId: string
    userId: string
    difficulty: 'easy' | 'medium' | 'hard'
    isCorrect: boolean
  }) {
    const card = await Flashcard.findById(data.flashcardId)
    if (!card) throw new Error('Flashcard not found')

    const newInterval = calculateNextInterval({
      currentInterval: card.intervalDays || 0,
      easeFactor: card.easeFactor || 2.5,
      difficulty: data.difficulty,
      isCorrect: data.isCorrect
    })

    return Flashcard.findByIdAndUpdate(
      data.flashcardId,
      {
        $set: {
          difficulty: data.difficulty,
          intervalDays: newInterval.interval,
          easeFactor: newInterval.easeFactor,
          nextReview: new Date(Date.now() + newInterval.interval * 24 * 60 * 60 * 1000)
        },
        $inc: { reviewCount: 1 }
      },
      { new: true }
    )
  }

  // ✅ Lưu kết quả ôn tập flashcard
  async saveAttempt(data: {
    userId: string
    flashcardSetId: string
    classId: string
    cards: {
      cardIndex: number
      isCorrect: boolean
      timeSpentSeconds?: number
      difficulty?: 'easy' | 'medium' | 'hard'
    }[]
    timeSpentMinutes: number
    startedAt: string
    sessionId: string
  }) {
    const correctCards = data.cards.filter(card => card.isCorrect).length
    const incorrectCards = data.cards.length - correctCards
    const score = data.cards.length > 0 ? Math.round((correctCards / data.cards.length) * 100) : 0

    return FlashcardAttempt.create({
      userId: new Types.ObjectId(data.userId),
      flashcardSetId: new Types.ObjectId(data.flashcardSetId),
      classId: new Types.ObjectId(data.classId),
      cards: data.cards,
      score,
      totalCards: data.cards.length,
      correctCards,
      incorrectCards,
      timeSpentMinutes: data.timeSpentMinutes,
      startedAt: new Date(data.startedAt),
      completedAt: new Date(),
      sessionId: data.sessionId
    })
  }

  // ✅ Lấy lần ôn tập cuối cùng của user cho flashcard set
  async getLatestAttempt(userId: string, flashcardSetId: string) {
    return FlashcardAttempt.findOne({
      userId: new Types.ObjectId(userId),
      flashcardSetId: new Types.ObjectId(flashcardSetId)
    }).sort({ completedAt: -1 }).populate('flashcardSetId')
  }

  // ✅ Lấy chi tiết lần ôn tập
  async getAttemptById(attemptId: string) {
    return FlashcardAttempt.findById(attemptId)
      .populate('flashcardSetId')
      .populate('userId', 'name email')
  }

  // ✅ Lấy tất cả attempts của user cho flashcard set
  async getUserAttempts(userId: string, flashcardSetId: string, limit = 10) {
    return FlashcardAttempt.find({
      userId: new Types.ObjectId(userId),
      flashcardSetId: new Types.ObjectId(flashcardSetId)
    })
      .sort({ completedAt: -1 })
      .limit(limit)
      .populate('flashcardSetId')
  }
}
