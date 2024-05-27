// src/pages/api/cache/events.js
import { eventsCache, checkAndUpdateCache } from '../../../cache';

export default async function handler(req, res) {
  try {
    await checkAndUpdateCache();
    res.status(200).json(eventsCache);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des événements en cache' });
  }
}
