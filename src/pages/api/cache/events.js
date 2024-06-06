import { getEventsCache, checkAndUpdateCacheBackground, initializeCache } from '../../../cache';

export default async function handler(req, res) {
  try {
    // Initialiser le cache si nécessaire et lancer la mise à jour en arrière-plan
    await initializeCache();
    checkAndUpdateCacheBackground();

    const eventsCache = getEventsCache();
    if (!eventsCache || eventsCache.length === 0) {
      return res.status(503).json({ error: 'Cache is initializing, please retry.' });
    }

    res.status(200).json(eventsCache);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements en cache:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements en cache' });
  }
}
