// src/hooks/useMapEvents.tsx
import { useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useEvents } from '../contexts/EventContext';
import { useNativeEvents } from '../contexts/NativeEventContext';

const useInitializeMapEvents = () => {
  const { initializeEvents } = useEvents();
  const { initializeNativeEvents } = useNativeEvents();
  const isInitialized = useRef(false);
  const map = useMap();

  useEffect(() => {
    if (!isInitialized.current) {
      map.on('load', async () => {
        const bounds = map.getBounds();
        if (bounds.isValid()) {
          await initializeEvents(bounds);
          await initializeNativeEvents(bounds);
          isInitialized.current = true;
        }
      });
    }
  }, [map, initializeEvents, initializeNativeEvents]);
};

export default useInitializeMapEvents;
