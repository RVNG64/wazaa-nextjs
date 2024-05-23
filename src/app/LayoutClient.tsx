// src/app/LayoutClient.tsx
'use client';
import React, { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthProvider.client';
import { EventsProvider } from '../contexts/EventContext';
import { NativeEventProvider } from '../contexts/NativeEventContext';
import { SearchProvider } from '../contexts/EventFilter';
import App from "./app.client";

export default function LayoutClient({ children }: { children: React.ReactNode }) {

  // Initialisation du cache des événements lors du chargement de l'application
  useEffect(() => {
    const initCache = async () => {
      try {
        await fetch('/api/init-cache');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du cache des événements:', error);
      }
    };
    initCache();
  }, []); // Ce useEffect s'exécute une seule fois au montage du composant

  return (
    <AuthProvider>
      <SearchProvider>
        <EventsProvider>
          <NativeEventProvider>
            <App>
              {children}
            </App>
          </NativeEventProvider>
        </EventsProvider>
      </SearchProvider>
    </AuthProvider>
  );
}
