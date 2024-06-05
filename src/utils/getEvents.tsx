/* src/utils/getEvents.tsx
export const getEvents = async () => {
  const baseUrl = 'http://localhost:3000';
  // const baseUrl = https://wazaa.app || 'http://localhost:3000';

  const [eventsResponse, nativeEventsResponse] = await Promise.all([
    fetch(`${baseUrl}/api/events`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/native-events`, { cache: 'no-store' }),
  ]);

  console.log('eventsResponse status:', eventsResponse.status);
  console.log('eventsResponse body:', await eventsResponse.text()); // Log the raw response body

  console.log('nativeEventsResponse status:', nativeEventsResponse.status);
  console.log('nativeEventsResponse body:', await nativeEventsResponse.text()); // Log the raw response body

  if (!eventsResponse.ok || !nativeEventsResponse.ok) {
    throw new Error('Failed to fetch events');
  }

  const events = await eventsResponse.json();
  const nativeEvents = await nativeEventsResponse.json();

  return { events, nativeEvents };
};
*/
export {};
