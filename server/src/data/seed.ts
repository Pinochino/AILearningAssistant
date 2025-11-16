import { Role, RoleName } from '../models/Role.js'
import { User } from '../models/User.js'
import { Conversation } from '../models/conversation.model.js'
import { Message } from '../models/message.model.js'
import { Notification } from '../models/notification.model.js'
import { IAnnouncement, Announcement } from '../models/announcement.model.js'

import mongoose, { Model } from 'mongoose'
import dotenv from 'dotenv'
import { pathToFileURL } from 'url'
import { Class, Subject, type IClass, type ISubject } from '~/models/class.model.js'

dotenv.config()

export async function runSeed() {
  // Ensure core roles exist (idempotent)
  const roleNames = [
    RoleName.ADMIN,
    RoleName.TEACHER,
    RoleName.STUDENT,
  ] as const

  const existing = await Role.find({ name: { $in: roleNames } })
  const existingSet = new Set(existing.map((r: any) => r.name))
  const toCreate = roleNames.filter(r => !existingSet.has(r)).map(name => ({ name }))
  if (toCreate.length) {
    await Role.insertMany(toCreate)
  }

  let superAdminRole = await Role.findOne({ name: RoleName.ADMIN })
  let teacherRole = await Role.findOne({ name: RoleName.TEACHER })
  let userRole = await Role.findOne({ name: RoleName.STUDENT })

  // Fetch role ids
  const [ADMIN, TEACHER, STUDENT] = await Promise.all([
    Role.findOne({ name: RoleName.ADMIN }),
    Role.findOne({ name: RoleName.TEACHER }),
    Role.findOne({ name: RoleName.STUDENT }),
  ])

  // Ensure email index allows multiple nulls by making it sparse unique
  try {
    const indexes = await (User as any).collection.indexes();
    const hasEmailIndex = Array.isArray(indexes) && indexes.find((ix: any) => ix.name === 'email_1');
    if (hasEmailIndex) {
      try { await (User as any).collection.dropIndex('email_1'); } catch { }
    }
    await (User as any).collection.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email_1' });
  } catch { }

  // Helper to upsert user with roles[] by username
  async function upsertUser(name: string, username: string, password: string, roleIds: any[], email?: string) {
    const doc = await User.findOne({ username })
    if (!doc) {
      const payload: any = { name, username, password, roles: roleIds }
      await User.create(payload)
      return
    }
    // Ensure roles assigned (merge)
    const current = Array.isArray((doc as any).roles) ? (doc as any).roles.map((x: any) => String(x)) : []
    const add = roleIds.filter((rid: any) => !current.includes(String(rid)))
    if (add.length) {
      await User.updateOne({ _id: doc._id }, { $addToSet: { roles: { $each: add } } })
    }
  }

  const password = 'password123'
  await upsertUser('Quản trị hệ thống', 'admin', password, [ADMIN?._id].filter(Boolean) as any)
  await upsertUser('Nguyễn Văn A', 'teacher1', password, [TEACHER?._id].filter(Boolean) as any)
  await upsertUser('Trần Thị B', 'teacher2', password, [TEACHER?._id].filter(Boolean) as any)
  await upsertUser('Lê Văn C', 'student1', password, [STUDENT?._id].filter(Boolean) as any)
  await upsertUser('Phạm Thị D', 'student2', password, [STUDENT?._id].filter(Boolean) as any)
  await upsertUser('Trần Thị H', 'student3', password, [STUDENT?._id].filter(Boolean) as any)
  await upsertUser('Trần Thị K', 'student4', password, [STUDENT?._id].filter(Boolean) as any)
  await upsertUser('Trần Thị M', 'student5', password, [STUDENT?._id].filter(Boolean) as any)

  // Fetch created users
  const [admin, teacher1, teacher2, student1, student2] = await Promise.all([
    User.findOne({ username: 'admin' }),
    User.findOne({ username: 'teacher1' }),
    User.findOne({ username: 'teacher2' }),
    User.findOne({ username: 'student1' }),
    User.findOne({ username: 'student2' }),
  ])

  const AnnouncementModel = Announcement as Model<IAnnouncement>


  // Clean sample collections (keep users/roles)
  await Promise.all([
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    AnnouncementModel.deleteMany({}).exec(),
  ])

  // Conversations: direct, group, ai
  const directConv = await Conversation.create({
    participants: [student1?._id, teacher1?._id].filter(Boolean),
    conversationType: 'direct',
    isGroup: false,
  })

  const groupConv = await Conversation.create({
    participants: [student1?._id, student2?._id, teacher1?._id].filter(Boolean),
    name: 'Lớp Toán 10A',
    conversationType: 'group',
    isGroup: true,
    admins: [teacher1?._id].filter(Boolean),
  })

  const aiConv = await Conversation.create({
    participants: [student1?._id].filter(Boolean),
    conversationType: 'ai',
    aiTutorId: 'default-tutor',
    name: 'AI Tutor - default',
  })

  // Messages
  const message1 = await Message.create({
    conversation: directConv._id,
    sender: student1?._id,
    content: 'Chào thầy, em có câu hỏi về bài tập toán',
    type: 'text',
  })

  const message2 = await Message.create({
    conversation: directConv._id,
    sender: teacher1?._id,
    content: 'Chào em, thầy sẵn sàng giúp em. Em có câu hỏi gì?',
    type: 'text',
  })

  const message3 = await Message.create({
    conversation: groupConv._id,
    sender: teacher1?._id,
    content: 'Chào các em, hôm nay chúng ta sẽ học về phương trình bậc hai',
    type: 'text',
  })

  const aiMessage = await Message.create({
    conversation: aiConv._id,
    sender: null, // sender is null for AI messages
    content: 'Xin chào! Tôi là AI Tutor... Em có câu hỏi gì không?',
    type: 'ai',
    aiTutorId: 'math-tutor',
  })

  // Seed read states: đánh dấu chỉ người gửi đã đọc
  // => Người nhận sẽ thấy chưa đọc để UI có thể bold preview
  await Message.findByIdAndUpdate(message1._id, {
    $set: { readBy: [{ user: student1?._id, readAt: new Date() }] }
  })
  await Message.findByIdAndUpdate(message2._id, {
    $set: { readBy: [{ user: teacher1?._id, readAt: new Date() }] }
  })
  await Message.findByIdAndUpdate(message3._id, {
    $set: { readBy: [{ user: teacher1?._id, readAt: new Date() }] }
  })
  await Message.findByIdAndUpdate(aiMessage._id, {
    $set: { readBy: [{ user: student1?._id, readAt: new Date() }] }
  })

  // Update lastMessage
  await Promise.all([
    Conversation.findByIdAndUpdate(directConv._id, { lastMessage: message2._id }),
    Conversation.findByIdAndUpdate(groupConv._id, { lastMessage: message3._id }),
    Conversation.findByIdAndUpdate(aiConv._id, { lastMessage: aiMessage._id }),
  ])

  // Announcements
  await (Announcement as any).create({
    title: 'Chào mừng năm học mới',
    content: 'Chúc mừng các em bước vào năm học mới đầy hứng khởi!',
    author: admin?._id,
    pinned: true,
  })

  await (Announcement as any).create({
    title: 'Lịch kiểm tra giữa kỳ',
    content: 'Tuần tới sẽ có kiểm tra giữa kỳ cho các môn Toán và Vật lý.',
    author: teacher1?._id,
  })

  await (Announcement as any).create({
    title: 'Thông báo lớp Toán 10A',
    content: 'Buổi học ngày mai chuyển sang phòng 201.',
    author: teacher1?._id,
  })

  // Notifications (ví dụ giáo viên và học sinh)
  await Notification.create({
    user: teacher1?._id,
    actor: student1?._id,
    type: 'class_join_request',
    title: 'Yêu cầu tham gia lớp',
    body: `${student1?.name || 'Học sinh'} muốn tham gia lớp Lớp Toán 10A`,
    data: { classId: groupConv._id, className: 'Lớp Toán 10A', requesterId: student1?._id },
  })
  await Notification.create({
    user: teacher1?._id,
    actor: student2?._id,
    type: 'comment_reply',
    title: 'Có phản hồi bình luận của bạn',
    body: `${student2?.name || 'Học sinh'} đã trả lời bình luận của bạn trong một quiz/flashcard`,
    data: { contentType: 'quiz', contentId: 'quiz-001' },
  })
  await Notification.create({
    user: teacher1?._id,
    actor: student1?._id,
    type: 'new_comment_on_my_content',
    title: 'Bình luận mới trên nội dung của bạn',
    body: `${student1?.name || 'Học sinh'} đã bình luận vào quiz/flashcard bạn tạo`,
    data: { contentType: 'flashcard', contentId: 'fc-001' },
  })

  await Notification.create({
    user: student1?._id,
    actor: teacher1?._id,
    type: 'class_join_result',
    title: 'Yêu cầu tham gia lớp: Đã duyệt',
    body: `Yêu cầu tham gia lớp Lớp Toán 10A của bạn đã được chấp nhận`,
    data: { classId: groupConv._id, className: 'Lớp Toán 10A', status: 'approved' },
  })
  await Notification.create({
    user: student2?._id,
    actor: teacher1?._id,
    type: 'class_join_result',
    title: 'Yêu cầu tham gia lớp: Bị từ chối',
    body: `Yêu cầu tham gia lớp Lớp Toán 10A của bạn đã bị từ chối`,
    data: { classId: groupConv._id, className: 'Lớp Toán 10A', status: 'rejected' },
  })
  await Notification.create({
    user: student1?._id,
    actor: student2?._id,
    type: 'comment_reply',
    title: 'Có phản hồi bình luận của bạn',
    body: `${student2?.name || 'Bạn học'} đã trả lời bình luận của bạn trong một quiz/flashcard`,
    data: { contentType: 'quiz', contentId: 'quiz-001' },
  })
  await Notification.create({
    user: student1?._id,
    actor: teacher1?._id,
    type: 'new_comment_on_my_content',
    title: 'Bình luận mới trên nội dung của bạn',
    body: `${teacher1?.name || 'Giáo viên'} đã bình luận vào quiz/flashcard bạn tạo`,
    data: { contentType: 'flashcard', contentId: 'fc-002' },
  })

  console.log('✅ Seed dữ liệu (roles + users) hoàn tất')

  // Seed Classes
  console.log('🏫 Creating classes...')

  // Fetch required users for class seeding in this scope
  const [classTeacher1, classStudent1, classStudent2] = await Promise.all([
    User.findOne({ username: 'teacher1' }),
    User.findOne({ username: 'student1' }),
    User.findOne({ username: 'student2' }),
  ])

  const classesToSeed: Array<Partial<IClass>> = [
    // ===== LỚP CẤP 3 (có grade cụ thể) =====
    {
      name: 'Toán học - 12A1',
      subject: 'Toán học',
      grade: '12A1',
      description: 'Lớp Toán học nâng cao dành cho học sinh lớp 12A1',
      teacherId: classTeacher1?._id as any,
      students: [classStudent1?._id as any, classStudent2?._id as any],
      schedule: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '08:30' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '08:30' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '08:30' }
      ],
      maxStudents: 40,
    },
    {
      name: 'Vật lý - 12A1',
      subject: 'Vật lý',
      grade: '12A1',
      description: 'Lớp Vật lý thí nghiệm cho học sinh 12A1',
      teacherId: classTeacher1?._id as any,
      students: [classStudent1?._id as any, classStudent2?._id as any],
      schedule: [
        { dayOfWeek: 2, startTime: '08:45', endTime: '10:15' },
        { dayOfWeek: 4, startTime: '08:45', endTime: '10:15' }
      ],
      maxStudents: 35,
    },
    {
      name: 'Trí tuệ nhân tạo',
      subject: 'Trí tuệ nhân tạo',
      grade: undefined, // Không có grade - áp dụng chung
      description: 'Machine Learning, Deep Learning và ứng dụng AI - Tất cả ngành',
      teacherId: classTeacher1?._id as any,
      students: [classStudent2?._id as any],
      schedule: [
        { dayOfWeek: 4, startTime: '15:30', endTime: '17:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '09:30' }
      ],
      maxStudents: 70,
    }
  ]

  // Insert classes (idempotent by name)
  for (const classData of classesToSeed) {
    const existingClass = await Class.findOne({ name: classData.name })
    if (!existingClass) {
      await Class.create(classData)
      console.log(`✅ Created class: ${classData.name}`)
    } else {
      console.log(`⏭️  Skipped (exists): ${classData.name}`)
    }
  }

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`   - Roles: ${await Role.countDocuments()}`)
  console.log(`   - Users: ${await User.countDocuments()}`)
  console.log(`   - Classes: ${await Class.countDocuments()}`)
}

// Allow running the seed directly: `npx tsx src/data/seed.ts`
async function main() {
  const uri = process.env.MONGO_URL
  if (!uri) {
    console.error('❌ MONGO_URL chưa được cấu hình trong .env')
    process.exit(1)
  }
  try {
    console.log('🔌 Đang kết nối MongoDB...')
    await mongoose.connect(uri)
    console.log('✅ Đã kết nối MongoDB')

    await runSeed()

    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi khi seed dữ liệu:', err)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Đã đóng kết nối MongoDB')
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Executed directly
  main()
}


