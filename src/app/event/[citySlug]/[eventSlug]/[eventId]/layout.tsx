import { ReactNode } from 'react';
import { generateMetadata } from './metadata';
/*
export async function generateStaticParams() {
  try {
    const response = await fetch(`http://localhost:3000/api/event/${params.eventId}`);
    // const response = await fetch('https://www.wazaa.app/api/cache/events');

    if (!response.ok) {
      console.error('Failed to fetch events:', response.status, response.statusText);
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const text = await response.text();

    try {
      const events = JSON.parse(text);

      return events.map((event: { id: string }) => ({
        eventId: event.id,
      }));
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      console.error('Response text:', text);
      throw new Error('Failed to parse JSON response');
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
} */

export { generateMetadata };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
