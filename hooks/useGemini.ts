"use client";

import { useState } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface GeminiResponse {
  content: string;
  error?: string;
}

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (
    messages: ChatMessage[],
    options?: {
      useThinking?: boolean;
      thinkingBudget?: number;
      systemPrompt?: string;
    }
  ): Promise<GeminiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }

      const data = await response.json();
      return { content: data.content };
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      return { content: "", error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const enhanceIdea = async (
    idea: string,
    context?: string
  ): Promise<GeminiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/enhance-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enhance idea");
      }

      const data = await response.json();
      return { content: data.content };
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      return { content: "", error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generateChatResponse = async (
    message: string,
    chatHistory: ChatMessage[] = [],
    systemPrompt?: string
  ): Promise<GeminiResponse> => {
    const messages: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: message, timestamp: new Date() }
    ];

    return generateResponse(messages, { systemPrompt });
  };

  const generateStreamingResponse = async function* (
    messages: ChatMessage[],
    options?: {
      useThinking?: boolean;
      thinkingBudget?: number;
      systemPrompt?: string;
    }
  ): AsyncGenerator<string, void, unknown> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateResponse,
    enhanceIdea,
    generateChatResponse,
    generateStreamingResponse,
  };
}; 