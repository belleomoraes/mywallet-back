import express from 'express'
import { registerWithdraw } from "../controllers/withdrawRegistration.controller.js";

const router = express.Router()
router.post("/withdraw", registerWithdraw);

export default router