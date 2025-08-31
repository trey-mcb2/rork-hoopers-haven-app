import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBusrW1dWvT7YGLCARGmKXv6W4XiSpl-Mo",
  authDomain: "hoopershavenapp2.firebaseapp.com",
  projectId: "hoopershavenapp2",
  storageBucket: "hoopershavenapp2.firebasestorage.app",
  messagingSenderId: "695385820548",
  appId: "1:695385820548:web:13aeab364ec5bab87661d1"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Failed to initialize Firebase app:', error);
  throw new Error('Firebase initialization failed');
}

// Initialize Firebase Authentication with platform-specific configuration
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase auth:', error);
  if (Platform.OS !== 'web') {
    try {
      auth = getAuth(app);
      console.warn('Using Firebase auth without AsyncStorage persistence due to initialization error');
    } catch (fallbackError) {
      console.error('Firebase auth fallback also failed:', fallbackError);
      throw new Error('Firebase auth initialization completely failed');
    }
  } else {
    throw error;
  }
}

export { auth };

// Initialize Cloud Firestore and get a reference to the service
let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.error('Failed to initialize Firestore:', error);
  throw new Error('Firestore initialization failed');
}

export { db };

export default app;
