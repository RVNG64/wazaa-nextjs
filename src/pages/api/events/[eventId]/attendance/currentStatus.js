// src/pages/api/events/[eventId]/attendance/currentStatus.js
import Event from '../../../../../models/Event';
import dbConnect from '../../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const eventId = req.query.eventId;

  switch (method) {
    case 'GET':
      const { firebaseId } = req.query;

      try {
        const event = await Event.findOne({ eventID: eventId });
        if (!event) {
          return res.status(404).send({ message: "Événement non trouvé" });
        }

        const userStatus = event.attendance.find(a => a.firebaseId === firebaseId)?.status;

        if (userStatus) {
          res.send({ status: userStatus });
        } else {
          res.status(404).send({ message: "Statut de l'utilisateur non trouvé pour cet événement" });
        }
      } catch (error) {
        res.status(500).send({ message: "Erreur interne du serveur" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
