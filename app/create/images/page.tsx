"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Download, RefreshCw, Zap, Image as ImageIcon, Settings, Eye, AlertCircle } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { useFirestore, Project } from "@/hooks/useFirestore"
import { toast } from "sonner"

interface GeneratedImage {
  sceneId: string;
  imageUrl: string;
  mimeType: string;
  prompt?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  model: string;
  message: string;
  isDemo?: boolean;
  errors?: string[];
}

export default function ImagesPage() {
  const { user } = useAuthContext();
  const { getProject, updateProject } = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'imagen-4.0-generate-preview-05-20' | 'imagen-4.0-ultra-generate-exp-05-20'>('imagen-4.0-generate-preview-05-20');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Get CSS aspect ratio class based on selected aspect ratio
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-video'; // 16:9
      case '9:16':
        return 'aspect-[9/16]'; // 9:16 portrait
      case '1:1':
        return 'aspect-square'; // 1:1 square
      case '4:3':
        return 'aspect-[4/3]'; // 4:3 standard
      case '3:4':
        return 'aspect-[3/4]'; // 3:4 portrait standard
      default:
        return 'aspect-video'; // fallback to 16:9
    }
  };

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
        // Check if project already has generated images
        if (projectData?.scenes?.some(scene => scene.imageUrl)) {
          setGenerationComplete(true);
          // Convert existing scene images to GeneratedImage format
          const existingImages: GeneratedImage[] = projectData.scenes
            .filter(scene => scene.imageUrl)
            .map(scene => ({
              sceneId: scene.id,
              imageUrl: scene.imageUrl!,
              mimeType: 'image/png',
              prompt: scene.description
            }));
          setGeneratedImages(existingImages);
        }
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [user, projectId, getProject, router]);

  const handleGenerateImages = async () => {
    if (!project || !project.scenes) return;

    setGeneratingImages(true);
    
    try {
      const response = await fetch('/api/vertex-ai/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenes: project.scenes,
          model: selectedModel,
          aspectRatio: aspectRatio,
          numberOfImages: 1
        }),
      });

      const result: ImageGenerationResponse = await response.json();

      if (result.success) {
        setGeneratedImages(result.images);
        setGenerationComplete(true);
        
        if (result.isDemo) {
          toast.info(result.message);
        } else {
          toast.success(result.message);
        }

        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => toast.error(error));
        }

        // Update project with generated images
        const updatedScenes = project.scenes.map(scene => {
          const generatedImage = result.images.find(img => img.sceneId === scene.id);
          return generatedImage ? { ...scene, imageUrl: generatedImage.imageUrl } : scene;
        });

        await updateProject(projectId!, { 
          scenes: updatedScenes,
          status: "completed"
        });
        
      } else {
        throw new Error('Image generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error("Failed to generate images. Please try again.");
    } finally {
      setGeneratingImages(false);
    }
  };

  const downloadImage = (imageUrl: string, sceneTitle: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${project?.title || 'image'}-${sceneTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading project...</div>
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
          <Link href={`/create/scenes?projectId=${projectId}`} className="flex items-center space-x-2">
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
            <span className="text-sm font-medium">Step 4: Generate Images</span>
            <span className="text-sm text-slate-400">100% Complete</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Project Info */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{project.description}</p>
            {project.scenes && (
              <p className="text-sm text-slate-400 mt-2">
                {project.scenes.length} scene(s) ready for image generation
              </p>
            )}
          </CardContent>
        </Card>

        {/* Model Selection and Settings */}
        {!generationComplete && project.scenes && project.scenes.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">AI Model</label>
                <Select value={selectedModel} onValueChange={(value: any) => setSelectedModel(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagen-4.0-generate-preview-05-20">
                      <div className="flex items-center space-x-2">
                        <span>Imagen 4.0 Preview</span>
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="imagen-4.0-ultra-generate-exp-05-20">
                      <div className="flex items-center space-x-2">
                        <span>Imagen 4.0 Ultra</span>
                        <Badge variant="destructive">Limited Quota</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedModel.includes('ultra') 
                    ? 'Higher quality but may hit quota limits. Will auto-fallback to preview model if needed.' 
                    : 'Fast, reliable generation with higher quota limits (recommended)'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="3:4">3:4 (Portrait Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Images Section */}
        {!generationComplete && project.scenes && project.scenes.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                Generate Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-6">
                Ready to bring your scenes to life? Our AI will generate high-quality images using Google's Vertex AI Imagen models.
              </p>
              
              {generatingImages ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold mb-2">Generating Images with {selectedModel}</h3>
                  <p className="text-slate-400">This may take a few minutes...</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleGenerateImages}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate All Images
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generated Images Display */}
        {generatedImages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Generated Images</h2>
              {generationComplete && (
                <Button 
                  onClick={() => {
                    setGenerationComplete(false);
                    setGeneratedImages([]);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {generatedImages.map((image, index) => {
                const scene = project.scenes?.find(s => s.id === image.sceneId);
                return (
                  <Card key={image.sceneId} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center">
                          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                            {scene?.order || index + 1}
                          </span>
                          {scene?.title || `Scene ${index + 1}`}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(image.imageUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage(image.imageUrl, scene?.title || `scene-${index + 1}`)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`${getAspectRatioClass(aspectRatio)} bg-slate-700 rounded-lg mb-4 overflow-hidden`}>
                        <img 
                          src={image.imageUrl} 
                          alt={scene?.title || `Generated scene ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <div class="text-center text-slate-400">
                                  <svg class="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                  </svg>
                                  <p>Failed to load image</p>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{scene?.description}</p>
                      {image.prompt && image.prompt !== scene?.description && (
                        <p className="text-slate-500 text-xs">Enhanced prompt: {image.prompt}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Scenes Found */}
        {(!project.scenes || project.scenes.length === 0) && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardContent className="py-8 text-center">
              <ImageIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Scenes Found</h3>
              <p className="text-slate-400 mb-4">
                Please go back to the scenes step to generate scenes first.
              </p>
              <Link href={`/create/scenes?projectId=${projectId}`}>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Scenes
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link href={`/create/scenes?projectId=${projectId}`}>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scenes
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Complete Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 