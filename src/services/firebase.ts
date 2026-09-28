import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCs_IXvrECzTf5v1PwxJId-xmT89zhFeA0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "resqlink-2a8f2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "resqlink-2a8f2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "resqlink-2a8f2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "704922089642",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:704922089642:web:e0564807dec6677ef9f8d3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BZR17G86B3"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let isFirebaseConfigured = true;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  try {
    rtdb = getDatabase(app);
  } catch (rtdbErr) {
    console.warn("RTDB initialization note:", rtdbErr);
  }
  console.log("🔥 Firebase initialized successfully with project:", firebaseConfig.projectId);
} catch (err) {
  console.warn("Firebase initialization warning (falling back to local storage):", err);
  isFirebaseConfigured = false;
}

export { app, auth, db, rtdb, isFirebaseConfigured };
