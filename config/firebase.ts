import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBusrW1dWvT7YGLCARGmKXv6W4XiSpl-Mo",
  authDomain: "hoopershavenapp2.firebaseapp.com",
  projectId: "hoopershavenapp2",
  storageBucket: "hoopershavenapp2.firebasestorage.app",
  messagingSenderId: "695385820548",
  appId: "1:695385820548:web:13aeab364ec5bab87661d1"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication with proper configuration
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // For React Native, use initializeAuth
    auth = initializeAuth(app);
  }
} catch {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize Cloud Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
