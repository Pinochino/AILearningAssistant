import bcrypt from 'bcrypt'

const saltRounds = 10

const hashedText = async (data: string | Buffer) => {
  const hashed = await bcrypt.hash(data, saltRounds)
  return hashed
}

const compareHashed = async (data: string | Buffer, encrypted: string) => {
  const isValid = await bcrypt.compare(data, encrypted)
  return isValid
}

export { hashedText, compareHashed }
