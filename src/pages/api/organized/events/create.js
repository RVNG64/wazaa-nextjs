import Event from '../../../../models/Event';
import Organizer from '../../../../models/Organizer';
import User from '../../../../models/User';
import dbConnect from '../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const { method, body } = req;

  switch (method) {
    case 'POST':
      const { name, startDate, endDate, startTime, endTime, category, userID, type } = body;

      if (!name || !startDate || !startTime || !endTime || !category || !userID || !type) {
        return res.status(400).json({ message: "Les champs requis ne sont pas fournis ou aucun identifiant d'organisateur ou d'utilisateur n'est présent." });
      }

      try {
        const newEvent = new Event({
          name,
          type,
          startDate,
          endDate,
          startTime,
          endTime,
          category,
          userOrganizer: userID,
          validationStatus: 'default'
        });

        await newEvent.save();

        let userUpdated = await Organizer.findOne({ firebaseId: userID });
        if (!userUpdated) {
          userUpdated = await User.findOne({ firebaseId: userID });
          if (!userUpdated) {
            return res.status(404).json({ message: 'Aucun utilisateur ou organisateur trouvé avec l\'identifiant Firebase fourni.' });
          }
        }

        await userUpdated.constructor.findByIdAndUpdate(userUpdated._id, { $push: { organizedEventsList: newEvent._id } });

        res.status(201).json(newEvent);
      } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        res.status(500).send('Erreur lors de la création de l\'événement.');
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
