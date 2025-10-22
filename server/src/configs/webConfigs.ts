import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { Application, NextFunction, Request, Response } from 'express'
// import { runSeed } from '~/data/seed'
import cookieParser from 'cookie-parser'
import path from 'path'
import { create } from 'express-handlebars'
import morgan from 'morgan'
// import passport from '~/configs/passport'
dotenv.config()

const hbs = create({
  extname: '.hbs',
  layoutsDir: path.join(__dirname + 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
})

const webConfigs = (app: Application) => {
  app.engine('handlebars', hbs.engine)
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname + 'views'))
  app.use(
    cors({
      credentials: true,
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:5179',
        'http://localhost:5180',
        'http://localhost:5181',
        'http://localhost:5182',
        'http://localhost:5183',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
        'http://127.0.0.1:5177',
        'http://127.0.0.1:5178',
        'http://127.0.0.1:5179',
        'http://127.0.0.1:5180',
        'http://127.0.0.1:5181',
        'http://127.0.0.1:5182',
        'http://127.0.0.1:5183',
        'http://127.0.0.1:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  )
  // Handle preflight requests
  app.options('*', cors({
    credentials: true,
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
      'http://localhost:5180',
      'http://localhost:5181',
      'http://localhost:5182',
      'http://localhost:5183',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:5177',
      'http://127.0.0.1:5178',
      'http://127.0.0.1:5179',
      'http://127.0.0.1:5180',
      'http://127.0.0.1:5181',
      'http://127.0.0.1:5182',
      'http://127.0.0.1:5183',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }))
  // Body parsers: chỉ cấu hình một lần, dùng built-in của Express
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(path.join(__dirname, 'public')))
  app.use('preview', express.static(path.join(__dirname, 'public', 'uploads')))
  app.use(cookieParser())
  // app.use(passport.initialize())
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  })
}

// NOTE: Tắt auto-connect và auto-seed khi import webConfigs để tránh crash
// Hãy chạy seed thủ công bằng script: `npm run seed`

export default webConfigs
