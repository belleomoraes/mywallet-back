import express from 'express'
import { registerDeposit } from "../controllers/depositRegistration.controller.js";
import validatenewRecordSchema from "../middlewares/validationDepositWithdraw.middleware.js"

const router = express.Router()
router.use(validatenewRecordSchema)
router.post("/deposit", registerDeposit);

export default router