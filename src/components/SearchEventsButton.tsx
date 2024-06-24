// src/components/SearchEventsButton.tsx
'use client';
import React, { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useEvents } from '../contexts/EventContext';
import { useNativeEvents } from '../contexts/NativeEventContext';
import { useSearch } from '../contexts/EventFilter';

type SearchEventsButtonProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchEventsButton = ({ setIsLoading }: SearchEventsButtonProps) => {
  const map = useMap();
  const { fetchEventsInBounds, setEvents } = useEvents();
  const { fetchNativeEventsInBounds, setNativeEvents } = useNativeEvents();
  const { searchStartDate, searchEndDate } = useSearch();
  const [showSearchButton, setShowSearchButton] = useState(false);

  useMapEvents({
    moveend: () => setShowSearchButton(true),
    zoomend: () => setShowSearchButton(true),
  });

  const handleSearch = () => {
    setIsLoading(true);
    const bounds = map.getBounds();
    fetchEventsInBounds(bounds, searchStartDate, searchEndDate).then(newEvents => {
      setEvents(newEvents);
    });
    fetchNativeEventsInBounds(bounds).then(newNativeEvents => {
      setNativeEvents(newNativeEvents);
      setShowSearchButton(false);
      setIsLoading(false);
    });
  };

  return (
    <>
      {showSearchButton ? (
        <button className="search-events-btn" onClick={handleSearch}>
          Chercher dans cette zone
        </button>
      ) : null}
    </>
  );
};

export default SearchEventsButton;

// Code pour la recherche automatique des événements (sans bouton "Chercher dans cette zone")
/*
// src/components/SearchEventsButton.tsx
'use client';
import React, { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useEvents } from '../contexts/EventContext';
import { useNativeEvents } from '../contexts/NativeEventContext';
import { useSearch } from '../contexts/EventFilter';

type SearchEventsButtonProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchEventsButton = ({ setIsLoading }: SearchEventsButtonProps) => {
  const map = useMap();
  const { fetchEventsInBounds, setEvents } = useEvents();
  const { fetchNativeEventsInBounds, setNativeEvents } = useNativeEvents();
  const { searchStartDate, searchEndDate } = useSearch();

  const handleSearch = async () => {
    setIsLoading(true);
    const bounds = map.getBounds();
    const newEvents = await fetchEventsInBounds(bounds, searchStartDate, searchEndDate);
    setEvents(newEvents);
    const newNativeEvents = await fetchNativeEventsInBounds(bounds);
    setNativeEvents(newNativeEvents);
    setIsLoading(false);
  };

  useMapEvents({
    moveend: handleSearch,
    zoomend: handleSearch,
  });

  useEffect(() => {
    handleSearch();
  }, []);

  return null;
};

export default SearchEventsButton;
*/
