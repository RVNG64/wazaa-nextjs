// src/pages/api/event/[eventId].js
const { checkAndUpdateCache, eventsCache } = require('../../../cache');

const cacheDuration = '36 hours';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=259200');
  console.log('Requête pour événement:', req.query);

  const { eventId } = req.query;

  await checkAndUpdateCache();

  if (!eventsCache) {
    return res.status(503).json({ error: 'Cache is initializing, please retry.' });
  }

  const event = eventsCache.find(e => e['@id'].split('/').pop() === eventId);

  if (event) {
    res.json(event);
  } else {
    res.status(404).send('Événement non trouvé');
  }
}
