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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with platform-specific configuration
console.log('Platform.OS detected as:', Platform.OS);
export const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
console.log('Firebase Auth initialized for platform:', Platform.OS);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
