import dotenv from 'dotenv';
import { create } from 'express-handlebars';
dotenv.config();
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Tạo instance express-handlebars cho email
const emailHbs = create({
  extname: '.hbs',
  layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
  partialsDir: path.join(__dirname, '..', 'views', 'partials'),
})

// Gắn plugin handlebars cho transporter
transporter.use(
  'compile',
  hbs({
    viewEngine: emailHbs,
    viewPath: path.join(__dirname, '..', 'views', 'email'),
    extName: '.hbs',
  })
)


