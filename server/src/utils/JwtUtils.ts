import dotenv from 'dotenv';
dotenv.config()
import jwt from 'jsonwebtoken';
import { JwtPayloadInterface } from '~/types/JwtPayload';

const secretOrPublicKey = process.env.JWT_ACCESS_KEY as string

const verifyJwt = (token: string) => {
  const valid = jwt.verify(token, secretOrPublicKey)
  return valid
}

const generateAccessToken = (user: any) => {
  const roles: string[] = user.role.map((e: any) => e.name);

  const authPayload: JwtPayloadInterface = {
    id: user._id,
    username: user.username ? user.username : '',
    email: user.email ? user.email : '',
    roles
  }
  const token = jwt.sign(authPayload, secretOrPublicKey, {
    expiresIn: '5m'
  })
  return token;
}

export { verifyJwt, generateAccessToken }