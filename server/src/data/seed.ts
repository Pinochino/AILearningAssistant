import { Role, RoleName } from '../models/Role.js'
import { User } from '../models/User.js'
import { Conversation } from '../models/conversation.model.js'
import { Message } from '../models/message.model.js'
import { Notification } from '../models/notification.model.js'
import Announcement from '../models/announcement.model.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { pathToFileURL } from 'url'

dotenv.config()

export async function runSeed() {
  // Ensure core roles exist (idempotent)
  const roleNames = [
    RoleName.ADMIN,
    RoleName.TEACHER,
    RoleName.STUDENT,
    RoleName.SUPER_ADMIN,
    RoleName.USER,
  ] as const

  const existing = await Role.find({ name: { $in: roleNames } })
  const existingSet = new Set(existing.map((r: any) => r.name))
  const toCreate = roleNames.filter(r => !existingSet.has(r)).map(name => ({ name }))
  if (toCreate.length) {
    await Role.insertMany(toCreate)
  }
  // Fetch role ids
  const [ADMIN, TEACHER, STUDENT, SUPER_ADMIN] = await Promise.all([
    Role.findOne({ name: RoleName.ADMIN }),
    Role.findOne({ name: RoleName.TEACHER }),
    Role.findOne({ name: RoleName.STUDENT }),
    Role.findOne({ name: RoleName.SUPER_ADMIN })
  ])

  // Ensure email index allows multiple nulls by making it sparse unique
  try {
    const indexes = await (User as any).collection.indexes();
    const hasEmailIndex = Array.isArray(indexes) && indexes.find((ix: any) => ix.name === 'email_1');
    if (hasEmailIndex) {
      try { await (User as any).collection.dropIndex('email_1'); } catch {}
    }
    await (User as any).collection.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email_1' });
  } catch {}

  // Helper to upsert user with roles[] by username
  async function upsertUser(name: string, username: string, password: string, roleIds: any[], email?: string) {
    const doc = await User.findOne({ username })
    if (!doc) {
      const payload: any = { name, username, password, roles: roleIds }
      if (email) payload.email = email
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
  await upsertUser('Quản trị hệ thống', 'admin', password, [SUPER_ADMIN?._id || ADMIN?._id].filter(Boolean) as any)
  await upsertUser('Nguyễn Văn A', 'teacher1', password, [TEACHER?._id].filter(Boolean) as any)
  await upsertUser('Trần Thị B', 'teacher2', password, [TEACHER?._id].filter(Boolean) as any)
  await upsertUser('Lê Văn C', 'student1', password, [STUDENT?._id].filter(Boolean) as any)
  await upsertUser('Phạm Thị D', 'student2', password, [STUDENT?._id].filter(Boolean) as any)

  // Fetch created users
  const [admin, teacher1, teacher2, student1, student2] = await Promise.all([
    User.findOne({ username: 'admin' }),
    User.findOne({ username: 'teacher1' }),
    User.findOne({ username: 'teacher2' }),
    User.findOne({ username: 'student1' }),
    User.findOne({ username: 'student2' }),
  ])

  // Clean sample collections (keep users/roles)
  await Promise.all([
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Announcement.deleteMany({}),
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
    isAiConversation: true,
    aiTutorId: 'math-tutor',
    name: 'AI Tutor - Math',
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
    sender: student1?._id, // để hợp lệ schema (sender required khi không phải type 'ai')
    content: 'Xin chào! Tôi là AI Tutor chuyên về Toán học... Em có câu hỏi gì không?',
    type: 'ai',
    aiTutorId: 'math-tutor',
  })

  // Update lastMessage
  await Promise.all([
    Conversation.findByIdAndUpdate(directConv._id, { lastMessage: message2._id }),
    Conversation.findByIdAndUpdate(groupConv._id, { lastMessage: message3._id }),
    Conversation.findByIdAndUpdate(aiConv._id, { lastMessage: aiMessage._id }),
  ])

  // Announcements
  await Announcement.create({
    title: 'Chào mừng năm học mới',
    content: 'Chúc mừng các em bước vào năm học mới đầy hứng khởi!',
    author: admin?._id,
    pinned: true,
  })

  await Announcement.create({
    title: 'Lịch kiểm tra giữa kỳ',
    content: 'Tuần tới sẽ có kiểm tra giữa kỳ cho các môn Toán và Vật lý.',
    author: teacher1?._id,
  })

  await Announcement.create({
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
    body: `${student1?.firstName || 'Học sinh'} muốn tham gia lớp Lớp Toán 10A`,
    data: { classId: groupConv._id, className: 'Lớp Toán 10A', requesterId: student1?._id },
  })
  await Notification.create({
    user: teacher1?._id,
    actor: student2?._id,
    type: 'comment_reply',
    title: 'Có phản hồi bình luận của bạn',
    body: `${student2?.firstName || 'Học sinh'} đã trả lời bình luận của bạn trong một quiz/flashcard`,
    data: { contentType: 'quiz', contentId: 'quiz-001' },
  })
  await Notification.create({
    user: teacher1?._id,
    actor: student1?._id,
    type: 'new_comment_on_my_content',
    title: 'Bình luận mới trên nội dung của bạn',
    body: `${student1?.firstName || 'Học sinh'} đã bình luận vào quiz/flashcard bạn tạo`,
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
    body: `${student2?.firstName || 'Bạn học'} đã trả lời bình luận của bạn trong một quiz/flashcard`,
    data: { contentType: 'quiz', contentId: 'quiz-001' },
  })
  await Notification.create({
    user: student1?._id,
    actor: teacher1?._id,
    type: 'new_comment_on_my_content',
    title: 'Bình luận mới trên nội dung của bạn',
    body: `${teacher1?.firstName || 'Giáo viên'} đã bình luận vào quiz/flashcard bạn tạo`,
    data: { contentType: 'flashcard', contentId: 'fc-002' },
  })

  console.log('✅ Seed dữ liệu (roles + users) hoàn tất')
}

// Allow running the seed directly: `npx tsx src/data/seed.ts`
async function main() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('❌ MONGO_URI chưa được cấu hình trong .env')
    process.exit(1)
  }
  try {
    console.log('🔌 Đang kết nối MongoDB...')
    await mongoose.connect(uri)
    console.log('✅ Đã kết nối MongoDB')

    await runSeed()
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
