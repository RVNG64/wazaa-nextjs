import Event from '../../../../../models/Event';
import dbConnect from '../../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { eventId }, body } = req;

  switch (method) {
    case 'GET':
      try {
        const event = await Event.findOne({ eventID: eventId });

        if (!event) {
          return res.status(404).send('Événement non trouvé');
        }

        res.json(event);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'événement:', error);
        res.status(500).send('Erreur serveur');
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
