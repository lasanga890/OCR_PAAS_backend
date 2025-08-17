import express from "express";
import { google } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/google", google);

export default router;
