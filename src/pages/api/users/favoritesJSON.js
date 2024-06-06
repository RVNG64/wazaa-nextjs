import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';
import { checkAndUpdateCacheBackground, getEventsCache, initializeCache } from '../../../cache';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await initializeCache();
    checkAndUpdateCacheBackground();

    const eventsCache = getEventsCache();
    if (!eventsCache || eventsCache.length === 0) {
      return res.status(503).send('Erreur serveur : Cache des événements non initialisé');
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await dbConnect();

    let user = await User.findOne({ firebaseId: userId });
    if (!user) {
      user = await Organizer.findOne({ firebaseId: userId });
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }
    }

    const favoriteEvents = eventsCache.filter(event =>
      user.favEvents.includes(event['@id'].split('/').pop())
    );

    return res.status(200).json(favoriteEvents);
  } catch (error) {
    console.error('Error in /favoritesJSON:', error);
    return res.status(500).json({ error: 'Server error while processing favorites' });
  }
}
