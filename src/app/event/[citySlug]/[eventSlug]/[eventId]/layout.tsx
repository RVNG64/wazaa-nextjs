// src/app/event/[citySlug]/[eventSlug]/[eventId]/layout.tsx
import { ReactNode } from 'react';
import { generateMetadata } from './metadata';

export async function generateStaticParams() {
  // const response = await fetch('http://localhost:3000/api/cache/events');
  const response = await fetch('https://www.wazaa.app/api/cache/events');
  const events = await response.json();

  return events.map((event: { id: string }) => ({
    eventId: event.id,
  }));
}

export { generateMetadata };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
