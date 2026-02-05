import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing API key:", apiKey?.substring(0, 10) + "...\n");

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(`✅ ${modelName} - WORKS`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} - FAILED: ${error.message.split("\n")[0]}`);
    return false;
  }
}

console.log("Testing models...\n");

for (const modelName of modelsToTest) {
  await testModel(modelName);
}

console.log("\n✅ Test complete!");
