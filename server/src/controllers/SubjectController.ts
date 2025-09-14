import { Request, Response } from 'express'
import subjectService from '~/services/subjectService'
import { responseUtils } from '~/utils/ResponseUtils'

const subjectController = {
  getSubjects: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const result = await subjectService.getSubjects(userId)
      responseUtils({ req, res, code: 200, message: `Get subject succesfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  getSubject: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const { subjectId } = req.params
      const result = await subjectService.getSubject(subjectId, userId)
      responseUtils({ req, res, code: 200, message: `Get subject succesfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  createSubject: async (req: Request, res: Response) => {
    try {
      const result = await subjectService.createSubject({ ...req.body })
      responseUtils({ req, res, code: 200, message: `Create subject succesfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  deleteSubject: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const { subjectId } = req.params
      await subjectService.deleteSubject(subjectId, userId)
      responseUtils({ req, res, code: 200, message: `Delete subject succesfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  deleteSubjects: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      await subjectService.deleteSubjects(userId)
      responseUtils({ req, res, code: 200, message: `Delete subjects succesfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  updateSubject: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string
      const result = await subjectService.updateSubject({ userId, ...req.body })
      responseUtils({ req, res, code: 200, message: `Update subjects succesfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  }
}
export default subjectController
