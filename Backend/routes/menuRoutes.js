import { getAllDishes, addDish } from "../controllers/menuControllers.js";
import { Authorization, adminOnly } from "../middleware/authMiddleware.js";
import express from 'express'

const router = express.Router()

router.post('/addDish', Authorization, adminOnly, addDish)
router.get('/getAllDishes', getAllDishes)

export default router
