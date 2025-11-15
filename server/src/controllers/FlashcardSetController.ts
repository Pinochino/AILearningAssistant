import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { responseUtils } from '../utils/ResponseUtils'
import { FlashcardSet } from '../models/FlashcardSet'

const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)
const getUserId = (req: any): string | undefined => req.user?.id || req.user?._id

export const listAll: RequestHandler = async (req, res) => {
    try {
        const { search, page = '1', limit = '20', difficulty } = req.query as Record<string, any>
        const filter: any = {}

        if (difficulty) filter.difficulty = difficulty
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        const p = Math.max(1, parseInt(String(page)) || 1)
        const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))

        const [items, total] = await Promise.all([
            FlashcardSet.find(filter)
                .sort({ createdAt: -1 })
                .skip((p - 1) * l)
                .limit(l)
                .populate('chapters', 'title')
                .lean(),
            FlashcardSet.countDocuments(filter)
        ])

        return responseUtils({
            req,
            res,
            code: 200,
            message: 'OK',
            data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
        })
    } catch (err: any) {
        return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
    }
}

export const listByClass: RequestHandler = async (req, res) => {
    try {
        const { classId } = req.params
        if (!isId(classId)) return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
        const { chapters, search, page = '1', limit = '20', difficulty } = req.query as Record<string, any>
        const filter: any = { classId: new Types.ObjectId(classId) }

        if (Array.isArray(chapters) && chapters.every((c) => isId(c))) {
            filter.chapters = { $in: chapters.map((c) => new Types.ObjectId(c)) }
        } else if (typeof chapters === 'string' && isId(chapters)) {
            // trường hợp chỉ truyền 1 id
            filter.chapters = { $in: [new Types.ObjectId(chapters)] }
        }
        if (difficulty) filter.difficulty = difficulty
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        const p = Math.max(1, parseInt(String(page)) || 1)
        const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))

        const [items, total] = await Promise.all([
            FlashcardSet.find(filter)
                .sort({ createdAt: -1 })
                .skip((p - 1) * l)
                .limit(l)
                .populate('chapters', 'title')
                .lean(),
            FlashcardSet.countDocuments(filter)
        ])

        return responseUtils({
            req,
            res,
            code: 200,
            message: 'OK',
            data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
        })
    } catch (error: any) {
        console.error('Error listing flashcard sets:', error)
        return responseUtils({ req, res, code: 500, message: 'Internal server error' })
    }
}

export const create: RequestHandler = async (req, res) => {
    try {
        const { title, description, classId, chapters, flashcards, difficulty } = req.body
        const userId = getUserId(req)

        if (!title || !classId) {
            return responseUtils({ req, res, code: 400, message: 'Title and classId are required' })
        }

        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            return responseUtils({ req, res, code: 400, message: 'Flashcards array is required' })
        }

        // Validate flashcard items
        for (const card of flashcards) {
            if (!card.front || !card.back) {
                return responseUtils({ req, res, code: 400, message: 'Each flashcard must have front and back' })
            }
        }

        const flashcardSet = new FlashcardSet({
            title,
            description,
            classId: new Types.ObjectId(classId),
            chapters: chapters.map((id: string) => new Types.ObjectId(id)),
            createdBy: new Types.ObjectId(userId),
            flashcards,
            difficulty: difficulty || 'medium'
        })

        await flashcardSet.save()

        return responseUtils({
            req,
            res,
            code: 201,
            message: 'Flashcard set created successfully',
            data: flashcardSet
        })
    } catch (error: any) {
        console.error('Error creating flashcard set:', error)
        return responseUtils({ req, res, code: 500, message: 'Internal server error' })
    }
}

export const update: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, chapters, flashcards, difficulty } = req.body

        if (!isId(id)) {
            return responseUtils({ req, res, code: 400, message: 'Invalid flashcard set ID' })
        }

        const updateData: any = {}
        if (title) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (chapters) updateData.chapters = chapters.map((id: string) => new Types.ObjectId(id))
        if (flashcards) {
            if (!Array.isArray(flashcards) || flashcards.length === 0) {
                return responseUtils({ req, res, code: 400, message: 'Flashcards array is required' })
            }
            updateData.flashcards = flashcards
        }
        if (difficulty) updateData.difficulty = difficulty

        const flashcardSet = await FlashcardSet.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        )

        if (!flashcardSet) {
            return responseUtils({ req, res, code: 404, message: 'Flashcard set not found' })
        }

        return responseUtils({
            req,
            res,
            code: 200,
            message: 'Flashcard set updated successfully',
            data: flashcardSet
        })
    } catch (error: any) {
        console.error('Error updating flashcard set:', error)
        return responseUtils({ req, res, code: 500, message: 'Internal server error' })
    }
}

export const remove: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params

        if (!isId(id)) {
            return responseUtils({ req, res, code: 400, message: 'Invalid flashcard set ID' })
        }

        const flashcardSet = await FlashcardSet.findById(id)

        if (!flashcardSet) {
            return responseUtils({ req, res, code: 404, message: 'Flashcard set not found' })
        }

        await FlashcardSet.deleteById(id)

        return responseUtils({
            req,
            res,
            code: 200,
            message: 'Flashcard set deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting flashcard set:', error)
        return responseUtils({ req, res, code: 500, message: 'Internal server error' })
    }
}

export const getById: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params

        if (!isId(id)) {
            return responseUtils({ req, res, code: 400, message: 'Invalid flashcard set ID' })
        }

        const flashcardSet = await FlashcardSet.findById(id)
            .populate('chapters', 'title')
            .populate('createdBy', 'name email')

        if (!flashcardSet) {
            return responseUtils({ req, res, code: 404, message: 'Flashcard set not found' })
        }

        return responseUtils({
            req,
            res,
            code: 200,
            message: 'OK',
            data: flashcardSet
        })
    } catch (error: any) {
        console.error('Error getting flashcard set:', error)
        return responseUtils({ req, res, code: 500, message: 'Internal server error' })
    }
}
