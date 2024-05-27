// InitializeMapEvents.tsx
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useEvents } from '../contexts/EventContext';
import { useNativeEvents } from '../contexts/NativeEventContext';
import { useSearch } from '../contexts/EventFilter';

const InitializeMapEvents = () => {
  const { initializeEvents } = useEvents();
  const { initializeNativeEvents } = useNativeEvents();
  const { searchStartDate, searchEndDate } = useSearch();
  const map = useMap();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      console.log("Initialisation des événements pour les limites actuelles de la carte");
      const bounds = map.getBounds();
      console.log("Limites actuelles de la carte:", bounds);
      if (bounds.isValid()) { // S'assure que les limites de la carte sont valides
        initializeEvents(bounds, searchStartDate, searchEndDate);
        initializeNativeEvents(bounds);
        isInitialized.current = true;
      }
    }
  }, [map, initializeEvents, initializeNativeEvents, searchStartDate, searchEndDate]);

  return null;
};

export default InitializeMapEvents;
