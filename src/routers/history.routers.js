import express from 'express'
import { showHistory } from "../controllers/home.controller.js";
// import checkAuthorization from '../middlewares/authorization.middleware.js';

const router = express.Router()
// router.use(checkAuthorization)
router.get("/home", showHistory);

export default router