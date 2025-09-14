import { Note } from '~/models/Note'
import { NoteInterface } from '~/types/NoteInterface'

const noteService = {
  getNotes: async (userId: string) => {
    try {
      const notes = await Note.find({
        userId
      })
      return notes
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  getNote: async (userId: string, noteId: string) => {
    try {
      const note = await Note.findOne({
        _id: noteId,
        userId
      })

      if (!note) {
        throw new Error('Not found note')
      }

      return note
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  deleteNote: async (userId: string, noteId: string) => {
    try {
      await Note.deleteOne({
        _id: noteId,
        userId
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  deleteNotes: async (userId: string) => {
    try {
      await Note.deleteMany({
        userId
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  updateNote: async ({ noteId, userId, ...props }: NoteInterface) => {
    try {
      const note = await Note.findOne({
        _id: noteId,
        userId
      })

      if (!note) {
        throw new Error('Not found note')
      }

      const updatedNote = await Note.updateOne(
        {
          _id: note._id
        },
        {
          ...props
        }
      )

      return updatedNote
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  createNote: async ({ title, ...props }: NoteInterface) => {
    try {
      let note = await Note.findOne({
        title
      })
      if (!note) {
        note = await Note.create({ ...props })
      }

      return note
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
export default noteService
