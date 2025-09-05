import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import webConfigs from './configs/webConfigs.js'
import routers from './routers/routers'
import { runSeed } from './data/seed.js'

const app = express();

webConfigs(app);
routers(app);

const PORT = process.env.PORT




app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
