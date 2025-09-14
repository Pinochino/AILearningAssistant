import { ISubject, Subject } from '~/models/Subject'
import { SubjectInterface } from '~/types/SubjectInterface'

const subjectService = {
  getSubjects: async (userId: string): Promise<ISubject[]> => {
    try {
      const subjects = await Subject.find({
        userId
      })
      return subjects
    } catch (error: any) {
      throw new Error(error.messsage)
    }
  },

  getSubject: async (subjectId: string, userId: string) => {
    try {
      const subject = await Subject.findOne({
        _id: subjectId,
        userId
      })
      return subject
    } catch (error: any) {
      throw new Error(error.messsage)
    }
  },

  createSubject: async ({ name, ...props }: SubjectInterface) => {
    try {
      let subject = await Subject.findOne({
        name
      })

      if (!subject) {
        subject = await Subject.create({
          name,
          ...props
        })
      }

      return subject
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  deleteSubject: async (subjectId: string, userId: string) => {
    try {
      await Subject.deleteOne({
        _id: subjectId,
        userId
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  deleteSubjects: async (userId: string) => {
    try {
      await Subject.deleteMany({ userId })
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  updateSubject: async ({ name, userId, ...props }: SubjectInterface) => {
    try {
      const oldSubject = await Subject.findOne({
        name,
        userId: userId
      })

      if (!oldSubject) {
        throw new Error(`Subject is not found`)
      }

      const updatedSubject = await Subject.updateOne(
        {
          _id: oldSubject._id
        },
        { ...props }
      )

      return updatedSubject
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
export default subjectService
