// src/app/page.tsx
import React from 'react';
import LeafletMap from '../components/LeafletMap';
/* import { initializeCache, eventsCache } from '../cache';

// Cette fonction génère les paramètres statiques pour ISR
export async function generateStaticParams() {
  try {
    await initializeCache();

    const cachedEvents = eventsCache || [];

    const { events, nativeEvents } = await getEvents();

    return [
      {
        props: {
          events: cachedEvents || events,
          nativeEvents,
        },
        revalidate: 86400, // Re-générer la page toutes les 24 heures
      },
    ];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

interface PageProps {
  events: any;
  nativeEvents: any;
} */

function Map() {
  /* const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []); */

  return (
    <>
      <LeafletMap />
    </>
  );
}

export default Map;
