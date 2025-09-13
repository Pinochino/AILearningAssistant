import dotenv from 'dotenv'
dotenv.config()
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure_distribution: 'mydomain.com',
  upload_prefix: 'https://api-eu.cloudinary.com'
})

export default cloudinary
