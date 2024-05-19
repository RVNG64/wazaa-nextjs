// src/contexts/AuthContext.tsx
import React, { createContext, Dispatch, SetStateAction } from 'react';
import { User } from 'firebase/auth';

type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
};

// Initialize the context with default values
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
});
