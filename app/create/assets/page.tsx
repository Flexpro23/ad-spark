"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { useFirestore } from "@/hooks/useFirestore"
import { useStorage } from "@/hooks/useStorage"
import { toast } from "sonner"

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

export default function AssetsPage() {
  const { user } = useAuthContext();
  const { getProject, updateProject } = useFirestore();
  const { uploadProjectAssets, uploading, uploadProgress } = useStorage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  const [project, setProject] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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
        // Load existing assets if any
        if (projectData?.assets) {
          const existingFiles = projectData.assets.map((url: string, index: number) => ({
            id: `existing-${index}`,
            name: `Asset ${index + 1}`,
            url,
            type: 'image/*'
          }));
          setUploadedFiles(existingFiles);
        }
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [user, projectId, getProject, router]);

  const handleFileUpload = async (files: FileList) => {
    if (!projectId || !user) return;

    setIsLoading(true);
    const fileArray = Array.from(files);
    
    try {
      const uploadResults = await uploadProjectAssets(fileArray, projectId, user.uid);
      
      const successfulUploads = uploadResults.filter(result => result.url);
      const newFiles: UploadedFile[] = successfulUploads.map((result, index) => ({
        id: `${Date.now()}-${index}`,
        name: result.file,
        url: result.url!,
        type: fileArray[index].type,
      }));

      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);

      // Update project with new asset URLs
      const assetUrls = updatedFiles.map(file => file.url);
      await updateProject(projectId, { assets: assetUrls });

      toast.success(`Successfully uploaded ${successfulUploads.length} files`);
    } catch (error) {
      toast.error("Failed to upload files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== id);
    setUploadedFiles(updatedFiles);
    
    // Update project assets
    if (projectId) {
      const assetUrls = updatedFiles.map(file => file.url);
      updateProject(projectId, { assets: assetUrls });
    }
  };

  const handleContinue = async () => {
    if (!projectId) return;

    // Update project status
    await updateProject(projectId, { status: "in-progress" });
    router.push(`/create/scenes?projectId=${projectId}`);
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
          <Link href="/create/idea" className="flex items-center space-x-2">
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
            <span className="text-sm font-medium">Step 2: Upload Assets</span>
            <span className="text-sm text-slate-400">50% Complete</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        {/* Finalized Idea Display */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{project.description}</p>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5 text-blue-500" />
              Upload Your Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-slate-600 hover:border-slate-500"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drag and drop your files here</h3>
              <p className="text-slate-400 mb-4">Upload product photos, logos, or any other visual assets</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  asChild
                  disabled={uploading}
                >
                  <span>
                    {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Browse Files"}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle>Uploaded Assets ({uploadedFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-slate-400 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleContinue}
            disabled={uploading}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Scenes from Project
          </Button>
        </div>
      </div>
    </div>
  )
}
