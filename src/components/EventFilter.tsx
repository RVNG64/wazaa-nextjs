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


/* import React, { useState } from 'react';
import './EventFilter.css';

interface EventFilterProps {
  setSearchStartDate: (date: string) => void;
  setSearchEndDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
}

const EventFilter: React.FC<EventFilterProps> = ({ setSearchStartDate, setSearchEndDate, setSearchQuery }) => {
  const [isPeriodSearch, setIsPeriodSearch] = useState(false);

  const handleToggleSearchType = () => {
    setIsPeriodSearch(!isPeriodSearch);
  };

  return (
    <div className="filter-container">
      <button onClick={handleToggleSearchType}>
        {isPeriodSearch ? "Recherche par date" : "Recherche par période"}
      </button>

      {!isPeriodSearch && (
        <input
          type="date"
          onChange={(e) => setSearchStartDate(e.target.value)}
          className="filter-date"
          placeholder="Choisir une date"
        />
      )}

      {isPeriodSearch && (
        <>
          <input
            type="date"
            onChange={(e) => setSearchStartDate(e.target.value)}
            className="filter-date"
            placeholder="Date de début"
          />
          <input
            type="date"
            onChange={(e) => setSearchEndDate(e.target.value)}
            className="filter-date"
            placeholder="Date de fin"
          />
        </>
      )}

      <input
        type="text"
        onChange={(e) => setSearchQuery(e.target.value)}
        className="filter-text"
        placeholder="Rechercher par mot-clé...  "
      />

    </div>
  );
};

export default EventFilter;
*/
