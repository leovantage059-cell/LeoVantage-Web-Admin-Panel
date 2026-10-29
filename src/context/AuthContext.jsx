import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const AUTHORIZED_SUPER_ADMINS = [
  'gulesh788@gmail.com',
  'leovantage059@gmail.com'
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAdminStatus = async (user) => {
    if (!user) {
      setIsAdmin(false);
      setAdminProfile(null);
      return false;
    }

    const email = (user.email || '').toLowerCase().trim();

    // 1. Primary check: Explicitly authorized studio Google accounts
    if (AUTHORIZED_SUPER_ADMINS.includes(email) || email.endsWith('@leovantage.com')) {
      const defaultName = email.includes('gulesh') 
        ? 'Gulesh Patel' 
        : email.includes('leovantage') 
          ? 'LeoVantage Studio' 
          : 'Studio Admin';

      const profile = {
        uid: user.uid,
        email: email,
        displayName: user.displayName || defaultName,
        photoURL: user.photoURL || null,
        role: 'Super Admin'
      };

      setIsAdmin(true);
      setAdminProfile(profile);
      setAuthError(null);

      // Best-effort sync to Firestore admin_users document
      try {
        await setDoc(doc(db, 'admin_users', user.uid), {
          name: profile.displayName,
          email: profile.email,
          role: 'Super Admin',
          photoURL: profile.photoURL,
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        // Silently continue if rules are being deployed
      }

      return true;
    }

    // 2. Fallback check: check Firestore admin_users or admin_allowlist
    try {
      const userDocRef = doc(db, 'admin_users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setIsAdmin(true);
        setAdminProfile({
          uid: user.uid,
          email: user.email,
          displayName: data.name || user.displayName || 'Studio Admin',
          photoURL: user.photoURL || null,
          role: data.role || 'Admin'
        });
        setAuthError(null);
        return true;
      }
    } catch (err) {
      // Ignored
    }

    // If authenticated with an unauthorized email address
    setIsAdmin(false);
    setAdminProfile(null);
    const deniedMsg = `Access Denied: ${user.email} is not authorized. Please sign in with gulesh788@gmail.com or leovantage059@gmail.com.`;
    setAuthError(deniedMsg);
    await signOut(auth);
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkAdminStatus(user);
      } else {
        setIsAdmin(false);
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const cred = await signInWithPopup(auth, provider);
      const isAuth = await checkAdminStatus(cred.user);
      if (!isAuth) {
        throw new Error(`Access Denied: ${cred.user.email} is not authorized to access LeoVantage Admin OS. Only gulesh788@gmail.com and leovantage059@gmail.com are allowed.`);
      }
      return cred.user;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please click "Continue with Google" to log in.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked by browser. Please allow popups for localhost to sign in with Google.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please verify your Google account.');
      }
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminProfile(null);
  };

  const value = {
    currentUser,
    adminProfile,
    isAdmin,
    loading,
    authError,
    loginWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
