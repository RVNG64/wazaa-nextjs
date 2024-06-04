// src/pages/api/events/search.js
import { validationResult } from 'express-validator';
import { checkAndUpdateCache, eventsCache } from '../../../cache';

const sortByDateDescending = (a, b) => {
  const aStartDate = a['schema:startDate'] ? new Date(a['schema:startDate'][0]) : new Date(0);
  const bStartDate = b['schema:startDate'] ? new Date(b['schema:startDate'][0]) : new Date(0);
  return aStartDate - bStartDate; // Trie du plus récent au plus ancien
};

const normalizeString = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    // Vérifier et mettre à jour le cache si nécessaire
    await checkAndUpdateCache();

    if (!eventsCache) {
      return res.status(503).json({ error: 'Cache is initializing, please retry.' });
    }

    // Gestion des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { searchTerm, startDate, endDate, page = 1 } = req.body;

    const filterEvents = (event) => {
      if (searchTerm) {
        const normalizedSearchTerm = normalizeString(searchTerm);

        const labelMatch = event['rdfs:label'] && Object.values(event['rdfs:label'] || {}).flat().some(label => normalizeString(label).includes(normalizedSearchTerm));

        const descriptionMatch = event['hasDescription']?.some(desc => Object.values(desc['dc:description'] || {}).flat().some(description => normalizeString(description).includes(normalizedSearchTerm)));

        const themeMatch = event['hasTheme']?.some(theme => Object.values(theme['rdfs:label'] || {}).flat().some(themeLabel => normalizeString(themeLabel).includes(normalizedSearchTerm)));

        const bookingContactMatch = event['hasBookingContact']?.some(contact => contact['schema:legalName'] && normalizeString(contact['schema:legalName']).includes(normalizedSearchTerm));

        if (!(labelMatch || descriptionMatch || themeMatch || bookingContactMatch)) return false;
      }

      if (startDate && new Date(event['schema:startDate'][0]) < new Date(startDate)) return false;
      if (endDate && new Date(event['schema:endDate'][0]) > new Date(endDate)) return false;

      return true;
    };

    const filteredEvents = eventsCache.filter(filterEvents);
    const sortedEvents = filteredEvents.sort(sortByDateDescending);

    const limit = 10;
    const skip = (page - 1) * limit;
    const paginatedEvents = sortedEvents.slice(skip, skip + limit);

    console.log(`Nombre d'événements filtrés: ${sortedEvents.length}`);

    res.json({
      results: paginatedEvents,
      totalPages: Math.ceil(sortedEvents.length / limit)
    });
  } catch (error) {
    console.error('Erreur lors de la recherche :', error);
    res.status(500).send('Erreur serveur lors de la recherche');
  }
}
