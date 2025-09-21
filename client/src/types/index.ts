export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

export interface Subject {
  id: string
  name: string
  description: string
  teacherId: string
  studentIds: string[]
  chapters: Chapter[]
  createdAt: Date
}

export interface Chapter {
  id: string
  title: string
  subjectId: string
  documents: Document[]
  quizzes: Quiz[]
  flashcards: Flashcard[]
  order: number
}

export interface Document {
  id: string
  title: string
  type: 'pdf' | 'word' | 'powerpoint' | 'video' | 'other'
  url: string
  isPublic: boolean
  uploadedBy: string
  chapterId: string
  createdAt: Date
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  chapterId: string
  createdBy: string
  isAIGenerated: boolean
  createdAt: Date
}

export interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation?: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  chapterId: string
  createdBy: string
  isAIGenerated: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  nextReview: Date
  createdAt: Date
}

export interface Schedule {
  id: string
  subjectId: string
  dayOfWeek: number // 0-6, Sunday is 0
  startTime: string
  endTime: string
  room?: string
}

export interface StudyProgress {
  userId: string
  subjectId: string
  chapterId: string
  completedDocuments: string[]
  quizScores: { quizId: string; score: number; completedAt: Date }[]
  flashcardProgress: { cardId: string; level: number; lastReviewed: Date }[]
}
