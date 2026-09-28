import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDb6if1fQiTnIW0aJALY-p6i2vU6E3HNGk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "resq2link.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://resq2link-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "resq2link",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "resq2link.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "889575896643",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:889575896643:web:6cb8c7deabddd36cf506f6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EE97E37JQX"
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
