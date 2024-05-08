// pages/api/events.js
import loadEventsFromGCS from './loadEventsFromGCS';

export default async function handler(req, res) {
  console.log('Requête GET /api/events:', req.query);
  console.log("Received NE:", req.query.ne, "Received SW:", req.query.sw);

  if (!global.eventsCache) {
    console.log('Cache not initialized, loading...');
    try {
      global.eventsCache = await loadEventsFromGCS();
      console.log('Cache loaded successfully.');
    } catch (error) {
      console.error('Failed to load cache:', error);
      return res.status(500).json({ error: 'Failed to initialize events cache' });
    }
  }

  // Récupération et décomposition des paramètres de requête
  const ne = req.query.ne ? req.query.ne.split(',') : [];
  const sw = req.query.sw ? req.query.sw.split(',') : [];

  // Conversion des valeurs en nombres
  const northEastLat = parseFloat(ne[0]);
  const northEastLng = parseFloat(ne[1]);
  const southWestLat = parseFloat(sw[0]);
  const southWestLng = parseFloat(sw[1]);

  console.log('NE:', northEastLat, northEastLng, 'SW:', southWestLat, southWestLng);

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

      return isValidLatLong &&
              lat >= southWestLat && lat <= northEastLat &&
              lng >= southWestLng && lng <= northEastLng;
    });

    console.log(`Nombre d'événements JSON filtrés: ${filteredEvents.length}`);
    res.json(filteredEvents);
  } catch (error) {
    console.error('Erreur lors du filtrage des événements:', error);
    res.status(500).send('Erreur serveur lors du filtrage');
  }
}
