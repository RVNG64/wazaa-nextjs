// pages/api/users/nativeFavorites.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';
import Event from '../../../models/Event';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.query;

  try {
    await dbConnect();

    let user = await User.findOne({ firebaseId: userId });
    if (!user) {
      user = await Organizer.findOne({ firebaseId: userId });
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }
    }
    console.log('Favoris natifs actuels:', user.favEvents);

    if (user.favEvents) {
      const nativeFavorites = await Event.find({ 'eventID': { $in: user.favEvents } });
      console.log('Favoris natifs trouvés:', nativeFavorites);
      res.json(nativeFavorites);
      console.log('Favoris natifs envoyés');
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Erreur lors de l’exécution de /nativeFavorites:', error);
    res.status(500).send('Erreur serveur lors du traitement des favoris natifs');
  }
}
