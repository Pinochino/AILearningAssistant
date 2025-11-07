import { Router, type Request, type Response } from 'express'
import { ClassesService } from '../services/classes.services'
import { ClassEnrollment } from '../models/ClassEnrollment'
import { body, param, query, validationResult } from 'express-validator'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'
import authorizationMiddleware from '~/middlewares/auth/authorizationMiddleware'

const router = Router()

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array())
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    })
  }
  next()
}

// Class validation rules
const classValidationRules = [
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('grade').optional().trim().isLength({ max: 50 }).withMessage('Grade/Major cannot exceed 50 characters'),
  body('teacherId').custom((value) => {
    // Accept both ObjectId and username (alphanumeric string)
    if (typeof value === 'string') {
      // Check if it's a valid ObjectId or username (alphanumeric, 3-30 chars)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value)
      const isValidUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value)
      if (!isValidObjectId && !isValidUsername) {
        throw new Error('teacherId must be a valid ObjectId or username (3-30 alphanumeric characters)')
      }
      return true
    }
    throw new Error('teacherId must be a string')
  }),
  body('maxStudents').isInt({ min: 1, max: 100 }).withMessage('Max students must be 1-100'),
  body('schedule').isArray().withMessage('Schedule must be an array'),
  body('schedule.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('schedule.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format'),
  body('schedule.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format')
]

const subjectValidationRules = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('code').trim().isLength({ min: 1, max: 20 }).withMessage('Code must be 1-20 characters'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be 1-10'),
  body('department').trim().isLength({ min: 1 }).withMessage('Department is required')
]

// ============ CLASS ROUTES ============

// GET /classes - Get all classes with filtering and pagination
router.get(
  '/classes',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('subject').optional().trim(),
    query('teacherId')
      .optional()
      .custom((value) => {
        // Accept both ObjectId and username (alphanumeric string)
        if (typeof value === 'string') {
          // Check if it's a valid ObjectId or username (alphanumeric, 3-30 chars)
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value)
          const isValidUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value)
          if (!isValidObjectId && !isValidUsername) {
            throw new Error('teacherId must be a valid ObjectId or username (3-30 alphanumeric characters)')
          }
          return true
        }
        throw new Error('teacherId must be a string')
      }),
    query('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const filters = {
        subject: req.query.subject,
        teacherId: req.query.teacherId,
        dayOfWeek: req.query.dayOfWeek ? Number.parseInt(req.query.dayOfWeek as string) : undefined
      }

      // Remove undefined values (preserve typing)
      ;(Object.keys(filters) as Array<keyof typeof filters>).forEach((key) => {
        if (filters[key] === undefined) delete (filters as any)[key]
      })

      const result = await ClassesService.getAllClasses(filters, page, limit)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// GET /classes/:id - Get class by ID
