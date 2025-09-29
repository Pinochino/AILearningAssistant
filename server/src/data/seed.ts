import { Role, RoleName } from '~/models/Role'
import { User } from '~/models/User'

export async function runSeed() {
  let superAdminRole = await Role.findOne({ name: RoleName.SUPER_ADMIN })

  if (!superAdminRole) {
    await Role.insertMany([
      {
        name: RoleName.TEACHER
      },
      {
        name: RoleName.SUPER_ADMIN
      },
      {
        name: RoleName.USER
      }
    ])

    superAdminRole = await Role.findOne({ name: RoleName.SUPER_ADMIN })
  }

  const adminEmail = 'admin@gmail.com'
  let adminUser = await User.findOne({ email: adminEmail })

  if (!adminUser) {
    adminUser = await User.create({
      username: 'admin',
      email: adminEmail,
      password: '123456',
      roles: superAdminRole?._id
    })

    await Role.create({
      name: superAdminRole?.name,
      user: adminUser._id
    })
  }
}
