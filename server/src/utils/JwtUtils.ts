import dotenv from 'dotenv';
dotenv.config()
import jwt from 'jsonwebtoken';

const secretOrPublicKey = process.env.JWT_ACCESS_KEY as string

const verifyJwt = (token: string) => {
  const valid = jwt.verify(token, secretOrPublicKey)
  return valid
}

const decodeJwt = (payload: any) => {

  const token = jwt.sign(payload, secretOrPublicKey, {
    expiresIn: '5m' 
  })
  return token;
}

export { verifyJwt, decodeJwt }