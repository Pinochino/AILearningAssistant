import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { runSeed } from '~/data/seed.js'

dotenv.config()

const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGO_URL

    if (!mongoUrl) {
      throw new Error('MONGO_URL is not defined in environment variables')
    }

    await mongoose.connect(mongoUrl, {
      retryWrites: true,
      maxPoolSize: 10,
      connectTimeoutMS: 10000
    })
    console.log('MongoDB connected successfully')
    runSeed()
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB
