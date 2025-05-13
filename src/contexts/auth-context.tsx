
'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signUp: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const isEmailAdmin = firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        if (userDocSnap.exists()) {
          // If user doc exists, use its isAdmin field.
          // If the email matches admin email but Firestore says not admin, update Firestore (admin logged in, record was wrong)
          if (isEmailAdmin && userDocSnap.data().isAdmin !== true) {
            await setDoc(userDocRef, { isAdmin: true }, { merge: true });
            setIsAdmin(true);
          } else {
            setIsAdmin(userDocSnap.data().isAdmin === true);
          }
        } else {
          // User doc doesn't exist. Create it.
          // This handles first login for users (including admin) after these changes.
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
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      // Auth state change will handle setting user and isAdmin from Firestore
      // No need to duplicate logic here, onAuthStateChanged will run.
      setLoading(false);
      return firebaseUser;
    } catch (e) {
      const authError = e as AuthError;
      setError(authError.message);
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
      
      // Create user document in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        photoURL: firebaseUser.photoURL || '',
        isAdmin: isAdminUser,
        createdAt: Timestamp.now(),
      });

      // setUser(firebaseUser); // onAuthStateChanged will handle this
      // setIsAdmin(isAdminUser); // onAuthStateChanged will handle this by reading from Firestore

      setLoading(false); // Set loading false after operations
      await logActivity('user_registered', `User "${firebaseUser.email}" registered.`, firebaseUser.uid, firebaseUser.uid);
      return firebaseUser;
    } catch (e) {
      const authError = e as AuthError;
      setError(authError.message);
      setLoading(false);
      return null;
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      // setUser(null); // onAuthStateChanged will handle this
      // setIsAdmin(false); // onAuthStateChanged will handle this
    } catch (e) {
        const authError = e as AuthError;
        setError(authError.message);
    } finally {
        // setLoading(false); // onAuthStateChanged will set loading to false
    }
  };

  const value = { user, isAdmin, loading, signIn, signUp, signOut, error, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
