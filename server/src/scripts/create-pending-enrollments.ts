import 'dotenv/config';
import connectDB from '../database/connection';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Class } from '../models/class.model';
import { ClassEnrollment } from '../models/ClassEnrollment';

async function createPendingEnrollments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get students that haven't enrolled yet
    const allStudents = await User.find({
      $or: [
        { username: /^student/i },
        { email: /^student/i }
      ]
    });
    
    // Get all classes
    const classes = await Class.find({ isActive: true }).limit(5);
    
    if (allStudents.length === 0 || classes.length === 0) {
      console.log('⚠️ No students or classes found.');
      process.exit(0);
    }

    console.log(`📚 Found ${allStudents.length} students`);
    console.log(`🏫 Found ${classes.length} classes`);

    // Create 3-5 pending enrollments
    const pendingCount = Math.floor(Math.random() * 3) + 3; // 3-5 pending
    const enrollments: Array<{
      classId: mongoose.Types.ObjectId;
      studentId: mongoose.Types.ObjectId;
      status: 'pending' | 'approved' | 'rejected';
      message: string;
      requestedAt: Date;
    }> = [];

    for (let i = 0; i < pendingCount && i < allStudents.length; i++) {
      const student = allStudents[i];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];

      // Check if enrollment already exists
      const existing = await ClassEnrollment.findOne({
        studentId: student._id,
        classId: randomClass._id
      });

      if (!existing) {
        enrollments.push({
          classId: randomClass._id as mongoose.Types.ObjectId,
          studentId: student._id as mongoose.Types.ObjectId,
          status: 'pending',
          message: `Em muốn tham gia lớp ${randomClass.name} để học tập`,
          requestedAt: new Date(),
        });
      }
    }

    if (enrollments.length > 0) {
      await ClassEnrollment.insertMany(enrollments);
      console.log(`✅ Created ${enrollments.length} pending enrollments`);

      // Show summary
      for (const enrollment of enrollments) {
        const student = await User.findById(enrollment.studentId);
        const cls = await Class.findById(enrollment.classId);
        console.log(`   📝 ${student?.username} → ${cls?.name} (PENDING)`);
      }
    } else {
      console.log('⚠️ No new pending enrollments created (all students already enrolled)');
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createPendingEnrollments();
