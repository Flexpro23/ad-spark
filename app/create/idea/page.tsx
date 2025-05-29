"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowLeft, Send, Bot, User } from "lucide-react"

export default function IdeaPage() {
  const [idea, setIdea] = useState("")
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm here to help you refine your ad idea. Tell me about your product, target audience, and what you want to achieve with this ad.",
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    const newMessages = [
      ...chatMessages,
      { role: "user", content: currentMessage },
      {
        role: "assistant",
        content:
          "That's a great direction! Let me ask a few questions to help refine this further. What's your target demographic? What emotion do you want viewers to feel? What's your main call to action?",
      },
    ]

    setChatMessages(newMessages)
    setCurrentMessage("")
  }

  const handleFinalize = () => {
    setIsEnhancing(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsEnhancing(false)
      // Navigate to next step
    }, 2000)
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Idea Input */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
                Your Ad Idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe your ad idea here... What product or service are you promoting? What's your vision?"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="min-h-[200px] bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
              <p className="text-sm text-slate-400 mt-2">
                Don't worry about perfection - our AI will help you refine and enhance your concept!
              </p>
            </CardContent>
          </Card>

          {/* AI Enhancement Chat */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-purple-500" />
                AI Enhancement Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] overflow-y-auto mb-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === "user" ? <User className="h-4 w-4 mr-1" /> : <Bot className="h-4 w-4 mr-1" />}
                        <span className="text-xs opacity-75">{message.role === "user" ? "You" : "AI Assistant"}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Ask questions or provide more details..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Save Draft
            </Button>
          </Link>

          <Link href="/create/assets">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!idea.trim() || isEnhancing}>
              {isEnhancing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing Idea...
                </>
              ) : (
                <>Finalize Idea & Upload Assets</>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
