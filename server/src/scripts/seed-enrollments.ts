import 'dotenv/config';
import connectDB from '../database/connection';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Class } from '../models/class.model';
import { ClassEnrollment } from '../models/ClassEnrollment';

async function seedEnrollments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all students - check both username and roles
    const students = await User.find({
      $or: [
        { username: /^student/i },
        { email: /^student/i }
      ]
    }).limit(5);
    console.log(`📚 Found ${students.length} students`);

    // Get all classes
    const classes = await Class.find({ isActive: true }).limit(10);
    console.log(`🏫 Found ${classes.length} classes`);

    if (students.length === 0 || classes.length === 0) {
      console.log('⚠️ No students or classes found. Run seed script first.');
      process.exit(0);
    }

    // Clear existing enrollments
    await ClassEnrollment.deleteMany({});
    console.log('🗑️ Cleared existing enrollments');

    // Create enrollments for each student
    const enrollments: Array<{
      classId: mongoose.Types.ObjectId;
      studentId: mongoose.Types.ObjectId;
      status: 'approved';
      requestedAt: Date;
      reviewedAt: Date;
    }> = [];
    for (const student of students) {
      // Enroll each student in 2-3 random classes
      const numClasses = Math.floor(Math.random() * 2) + 2; // 2-3 classes
      const shuffled = [...classes].sort(() => 0.5 - Math.random());
      const selectedClasses = shuffled.slice(0, numClasses);

      for (const cls of selectedClasses) {
        enrollments.push({
          classId: cls._id,
          studentId: student._id as mongoose.Types.ObjectId,
          status: 'approved', // Auto-approve for testing
          requestedAt: new Date(),
          reviewedAt: new Date(),
        });

        // Add student to class students
        if (!cls.students.includes(student._id as mongoose.Types.ObjectId)) {
          cls.students.push(student._id as mongoose.Types.ObjectId);
          await cls.save();
        }
      }
    }

    await ClassEnrollment.insertMany(enrollments);
    console.log(`✅ Created ${enrollments.length} enrollments`);

    // Show summary
    for (const student of students) {
      const studentEnrollments = await ClassEnrollment.find({ 
        studentId: student._id,
        status: 'approved'
      }).populate('classId', 'name subject');
      
      console.log(`\n👤 ${student.username} (${student.email}):`);
      studentEnrollments.forEach((e: any) => {
        console.log(`   ✓ ${e.classId.name} - ${e.classId.subject}`);
      });
    }

    console.log('\n✅ Enrollment seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedEnrollments();
