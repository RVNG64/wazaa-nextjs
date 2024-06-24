// src/contexts/EventFilter.tsx
import React, { createContext, useState, useContext } from 'react';

interface SearchContextType {
  searchStartDate: string;
  setSearchStartDate: (value: string) => void;
  searchEndDate: string;
  setSearchEndDate: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const defaultState = {
  searchStartDate: '',
  setSearchStartDate: () => {},
  searchEndDate: '',
  setSearchEndDate: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
};

const SearchContext = createContext<SearchContextType>(defaultState);

export const useSearch = () => useContext(SearchContext);

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchStartDate, setSearchStartDate, searchEndDate, setSearchEndDate, searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};
