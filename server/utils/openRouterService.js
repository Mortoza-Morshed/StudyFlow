import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();

const openrouter = new OpenRouter({
  apiKey,
});

export const generateMCQsOpenRouter = async (text, count = 5) => {
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in .env");
  }

  const prompt = `Generate exactly ${count} multiple-choice questions from this text.

TEXT:
"""
${text}
"""

Respond ONLY with a valid JSON array. No markdown, no explanation. Each object:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "..."
}`;

  const response = await openrouter.chat.send({
    chatGenerationParams: {
      model: "arcee-ai/trinity-large-preview:free",
      models: [
        "arcee-ai/trinity-large-preview:free",
        "google/gemma-3-27b-it:free",
        "z-ai/glm-4.5-air:free",
      ],
      route: "fallback",
      messages: [
        {
          role: "system",
          content:
            "You are a quiz generator. You MUST respond with ONLY a valid JSON array, no markdown fences, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    },
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "StudyFlow",
  });

  let responseText = response.choices?.[0]?.message?.content || "";

  // Clean up markdown fences if present
  responseText = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "");

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
