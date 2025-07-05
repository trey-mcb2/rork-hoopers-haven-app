import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;