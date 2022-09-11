import express from 'express'
import { signUp } from "../controllers/sign-up.controller.js";
import validateSignUpSchema from "../middlewares/validationSignUp.middleware.js"

const router = express.Router()
// router.use(validateSignUpSchema)
router.post("/sign-up", signUp);

export default router