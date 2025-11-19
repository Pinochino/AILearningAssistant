import dotenv from 'dotenv'
dotenv.config()
import { JwtPayloadInterface } from '../types/JwtPayload.js'
import crypto from 'crypto'
import { ValidatedToken } from '../models/ValidatedToken.js'
import jwt, { SignOptions, Secret } from 'jsonwebtoken'

const secretOrPublicKey = process.env.JWT_ACCESS_SECRET as Secret

const verifyJwt = (token: string) => {
  const valid = jwt.verify(token, secretOrPublicKey)
  return valid
}

const generateAccessToken = (user: any): string => {
  // Lấy roles
  const rolesFromPopulated = Array.isArray(user?.roles)
    ? user.roles.map((e: any) => (typeof e === 'string' ? e : e?.name)).filter(Boolean)
    : []

  const roleFromString =
    typeof user?.role === 'string' && user.role ? [user.role] : []

  const roles: string[] = (rolesFromPopulated.length > 0 ? rolesFromPopulated : roleFromString)
    .map((r: string) => String(r).toUpperCase())

  if (roles.length === 0) roles.push('STUDENT')

  const authPayload: JwtPayloadInterface = {
    id: user._id.toString(),
    name: user.name ?? '',
    username: user.username ?? '',
    roles,
  }

  // ❗️ĐỪNG cho nó là Secret | undefined, chỉ để Secret thôi
  const secret = (process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-secret') as Secret

  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES as any) || '2h',
  }

  // Ép kiểu options rõ ràng để TS chọn đúng overload
  const token = jwt.sign(authPayload, secret, options)

  return token
}

const createLoginResponse = async (user: any) => {
  // 1. Tạo access token
  const accessToken = generateAccessToken(user)

  // 2. Tạo refresh token dạng random string
  const refreshToken = crypto.randomBytes(32).toString('hex')

  // 3. Lưu refreshToken vào DB (không để fail login nếu chỗ này lỗi)
  try {
    await ValidatedToken.create({
      token: refreshToken,
      userId: user?._id,
      issuedAt: Date.now(),
      expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
    })
  } catch (e) {
    console.error('❌ Failed to persist refresh token:', e)
  }

  // 4. Build role list
  const roleList: string[] = Array.isArray(user?.roles)
    ? user.roles
        .map((r: any) => (typeof r === 'string' ? r : r?.name))
        .filter(Boolean)
    : typeof user?.role === 'string'
    ? [user.role]
    : []

  if (roleList.length === 0) roleList.push('STUDENT')

  // 5. Payload user FE dùng
  const payload = {
    id: user._id.toString(),
    name: user.name ?? user.username,
    username: user.username,
    avatar: user.avatar ?? '',
    roles: roleList, // FE đang map từ user.roles / userData.roles
  }

  return {
    user: payload,
    accessToken,
    refreshToken,
  }
}

export { verifyJwt, generateAccessToken, createLoginResponse }
