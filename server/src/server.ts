import dotenv from 'dotenv'
import express from 'express'
import webConfigs from '~/configs/webConfigs'
import routers from '~/routers/routers'
// import '~/crons/ValidatedTokenClean'
// import '~/crons/ForgotPasswordClean'
import connectDB from "./database/connection"
import classRoutes from "./routes/class.routes"

dotenv.config()

const app = express()

webConfigs(app)
routers(app)

// Connect to MongoDB
connectDB()

// Routes
app.use("/api", classRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running!", status: "OK" })
})

const PORT = process.env.PORT || 9000

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})