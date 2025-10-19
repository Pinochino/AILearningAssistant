import 'dotenv/config'
import connectDB from '../database/connection'
import mongoose from 'mongoose'
import { User } from '../models/User'
import { Role, RoleName } from '../models/Role'

async function fixDatabase() {
  try {
    await connectDB()
    
    console.log('🔧 Fixing database...\n')
    
    // 1. Ensure roles exist
    console.log('1️⃣ Checking roles...')
    let superAdminRole = await Role.findOne({ name: RoleName.SUPER_ADMIN })
    let adminRole = await Role.findOne({ name: RoleName.ADMIN })
    let userRole = await Role.findOne({ name: RoleName.USER })

    if (!superAdminRole || !adminRole || !userRole) {
      console.log('   Creating missing roles...')
      await Role.deleteMany({}) // Clear old roles
      await Role.insertMany([
        { name: RoleName.SUPER_ADMIN },
        { name: RoleName.ADMIN },
        { name: RoleName.USER }
      ])
      superAdminRole = await Role.findOne({ name: RoleName.SUPER_ADMIN })
      adminRole = await Role.findOne({ name: RoleName.ADMIN })
      userRole = await Role.findOne({ name: RoleName.USER })
      console.log('   ✅ Roles created')
    } else {
      console.log('   ✅ Roles exist')
    }

    // 2. Fix admin user
    console.log('\n2️⃣ Fixing admin user...')
    let admin = await User.findOne({ email: 'admin@gmail.com' })
    
    if (!admin) {
      console.log('   Creating admin user...')
      admin = await User.create({
        username: 'admin',
        email: 'admin@gmail.com',
        password: '123456',
        roles: [superAdminRole!._id]
      })
      console.log('   ✅ Admin created')
    } else {
      let needsUpdate = false
      
      if (!admin.username) {
        admin.username = 'admin'
        needsUpdate = true
        console.log('   ✅ Fixed username')
      }
      
      if (!admin.roles || admin.roles.length === 0) {
        admin.roles = [superAdminRole!._id as any]
        needsUpdate = true
        console.log('   ✅ Fixed roles')
      }
      
      if (needsUpdate) {
        await admin.save()
        console.log('   ✅ Admin updated')
      } else {
        console.log('   ✅ Admin OK')
      }
    }

    // 3. Fix teachers
    console.log('\n3️⃣ Fixing teachers...')
    const teachers = [
      { username: 'teacher1', email: 'teacher1@example.com' },
      { username: 'teacher2', email: 'teacher2@example.com' },
      { username: 'teacher3', email: 'teacher3@example.com' }
    ]

    for (const teacherData of teachers) {
      let teacher = await User.findOne({ email: teacherData.email })
      
      if (!teacher) {
        teacher = await User.create({
          username: teacherData.username,
          email: teacherData.email,
          password: '123456',
          roles: [userRole!._id]
        })
        console.log(`   ✅ Created ${teacherData.username}`)
      } else {
        let needsUpdate = false
        
        if (!teacher.username || teacher.username !== teacherData.username) {
          teacher.username = teacherData.username
          needsUpdate = true
        }
        
        if (!teacher.roles || teacher.roles.length === 0) {
          teacher.roles = [userRole!._id as any]
          needsUpdate = true
        }
        
        if (needsUpdate) {
          await teacher.save()
          console.log(`   ✅ Fixed ${teacherData.username}`)
        } else {
          console.log(`   ✅ ${teacherData.username} OK`)
        }
      }
    }

    // 4. Fix students
    console.log('\n4️⃣ Fixing students...')
    const students = [
      { username: 'student1', email: 'student1@example.com' },
      { username: 'student2', email: 'student2@example.com' },
      { username: 'student3', email: 'student3@example.com' },
      { username: 'student4', email: 'student4@example.com' },
      { username: 'student5', email: 'student5@example.com' }
    ]

    for (const studentData of students) {
      let student = await User.findOne({ email: studentData.email })
      
      if (!student) {
        student = await User.create({
          username: studentData.username,
          email: studentData.email,
          password: '123456',
          roles: [userRole!._id]
        })
        console.log(`   ✅ Created ${studentData.username}`)
      } else {
        let needsUpdate = false
        
        if (!student.username || student.username !== studentData.username) {
          student.username = studentData.username
          needsUpdate = true
        }
        
        if (!student.roles || student.roles.length === 0) {
          student.roles = [userRole!._id as any]
          needsUpdate = true
        }
        
        if (needsUpdate) {
          await student.save()
          console.log(`   ✅ Fixed ${studentData.username}`)
        } else {
          console.log(`   ✅ ${studentData.username} OK`)
        }
      }
    }

    // 5. Verify all users
    console.log('\n5️⃣ Verifying all users...')
    const allUsers = await User.find({}).populate('roles', 'name')
    
    console.log('\n📊 Database Status:')
    console.log(`   Total users: ${allUsers.length}`)
    console.log('\n   User List:')
    
    for (const user of allUsers) {
      const roleNames = user.roles?.map((r: any) => r.name).join(', ') || 'NO ROLES'
      console.log(`   - ${user.username || 'NO USERNAME'} (${user.email})`)
      console.log(`     Roles: ${roleNames}`)
    }

    console.log('\n✅ Database fixed successfully!')
    console.log('\n🔑 Login credentials:')
    console.log('   Admin: admin@gmail.com / 123456')
    console.log('   Teacher: teacher1@example.com / 123456')
    console.log('   Student: student1@example.com / 123456')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await mongoose.connection.close()
  }
}

fixDatabase()
