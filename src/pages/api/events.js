// src/pages/api/events.js
import { checkAndUpdateCache, eventsCache } from '../../cache';

export const config = {
  api: {
    responseLimit: '45mb', // Augmente la limite de réponse à 8MB
  },
};

export default async function handler(req, res) {
  console.log('Requête GET /api/events:', req.query);
  console.log("Received NE:", req.query.ne, "Received SW:", req.query.sw);

  await checkAndUpdateCache();

  if (!eventsCache) {
    console.log('Cache not available');
    return res.status(503).json({ error: 'Cache is initializing, please retry.' });
  }

  // Récupération et décomposition des paramètres de requête
  const ne = req.query.ne ? req.query.ne.split(',') : [];
  const sw = req.query.sw ? req.query.sw.split(',') : [];
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  // Conversion des valeurs en nombres
  const northEastLat = parseFloat(ne[0]);
  const northEastLng = parseFloat(ne[1]);
  const southWestLat = parseFloat(sw[0]);
  const southWestLng = parseFloat(sw[1]);

  // Vérification si les coordonnées sont valides
  if (isNaN(northEastLat) || isNaN(northEastLng) || isNaN(southWestLat) || isNaN(southWestLng)) {
    console.error('Paramètres de requête invalides:', req.query);
    return res.status(400).send('Paramètres de requête invalides');
  }

  try {
    const filteredEvents = eventsCache.filter(event => {
      const location = event.isLocatedAt[0]['schema:geo'];
      const lat = parseFloat(location['schema:latitude']);
      const lng = parseFloat(location['schema:longitude']);
      const isValidLatLong = !isNaN(lat) && !isNaN(lng);

      const eventStartDate = event['schema:startDate'] ? new Date(event['schema:startDate'][0]) : null;
      const eventEndDate = event['schema:endDate'] ? new Date(event['schema:endDate'][0]) : null;

      const isWithinBounds = isValidLatLong &&
        lat >= southWestLat && lat <= northEastLat &&
        lng >= southWestLng && lng <= northEastLng;

      const isWithinDateRange = (!startDate || !eventStartDate || eventStartDate >= startDate) &&
        (!endDate || !eventEndDate || eventEndDate <= endDate);

      return isWithinBounds && isWithinDateRange;
    });

    console.log(`Nombre d'événements JSON filtrés: ${filteredEvents.length}`);
    res.json(filteredEvents);
  } catch (error) {
    console.error('Erreur lors du filtrage des événements:', error);
    res.status(500).send('Erreur serveur lors du filtrage');
  }
}
