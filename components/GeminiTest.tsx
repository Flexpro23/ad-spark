"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGemini } from "@/hooks/useGemini";
import { Sparkles, Bot, Send } from "lucide-react";

export const GeminiTest = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const { generateChatResponse, loading, error } = useGemini();

  const handleTest = async () => {
    if (!message.trim()) return;

    const result = await generateChatResponse(
      message,
      [],
      "You are a helpful AI assistant. Respond in a friendly and informative way."
    );

    if (result.error) {
      setResponse(`Error: ${result.error}`);
    } else {
      setResponse(result.content);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Bot className="mr-2 h-5 w-5 text-blue-500" />
          Gemini 2.5 Flash Test
          {loading && (
            <div className="ml-2 flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask Gemini anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && handleTest()}
            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
            disabled={loading}
          />
          <Button 
            onClick={handleTest}
            disabled={loading || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">Error: {error}</p>
          </div>
        )}

        {response && (
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
              <span className="text-sm text-slate-300">Gemini Response:</span>
            </div>
            <p className="text-slate-100 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        <div className="text-xs text-slate-400">
          This component tests the Gemini 2.5 Flash API integration. Make sure your API key is set in environment variables.
        </div>
      </CardContent>
    </Card>
  );
}; 