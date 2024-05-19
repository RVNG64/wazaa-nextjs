// src/pages/api/events/[eventId].js
import Event from '../../../models/Event';
import dbConnect from '../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();
  console.log('Requête pour l\'événement natif:', req.query.eventId);

  const { eventId } = req.query;

  try {
    const nativeEvent = await Event.findOne({ eventID: eventId });

    if (nativeEvent) {
      res.json(nativeEvent);
    } else {
      res.status(404).send('Événement natif non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement natif:', error);
    res.status(500).send('Erreur serveur lors de la récupération');
  }
}
