import { checkAndUpdateCache, getEventsCache } from '../../cache';

export const config = {
  api: {
    responseLimit: '45mb',
  },
};

export default async function handler(req, res) {
  console.log('Requête GET /api/events:', req.query);

  try {
    await checkAndUpdateCache();

    const eventsCache = getEventsCache();
    console.log('Vérification du cache après mise à jour');
    if (!eventsCache || eventsCache.length === 0) {
      console.log('Cache is still initializing, please retry.');
      return res.status(503).json({ error: 'Cache is still initializing, please retry.' });
    }

    console.log('Cache validé avec', eventsCache.length, 'événements');

    const { ne, sw, startDate, endDate } = req.query;
    const [northEastLat, northEastLng] = ne ? ne.split(',').map(parseFloat) : [];
    const [southWestLat, southWestLng] = sw ? sw.split(',').map(parseFloat) : [];

    if ([northEastLat, northEastLng, southWestLat, southWestLng].some(isNaN)) {
      console.error('Paramètres de requête invalides:', req.query);
      return res.status(400).send('Paramètres de requête invalides');
    }

    const filteredEvents = eventsCache.filter(event => {
      const location = event.isLocatedAt[0]['schema:geo'];
      const lat = parseFloat(location['schema:latitude']);
      const lng = parseFloat(location['schema:longitude']);

      const eventStartDate = event['schema:startDate'] ? new Date(event['schema:startDate'][0]) : null;
      const eventEndDate = event['schema:endDate'] ? new Date(event['schema:endDate'][0]) : null;

      const isWithinBounds = lat >= southWestLat && lat <= northEastLat && lng >= southWestLng && lng <= northEastLng;
      const isWithinDateRange = (!startDate || !eventStartDate || eventStartDate >= new Date(startDate)) &&
                                (!endDate || !eventEndDate || eventEndDate <= new Date(endDate));

      return isWithinBounds && isWithinDateRange;
    });

    console.log(`Nombre d'événements JSON filtrés: ${filteredEvents.length}`);
    res.json(filteredEvents);
  } catch (error) {
    console.error('Erreur lors du filtrage des événements:', error);
    res.status(500).send('Erreur serveur lors du filtrage: ' + error.message);
  }
}
