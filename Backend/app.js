import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import menuRouter from './routes/menuRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import analyticsRouter from './routes/analyticsRoutes.js'
import recommendRouter from './routes/recommendRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/dishes', menuRouter)
app.use('/api/dishes', messageRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/recommend', recommendRouter)

export default app
