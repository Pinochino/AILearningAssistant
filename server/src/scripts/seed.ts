import 'dotenv/config'
import connectDB from '../database/connection'
import mongoose from 'mongoose'
import { runSeed } from '../data/seed'

async function main() {
  try {
    await connectDB()
    await runSeed()
    console.log('Seeding completed')
  } catch (err: any) {
    console.error('Seeding failed:', err?.message || err)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

main()


