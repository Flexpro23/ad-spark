import { NextRequest, NextResponse } from "next/server";
import { geminiAI, GEMINI_MODEL } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { idea, context = "" } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: "Idea is required" },
        { status: 400 }
      );
    }

    // Enhanced system prompt for idea refinement
    const systemPrompt = `You are an expert advertising strategist and creative director. Your job is to help refine and enhance advertising ideas to make them more compelling, targeted, and effective.

When analyzing an advertising idea, consider:
1. Target audience demographics and psychographics
2. Unique value proposition and competitive advantages
3. Emotional triggers and psychological appeals
4. Clear call-to-action and desired outcomes
5. Brand positioning and messaging consistency
6. Platform-specific considerations (social media, video, print, etc.)
7. Budget and resource optimization
8. Measurable success metrics

Provide specific, actionable suggestions to improve the concept while maintaining the core creative vision.`;

    const enhancementPrompt = `${systemPrompt}

Please analyze and enhance this advertising idea:

ORIGINAL IDEA: "${idea}"

${context ? `ADDITIONAL CONTEXT: ${context}` : ""}

Please provide:
1. A refined version of the idea with specific improvements
2. Target audience insights and recommendations
3. Key messaging suggestions
4. Platform and format recommendations
5. Potential challenges and solutions
6. Next steps for development

Be creative, strategic, and actionable in your response.`;

    // Generate response using Gemini with thinking enabled for better analysis
    const response = await geminiAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: enhancementPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 2048  // Higher budget for complex idea analysis
        }
      },
    });

    if (!response.text) {
      throw new Error("No response text generated");
    }

    return NextResponse.json({
      content: response.text,
      originalIdea: idea,
      context: context,
    });

  } catch (error: any) {
    console.error("Gemini Idea Enhancement Error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to enhance idea",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 