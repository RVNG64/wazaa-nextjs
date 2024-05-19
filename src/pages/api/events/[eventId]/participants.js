// src/pages/api/events/[eventId]/participants.js
import Event from '../../../../models/Event';
import User from '../../../../models/User';
import Organizer from '../../../../models/Organizer';
import dbConnect from '../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const eventId = req.query.eventId;

  switch (method) {
    case 'GET':
      try {
        const event = await Event.findOne({ eventID: eventId });
        if (!event) {
          return res.status(404).send({ message: "Événement non trouvé" });
        }

        const participants = await Promise.all(
          event.attendance.map(async (entry) => {
            let participant = await User.findOne({ firebaseId: entry.firebaseId });
            if (!participant) {
              participant = await Organizer.findOne({ firebaseId: entry.firebaseId });
            }
            if (participant) {
              return {
                firebaseId: entry.firebaseId,
                profilePicture: participant.profilePic || '',
                firstName: participant.firstName,
                lastName: participant.lastName,
                status: entry.status
              };
            }
            return null;
          })
        );

        res.json(participants.filter(p => p !== null));
      } catch (error) {
        res.status(500).send({ message: "Erreur interne du serveur" });
      }
      break;

    case 'DELETE':
      const { firebaseId } = req.query;
      try {
        await Event.updateOne(
          { eventID: eventId },
          { $pull: { attendance: { firebaseId: firebaseId } } }
        );
        res.send({ message: 'Participant supprimé avec succès' });
      } catch (error) {
        res.status(500).send({ message: "Erreur interne du serveur" });
      }
      break;

    case 'PUT':
      const { firebaseId: blockFirebaseId } = req.query;
      try {
        await Event.updateOne(
          { eventID: eventId, "attendance.firebaseId": blockFirebaseId },
          { $set: { "attendance.$.status": "Blocked" } }
        );
        res.send({ message: 'Participant bloqué avec succès' });
      } catch (error) {
        res.status(500).send({ message: "Erreur interne du serveur" });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
