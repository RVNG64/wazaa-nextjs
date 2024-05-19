// pages/api/users/removeFavorite.js
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

    // Trouver l'utilisateur par firebaseId
    let user = await User.findOne({ firebaseId: userId });
    if (!user) {
      user = await Organizer.findOne({ firebaseId: userId });
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }
    }

    // Vérifier si l'événement à supprimer existe dans les favoris
    if (!user.favEvents.includes(eventId)) {
      return res.status(404).send("L'événement spécifié n'est pas dans les favoris");
    }

    // Filtrer pour supprimer l'événement des favoris
    user.favEvents = user.favEvents.filter(id => id !== eventId);

    // Sauvegarder les modifications
    await user.save();

    res.status(200).send('Favori retiré');
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    res.status(500).send('Erreur serveur');
  }
}
