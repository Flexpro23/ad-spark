import { NextRequest, NextResponse } from "next/server";
import { geminiAI, GEMINI_MODEL } from "@/lib/gemini";
import { ChatMessage } from "@/hooks/useGemini";

export async function POST(request: NextRequest) {
  try {
    const { messages, options = {} } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const {
      systemPrompt = "You are a helpful AI assistant specializing in advertising and marketing. Provide creative, insightful, and actionable advice for ad creation."
    } = options;

    // Convert messages to Gemini format and build the conversation
    let contents = "";
    
    // Add system instruction first
    if (systemPrompt) {
      contents = `System: ${systemPrompt}\n\n`;
    }
    
    // Add conversation history
    messages.forEach((msg: ChatMessage) => {
      contents += `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}\n`;
    });

    // Generate response using Gemini
    const response = await geminiAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response text generated");
    }

    return NextResponse.json({
      content: text,
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate response",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 