// src/utils/getEvents.tsx
export const getEvents = async () => {
  const baseUrl = 'https://wazaa.app';
  // const baseUrl = https://wazaa.app || 'http://localhost:3000';

  const [eventsResponse, nativeEventsResponse] = await Promise.all([
    fetch(`${baseUrl}/api/events`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/native-events`, { cache: 'no-store' }),
  ]);

  if (!eventsResponse.ok || !nativeEventsResponse.ok) {
    throw new Error('Failed to fetch events');
  }

  const events = await eventsResponse.json();
  const nativeEvents = await nativeEventsResponse.json();

  return { events, nativeEvents };
};
