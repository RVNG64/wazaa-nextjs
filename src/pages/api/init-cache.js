// pages/api/init-cache.js
import loadEventsFromGCS from './loadEventsFromGCS';

export default async function handler(req, res) {
  try {
    const events = await loadEventsFromGCS();
    // Vous pouvez stocker ce cache dans une variable globale, ou utiliser redis/memcached pour une gestion de cache plus évolutive.
    global.eventsCache = events;
    res.status(200).json({ message: 'Cache initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize cache:', error);
    res.status(500).json({ error: 'Failed to initialize events cache' });
  }
}
