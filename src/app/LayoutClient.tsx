// src/app/LayoutClient.tsx
'use client';
import React, { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthProvider.client';
import { EventsProvider } from '../contexts/EventContext';
import { NativeEventProvider } from '../contexts/NativeEventContext';
import { SearchProvider } from '../contexts/EventFilter';
import App from "./app.client";

export default function LayoutClient({ children }: { children: React.ReactNode }) {

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
