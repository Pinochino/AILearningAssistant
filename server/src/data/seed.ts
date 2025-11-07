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
}
