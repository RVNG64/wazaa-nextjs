'use client';
import React, { useState, useEffect, createContext, Dispatch, SetStateAction } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../utils/firebase';

type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authInstance = auth;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      console.log('AuthProvider - Utilisateur authentifié:', user);
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authInstance]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
