// pages/api/users/removeNativeFavorite.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.query;
  const { eventId } = req.body;

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

    // Vérifier si l'événement natif à supprimer existe dans les favoris
    if (!user.favEvents.includes(eventId)) {
      return res.status(404).send("L'événement spécifié n'est pas dans les favoris");
    }

    // Supprimer l'événement des favoris
    user.favEvents = user.favEvents.filter(id => id !== eventId);
    console.log('Favoris natifs actuels:', user.favEvents);

    await user.save();
    console.log('Favori natif retiré');

    res.status(200).send('Favori natif retiré');
  } catch (error) {
    console.error('Erreur lors de la suppression du favori natif:', error);
    res.status(500).send('Erreur serveur');
  }
}
