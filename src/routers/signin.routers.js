import express from 'express'
import { signIn } from "../controllers/sign-in.controller.js";
import validateSignInSchema from "../middlewares/validationSignIn.middleware.js"
const router = express.Router()
// router.use(validateSignInSchema)
router.post("/", signIn);

export default router