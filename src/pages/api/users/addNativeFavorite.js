// pages/api/users/addNativeFavorite.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.query;
  const { eventID } = req.body;

  try {
    await dbConnect();

    let user = await User.findOne({ firebaseId: userId });
    if (!user) {
      user = await Organizer.findOne({ firebaseId: userId });
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }
    }

    // Vérifier si l'événement natif est déjà dans les favoris
    if (user.favEvents.includes(eventID)) {
      return res.status(400).send('Cet événement est déjà dans vos favoris');
    }

    // Ajouter l'événement natif aux favoris
    user.favEvents.push(eventID);

    await user.save();
    console.log('Favori natif ajouté');

    res.status(200).send('Favori natif ajouté');
  } catch (error) {
    console.error('Erreur lors de l’ajout du favori natif:', error);
    res.status(500).send('Erreur serveur');
  }
}
