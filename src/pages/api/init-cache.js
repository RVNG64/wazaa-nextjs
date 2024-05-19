// src/pages/api/init-cache.js
import { initializeCache, eventsCache } from '../../cache';

export default async function handler(req, res) {
  try {
    await initializeCache();
    res.status(200).json({ message: 'Cache valide', cacheInitialized: Boolean(eventsCache) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'initialisation du cache' });
  }
}
