"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowLeft, Edit, RefreshCw, Zap } from "lucide-react"

export default function ScenesPage() {
  const [scenes, setScenes] = useState([
    {
      id: 1,
      title: "Scene 1: Product Introduction",
      description:
        "Close-up shot of the eco-friendly water bottle on a clean, modern wooden table with natural sunlight streaming in from the side. The bottle should be the main focus with soft shadows and a minimalist background.",
    },
    {
      id: 2,
      title: "Scene 2: Lifestyle Context",
      description:
        "A young professional woman in activewear holding the water bottle during a morning jog in a park. She's smiling and looks refreshed, with green trees and blue sky in the background.",
    },
    {
      id: 3,
      title: "Scene 3: Sustainability Focus",
      description:
        "Split screen showing plastic bottles in a landfill on one side and our reusable bottle with green leaves and recycling symbols on the other side, emphasizing the environmental impact.",
    },
    {
      id: 4,
      title: "Scene 4: Call to Action",
      description:
        "The bottle prominently displayed with the company logo and text overlay showing '20% OFF - Order Now'. Clean white background with the website URL and promotional code visible.",
    },
  ])

  const [isGenerating, setIsGenerating] = useState(false)

  const handleRegenerateScenes = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  const updateScene = (id, newDescription) => {
    setScenes((prev) => prev.map((scene) => (scene.id === id ? { ...scene, description: newDescription } : scene)))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/create/assets" className="flex items-center space-x-2">
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
            <span className="text-sm font-medium">Step 3: Review Scenes</span>
            <span className="text-sm text-slate-400">75% Complete</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>

        {/* Finalized Idea */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>Your Finalized Ad Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Create a dynamic video ad for our new eco-friendly water bottle targeting health-conscious millennials.
              The ad should emphasize sustainability, convenience, and style. Key message: "Stay hydrated, stay
              sustainable." Call to action: "Order now and get 20% off your first purchase."
            </p>
          </CardContent>
        </Card>

        {/* Scenes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">AI-Generated Scenes</h2>
            <Button
              onClick={handleRegenerateScenes}
              disabled={isGenerating}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate All Scenes
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            {scenes.map((scene) => (
              <Card key={scene.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {scene.id}
                      </span>
                      {scene.title}
                    </span>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={scene.description}
                    onChange={(e) => updateScene(scene.id, e.target.value)}
                    className="min-h-[100px] bg-slate-700 border-slate-600 text-slate-100"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    This description will be used to generate the image for this scene. Edit as needed.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link href="/create/assets">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </Link>

          <Link href="/create/images">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Zap className="mr-2 h-4 w-4" />
              Confirm Scenes & Create Images
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
