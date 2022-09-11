import express from 'express'
import { signIn } from "../controllers/sign-in.controller.js";

const router = express.Router()
router.post("/", signIn);

export default router