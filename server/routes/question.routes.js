import express from "express";
import {
  generateQuestions,
  checkAnswers,
  getQuizzes,
  getStats,
} from "../controllers/question.controller.js";

const router = express.Router();

router.post("/generate", generateQuestions);
router.post("/check", checkAnswers);
router.get("/history", getQuizzes);
router.get("/stats", getStats);

export default router;
