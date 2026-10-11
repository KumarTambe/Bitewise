import { recommend } from "../controllers/recommendController.js";
import express from 'express'

const router = express.Router()

router.post('/', recommend)

export default router
