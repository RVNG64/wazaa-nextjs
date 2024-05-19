// pages/api/deleteUser/mongoDB/[userId].js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { authenticate } from '../../../utils/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await authenticate(req, res, async () => {
    const { userId } = req.query;

    try {
      await dbConnect();

      // Vérifie que l'utilisateur connecté est celui qui est supprimé ou un admin
      if (req.user.uid !== userId && !req.user.admin) {
        return res.status(403).json({ message: "Vous n'avez pas les droits nécessaires pour effectuer cette action." });
      }

      // Suppression de l'utilisateur dans MongoDB
      const result = await User.deleteOne({ firebaseId: userId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      res.json({ message: 'Compte supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l’utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur.' });
    }
  });
}
