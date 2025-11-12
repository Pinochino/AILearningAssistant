import { Role, RoleName } from '~/models/Role'
import { User } from '~/models/User'
import { Class, Subject, type IClass, type ISubject } from '~/models/class.model'

export async function runSeed() {
  console.log('🌱 Starting database seeding...')

  // 1. Seed Roles
  let superAdminRole = await Role.findOne({ name: RoleName.SUPER_ADMIN })
  let teacherRole = await Role.findOne({ name: RoleName.TEACHER })
  let userRole = await Role.findOne({ name: RoleName.USER })

  if (!superAdminRole || !teacherRole || !userRole) {
    console.log('📝 Creating roles...')
    await Role.insertMany([{ name: RoleName.SUPER_ADMIN }, { name: RoleName.TEACHER }, { name: RoleName.USER }])

    superAdminRole = await Role.findOne({ name: RoleName.SUPER_ADMIN })
    teacherRole = await Role.findOne({ name: RoleName.TEACHER })
    userRole = await Role.findOne({ name: RoleName.USER })
  }

  // 2. Seed Admin User
  const adminUsername = 'admin'
  let adminUser = await User.findOne({ username: adminUsername })

  if (!adminUser) {
    console.log('👤 Creating admin user...')
    adminUser = await User.create({
      username: 'admin',
      name: 'Uyen',
      password: '123456',
      roles: superAdminRole ? [superAdminRole._id] : []
    })
    console.log(`✅ Admin created: ${adminUsername} / 123456`)
  }
  // 3. Seed Teacher Users
  const teachers = [
    { username: 'teacher1', name: 'Nguyễn văn A', password: '123456' },
    { username: 'teacher2', name: 'Nguyễn Văn B', password: '123456' },
    { username: 'teacher3', name: 'Nguyễn Văn C', password: '123456' }
  ]

  const teacherUsers = []
  for (const teacherData of teachers) {
    let teacher = await User.findOne({ username: teacherData.username })
    if (!teacher) {
      console.log(`👨‍🏫 Creating teacher: ${teacherData.username}`)
      teacher = await User.create({
        ...teacherData,
        roles: [teacherRole!._id]
      })
    }
    teacherUsers.push(teacher)
  }

  // 4. Seed Student Users
  const students = [
    { username: 'student1', name: 'Trần Thị F', password: '123456' },
    { username: 'student2', name: 'Trần Thị G', password: '123456' },
    { username: 'student3', name: 'Trần Thị H', password: '123456' },
    { username: 'student4', name: 'Trần Thị K', password: '123456' },
    { username: 'student5', name: 'Trần Thị M', password: '123456' }
  ]

  const studentUsers = []
  for (const studentData of students) {
    let student = await User.findOne({ username: studentData.username })
    if (!student) {
      console.log(`👨‍🎓 Creating student: ${studentData.username}`)
      student = await User.create({
        ...studentData,
        roles: [userRole!._id]
      })
    }
    studentUsers.push(student)
  }

  // 6. Seed Classes
  console.log('🏫 Creating classes...')
  
  const classesToSeed: Array<Partial<IClass>> = [
    // ===== LỚP CẤP 3 (có grade cụ thể) =====
    {
      name: "Toán học - 12A1",
      subject: "Toán học",
      grade: "12A1",
      description: "Lớp Toán học nâng cao dành cho học sinh lớp 12A1",
      teacherId: teacherUsers[0]._id as any,
      students: [studentUsers[0]._id as any, studentUsers[1]._id as any],
      schedule: [
        { dayOfWeek: 1, startTime: "07:00", endTime: "08:30" },
        { dayOfWeek: 3, startTime: "07:00", endTime: "08:30" },
        { dayOfWeek: 5, startTime: "07:00", endTime: "08:30" }
      ],
      maxStudents: 40,
    },
    {
      name: "Vật lý - 12A1",
      subject: "Vật lý",
      grade: "12A1",
      description: "Lớp Vật lý thí nghiệm cho học sinh 12A1",
      teacherId: teacherUsers[1]._id as any,
      students: [studentUsers[0]._id as any, studentUsers[1]._id as any, studentUsers[2]._id as any],
      schedule: [
        { dayOfWeek: 2, startTime: "08:45", endTime: "10:15" },
        { dayOfWeek: 4, startTime: "08:45", endTime: "10:15" }
      ],
      maxStudents: 35,
    },
    {
      name: "Hóa học - 11B",
      subject: "Hóa học",
      grade: "11B",
      description: "Lớp Hóa học cơ bản cho học sinh lớp 11B",
      teacherId: teacherUsers[2]._id as any,
      students: [studentUsers[2]._id as any, studentUsers[3]._id as any],
      schedule: [
        { dayOfWeek: 1, startTime: "13:30", endTime: "15:00" },
        { dayOfWeek: 3, startTime: "13:30", endTime: "15:00" }
      ],
      maxStudents: 38,
    },
    {
      name: "Tiếng Anh - 10A",
      subject: "Tiếng Anh",
      grade: "10A",
      description: "Lớp Tiếng Anh giao tiếp cho học sinh lớp 10A",
      teacherId: teacherUsers[0]._id as any,
      students: [studentUsers[3]._id as any, studentUsers[4]._id as any],
      schedule: [
        { dayOfWeek: 2, startTime: "15:15", endTime: "16:45" },
        { dayOfWeek: 5, startTime: "15:15", endTime: "16:45" }
      ],
      maxStudents: 42,
    },

    // ===== LỚP ĐẠI HỌC (có thể có hoặc không có grade/ngành) =====
    {
      name: "Cấu trúc dữ liệu và Giải thuật - IT",
      subject: "Cấu trúc dữ liệu và Giải thuật",
      grade: "IT",
      description: "Môn học cơ sở về cấu trúc dữ liệu, thuật toán - Ngành IT",
      teacherId: teacherUsers[1]._id as any,
      students: [studentUsers[0]._id as any, studentUsers[1]._id as any],
      schedule: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "09:30" },
        { dayOfWeek: 3, startTime: "08:00", endTime: "09:30" }
      ],
      maxStudents: 60,
    },
    {
      name: "Cấu trúc dữ liệu và Giải thuật - MME",
      subject: "Cấu trúc dữ liệu và Giải thuật",
      grade: "MME",
      description: "Môn học cơ sở về cấu trúc dữ liệu, thuật toán - Ngành MME",
      teacherId: teacherUsers[1]._id as any,
      students: [studentUsers[2]._id as any],
      schedule: [
        { dayOfWeek: 2, startTime: "10:00", endTime: "11:30" },
        { dayOfWeek: 4, startTime: "10:00", endTime: "11:30" }
      ],
      maxStudents: 50,
    },
    {
      name: "Lập trình Web",
      subject: "Lập trình Web",
      grade: undefined, // Không có grade - áp dụng chung
      description: "Học HTML, CSS, JavaScript, React và Node.js - Tất cả ngành",
      teacherId: teacherUsers[2]._id as any,
      students: [studentUsers[1]._id as any, studentUsers[3]._id as any, studentUsers[4]._id as any],
      schedule: [
        { dayOfWeek: 2, startTime: "13:30", endTime: "15:00" },
        { dayOfWeek: 4, startTime: "13:30", endTime: "15:00" }
      ],
      maxStudents: 80,
    },
    {
      name: "Cơ sở dữ liệu - IT",
      subject: "Cơ sở dữ liệu",
      grade: "IT",
      description: "SQL, NoSQL, thiết kế và tối ưu hóa cơ sở dữ liệu - Ngành IT",
      teacherId: teacherUsers[0]._id as any,
      students: [studentUsers[0]._id as any, studentUsers[2]._id as any],
      schedule: [
        { dayOfWeek: 3, startTime: "10:00", endTime: "11:30" },
        { dayOfWeek: 5, startTime: "10:00", endTime: "11:30" }
      ],
      maxStudents: 55,
    },
    {
      name: "Trí tuệ nhân tạo",
      subject: "Trí tuệ nhân tạo",
      grade: undefined, // Không có grade - áp dụng chung
      description: "Machine Learning, Deep Learning và ứng dụng AI - Tất cả ngành",
      teacherId: teacherUsers[1]._id as any,
      students: [studentUsers[1]._id as any, studentUsers[4]._id as any],
      schedule: [
        { dayOfWeek: 4, startTime: "15:30", endTime: "17:00" },
        { dayOfWeek: 6, startTime: "08:00", endTime: "09:30" }
      ],
      maxStudents: 70,
    },
    {
      name: "Hệ điều hành - IT",
      subject: "Hệ điều hành",
      grade: "IT",
      description: "Processes, threads, memory management và file systems - Ngành IT",
      teacherId: teacherUsers[2]._id as any,
      students: [studentUsers[0]._id as any, studentUsers[3]._id as any],
      schedule: [
        { dayOfWeek: 1, startTime: "13:30", endTime: "15:00" },
        { dayOfWeek: 5, startTime: "13:30", endTime: "15:00" }
      ],
      maxStudents: 50,
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
  console.log(`   - Subjects: ${await Subject.countDocuments()}`)
  console.log(`   - Classes: ${await Class.countDocuments()}`)
  console.log('\n🔑 Login credentials:')
  console.log('   Admin: admin / 123456')
  console.log('   Teacher: teacher1 / 123456')
  console.log('   Student: student1 / 123456')
}


