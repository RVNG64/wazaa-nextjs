// src/components/UpdateMapRef.tsx
import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { useNativeEvents } from '../contexts/NativeEventContext';
import L from 'leaflet';

interface UpdateMapRefProps {
  mapRef: React.MutableRefObject<L.Map | null>;
}

const UpdateMapRef = (props: UpdateMapRefProps) => {
  const { initializeNativeEvents } = useNativeEvents();
  const { mapRef } = props;

  useMapEvents({
    load: (mapEvent) => {
      const mapInstance = mapEvent.target as L.Map;
      if (mapRef && 'current' in mapRef) {
        mapRef.current = mapInstance;
      }
      const bounds = mapInstance.getBounds();
      initializeNativeEvents(bounds);
    },
  });

  return null;
};

UpdateMapRef.displayName = 'UpdateMapRef';

export default UpdateMapRef;
