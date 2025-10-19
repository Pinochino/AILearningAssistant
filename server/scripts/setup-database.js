// Database setup script for ATIUI Messaging & Notifications
// Run with: node scripts/setup-database.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'url';


// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dtumailm_db_user:HhQXlU8VUKU6TRgV@cluster0.tb9bh1l.mongodb.net/ala');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["student", "teacher", "admin"], 
        required: true 
    },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    studentId: { type: String, sparse: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    teacherId: { type: String, sparse: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    permissions: [{ type: String }],
}, { timestamps: true });

UserSchema.index({ role: 1 });
UserSchema.index({ classId: 1 });

const User = mongoose.model('User', UserSchema);

// Conversation Schema (only direct/group/ai)
const ConversationSchema = new mongoose.Schema({
    name: { type: String, default: null },
    isGroup: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    isAiConversation: { type: Boolean, default: false },
    aiTutorId: { type: String, default: null },
    conversationType: { 
        type: String, 
        enum: ["direct", "group", "ai"], 
        default: "direct" 
    },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ conversationType: 1 });
ConversationSchema.index({ isAiConversation: 1 });

const Conversation = mongoose.model('Conversation', ConversationSchema);

// Message Schema (no announcement type)
const MessageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["text", "system", "ai", "attachment"], 
        default: "text" 
    },
    attachments: [{ 
        url: String, 
        filename: String, 
        mimeType: String,
        size: Number 
    }],
    readBy: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now }
    }],
    aiResponse: { type: String, default: null },
    aiTutorId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
}, { timestamps: true });

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ type: 1 });

const Message = mongoose.model('Message', MessageSchema);

// Notification Schema
const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { 
        type: String, 
        required: true,
        enum: [
            "message", "mention", "class_invite", "ai_reply", 
            "announcement", "assignment", "quiz", "grade_update",
            "system", "friend_request", "class_update",
            // new product-specific
            "class_join_request", "class_join_result", "comment_reply", "new_comment_on_my_content"
        ]
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    pushSent: { type: Boolean, default: false },
    pushSentAt: { type: Date, default: null },
    priority: { 
        type: String, 
        enum: ["low", "normal", "high", "urgent"], 
        default: "normal" 
    },
    expiresAt: { type: Date, default: null },
    isAnnouncement: { type: Boolean, default: false },
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
}, { timestamps: true });

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ isAnnouncement: 1 });
NotificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);

