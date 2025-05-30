"use client";

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Plus, User, Clock, Video, LogOut } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { useFirestore, Project } from "@/hooks/useFirestore"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function Dashboard() {
  const { user, logout } = useAuthContext();
  const { getUserProjects, loading } = useFirestore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const router = useRouter();

  const fetchProjects = useCallback(async (userId: string) => {
    if (isLoadingProjects) return; // Prevent multiple simultaneous requests
    
    setIsLoadingProjects(true);
    console.log("Fetching projects for user:", userId);
    
    try {
      const { projects: userProjects, error } = await getUserProjects(userId);
      
      if (error) {
        console.error("Error fetching projects:", error);
        setFetchError(error);
        toast.error("Failed to load projects: " + error);
      } else {
        console.log("Fetched projects:", userProjects);
        setProjects(userProjects);
        setFetchError(null);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setFetchError("Unexpected error occurred");
    } finally {
      setIsLoadingProjects(false);
    }
  }, [getUserProjects]); // Removed isLoadingProjects dependency

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchProjects(user.uid);
  }, [user, router]); // Removed fetchProjects dependency to prevent infinite loop

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const handleEditProject = (project: Project) => {
    // Determine which step to navigate to based on project status/progress
    if (!project.scenes || project.scenes.length === 0) {
      if (!project.assets || project.assets.length === 0) {
        // Go to assets step
        router.push(`/create/assets?projectId=${project.id}`);
      } else {
        // Go to scenes step
        router.push(`/create/scenes?projectId=${project.id}`);
      }
    } else {
      // Go to images step
      router.push(`/create/images?projectId=${project.id}`);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "MMM dd, yyyy");
    } catch {
      return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900 text-green-300";
      case "in-progress":
        return "bg-blue-900 text-blue-300";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Please sign in to access your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">AdSpark</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Welcome, {user.email}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-slate-400">Ready to create your next amazing ad?</p>
        </div>

        {/* New Project Section */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <Plus className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Start New Ad Project</h2>
              <p className="text-slate-400 mb-6">
                Transform your creative idea into a stunning video advertisement with AI assistance
              </p>
              <Link href="/create/idea">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create New Ad
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Existing Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Projects</h2>
          
          {fetchError && (
            <Card className="bg-red-900/20 border-red-800 mb-6">
              <CardContent className="p-4">
                <p className="text-red-300">Error loading projects: {fetchError}</p>
                <Button 
                  onClick={() => user && fetchProjects(user.uid)} 
                  className="mt-2" 
                  size="sm"
                  variant="outline"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
          
          {isLoadingProjects || loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-800 border-slate-700">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-slate-700 rounded-t-lg animate-pulse" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-6 bg-slate-700 rounded mb-2 animate-pulse" />
                    <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => handleEditProject(project)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-slate-700 rounded-t-lg overflow-hidden">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-slate-500" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 truncate">{project.title}</CardTitle>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(project.updatedAt)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                      >
                        Continue
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <Video className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-slate-400 mb-4">
                  Start your creative journey by creating your first ad project.
                </p>
                <Link href="/create/idea">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
