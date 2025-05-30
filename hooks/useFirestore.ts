"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Project {
  id?: string;
  title: string;
  description: string;
  status: "draft" | "in-progress" | "completed";
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  idea?: string;
  assets?: string[];
  scenes?: Scene[];
  thumbnail?: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);

  // Create a new project
  const createProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true);
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: now,
        updatedAt: now,
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      setLoading(true);
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "projects", projectId));
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get a single project
  const getProject = async (projectId: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, "projects", projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          project: { id: docSnap.id, ...docSnap.data() } as Project, 
          error: null 
        };
      } else {
        return { project: null, error: "Project not found" };
      }
    } catch (error: any) {
      return { project: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get user's projects
  const getUserProjects = async (userId: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "projects"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Sort on client side by updatedAt desc
      const sortedProjects = projects.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      return { projects: sortedProjects, error: null };
    } catch (error: any) {
      return { projects: [], error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to user's projects (real-time updates)
  const subscribeToUserProjects = (userId: string, callback: (projects: Project[]) => void) => {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Sort on client side by updatedAt desc
      const sortedProjects = projects.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      callback(sortedProjects);
    });
  };

  return {
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    getUserProjects,
    subscribeToUserProjects,
  };
}; 