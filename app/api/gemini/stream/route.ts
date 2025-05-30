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
      useThinking = true,
      thinkingBudget = 1024,
      systemPrompt = "You are a helpful AI assistant specializing in advertising and marketing. Provide creative, insightful, and actionable advice for ad creation."
    } = options;

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: ChatMessage) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Add system prompt as the first message if provided
    if (systemPrompt) {
      geminiMessages.unshift({
        role: "user",
        parts: [{ text: `System: ${systemPrompt}` }]
      });
      geminiMessages.unshift({
        role: "model",
        parts: [{ text: "I understand. I'll help you with advertising and marketing advice." }]
      });
    }

    // Configure thinking if enabled
    const config: any = {};
    if (useThinking && thinkingBudget > 0) {
      config.thinkingConfig = {
        thinkingBudget: thinkingBudget
      };
    }

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate streaming response using Gemini
          const response = await geminiAI.models.generateContentStream({
            model: GEMINI_MODEL,
            contents: geminiMessages,
            config: Object.keys(config).length > 0 ? config : undefined,
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              const data = JSON.stringify({ content: text });
              controller.enqueue(`data: ${data}\n\n`);
            }
          }

          controller.enqueue(`data: [DONE]\n\n`);
          controller.close();

        } catch (error: any) {
          console.error("Streaming Error:", error);
          const errorData = JSON.stringify({ 
            error: error.message || "Streaming failed" 
          });
          controller.enqueue(`data: ${errorData}\n\n`);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Gemini Streaming API Error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to start streaming",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 