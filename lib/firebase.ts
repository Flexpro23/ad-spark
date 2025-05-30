// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzbk96trIMSIVw3OLYU7KeXKHeisiY1AI",
  authDomain: "ai-spark-25.firebaseapp.com",
  projectId: "ai-spark-25",
  storageBucket: "ai-spark-25.firebasestorage.app",
  messagingSenderId: "120361219",
  appId: "1:120361219:web:222b14b56d6aecf8039936",
  measurementId: "G-YT59FFD68J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in browser with error handling
export const analytics = (() => {
  if (typeof window === "undefined") return null;
  
  try {
    return getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
    return null;
  }
})();

export default app; 