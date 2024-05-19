// pages/api/users/[firebaseId].js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Organizer from '../../../models/Organizer';
import signInSchema from '../../../schemas/signInSchema';

export default async function handler(req, res) {
  const {
    query: { firebaseId },
    method,
  } = req;

  await dbConnect(); // Assure-toi que la connexion à la base de données est établie

  switch (method) {
    case 'GET':
      try {
        let user = await User.findOne({ firebaseId });
        if (!user) {
          user = await Organizer.findOne({ firebaseId });
          if (!user) {
            return res.status(404).json({ message: 'No user or organizer found with provided Firebase ID.' });
          }
        }
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ message: 'An error occurred', error: err.toString() });
      }
      break;

    case 'POST':
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        // Valider les données du formulaire
        await signInSchema.validate(req.body, { abortEarly: false });

        const userData = req.body;
        const user = await User.findOneAndUpdate({ firebaseId }, userData, { new: true });
        if (!user) {
          return res.status(404).json({ message: 'No user found with provided Firebase ID.' });
        }
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ message: 'An error occurred', error: err.toString() });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