// Announcement Schema (global-only; no scope/classId)
const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// Sample data
const createSampleData = async () => {
    try {
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        await Notification.deleteMany({});
        await Announcement.deleteMany({});

        console.log('👥 Creating sample users...');
        
        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const admin = await User.create({
            email: 'admin@atiui.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            permissions: ['all']
        });

        const teacher1 = await User.create({
            email: 'teacher1@atiui.com',
            password: hashedPassword,
            firstName: 'Nguyen',
            lastName: 'Van A',
            role: 'teacher',
            teacherId: 'T001',
            subjects: []
        });

        const teacher2 = await User.create({
            email: 'teacher2@atiui.com',
            password: hashedPassword,
            firstName: 'Tran',
            lastName: 'Thi B',
            role: 'teacher',
            teacherId: 'T002',
            subjects: []
        });

        const student1 = await User.create({
            email: 'student1@atiui.com',
            password: hashedPassword,
            firstName: 'Le',
            lastName: 'Van C',
            role: 'student',
            studentId: 'S001',
            classId: null
        });

        const student2 = await User.create({
            email: 'student2@atiui.com',
            password: hashedPassword,
            firstName: 'Pham',
            lastName: 'Thi D',
            role: 'student',
            studentId: 'S002',
            classId: null
        });

        console.log('💬 Creating sample conversations...');
        
        // Create conversations
        const directConv = await Conversation.create({
            participants: [student1._id, teacher1._id],
            conversationType: 'direct',
            isGroup: false
        });

        const groupConv = await Conversation.create({
            participants: [student1._id, student2._id, teacher1._id],
            name: 'Lớp Toán 10A',
            conversationType: 'group',
            isGroup: true,
            admins: [teacher1._id]
        });

        const aiConv = await Conversation.create({
            participants: [student1._id],
            conversationType: 'ai',
            isAiConversation: true,
            aiTutorId: 'math-tutor',
            name: 'AI Tutor - Math'
        });

        console.log('📝 Creating sample messages...');
        
        // Create messages
        const message1 = await Message.create({
            conversation: directConv._id,
            sender: student1._id,
            content: 'Chào thầy, em có câu hỏi về bài tập toán',
            type: 'text'
        });

        const message2 = await Message.create({
            conversation: directConv._id,
            sender: teacher1._id,
            content: 'Chào em, thầy sẵn sàng giúp em. Em có câu hỏi gì?',
            type: 'text'
        });

        const message3 = await Message.create({
            conversation: groupConv._id,
            sender: teacher1._id,
            content: 'Chào các em, hôm nay chúng ta sẽ học về phương trình bậc hai',
            type: 'text'
        });

        const aiMessage = await Message.create({
            conversation: aiConv._id,
            sender: student1._id, // AI messages still need a sender for validation
            content: 'Xin chào! Tôi là AI Tutor chuyên về Toán học. Tôi có thể giúp em giải các bài tập toán từ cơ bản đến nâng cao. Em có câu hỏi gì không?',
            type: 'ai',
            aiTutorId: 'math-tutor'
        });


        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(directConv._id, { lastMessage: message2._id });
        await Conversation.findByIdAndUpdate(groupConv._id, { lastMessage: message3._id });
        await Conversation.findByIdAndUpdate(aiConv._id, { lastMessage: aiMessage._id });

        console.log('📣 Creating sample announcements...');

        await Announcement.create({
            title: 'Chào mừng năm học mới',
            content: 'Chúc mừng các em bước vào năm học mới đầy hứng khởi!',
            author: admin._id,
            pinned: true,
        });

        await Announcement.create({
            title: 'Lịch kiểm tra giữa kỳ',
            content: 'Tuần tới sẽ có kiểm tra giữa kỳ cho các môn Toán và Vật lý.',
            author: teacher1._id,
        });

        await Announcement.create({
            title: 'Thông báo lớp Toán 10A',
            content: 'Buổi học ngày mai chuyển sang phòng 201.',
            author: teacher1._id,
        });

        console.log('🔔 Creating sample notifications (teacher/student only)...');
        // Teacher notifications
        await Notification.create({
            user: teacher1._id,
            actor: student1._id,
            type: 'class_join_request',
            title: 'Yêu cầu tham gia lớp',
            body: `${student1.firstName} ${student1.lastName} muốn tham gia lớp Lớp Toán 10A`,
            data: { classId: groupConv._id, className: 'Lớp Toán 10A', requesterId: student1._id }
        });
        await Notification.create({
            user: teacher1._id,
            actor: student2._id,
            type: 'comment_reply',
            title: 'Có phản hồi bình luận của bạn',
            body: `${student2.firstName} đã trả lời bình luận của bạn trong một quiz/flashcard`,
            data: { contentType: 'quiz', contentId: 'quiz-001' }
        });
        await Notification.create({
            user: teacher1._id,
            actor: student1._id,
            type: 'new_comment_on_my_content',
            title: 'Bình luận mới trên nội dung của bạn',
            body: `${student1.firstName} đã bình luận vào quiz/flashcard bạn tạo`,
            data: { contentType: 'flashcard', contentId: 'fc-001' }
        });

        // Student notifications
        await Notification.create({
            user: student1._id,
            actor: teacher1._id,
            type: 'class_join_result',
            title: 'Yêu cầu tham gia lớp: Đã duyệt',
            body: `Yêu cầu tham gia lớp Lớp Toán 10A của bạn đã được chấp nhận`,
            data: { classId: groupConv._id, className: 'Lớp Toán 10A', status: 'approved' }
        });
        await Notification.create({
            user: student2._id,
            actor: teacher1._id,
            type: 'class_join_result',
            title: 'Yêu cầu tham gia lớp: Bị từ chối',
            body: `Yêu cầu tham gia lớp Lớp Toán 10A của bạn đã bị từ chối`,
            data: { classId: groupConv._id, className: 'Lớp Toán 10A', status: 'rejected' }
        });
        await Notification.create({
            user: student1._id,
            actor: student2._id,
            type: 'comment_reply',
            title: 'Có phản hồi bình luận của bạn',
            body: `${student2.firstName} đã trả lời bình luận của bạn trong một quiz/flashcard`,
            data: { contentType: 'quiz', contentId: 'quiz-001' }
        });
        await Notification.create({
            user: student1._id,
            actor: teacher1._id,
            type: 'new_comment_on_my_content',
            title: 'Bình luận mới trên nội dung của bạn',
            body: `${teacher1.firstName} đã bình luận vào quiz/flashcard bạn tạo`,
            data: { contentType: 'flashcard', contentId: 'fc-002' }
        });

        console.log('✅ Sample data created successfully!');
        console.log('\n📊 Database Summary:');
        console.log(`👥 Users: ${await User.countDocuments()}`);
        console.log(`💬 Conversations: ${await Conversation.countDocuments()}`);
        console.log(`📝 Messages: ${await Message.countDocuments()}`);
        console.log(`🔔 Notifications: ${await Notification.countDocuments()}`);
        console.log(`📣 Announcements: ${await Announcement.countDocuments()}`);

        console.log('\n🔑 Test Credentials:');
        console.log('Admin: admin@atiui.com / password123');
        console.log('Teacher: teacher1@atiui.com / password123');
        console.log('Student: student1@atiui.com / password123');

    } catch (error) {
        console.error('❌ Error creating sample data:', error);
    }
};

// Main function
const main = async () => {
    await connectDB();
    await createSampleData();
    await mongoose.connection.close();
    console.log('✅ Database setup completed!');
  };
  
  // Run if called directly
  if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(console.error);
  }
  
  export { connectDB, createSampleData };  
