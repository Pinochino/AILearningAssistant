import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import { IUser } from '~/models/User'
import { JwtPayloadInterface } from '~/types/JwtPayload'
import crypto from 'crypto'
import { ValidatedToken } from '~/models/ValidatedToken'
import { UserInterface } from '~/types/UserInterface'

const secretOrPublicKey = process.env.JWT_SECRET as string

const verifyJwt = (token: string) => {
  const valid = jwt.verify(token, secretOrPublicKey)
  return valid
}

const generateAccessToken = (user: any) => {
  // Derive roles robustly from multiple shapes
  const rolesFromPopulated = Array.isArray(user?.roles)
    ? user.roles.map((e: any) => (typeof e === 'string' ? e : e?.name)).filter(Boolean)
    : []
  const roleFromString = (typeof user?.role === 'string' && user.role) ? [user.role] : []
  const roles: string[] = (rolesFromPopulated.length > 0 ? rolesFromPopulated : roleFromString)
    .map((r: string) => String(r).toUpperCase())
  if (roles.length === 0) roles.push('STUDENT')

  const authPayload: JwtPayloadInterface = {
    id: user._id,
    name: user.name ? user.name : '',
    username: user.username ? user.username : '',
    email: user.email ? user.email : '',
    roles
  }
  const token = jwt.sign(authPayload, secretOrPublicKey, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '2h'
  })
  return token
}
const createLoginResponse = async (user: any) => {
  const accessToken = generateAccessToken(user)
  const refreshToken = crypto.randomBytes(32).toString('hex')

  await ValidatedToken.create({
    token: refreshToken,
    userId: user?._id,
    issuedAt: Date.now(),
    expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })

  // Build lightweight user payload
  const roleList = Array.isArray(user?.roles)
    ? user.roles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
    : (typeof user?.role === 'string' ? [user.role] : [])
  if (roleList.length === 0) roleList.push('student')

  const payload = {
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: roleList
  }

  return {
    user: payload,
    accessToken,
    refreshToken
  }
}

export { verifyJwt, generateAccessToken, createLoginResponse }
