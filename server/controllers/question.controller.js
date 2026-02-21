import { generateMCQs } from "../utils/aiService.js";

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
    const { questions, userAnswers } = req.body;

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

    res.json({
      success: true,
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
