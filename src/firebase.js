import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Default to official LeoVantage Firebase project config if env vars are not set
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDq5rhXDgiz139kpK0LNk4pEOC_kpaTyME',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'leovantage-website-admin.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'leovantage-website-admin',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'leovantage-website-admin.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '38193399854',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:38193399854:web:32824e41337c743b9d37bf',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-RYWZ3YBM2P',
};

let app = null;
let db = null;
let auth = null;
let storage = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
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
  }
} catch (error) {
  console.warn('[LeoVantage Admin] Firebase initialization error:', error.message);
}

export { app, db, auth, storage, firebaseConfig };
export default app;
