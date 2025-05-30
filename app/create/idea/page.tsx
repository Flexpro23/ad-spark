"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowLeft, Send, Bot, User } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { useFirestore } from "@/hooks/useFirestore"
import { useGemini, ChatMessage } from "@/hooks/useGemini"
import { toast } from "sonner"

export default function IdeaPage() {
  const { user } = useAuthContext();
  const { createProject, loading: firestoreLoading } = useFirestore();
  const { generateChatResponse, loading: geminiLoading } = useGemini();
  const router = useRouter();
  
  const [projectTitle, setProjectTitle] = useState("");
  const [idea, setIdea] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help you refine your ad idea. Tell me about your product, target audience, and what you want to achieve with this ad. I'll provide expert insights to make your concept more compelling and effective.",
      timestamp: new Date(),
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)

  // Redirect if not authenticated
  if (!user) {
    router.push('/');
    return null;
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setCurrentMessage("");

    try {
      // Get AI response using Gemini
      const systemPrompt = `You are an expert advertising strategist helping to refine ad ideas. Focus on:
- Target audience insights
- Emotional triggers and messaging
- Platform-specific recommendations
- Creative execution ideas
- Call-to-action optimization
- Brand positioning advice

Keep responses conversational but professional. Ask follow-up questions to better understand the user's vision.`;

      const response = await generateChatResponse(
        currentMessage,
        chatMessages,
        systemPrompt
      );

      if (response.error) {
        toast.error("Failed to get AI response: " + response.error);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      setChatMessages([...newMessages, assistantMessage]);
    } catch (error) {
      toast.error("Failed to generate AI response");
      console.error("Chat error:", error);
    }
  }

  const handleFinalize = async () => {
    if (!idea.trim() || !projectTitle.trim()) {
      toast.error("Please provide both a project title and idea description");
      return;
    }

    setIsEnhancing(true);

    try {
      const { id, error } = await createProject({
        title: projectTitle,
        description: idea,
        status: "draft",
        userId: user.uid,
        idea: idea,
      });

      if (error) {
        toast.error("Failed to save project: " + error);
      } else {
        toast.success("Project saved successfully!");
        router.push(`/create/assets?projectId=${id}`);
      }
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setIsEnhancing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <Sparkles className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">AdSpark</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step 1: Idea Enhancement</span>
            <span className="text-sm text-slate-400">25% Complete</span>
          </div>
          <Progress value={25} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Idea Input - Smaller Column */}
          <div className="lg:col-span-4">
            <Card className="bg-slate-800 border-slate-700 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
                  Your Ad Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="project-title" className="block text-sm font-medium text-slate-300 mb-2">
                    Project Title
                  </label>
                  <Input
                    id="project-title"
                    placeholder="Give your ad project a name..."
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="idea-description" className="block text-sm font-medium text-slate-300 mb-2">
                    Idea Description
                  </label>
                  <Textarea
                    id="idea-description"
                    placeholder="Describe your ad idea here... What product or service are you promoting? What's your vision?"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="min-h-[200px] bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <p className="text-sm text-slate-400">
                  Powered by Gemini 2.5 Flash - our AI will help you refine and enhance your concept with expert insights!
                </p>
                
                {/* Action Buttons moved here */}
                <div className="pt-4 space-y-3">
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                      Save Draft
                    </Button>
                  </Link>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={!idea.trim() || !projectTitle.trim() || isEnhancing || firestoreLoading}
                    onClick={handleFinalize}
                  >
                    {isEnhancing || firestoreLoading ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Saving Project...
                      </>
                    ) : (
                      <>Save & Continue to Assets</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Enhancement Chat - Larger Column */}
          <div className="lg:col-span-8">
            <Card className="bg-slate-800 border-slate-700 h-[calc(100vh-280px)]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-purple-500" />
                  AI Enhancement Chat
                  {geminiLoading && (
                    <div className="ml-2 flex items-center">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-80px)]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] p-4 rounded-lg ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          {message.role === "user" ? <User className="h-4 w-4 mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                          <span className="text-xs font-medium opacity-75">
                            {message.role === "user" ? "You" : "AI Assistant"}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 pt-2 border-t border-slate-700">
                  <Input
                    placeholder="Ask questions or provide more details..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !geminiLoading && handleSendMessage()}
                    className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                    disabled={geminiLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon"
                    disabled={geminiLoading || !currentMessage.trim()}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
