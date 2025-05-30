"use client";

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, MessageSquare, ImageIcon, Video, Zap, LogOut } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { AuthModal } from "@/components/AuthModal"

export default function LandingPage() {
  const { user, logout } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100" suppressHydrationWarning={true}>
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between" suppressHydrationWarning={true}>
          <div className="flex items-center space-x-2" suppressHydrationWarning={true}>
            <Sparkles className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">AdSpark</span>
          </div>
          <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
            {user ? (
              <>
                <span className="text-slate-300">Welcome, {user.email}</span>
                <Button 
                  variant="ghost" 
                  className="text-slate-300 hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-slate-300 hover:text-white"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAuthModal(true)}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto" suppressHydrationWarning={true}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Turn Your Ideas into Ads, Instantly
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Harness the power of AI to transform your creative concepts into stunning video advertisements. From idea to
            final video in minutes, not hours.
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating Now
              </Button>
            </Link>
          ) : (
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              onClick={() => setShowAuthModal(true)}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating Now
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How AdSpark Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" suppressHydrationWarning={true}>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center" suppressHydrationWarning={true}>
              <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Idea Enhancement</h3>
              <p className="text-slate-400">
                AI-powered conversation to refine your concept and identify your target audience
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center" suppressHydrationWarning={true}>
              <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Scene Generation</h3>
              <p className="text-slate-400">Automatically break down your ad into compelling scenes and storyboard</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center" suppressHydrationWarning={true}>
              <ImageIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Image Creation</h3>
              <p className="text-slate-400">Generate stunning visuals for each scene using advanced AI image models</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center" suppressHydrationWarning={true}>
              <Video className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Video Assembly</h3>
              <p className="text-slate-400">Combine scenes with transitions, music, and voiceover into a final video</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800/50 py-20">
        <div className="container mx-auto px-4 text-center" suppressHydrationWarning={true}>
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your First Ad?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using AI to bring their advertising ideas to life.
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAuthModal(true)}
            >
              Get Started Free
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400" suppressHydrationWarning={true}>
          <p>&copy; 2024 AdSpark. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}
