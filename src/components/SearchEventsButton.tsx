// src/components/SearchEventsButton.tsx
'use client';
import React, { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useEvents } from '../contexts/EventContext';
import { useNativeEvents } from '../contexts/NativeEventContext';

type SearchEventsButtonProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchEventsButton = ({ setIsLoading }: SearchEventsButtonProps) => {
  const map = useMap();
  const { fetchEventsInBounds, setEvents } = useEvents();
  const { fetchNativeEventsInBounds, setNativeEvents } = useNativeEvents();
  const [showSearchButton, setShowSearchButton] = useState(false);

  useMapEvents({
    moveend: () => setShowSearchButton(true),
    zoomend: () => setShowSearchButton(true),
  });

  const handleSearch = () => {
    setIsLoading(true);
    const bounds = map.getBounds();
    fetchEventsInBounds(bounds).then(newEvents => {
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
