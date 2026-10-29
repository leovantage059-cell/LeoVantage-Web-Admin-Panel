import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let db = null;
let auth = null;
let storage = null;

// Only initialize Firebase if environment variables are configured
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      db = getFirestore(app);
    } catch (e) {
      console.warn('[LeoVantage Admin] Firestore init warning:', e.message);
    }
    try {
      auth = getAuth(app);
    } catch (e) {
      console.warn('[LeoVantage Admin] Auth init warning:', e.message);
    }
    try {
      storage = getStorage(app);
    } catch (e) {
      console.warn('[LeoVantage Admin] Storage init warning:', e.message);
    }
  } catch (error) {
    console.warn('[LeoVantage Admin] Firebase initialization skipped:', error.message);
  }
}

export { app, db, auth, storage, firebaseConfig };
export default app;
