import express from "express";
import { generateQuestions, checkAnswers } from "../controllers/question.controller.js";

const router = express.Router();

router.post("/generate", generateQuestions);
router.post("/check", checkAnswers);

export default router;
