import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

type AuthContextType = {
  currentUser: User | null;
};

export const AuthContext = createContext<AuthContextType>({ currentUser: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Utilisateur actuel (authContext) : ", user);
      setCurrentUser(user); // ou juste `user` si vous voulez stocker l'objet utilisateur entier
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
