import { Request, Response } from 'express'
import noteService from '~/services/noteService'
import { responseUtils } from '~/utils/ResponseUtils'

const noteController = {
  getNotes: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      const result = await noteService.getNotes(userId as string)
      responseUtils({ req, res, code: 200, message: `Get notes successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  getNote: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const { noteId } = req.params
      const result = await noteService.getNote(userId, noteId)
      responseUtils({ req, res, code: 200, message: `Get note successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  updateNote: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const { noteId } = req.params

      const result = await noteService.updateNote({ noteId, userId, ...req.body })
      responseUtils({ req, res, code: 200, message: `Update note successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  deleteNote: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const { noteId } = req.params
      await noteService.deleteNote(userId, noteId)
      responseUtils({ req, res, code: 200, message: `Delete note successfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  deleteNotes: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      await noteService.deleteNotes(userId)
      responseUtils({ req, res, code: 200, message: `Delete notes successfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  createNote: async (req: Request, res: Response) => {
    try {
      const result = await noteService.createNote({ ...req.body })
      responseUtils({ req, res, code: 200, message: `Create note succesfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  }
}

export default noteController
