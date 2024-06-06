import { checkAndUpdateCacheBackground, getEventsCache, initializeCache } from '../../../cache';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=259200'); // Set client-side cache duration to 3 days
  console.log('Requête pour événement:', req.query);

  const { eventId } = req.query;

  try {
    await initializeCache(); // Ensure the cache is initialized before continuing
    checkAndUpdateCacheBackground(); // Background check and update

    const eventsCache = getEventsCache();
    if (!eventsCache || eventsCache.length === 0) {
      return res.status(503).json({ error: 'Cache is still initializing, please retry.' });
    }

    const event = eventsCache.find(e => e['@id'].split('/').pop() === eventId);

    if (event) {
      res.json(event);
    } else {
      res.status(404).send('Événement non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).send('Erreur serveur lors de la récupération de l\'événement');
  }
}
