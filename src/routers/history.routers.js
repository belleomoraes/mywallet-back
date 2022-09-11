import express from 'express'
import { showHistory } from "../controllers/home.controller.js";

const router = express.Router()
router.get("/home", showHistory);

export default router