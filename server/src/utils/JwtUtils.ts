import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import { IUser } from '~/models/User'
import { JwtPayloadInterface } from '~/types/JwtPayload'
import crypto from 'crypto'
import { ValidatedToken } from '~/models/ValidatedToken'
import { UserInterface } from '~/types/UserInterface'

const secretOrPublicKey = process.env.JWT_ACCESS_KEY as string

const verifyJwt = (token: string) => {
  const valid = jwt.verify(token, secretOrPublicKey)
  return valid
}

const generateAccessToken = (user: any) => {
  const roles: string[] = user?.roles.map((e: any) => e.name)

  const authPayload: JwtPayloadInterface = {
    id: user._id,
    username: user.username ? user.username : '',
    email: user.email ? user.email : '',
    roles
  }
  const token = jwt.sign(authPayload, secretOrPublicKey, {
    expiresIn: '15m'
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

  console.log('Role: ', user.roles)
  const role = user.roles.map((r: any) => r.name)

  console.log(role)

  const payload = {
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role
  }

  return {
    user: payload,
    accessToken,
    refreshToken
  }
}

export { verifyJwt, generateAccessToken, createLoginResponse }
