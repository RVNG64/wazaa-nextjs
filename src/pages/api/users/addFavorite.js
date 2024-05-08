// src/pages/api/users/[auth.currentUser.uid]/addFavorite.js
export default async function handler(req, res) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { eventId } = req.body;
  const userId = req.headers.authorization;

  try {
    // Trouver l'utilisateur par firebaseId
    let user = await User.findOne({ firebaseId: userId });
    if (!user) {
      user = await Organizer.findOne({ firebaseId: userId });
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }
    }

    // Vérifier si l'événement est déjà dans les favoris
    if (user.favEvents.includes(eventId)) {
      return res.status(400).send('Cet événement est déjà dans vos favoris');
    }

    // Ajouter l'événement aux favoris
    user.favEvents.push(eventId);

    // Sauvegarder les modifications
    await user.save();

    res.status(200).send('Favori ajouté');
  } catch (error) {
    console.error('Erreur lors de l’ajout du favori:', error);
    res.status(500).send('Erreur serveur');
  }
}
