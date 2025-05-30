import { GoogleGenAI } from "@google/genai";

// Initialize Google Gemini AI with API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

export const geminiAI = new GoogleGenAI({ apiKey });

// Gemini 2.5 Flash model for fast and cost-efficient responses
export const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";

// Enhanced thinking model for complex reasoning
export const GEMINI_THINKING_MODEL = "gemini-2.5-flash-preview-05-20";

export default geminiAI; 