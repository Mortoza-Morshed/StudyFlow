import { generateMCQs } from "../utils/aiService.js";
import Quiz from "../models/Quiz.model.js";

export const generateQuestions = async (req, res) => {
  try {
    const { text, count = 5, provider = "gemini" } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "No text provided for question generation",
      });
    }

    const questionCount = Math.min(Math.max(1, count), 10);
    const questions = await generateMCQs(text, questionCount, provider);

    res.json({
      success: true,
      questions,
      provider,
      textLength: text.length,
      generatedCount: questions.length,
    });
  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate questions",
    });
  }
};

export const checkAnswers = async (req, res) => {
  try {
    const { questions, userAnswers, documentId, title } = req.body;

    if (!questions || !userAnswers) {
      return res.status(400).json({
        success: false,
        error: "Questions and answers are required",
      });
    }

    const results = questions.map((question) => {
      const userAnswer = userAnswers[question.id];
      const isValidIndex =
        typeof userAnswer === "number" &&
        userAnswer >= 0 &&
        userAnswer < (question.options?.length ?? 0);
      const isCorrect = isValidIndex && userAnswer === question.correctAnswer;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation ?? "",
        selectedOption: isValidIndex
          ? (question.options[userAnswer] ?? "Not answered")
          : "Not answered",
        correctOption: question.options?.[question.correctAnswer] ?? "",
      };
    });

    const score = results.filter((r) => r.isCorrect).length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Persist to DB
    const savedQuiz = await Quiz.create({
      documentId,
      title: title || "Quiz Session",
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
      results: results.map((r) => ({
        questionId: r.questionId,
        userAnswer: r.userAnswer,
        isCorrect: r.isCorrect,
      })),
      score,
      total,
      percentage,
    });

    res.json({
      success: true,
      id: savedQuiz._id,
      results,
      score,
      total,
      percentage,
    });
  } catch (error) {
    console.error("Answer checking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check answers",
    });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const quizzes = await Quiz.find();

    const totalQuizzes = quizzes.length;
    const avgAccuracy =
      totalQuizzes > 0
        ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
        : 0;

    // For study time we can estimate based on number of questions (2 mins per question)
    const studyTime = quizzes.reduce((acc, q) => acc + q.total * 2, 0);
    const studyTimeHours = (studyTime / 60).toFixed(1);

    res.json({
      success: true,
      stats: {
        totalQuizzes,
        avgAccuracy: `${avgAccuracy}%`,
        studyTime: `${studyTimeHours}h`,
        docsSynced: await Quiz.distinct("documentId").then((docs) => docs.length),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