router.get(
  '/classes/:id',
  [param('id').isMongoId().withMessage('Invalid class ID')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const classDoc = await ClassesService.getClassById(req.params.id)

      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        })
      }

      res.json({
        success: true,
        data: classDoc
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// POST /classes - Create new class
router.post(
  '/classes',
  authenticationMiddleware,
  authorizationMiddleware,
  classValidationRules,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Auto-generate class name: Subject + Grade (or just Subject if no grade)
      const { subject, grade } = req.body
      const className = grade ? `${subject} - ${grade}` : subject

      const classData = {
        ...req.body,
        name: className
      }

      const newClass = await ClassesService.createClass(classData)

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: newClass
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// PATCH /classes/:id - Update class
router.patch(
  '/classes/:id',
  [
    param('id').isMongoId().withMessage('Invalid class ID'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('subject').optional().trim().isLength({ min: 1 }),
    body('grade').optional().trim().isLength({ max: 50 }),
    body('teacherId')
      .optional()
      .custom((value) => {
        // Accept both ObjectId and username (alphanumeric string)
        if (typeof value === 'string') {
          // Check if it's a valid ObjectId or username (alphanumeric, 3-30 chars)
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value)
          const isValidUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value)
          if (!isValidObjectId && !isValidUsername) {
            throw new Error('teacherId must be a valid ObjectId or username (3-30 alphanumeric characters)')
          }
          return true
        }
        throw new Error('teacherId must be a string')
      }),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }),
    body('schedule').optional().isArray(),
    body('isActive').optional().isBoolean()
  ],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Auto-generate name if subject or grade is being updated
      const updateData = { ...req.body }
      if (updateData.subject || updateData.grade) {
        const currentClass = await ClassesService.getClassById(req.params.id)
        if (currentClass) {
          const subject = updateData.subject || currentClass.subject
          const grade = updateData.grade !== undefined ? updateData.grade : currentClass.grade
          updateData.name = grade ? `${subject} - ${grade}` : subject
        }
      }

      const updatedClass = await ClassesService.updateClass(req.params.id, updateData)

      if (!updatedClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        })
      }

      res.json({
        success: true,
        message: 'Class updated successfully',
        data: updatedClass
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// DELETE /classes/:id - Soft delete class
router.delete(
  '/classes/:id',
  [param('id').isMongoId().withMessage('Invalid class ID')],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const deleted = await ClassesService.deleteClass(req.params.id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        })
      }

      res.json({
        success: true,
        message: 'Class deleted successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// POST /classes/:id/enroll - Enroll student in class
router.post(
  '/classes/:id/enroll',
  [
    param('id').isMongoId().withMessage('Invalid class ID'),
    body('studentId').isMongoId().withMessage('Valid student ID is required')
  ],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const updatedClass = await ClassesService.enrollStudent(req.params.id, req.body.studentId)

      if (!updatedClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        })
      }

      res.json({
        success: true,
        message: 'Student enrolled successfully',
        data: updatedClass
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// DELETE /classes/:id/enroll/:studentId - Unenroll student from class
router.delete(
  '/classes/:id/enroll/:studentId',
  [
    param('id').isMongoId().withMessage('Invalid class ID'),
    param('studentId').isMongoId().withMessage('Invalid student ID')
  ],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const updatedClass = await ClassesService.unenrollStudent(req.params.id, req.params.studentId)

      if (!updatedClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        })
      }

      res.json({
        success: true,
        message: 'Student unenrolled successfully',
        data: updatedClass
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// ============ SUBJECT ROUTES ============

// GET /subjects - Get all subjects
router.get(
  '/subjects',
  [query('department').optional().trim(), query('credits').optional().isInt({ min: 1, max: 10 })],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const filters = {
        department: req.query.department,
        credits: req.query.credits ? Number.parseInt(req.query.credits as string) : undefined
      }

      // Remove undefined values (preserve typing)
      ;(Object.keys(filters) as Array<keyof typeof filters>).forEach((key) => {
        if (filters[key] === undefined) delete (filters as any)[key]
      })

      const subjects = await ClassesService.getAllSubjects(filters)

      res.json({
        success: true,
        data: subjects
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// GET /subjects/:id - Get subject by ID
router.get(
  '/subjects/:id',
  [param('id').isMongoId().withMessage('Invalid subject ID')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const subject = await ClassesService.getSubjectById(req.params.id)

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        })
      }

      res.json({
        success: true,
        data: subject
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// POST /subjects - Create new subject
router.post(
  '/subjects',
  authenticationMiddleware,
  authorizationMiddleware,
  subjectValidationRules,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const newSubject = await ClassesService.createSubject(req.body)

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: newSubject
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// PATCH /subjects/:id - Update subject
router.patch(
  '/subjects/:id',
  [
    param('id').isMongoId().withMessage('Invalid subject ID'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('code').optional().trim().isLength({ min: 1, max: 20 }),
    body('credits').optional().isInt({ min: 1, max: 10 }),
    body('department').optional().trim().isLength({ min: 1 }),
    body('isActive').optional().isBoolean()
  ],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const updatedSubject = await ClassesService.updateSubject(req.params.id, req.body)

      if (!updatedSubject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        })
      }

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: updatedSubject
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// DELETE /subjects/:id - Soft delete subject
router.delete(
  '/subjects/:id',
  [param('id').isMongoId().withMessage('Invalid subject ID')],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const deleted = await ClassesService.deleteSubject(req.params.id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        })
      }

      res.json({
        success: true,
        message: 'Subject deleted successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// ============ ENROLLMENT ROUTES ============

// POST /classes/:id/request-enrollment - Student requests to enroll in class
router.post(
  '/classes/:id/request-enrollment',
  [
    param('id').isMongoId().withMessage('Invalid class ID'),
    // Make message optional and ensure it's a string before length validation to avoid runtime errors
    body('message')
      .optional({ values: 'falsy' })
      .isString()
      .bail()
      .isLength({ max: 500 })
      .withMessage('Message cannot exceed 500 characters')
  ],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Ensure user is attached by auth middleware
      const user = (req as any).user
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }

      const studentId = user.id as string
      const rawMessage = (req.body as any)?.message
      const message = typeof rawMessage === 'string' ? rawMessage : undefined

      const enrollment = await ClassesService.requestEnrollment(req.params.id, studentId, message)

      res.status(201).json({
        success: true,
        message: 'Enrollment request submitted successfully',
        data: enrollment
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// GET /classes/:id/pending-enrollments - Get pending enrollment requests for a class (Teacher only)
router.get(
  '/classes/:id/pending-enrollments',
  [param('id').isMongoId().withMessage('Invalid class ID')],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const enrollments = await ClassesService.getPendingEnrollments(req.params.id)

      res.json({
        success: true,
        data: enrollments
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// GET /students/:id/enrollments - Get student's enrollment requests
router.get(
  '/students/:id/enrollments',
  [
    param('id').custom((value) => {
      // Accept both ObjectId and username (alphanumeric string)
      if (typeof value === 'string') {
        // Check if it's a valid ObjectId or username (alphanumeric, 3-30 chars)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value)
        const isValidUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value)
        if (!isValidObjectId && !isValidUsername) {
          throw new Error('studentId must be a valid ObjectId or username (3-30 alphanumeric characters)')
        }
        return true
      }
      throw new Error('studentId must be a string')
    }),
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check if user is requesting their own enrollments or is admin/teacher
      const userId = (req as any).user.id
      const requestedStudentId = req.params.id

      if (userId !== requestedStudentId) {
        // Check if user has admin or teacher role
        const userRoles = (req as any).user.roles || []
        const hasAdminRole = userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN')
        const hasTeacherRole = userRoles.includes('TEACHER')

        if (!hasAdminRole && !hasTeacherRole) {
          return res.status(403).json({
            success: false,
            message: 'You can only view your own enrollments'
          })
        }
      }

      const enrollments = await ClassesService.getStudentEnrollments(req.params.id, req.query.status as string)

      res.json({
        success: true,
        data: enrollments
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// POST /enrollments/:id/approve - Approve enrollment request (Teacher only)
router.post(
  '/enrollments/:id/approve',
  [param('id').isMongoId().withMessage('Invalid enrollment ID')],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const reviewedBy = (req as any).user.id
      const enrollment = await ClassesService.approveEnrollment(req.params.id, reviewedBy)

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment request not found'
        })
      }

      res.json({
        success: true,
        message: 'Enrollment request approved successfully',
        data: enrollment
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// POST /enrollments/:id/reject - Reject enrollment request (Teacher only)
router.post(
  '/enrollments/:id/reject',
  [
    param('id').isMongoId().withMessage('Invalid enrollment ID'),
    body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
  ],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const reviewedBy = (req as any).user.id

      // Pre-check status to provide clearer feedback for testing
      const current = await ClassEnrollment.findById(req.params.id).select('status')
      if (!current) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment request not found'
        })
      }
      if (current.status !== 'pending') {
        return res.status(409).json({
          success: false,
          message: `Enrollment request already processed (status: ${current.status})`
        })
      }

      const enrollment = await ClassesService.rejectEnrollment(req.params.id, reviewedBy, req.body.reason)

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment request not found'
        })
      }

      res.json({
        success: true,
        message: 'Enrollment request rejected successfully',
        data: enrollment
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// GET /students/:id/available-classes - Get available classes for student to enroll
router.get(
  '/students/:id/available-classes',
  [
    param('id').custom((value) => {
      // Accept both ObjectId and username (alphanumeric string)
      if (typeof value === 'string') {
        // Check if it's a valid ObjectId or username (alphanumeric, 3-30 chars)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value)
        const isValidUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value)
        if (!isValidObjectId && !isValidUsername) {
          throw new Error('studentId must be a valid ObjectId or username (3-30 alphanumeric characters)')
        }
        return true
      }
      throw new Error('studentId must be a string')
    }),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('subject').optional().trim(),
    query('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6')
  ],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check if user is requesting their own available classes or is admin/teacher
      const userId = (req as any).user.id
      const requestedStudentId = req.params.id

      if (userId !== requestedStudentId) {
        // Check if user has admin or teacher role
        const userRoles = (req as any).user.roles || []
        const hasAdminRole = userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN')
        const hasTeacherRole = userRoles.includes('TEACHER')

        if (!hasAdminRole && !hasTeacherRole) {
          return res.status(403).json({
            success: false,
            message: 'You can only view your own available classes'
          })
        }
      }

      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const filters = {
        page,
        limit,
        subject: req.query.subject,
        dayOfWeek: req.query.dayOfWeek ? Number.parseInt(req.query.dayOfWeek as string) : undefined
      }

      // Remove undefined values
      ;(Object.keys(filters) as Array<keyof typeof filters>).forEach((key) => {
        if (filters[key] === undefined) delete (filters as any)[key]
      })

      const result = await ClassesService.getAvailableClassesForStudent(req.params.id, filters)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// ============ TEACHER ASSIGNMENT ROUTES ============

// POST /subjects/:id/assign-teacher - Assign teacher to subject (Admin only)
router.post(
  '/subjects/:id/assign-teacher',
  [
    param('id').isMongoId().withMessage('Invalid subject ID'),
    body('teacherId').isMongoId().withMessage('Valid teacher ID is required')
  ],
  authenticationMiddleware,
  authorizationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const subject = await ClassesService.assignTeacherToSubject(req.params.id, req.body.teacherId)

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        })
      }

      res.json({
        success: true,
        message: 'Teacher assigned to subject successfully',
        data: subject
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

// GET /teachers/:id/classes - Get classes taught by a teacher
router.get(
  '/teachers/:id/classes',
  [
    param('id').custom((value) => {
      // Accept both ObjectId and username (alphanumeric string)
      if (typeof value === 'string') {
        // Check if it's a valid ObjectId or username (alphanumeric, 3-30 chars)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(value)
        const isValidUsername = /^[a-zA-Z0-9_-]{3,30}$/.test(value)
        if (!isValidObjectId && !isValidUsername) {
          throw new Error('teacherId must be a valid ObjectId or username (3-30 alphanumeric characters)')
        }
        return true
      }
      throw new Error('teacherId must be a string')
    }),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('subject').optional().trim(),
    query('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6')
  ],
  authenticationMiddleware,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 10
      const filters = {
        page,
        limit,
        subject: req.query.subject,
        dayOfWeek: req.query.dayOfWeek ? Number.parseInt(req.query.dayOfWeek as string) : undefined
      }

      // Remove undefined values
      ;(Object.keys(filters) as Array<keyof typeof filters>).forEach((key) => {
        if (filters[key] === undefined) delete (filters as any)[key]
      })

      const result = await ClassesService.getTeacherClasses(req.params.id, filters)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

export default router
