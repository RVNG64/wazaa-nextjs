import Event from '../../../../../models/Event';
import dbConnect from '../../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { eventId } } = req;

  switch (method) {
    case 'DELETE':
      try {
        const event = await Event.findOneAndDelete({ eventID: eventId });

        if (!event) {
          return res.status(404).json({ message: 'Aucun événement trouvé avec l\'identifiant fourni.' });
        }

        res.json(event);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        res.status(500).send('Erreur serveur');
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
