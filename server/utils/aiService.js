import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// Trim to avoid invisible spaces/newlines from .env
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const ai = new GoogleGenAI({ apiKey });

export const generateMCQs = async (text, count = 5) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in .env");
    }

    // Using the specific model requested by user
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
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};
