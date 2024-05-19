import Event from '../../../../models/Event';
import dbConnect from '../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { userId } } = req;

  switch (method) {
    case 'GET':
      try {
        const events = await Event.find({
          $or: [
            { userOrganizer: userId },
            { professionalOrganizer: userId }
          ]
        });
        res.json(events);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).send('Erreur serveur');
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
