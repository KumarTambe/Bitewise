import express from 'express'
import { getTopDishes, getSummary } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/top-dishes', getTopDishes)
router.get('/summary', getSummary)

export default router