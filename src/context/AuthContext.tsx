import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '../types/database';

export type UserRole = 'client' | 'seller' | 'admin';
export type Profile = UserProfile;
export type AuthUser = UserProfile & { is_blocked?: boolean };

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterData) => Promise<{ error?: string; emailConfirmationSent?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
}

interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        const profile: AuthUser = {
          ...data,
          id: uid,
          full_name: `${data.prenom || ''} ${data.nom || ''}`.trim() || data.email.split('@')[0],
          created_at: data.createdAt || data.created_at || new Date().toISOString(),
          updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
        };
        setUser(profile);
        return profile;
      }
      return null;
    } catch (err) {
      console.error('Erreur de chargement du profil:', err);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser.uid);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        if (profile?.is_blocked || profile?.isBlocked) {
          await firebaseSignOut(auth);
          setUser(null);
        } else {
          // Live profile updates listener
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeSnapshot = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              const updatedProfile: AuthUser = {
                ...data,
                id: firebaseUser.uid,
                full_name: `${data.prenom || ''} ${data.nom || ''}`.trim() || data.email.split('@')[0],
                created_at: data.createdAt || data.created_at || new Date().toISOString(),
                updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
              };
              setUser(updatedProfile);
            }
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchProfile(userCred.user.uid);
      if (profile?.is_blocked || profile?.isBlocked) {
        await firebaseSignOut(auth);
        setUser(null);
        return { error: 'Votre compte est bloqué. Contactez un administrateur.' };
      }
      return {};
    } catch (err: any) {
      let msg = err.message || 'Erreur lors de la connexion';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Identifiants incorrects';
      }
      return { error: msg };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCred.user.uid;

      const newProfile: UserProfile = {
        id: uid,
        nom: data.nom,
        prenom: data.prenom,
        full_name: `${data.prenom} ${data.nom}`,
        email: data.email,
        phone: data.phone || null,
        role: 'client',
        productCount: 0,
        product_count: 0,
        rating: 0,
        isBlocked: false,
        is_blocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), newProfile);
      try {
        await sendEmailVerification(userCred.user);
      } catch (e) {
        console.warn("Verification email notice:", e);
      }
      setUser(newProfile as AuthUser);
      return { emailConfirmationSent: false };
    } catch (err: any) {
      let msg = err.message || "Erreur lors de l'inscription";
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Cet email est déjà utilisé par un autre compte.';
      }
      return { error: msg };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      let msg = err.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation';
      if (err.code === 'auth/user-not-found') {
        msg = 'Aucun compte associé à cet email.';
      }
      return { error: msg };
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
