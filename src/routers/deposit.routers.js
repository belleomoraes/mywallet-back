import express from 'express'
import { registerDeposit } from "../controllers/depositRegistration.controller.js";

const router = express.Router()
router.post("/deposit", registerDeposit);

export default router