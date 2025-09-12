import crypto from 'crypto'

const secretKey = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

function encrypt(text: any) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt(encrypted: any) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export { encrypt, decrypt }
