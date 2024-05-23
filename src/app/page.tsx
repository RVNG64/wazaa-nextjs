// src/app/page.tsx
import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/LeafletMap';
import { initializeCache, eventsCache } from '../cache';
import { getEvents } from '../utils/getEvents';

// Cette fonction génère les paramètres statiques pour ISR
export async function generateStaticParams() {
  // Initialiser le cache
  await initializeCache();

  // Récupérer les événements depuis le cache
  const cachedEvents = eventsCache || [];

  // Récupérer les événements supplémentaires
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
}

interface PageProps {
  events: any;
  nativeEvents: any;
}

const Page: React.FC<PageProps> = ({ events, nativeEvents }) => {
  return <LeafletMap />;
};

export default Page;
