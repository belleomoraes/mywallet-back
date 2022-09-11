import express from "express";
import { registerWithdraw } from "../controllers/withdrawRegistration.controller.js";
import validatenewRecordSchema from "../middlewares/validationDepositWithdraw.middleware.js";

const router = express.Router();
router.use(validatenewRecordSchema);
router.post("/withdraw", registerWithdraw);

export default router;
