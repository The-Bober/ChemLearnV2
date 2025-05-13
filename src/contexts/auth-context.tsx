'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth, db } from '@/lib/firebase'; // Ensure db is imported
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'; // Import Firestore methods
import type { PropsWithChildren } from 'react';
import { logActivity } from '@/services/activityService'; 
import { getUserCompletedQuizzesCount } from '@/services/quizService'; // Import quiz service

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signUp: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  completedQuizzesCount: number | null;
  loadingCompletedQuizzesCount: boolean;
  refreshCompletedQuizzesCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState<number | null>(null);
  const [loadingCompletedQuizzesCount, setLoadingCompletedQuizzesCount] = useState<boolean>(true);

  const fetchUserStats = useCallback(async (currentUser: FirebaseUser | null) => {
    if (currentUser) {
      setLoadingCompletedQuizzesCount(true);
      try {
        const count = await getUserCompletedQuizzesCount(currentUser.uid);
        setCompletedQuizzesCount(count);
      } catch (e: any) {
        console.error("Failed to fetch completed quizzes count:", e);
        setError(`Error fetching quiz count: ${e.message} (Code: ${e.code})`);
        setCompletedQuizzesCount(0); // Default to 0 on error
      } finally {
        setLoadingCompletedQuizzesCount(false);
      }
    } else {
      setCompletedQuizzesCount(null);
      setLoadingCompletedQuizzesCount(false);
    }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const isEmailAdmin = firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (isEmailAdmin && userData.isAdmin !== true) {
              await setDoc(userDocRef, { isAdmin: true }, { merge: true });
              setIsAdmin(true);
            } else {
              setIsAdmin(userData.isAdmin === true);
            }
          } else {
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              photoURL: firebaseUser.photoURL || '',
              isAdmin: isEmailAdmin,
              createdAt: Timestamp.now(),
            });
            setIsAdmin(isEmailAdmin);
          }
          await fetchUserStats(firebaseUser); 
        } catch (firestoreError: any) {
          console.error("Firestore error during user profile setup in AuthProvider:", firestoreError);
          setError(`Firestore setup error: ${firestoreError.message} (Code: ${firestoreError.code})`);
          setIsAdmin(false); // Reset admin status on error
        }
      } else {
        setIsAdmin(false);
        await fetchUserStats(null); 
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserStats]);

  const clearError = () => setError(null);

  const signIn = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      setLoading(false);
      return firebaseUser;
    } catch (e) {
      const authError = e as AuthError;
      console.error("Sign in error:", authError);
      setError(`Sign in failed: ${authError.message} (Code: ${authError.code})`);
      setLoading(false);
      return null;
    }
  };

  const signUp = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const isAdminUser = firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        photoURL: firebaseUser.photoURL || '',
        isAdmin: isAdminUser,
        createdAt: Timestamp.now(),
      });
      setLoading(false);
      await logActivity('user_registered', `User "${firebaseUser.email}" registered.`, firebaseUser.uid, firebaseUser.uid);
      return firebaseUser;
    } catch (e: any) { // Catch 'any' for broader error type checking from Firestore or Auth
      console.error("Sign up error:", e);
      setError(`Sign up failed: ${e.message} (Code: ${e.code})`);
      setLoading(false);
      return null;
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
        const authError = e as AuthError;
        console.error("Sign out error:", authError);
        setError(`Sign out failed: ${authError.message} (Code: ${authError.code})`);
    } 
  };

  const refreshCompletedQuizzesCount = useCallback(async () => {
    if (user) {
      await fetchUserStats(user);
    }
  }, [user, fetchUserStats]);

  const value = { 
    user, 
    isAdmin, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    error, 
    clearError,
    completedQuizzesCount,
    loadingCompletedQuizzesCount,
    refreshCompletedQuizzesCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

