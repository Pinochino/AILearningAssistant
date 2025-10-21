import { Class, Subject, type IClass, type ISubject } from "../models/class.model"
import { ClassEnrollment, type IClassEnrollment } from "../models/ClassEnrollment"
import { User } from "../models/User"
import mongoose from "mongoose"

export class ClassesService {
  // Class CRUD operations
  static async createClass(classData: Partial<IClass>): Promise<IClass> {
    try {
      // Handle teacherId - can be ObjectId or username
      if (classData.teacherId) {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(classData.teacherId as string);
        if (!isValidObjectId) {
          // Find user by username
          const user = await User.findOne({ username: classData.teacherId });
          if (!user) {
            throw new Error(`Teacher with username '${classData.teacherId}' not found`);
          }
          classData.teacherId = user._id as any;
        }
      }

      const newClass = new Class(classData)
      const savedClass = await newClass.save()
      await savedClass.populate("teacherId", "name email")
      return savedClass
    } catch (error: any) {
      throw new Error(`Failed to create class: ${error.message}`)
    }
  }

  static async getClassById(id: string): Promise<IClass | null> {
    try {
      const classDoc = await Class.findById(id)
        .populate("teacherId", "name email")
        .populate("students", "name email")
        .exec()
      return classDoc
    } catch (error: any) {
      throw new Error(`Failed to get class: ${error.message}`)
    }
  }

