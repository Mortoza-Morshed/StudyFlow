import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
console.log("--- OpenRouter Final Test (Using .env) ---");
console.log(
  "API Key found:",
  apiKey ? "YES (starts with " + apiKey.substring(0, 10) + "...)" : "NO",
);

const openrouter = new OpenRouter({ apiKey });

const requestParams = {
  chatGenerationParams: {
    model: "arcee-ai/trinity-large-preview:free",
    models: [
      "arcee-ai/trinity-large-preview:free",
      "google/gemma-3-27b-it:free",
      "z-ai/glm-4.5-air:free",
    ],
    route: "fallback",
    messages: [{ role: "user", content: "Say hello in one word" }],
    stream: true,
  },
  "HTTP-Referer": "http://localhost:5173",
  "X-Title": "StudyFlow",
};

try {
  const stream = await openrouter.chat.send(requestParams);
  console.log("Response:");
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) process.stdout.write(content);
  }
  console.log("\n--- TEST PASSED ---");
} catch (err) {
  console.error("\n--- TEST FAILED ---");
  console.error(err.message);
  if (err.data$) console.error(JSON.stringify(err.data$, null, 2));
}
