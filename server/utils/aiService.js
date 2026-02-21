import { GoogleGenAI } from "@google/genai";
import { generateMCQsOpenRouter } from "./openRouterService.js";
import "dotenv/config";

// Trim to avoid invisible spaces/newlines from .env
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const ai = new GoogleGenAI({ apiKey });

/**
 * Generate MCQs using Google Gemini.
 */
const generateMCQsGemini = async (text, count = 5) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env");
  }

  const model = "gemini-3-flash-preview";

  const prompt = `Generate exactly ${count} multiple-choice questions from this text.

TEXT:
"""
${text}
"""

Respond ONLY with a valid JSON array. Each object:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "..."
}`;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  let responseText = response.text;

  // Clean up if needed (though responseMimeType usually handles this)
  if (responseText.includes("```json")) {
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "");
  }

  const questions = JSON.parse(responseText.trim());

  return questions.map((q, index) => {
    const options = Array.isArray(q.options) ? q.options : [];
    const rawCorrect = typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
    const correctAnswer = Math.max(0, Math.min(rawCorrect, options.length - 1));
    return {
      id: index + 1,
      question: q.question ?? "",
      options,
      correctAnswer,
      explanation: q.explanation ?? "",
    };
  });
};

/**
 * Unified dispatcher — routes to the selected AI provider.
 * @param {string} text - Source text to generate questions from
 * @param {number} count - Number of questions to generate
 * @param {"gemini"|"openrouter"} provider - AI provider to use
 */
export const generateMCQs = async (text, count = 5, provider = "gemini") => {
  try {
    if (provider === "openrouter") {
      return await generateMCQsOpenRouter(text, count);
    }
    return await generateMCQsGemini(text, count);
  } catch (error) {
    console.error(`AI Service Error (${provider}):`, error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};
