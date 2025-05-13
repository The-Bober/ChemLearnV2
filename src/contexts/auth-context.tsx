
'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import type { PropsWithChildren } from 'react';

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsAdmin(firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
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
      setUser(userCredential.user);
      setIsAdmin(userCredential.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
      setLoading(false);
      return userCredential.user;
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
      setUser(userCredential.user);
      setIsAdmin(userCredential.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL); // Should be false for new users unless it's the admin email
      setLoading(false);
      return userCredential.user;
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
      setUser(null);
      setIsAdmin(false);
    } catch (e) {
        const authError = e as AuthError;
        setError(authError.message);
    } finally {
        setLoading(false);
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
