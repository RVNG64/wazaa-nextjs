// src/app/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import LeafletMap from '../components/LeafletMap';

function Map() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? <LeafletMap /> : null}
    </>
  );
}

export default Map;
