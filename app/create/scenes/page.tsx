"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowLeft, Edit, RefreshCw, Zap } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { useFirestore, Scene, Project } from "@/hooks/useFirestore"
import { useGemini } from "@/hooks/useGemini"
import { toast } from "sonner"

function ScenesContent() {
  const { user } = useAuthContext();
  const { getProject, updateProject } = useFirestore();
  const { generateChatResponse, loading: geminiLoading } = useGemini();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!projectId) {
      toast.error("No project ID found");
      router.push('/dashboard');
      return;
    }

    const fetchProject = async () => {
      const { project: projectData, error } = await getProject(projectId);
      if (error) {
        toast.error("Failed to load project");
        router.push('/dashboard');
      } else {
        setProject(projectData);
        
        // Only use existing scenes if they exist, don't auto-generate
        if (projectData?.scenes && projectData.scenes.length > 0) {
          setScenes(projectData.scenes);
        } else {
          // Show empty state instead of auto-generating
          setScenes([]);
        }
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [user, projectId, getProject, router]);

  const generateInitialScenes = async (projectData: Project) => {
    await generateScenes(projectData, false);
  };

  const generateScenes = async (projectData: Project, isRegeneration: boolean = false) => {
    if (isRegeneration) {
      setIsGenerating(true);
    }

    try {
      const systemPrompt = `You are an expert advertising creative director. Based on the provided project details, generate 4 detailed scene descriptions for a video advertisement.

Each scene should:
- Be visually compelling and specific
- Include camera angles, lighting, and composition details
- Support the overall advertising message
- Be feasible to create as images
- Flow logically from one scene to the next
- Include specific visual elements that can be generated by AI

Return your response as a JSON array with exactly 4 objects, each having:
- "title": A brief, descriptive title for the scene
- "description": A detailed visual description (2-3 sentences)

Project Details:
- Title: ${projectData.title}
- Description: ${projectData.description}
- Assets Available: ${projectData.assets ? projectData.assets.length : 0} uploaded files
- Target: Create compelling advertising scenes`;

      const response = await generateChatResponse(
        `Generate 4 advertising scenes for this project: "${projectData.title}" - ${projectData.description}`,
        [],
        systemPrompt
      );

      if (response.error) {
        toast.error("Failed to generate scenes: " + response.error);
        return;
      }

      try {
        // Try to parse JSON from the response
        let scenesData;
        const content = response.content.trim();
        
        // Extract JSON from response if it's wrapped in text
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          scenesData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the entire content
          scenesData = JSON.parse(content);
        }

        if (Array.isArray(scenesData) && scenesData.length > 0) {
          const formattedScenes: Scene[] = scenesData.slice(0, 4).map((scene, index) => ({
            id: `scene-${Date.now()}-${index}`,
            title: scene.title || `Scene ${index + 1}`,
            description: scene.description || "Scene description will be generated.",
            order: index + 1
          }));

          setScenes(formattedScenes);
          
          // Save scenes to project
          await updateProject(projectId!, { 
            scenes: formattedScenes,
            status: "in-progress"
          });
          
          toast.success(isRegeneration ? "Scenes regenerated successfully!" : "Scenes generated successfully!");
        } else {
          throw new Error("Invalid scene data format");
        }
      } catch (parseError) {
        console.error("Failed to parse scenes JSON:", parseError);
        // Fallback to default scenes if parsing fails
        const fallbackScenes = generateFallbackScenes(projectData);
        setScenes(fallbackScenes);
        await updateProject(projectId!, { scenes: fallbackScenes });
        toast.warning("Generated scenes using fallback method");
      }
    } catch (error) {
      console.error("Error generating scenes:", error);
      toast.error("Failed to generate scenes");
      
      // Use fallback scenes
      const fallbackScenes = generateFallbackScenes(projectData);
      setScenes(fallbackScenes);
    } finally {
      if (isRegeneration) {
        setIsGenerating(false);
      }
    }
  };

  const generateFallbackScenes = (projectData: Project): Scene[] => {
    return [
      {
        id: `scene-${Date.now()}-1`,
        title: "Scene 1: Product Introduction",
        description: `Opening shot showcasing the main product from ${projectData.title}. Clean, professional lighting with focus on key features and benefits.`,
        order: 1
      },
      {
        id: `scene-${Date.now()}-2`,
        title: "Scene 2: Lifestyle Context",
        description: `Show the product in use within a realistic lifestyle setting. Demonstrate how it fits into the target audience's daily routine.`,
        order: 2
      },
      {
        id: `scene-${Date.now()}-3`,
        title: "Scene 3: Key Benefits",
        description: `Highlight the unique selling points and benefits of ${projectData.title}. Use visual metaphors or comparisons to emphasize value.`,
        order: 3
      },
      {
        id: `scene-${Date.now()}-4`,
        title: "Scene 4: Call to Action",
        description: `Final scene with clear call-to-action. Show product prominently with branding, pricing, and next steps for the audience.`,
        order: 4
      }
    ];
  };

  const handleRegenerateScenes = () => {
    if (project) {
      generateScenes(project, true);
    }
  };

  const updateScene = (id: string, newDescription: string) => {
    const updatedScenes = scenes.map((scene) => 
      scene.id === id ? { ...scene, description: newDescription } : scene
    );
    setScenes(updatedScenes);
    
    // Debounced save to project
    if (projectId) {
      updateProject(projectId, { scenes: updatedScenes });
    }
  };

  const handleContinue = async () => {
    if (!projectId) return;

    // Update project status and navigate to images page
    await updateProject(projectId, { 
      scenes,
      status: "in-progress"
    });
    router.push(`/create/images?projectId=${projectId}`);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading project scenes...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/create/assets?projectId=${projectId}`} className="flex items-center space-x-2">
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

        {/* Project Info */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{project.description}</p>
            {project.assets && project.assets.length > 0 && (
              <p className="text-sm text-slate-400 mt-2">
                {project.assets.length} asset(s) uploaded
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scenes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">AI-Generated Scenes</h2>
            {scenes.length > 0 && (
              <Button
                onClick={handleRegenerateScenes}
                disabled={isGenerating || geminiLoading}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                {isGenerating || geminiLoading ? (
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
            )}
          </div>

          {scenes.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center">
                {isGenerating || geminiLoading ? (
                  <>
                    <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold mb-2">Generating Scenes</h3>
                    <p className="text-slate-400">AI is creating compelling ad scenes for your project...</p>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Generate Scenes</h3>
                    <p className="text-slate-400 mb-6">
                      Let our AI create 4 compelling advertising scenes based on your project details and uploaded assets.
                    </p>
                    <Button 
                      onClick={() => project && generateScenes(project, false)}
                      disabled={!project}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Scenes with AI
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {scenes.map((scene) => (
                <Card key={scene.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                          {scene.order}
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link href={`/create/assets?projectId=${projectId}`}>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </Link>

          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleContinue}
            disabled={scenes.length === 0 || isGenerating || geminiLoading}
          >
            <Zap className="mr-2 h-4 w-4" />
            Confirm Scenes & Create Images
          </Button>
          </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-slate-300">Loading...</div>
    </div>
  );
}

export default function ScenesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScenesContent />
    </Suspense>
  )
}
