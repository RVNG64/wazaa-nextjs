import { checkAndUpdateCache, getEventsCache } from '../../../cache';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=259200'); // Définit la durée de mise en cache du client à 3 jours
  console.log('Requête pour événement:', req.query);

  const { eventId } = req.query;

  try {
    // Vérifier et mettre à jour le cache si nécessaire
    await checkAndUpdateCache();

    // Obtenir le cache mis à jour
    const eventsCache = getEventsCache();
    console.log('Cache après mise à jour:', eventsCache ? 'disponible' : 'non disponible');

    // Vérifier si le cache est disponible
    if (!eventsCache || eventsCache.length === 0) {
      console.log('Cache non disponible après mise à jour');
      return res.status(503).json({ error: 'Cache is initializing, please retry.' });
    }

    // Rechercher l'événement par ID dans le cache
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
