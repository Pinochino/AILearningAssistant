import cors from 'cors'
import bodyParser from 'body-parser'
import express from 'express';
import mongoose from 'mongoose'
import { Application, NextFunction, Request, Response } from 'express'
import { Role, RoleName } from '~/models/Role'
import { User } from '~/models/User'
import { runSeed } from '~/data/seed'
import cookieParser from 'cookie-parser';
import path from 'path';
import { create, engine } from 'express-handlebars'
import multer from 'multer';

const upload = multer({ dest: '/uploads' })

const hbs = create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname + "views", "layouts")
})

const webConfigs = (app: Application) => {
  app.engine('handlebars', hbs.engine)
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname + 'views'))
  app.use(
    cors({
      credentials: true
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cookieParser());
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  });
}

// Create seed
async function main() {
  try {
    await mongoose.connect(`mongodb://localhost:27017/test`)
    console.log(`Connect database success`)
    await runSeed();
  } catch (error: any) {
    console.log(`Error in db: `, error.message)
    process.exit(1)
  }
}
main()

export default webConfigs
