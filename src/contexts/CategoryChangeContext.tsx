'use client';
// CategoryChangeContext.tsx
import React, { createContext, useContext, ReactNode, FC } from 'react';

interface CategoryContextType {
  onCategoryChange: (category: string) => void;
}

interface CategoryProviderProps {
  children: ReactNode;
  onCategoryChange: (category: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategoryChange = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryChange must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider: FC<CategoryProviderProps> = ({ children, onCategoryChange }) => (
  <CategoryContext.Provider value={{ onCategoryChange }}>
    {children}
  </CategoryContext.Provider>
);
