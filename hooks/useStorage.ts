"use client";

import { useState } from "react";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload a single file
  const uploadFile = async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      console.log("Starting upload:", { fileName: file.name, path, size: file.size });

      // Validate file
      if (!file) {
        throw new Error("No file provided");
      }

      if (file.size === 0) {
        throw new Error("File is empty");
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error("File size exceeds 10MB limit");
      }

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<{ url: string; error: null } | { url: null; error: string }>(
        (resolve) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
              onProgress?.(progress);
              console.log(`Upload progress: ${progress}%`);
            },
            (error) => {
              console.error("Upload error:", error);
              setUploading(false);
              resolve({ url: null, error: error.message });
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Upload completed:", downloadURL);
                setUploading(false);
                resolve({ url: downloadURL, error: null });
              } catch (error: any) {
                console.error("Error getting download URL:", error);
                setUploading(false);
                resolve({ url: null, error: error.message });
              }
            }
          );
        }
      );
    } catch (error: any) {
      console.error("Upload setup error:", error);
      setUploading(false);
      return { url: null, error: error.message };
    }
  };

  // Upload multiple files
  const uploadFiles = async (
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ) => {
    console.log("Starting multiple file upload:", { fileCount: files.length, basePath });
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${cleanFileName}`;
      const path = `${basePath}/${fileName}`;
      
      console.log(`Uploading file ${i + 1}/${files.length}:`, { fileName, path });
      
      const result = await uploadFile(file, path, (progress) => {
        onProgress?.(i, progress);
      });
      
      results.push({ file: file.name, ...result });
      
      if (result.error) {
        console.error(`Failed to upload ${file.name}:`, result.error);
      } else {
        console.log(`Successfully uploaded ${file.name}:`, result.url);
      }
    }
    
    console.log("Multiple file upload completed:", results);
    return results;
  };

  // Upload project assets
  const uploadProjectAssets = async (
    files: File[],
    projectId: string,
    userId: string
  ) => {
    if (!projectId || !userId) {
      throw new Error("Project ID and User ID are required");
    }

    const basePath = `projects/${userId}/${projectId}/assets`;
    console.log("Uploading project assets:", { basePath, fileCount: files.length });
    
    return uploadFiles(files, basePath);
  };

  // Upload generated image
  const uploadGeneratedImage = async (
    imageBlob: Blob,
    projectId: string,
    userId: string,
    sceneId: string
  ) => {
    const path = `projects/${userId}/${projectId}/scenes/${sceneId}/image.jpg`;
    
    try {
      setUploading(true);
      console.log("Uploading generated image:", path);
      
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, imageBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log("Generated image uploaded:", downloadURL);
      return { url: downloadURL, error: null };
    } catch (error: any) {
      console.error("Error uploading generated image:", error);
      return { url: null, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  // Delete a file
  const deleteFile = async (filePath: string) => {
    try {
      console.log("Deleting file:", filePath);
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      console.log("File deleted successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting file:", error);
      return { error: error.message };
    }
  };

  // Get file URL
  const getFileUrl = async (filePath: string) => {
    try {
      const storageRef = ref(storage, filePath);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error: any) {
      console.error("Error getting file URL:", error);
      return { url: null, error: error.message };
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadFiles,
    uploadProjectAssets,
    uploadGeneratedImage,
    deleteFile,
    getFileUrl,
  };
}; 