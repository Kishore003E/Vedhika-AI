import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBthvgp6mI460bcU4AR3iB7DSeCXqtDOOA",
  authDomain: "vedhika-newsai.firebaseapp.com",
  projectId: "vedhika-newsai",
  storageBucket: "vedhika-newsai.firebasestorage.app",
  messagingSenderId: "863977441284",
  appId: "1:863977441284:web:3d46096833ad4c37a74d51",
  measurementId: "G-34150PQCV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// API URL for backend
const API_URL = "http://localhost:5000/api";

// Manual registration function
export const registerWithEmailAndPassword = async (email, password, interests = {}) => {
  try {
    // First, register with backend
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, interests })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    // If backend registration is successful, create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Registration error: ", error);
    throw error;
  }
};

// Manual login function
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    // First, validate with backend
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    // If backend login is successful, sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error: ", error);
    throw error;
  }
};

// Google sign-in function (remains mostly the same)
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Optional: Save Google user to backend if needed
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: user.email, 
        password: user.uid, 
        interests: {} 
      })
    });

    return user;
  } catch (error) {
    console.error("Google sign-in error: ", error);
    throw error;
  }
};

// Existing profile fetch function
export const getUserProfile = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not logged in");
    }
    
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${user.email}` 
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export { auth };