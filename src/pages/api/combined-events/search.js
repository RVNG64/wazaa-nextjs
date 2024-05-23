/* module.exports = function(eventsCache) {
  const router = require('express').Router();
  const Event = require('../../models/Event');
  const { validationResult } = require('express-validator');

  // Fonction de normalisation des chaînes de caractères
  const normalizeString = (str) => {
    if (typeof str !== 'string') return ''; // Ou gérer l'erreur autrement
    console.log('Normalisation de la chaîne :', str);
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Fonction de tri (du plus récent au plus ancien)
  const sortByDateDescending = (a, b) => {
    const aStartDate = new Date(a.startDate || 0);
    const bStartDate = new Date(b.startDate || 0);
    return bStartDate - aStartDate;
  };

  // Fonction de transformation pour normaliser les résultats
  const transformEvent = (event) => {
    // Déterminer si l'événement est natif ou POI
    const isNativeEvent = event.hasOwnProperty('eventID');

    return {
      id: isNativeEvent ? event.eventID : event['@id'],
      title: isNativeEvent ? event.name : event['rdfs:label']['fr'][0],
      startDate: isNativeEvent ? event.startDate : event['schema:startDate'][0],
      endDate: isNativeEvent ? event.endDate : event['schema:endDate'][0],
      location: isNativeEvent ? event.location.city : (event['isLocatedAt'][0]['schema:address'][0]['schema:addressLocality'] || ''),
      description: isNativeEvent ? event.description : (event['hasDescription'][0]['dc:description']['fr'][0] || 'Description non disponible'),
      organizer: isNativeEvent ? event.organizerName : event['hasBookingContact'][0],
      category: isNativeEvent ? event.category : event['hasTheme'][0],
      tags: isNativeEvent ? event.tags : event['hasTheme'],

      // Eventuels champs supplémentaires à ajouter
    };
  };

  // Route pour les recherches avancées combinées d'événements
  router.post('/combined-events/search', async (req, res) => {
    try {
      // Validation des données de la requête
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { searchTerm, startDate, endDate, page } = req.body;
      console.log('Recherche avancée combinée d\'événements :', req.body);

      let nativeEvents = [];
      let poiEvents = [];

      try {
        // Logique de recherche pour les événements natifs
        let nativeQuery = Event.find({'validationStatus': 'approved', 'type': 'public'});
        console.log('Recherche d\'événements natifs :', nativeQuery);

        if (searchTerm) {
          console.log('Normalized input:', searchTerm, 'Type:', typeof searchTerm);
          const normalizedTerm = normalizeString(searchTerm);
          console.log('Normalized term:', normalizedTerm);

          nativeQuery = nativeQuery.or([ // or
            { 'name': { $regex: normalizedTerm, $options: 'i' } },
            { 'description': { $regex: normalizedTerm, $options: 'i' } },
            { 'organizerName': { $regex: normalizedTerm, $options: 'i' } },
            { 'theme': { $regex: normalizedTerm, $options: 'i' } },
            { 'tags': { $regex: normalizedTerm, $options: 'i' } },
            { 'location.city': { $regex: normalizedTerm, $options: 'i' } },
            { 'category': { $regex: normalizedTerm, $options: 'i' } },
            // Ajoutez d'autres champs si nécessaire
          ]);
          console.log('Recherche d\'événements natifs avec terme de recherche :', nativeQuery);
        }

        // Filtrage par dates
        if (startDate) nativeQuery = nativeQuery.gte('startDate', new Date(startDate));
        if (endDate) nativeQuery = nativeQuery.lte('endDate', new Date(endDate));

        console.log('Recherche d\'événements natifs avec dates :', nativeQuery);

        // Ajoutez d'autres critères de recherche si nécessaire
        nativeEvents = await nativeQuery.exec();
        console.log('Résultats de la recherche d\'événements natifs :', nativeEvents);

      } catch (error) {
        console.error('Erreur lors de la recherche des événements natifs :', error);
        return res.status(500).send('Erreur serveur lors de la recherche des événements natifs');
      }

      try {
        // Logique de recherche pour les POI
        poiEvents = eventsCache.filter(event => {
          if (searchTerm) {
            console.log('Normalized input:', searchTerm, 'Type:', typeof searchTerm);
            const normalizedTerm = normalizeString(searchTerm);
            console.log('Normalized term:', normalizedTerm);

            // Vérifie si un des champs correspond au terme de recherche
            return ['rdfs:label', 'hasDescription', 'hasTheme', 'hasBookingContact']
            .some(field => Array.isArray(event[field]) && event[field].some(subField =>
              normalizeString(subField).includes(normalizedTerm)));
          }

          // Filtrage par dates
          return (!startDate || new Date(event['schema:startDate'][0]) >= new Date(startDate)) &&
                  (!endDate || new Date(event['schema:endDate'][0]) <= new Date(endDate));
        });
      } catch (error) {
        console.error('Erreur lors de la recherche des POI :', error);
        return res.status(500).send('Erreur serveur lors de la recherche des POI');
      }

      console.log('Résultats de la recherche des POI :', poiEvents);

      // Fusion des résultats et normalisation
      const combinedResults = [...nativeEvents.map(transformEvent), ...poiEvents.map(transformEvent)];
      console.log('Résultats combinés :', combinedResults);

      // Tri et Pagination
      const sortedResults = combinedResults.sort(sortByDateDescending);
      const limit = 10;
      const skip = (page - 1) * limit;
      const paginatedResults = sortedResults.slice(skip, skip + limit);

      console.log('Résultats paginés :', paginatedResults);
      console.log('Total des résultats :', sortedResults.length);

      res.json({
        results: paginatedResults,
        totalPages: Math.ceil(sortedResults.length / limit)
      });
    } catch (error) {
      console.error('Erreur lors de la recherche combinée :', error);
      res.status(500).send('Erreur serveur lors de la recherche');
    }
  });

  return router;
};
*/