  static async getAllClasses(
    filters: any = {},
    page = 1,
    limit = 10,
  ): Promise<{
    items: IClass[]
    pagination: {
      page: number
      limit: number
      totalPages: number
      totalItems: number
    }
  }> {
    try {
      const query: any = { isActive: true }

      if (filters.subject) query.subject = new RegExp(filters.subject, "i")
      if (filters.teacherId) {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(filters.teacherId);
        if (isValidObjectId) {
          query.teacherId = filters.teacherId;
        } else {
          // Find user by username and get their _id
          const user = await User.findOne({ username: filters.teacherId });
          if (user) {
            query.teacherId = user._id;
          } else {
            // If teacher not found, return empty result
            query.teacherId = null;
          }
        }
      }
      if (filters.dayOfWeek !== undefined) query["schedule.dayOfWeek"] = filters.dayOfWeek

      const skip = (page - 1) * limit

      const [classes, total] = await Promise.all([
        Class.find(query)
          .populate("teacherId", "name email")
          .populate("students", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Class.countDocuments(query),
      ])

      return {
        items: classes,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to get classes: ${error.message}`)
    }
  }

  static async updateClass(id: string, updateData: Partial<IClass>): Promise<IClass | null> {
    try {
      // Handle teacherId - can be ObjectId or username
      if (updateData.teacherId) {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(updateData.teacherId as string);
        if (!isValidObjectId) {
          // Find user by username
          const user = await User.findOne({ username: updateData.teacherId });
          if (!user) {
            throw new Error(`Teacher with username '${updateData.teacherId}' not found`);
          }
          updateData.teacherId = user._id as any;
        }
      }

      const updatedClass = await Class.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
        .populate("teacherId", "name email")
        .populate("students", "name email")
        .exec()
      return updatedClass
    } catch (error: any) {
      throw new Error(`Failed to update class: ${error.message}`)
    }
  }

  static async deleteClass(id: string): Promise<boolean> {
    try {
      const result = await Class.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true })
      return !!result
    } catch (error: any) {
      throw new Error(`Failed to delete class: ${error.message}`)
    }
  }

  static async enrollStudent(classId: string, studentId: string): Promise<IClass | null> {
    try {
      const classDoc = await Class.findById(classId)

      if (!classDoc) {
        throw new Error("Class not found")
      }

      if ((classDoc.students?.length || 0) >= classDoc.maxStudents) {
        throw new Error("Class is full")
      }

      if (classDoc.students?.includes(new mongoose.Types.ObjectId(studentId))) {
        throw new Error("Student already enrolled")
      }

      if (!classDoc.students) {
        classDoc.students = []
      }
      classDoc.students.push(new mongoose.Types.ObjectId(studentId))
      await classDoc.save()

      const updatedClass = await classDoc.populate("teacherId", "name email")
      await updatedClass.populate("students", "name email")

      return updatedClass
    } catch (error: any) {
      throw new Error(`Failed to enroll student: ${error.message}`)
    }
  }

  static async unenrollStudent(classId: string, studentId: string): Promise<IClass | null> {
    try {
      const updatedClass = await Class.findByIdAndUpdate(classId, { $pull: { students: studentId } }, { new: true })
        .populate("teacherId", "name email")
        .populate("students", "name email")
        .exec()
      return updatedClass
    } catch (error: any) {
      throw new Error(`Failed to unenroll student: ${error.message}`)
    }
  }

  // Subject CRUD operations
  static async createSubject(subjectData: Partial<ISubject>): Promise<ISubject> {
    try {
      const newSubject = new Subject(subjectData)
      const savedSubject = await newSubject.save()
      return savedSubject
    } catch (error: any) {
      throw new Error(`Failed to create subject: ${error.message}`)
    }
  }

  static async getSubjectById(id: string): Promise<ISubject | null> {
    try {
      const subject = await Subject.findById(id).populate("prerequisites", "name code").exec()
      return subject
    } catch (error: any) {
      throw new Error(`Failed to get subject: ${error.message}`)
    }
  }

  static async getAllSubjects(filters: any = {}): Promise<ISubject[]> {
    try {
      const query: any = { isActive: true }

      if (filters.department) query.department = new RegExp(filters.department, "i")
      if (filters.credits) query.credits = filters.credits

      const subjects = await Subject.find(query).populate("prerequisites", "name code").sort({ code: 1 }).exec()
      return subjects
    } catch (error: any) {
      throw new Error(`Failed to get subjects: ${error.message}`)
    }
  }

  static async updateSubject(id: string, updateData: Partial<ISubject>): Promise<ISubject | null> {
    try {
      const updatedSubject = await Subject.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
        .populate("prerequisites", "name code")
        .exec()
      return updatedSubject
    } catch (error: any) {
      throw new Error(`Failed to update subject: ${error.message}`)
    }
  }

  static async deleteSubject(id: string): Promise<boolean> {
    try {
      const result = await Subject.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true })
      return !!result
    } catch (error: any) {
      throw new Error(`Failed to delete subject: ${error.message}`)
    }
  }

  // ============ CLASS ENROLLMENT OPERATIONS ============

  // Student requests to enroll in a class
  static async requestEnrollment(classId: string, studentId: string, message?: string): Promise<IClassEnrollment> {
    try {
      // Check if class exists and is active
      const classDoc = await Class.findById(classId)
      if (!classDoc || !classDoc.isActive) {
        throw new Error("Class not found or inactive")
      }

      // Check if student is already enrolled
      if (classDoc.students?.includes(new mongoose.Types.ObjectId(studentId))) {
        throw new Error("Student already enrolled in this class")
      }

      // Check if there's already a pending request
      let existingRequest = await ClassEnrollment.findOne({
        classId,
        studentId,
        status: 'pending'
      })

      let savedRequest;
      if (existingRequest) {
        // Update existing request
        existingRequest.message = message
        existingRequest.requestedAt = new Date()
        savedRequest = await existingRequest.save()
      } else {
        // Create new enrollment request
        const enrollmentRequest = new ClassEnrollment({
          classId,
          studentId,
          message,
          status: 'pending'
        })
        savedRequest = await enrollmentRequest.save()
      }
      await savedRequest.populate([
        { path: 'classId', select: 'name subject teacherId maxStudents students' },
        { path: 'studentId', select: 'username email' }
      ])

      return savedRequest
    } catch (error: any) {
      throw new Error(`Failed to request enrollment: ${error.message}`)
    }
  }

  // Get pending enrollment requests for a class (for teachers)
  static async getPendingEnrollments(classId: string): Promise<IClassEnrollment[]> {
    try {
      const enrollments = await ClassEnrollment.find({
        classId,
        status: 'pending'
      })
        .populate('studentId', 'username email')
        .populate('classId', 'name subject maxStudents students')
        .sort({ requestedAt: -1 })
        .exec()

      return enrollments
    } catch (error: any) {
      throw new Error(`Failed to get pending enrollments: ${error.message}`)
    }
  }

  // Get enrollment requests for a student
  static async getStudentEnrollments(studentId: string, status?: string): Promise<IClassEnrollment[]> {
    try {
      const query: any = { studentId }
      if (status) query.status = status

      const enrollments = await ClassEnrollment.find(query)
        .populate('classId', 'name subject teacherId maxStudents schedule')
        .populate('studentId', 'username email')
        .sort({ requestedAt: -1 })
        .exec()

      return enrollments
    } catch (error: any) {
      throw new Error(`Failed to get student enrollments: ${error.message}`)
    }
  }

  // Approve enrollment request
  static async approveEnrollment(enrollmentId: string, reviewedBy: string): Promise<IClassEnrollment | null> {
    try {
      const enrollment = await ClassEnrollment.findById(enrollmentId)
      if (!enrollment) {
        throw new Error("Enrollment request not found")
      }

      if (enrollment.status !== 'pending') {
        throw new Error("Enrollment request already processed")
      }

      // Check if class still has space
      const classDoc = await Class.findById(enrollment.classId)
      if (!classDoc) {
        throw new Error("Class not found")
      }

      if ((classDoc.students?.length || 0) >= classDoc.maxStudents) {
        throw new Error("Class is full")
      }

      // Update enrollment status
      enrollment.status = 'approved'
      enrollment.reviewedAt = new Date()
      enrollment.reviewedBy = new mongoose.Types.ObjectId(reviewedBy)
      await enrollment.save()

      // Add student to class
      if (!classDoc.students) {
        classDoc.students = []
      }
      classDoc.students.push(enrollment.studentId)
      await classDoc.save()

      await enrollment.populate([
        { path: 'classId', select: 'name subject teacherId maxStudents students' },
        { path: 'studentId', select: 'username email' },
        { path: 'reviewedBy', select: 'username email' }
      ])

      return enrollment
    } catch (error: any) {
      throw new Error(`Failed to approve enrollment: ${error.message}`)
    }
  }

  // Reject enrollment request
  static async rejectEnrollment(enrollmentId: string, reviewedBy: string, reason?: string): Promise<IClassEnrollment | null> {
    try {
      const enrollment = await ClassEnrollment.findById(enrollmentId)
      if (!enrollment) {
        throw new Error("Enrollment request not found")
      }

      if (enrollment.status !== 'pending') {
        throw new Error("Enrollment request already processed")
      }

      // Update enrollment status
      enrollment.status = 'rejected'
      enrollment.reviewedAt = new Date()
      enrollment.reviewedBy = new mongoose.Types.ObjectId(reviewedBy)
      if (reason) enrollment.message = reason
      await enrollment.save()

      await enrollment.populate([
        { path: 'classId', select: 'name subject teacherId maxStudents' },
        { path: 'studentId', select: 'username email' },
        { path: 'reviewedBy', select: 'username email' }
      ])

      return enrollment
    } catch (error: any) {
      throw new Error(`Failed to reject enrollment: ${error.message}`)
    }
  }

  // Get available classes for students to enroll
  static async getAvailableClassesForStudent(studentId: string, filters: any = {}): Promise<{
    items: IClass[]
    pagination: {
      page: number
      limit: number
      totalPages: number
      totalItems: number
    }
  }> {
    try {
      const query: any = { isActive: true }

      if (filters.subject) query.subject = new RegExp(filters.subject, "i")
      if (filters.dayOfWeek !== undefined) query["schedule.dayOfWeek"] = filters.dayOfWeek

      // Exclude classes where student is already enrolled
      const studentEnrollments = await ClassEnrollment.find({
        studentId,
        status: { $in: ['approved', 'pending'] }
      }).select('classId')

      const enrolledClassIds = (studentEnrollments || []).map((e: any) => e.classId)
      query._id = { $nin: enrolledClassIds }

      const page = filters.page || 1
      const limit = filters.limit || 10
      const skip = (page - 1) * limit

      const [classes, total] = await Promise.all([
        Class.find(query)
          .populate("teacherId", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Class.countDocuments(query),
      ])

      return {
        items: classes,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to get available classes: ${error.message}`)
    }
  }

  // Assign teacher to subject
  static async assignTeacherToSubject(subjectId: string, teacherId: string): Promise<ISubject | null> {
    try {
      const subject = await Subject.findByIdAndUpdate(
        subjectId,
        { teacherId, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("teacherId", "name email")
        .exec()

      return subject
    } catch (error: any) {
      throw new Error(`Failed to assign teacher to subject: ${error.message}`)
    }
  }

  // Get classes taught by a teacher
  static async getTeacherClasses(teacherId: string, filters: any = {}): Promise<{
    items: IClass[]
    pagination: {
      page: number
      limit: number
      totalPages: number
      totalItems: number
    }
  }> {
    try {
      // Handle teacherId - can be ObjectId or username
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(teacherId);
      let actualTeacherId = teacherId;

      if (!isValidObjectId) {
        // Find user by username and get their _id
        const user = await User.findOne({ username: teacherId });
        if (user) {
          actualTeacherId = user._id;
        } else {
          // If teacher not found, return empty result
          actualTeacherId = null;
        }
      }

      const query: any = { teacherId: actualTeacherId, isActive: true }

      if (filters.subject) query.subject = new RegExp(filters.subject, "i")
      if (filters.dayOfWeek !== undefined) query["schedule.dayOfWeek"] = filters.dayOfWeek

      const page = filters.page || 1
      const limit = filters.limit || 10
      const skip = (page - 1) * limit

      const [classes, total] = await Promise.all([
        Class.find(query)
          .populate("teacherId", "name email")
          .populate("students", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Class.countDocuments(query),
      ])

      return {
        items: classes,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to get teacher classes: ${error.message}`)
    }
  }
}
