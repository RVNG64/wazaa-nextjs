// src/app/event/[citySlug]/[eventSlug]/[eventId]/layout.tsx
import { ReactNode } from 'react';
/*
export async function generateStaticParams() {
  const response = await fetch(`http://localhost:3000/api/native-events`);
  // const response = await fetch(`https://www.wazaa.app/api/native-events`);
  const nativeEvents = await response.json();

  return nativeEvents.map((event: { eventID: string }) => ({
    eventId: event.eventID,
  }));
} */

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
