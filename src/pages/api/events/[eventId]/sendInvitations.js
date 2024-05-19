// src/pages/api/events/[eventId]/sendInvitations.js
import Event from '../../../../models/Event';
import dbConnect from '../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const eventId = req.query.eventId;

  switch (method) {
    case 'POST':
      const { userIds } = req.body;
      try {
        await Event.updateOne(
          { eventID: eventId },
          { $addToSet: { attendance: { $each: userIds.map(uid => ({ firebaseId: uid, status: 'Invited' })) } } }
        );
        res.send({ message: 'Invitations envoyées avec succès' });
      } catch (error) {
        res.status(500).send({ message: "Erreur interne du serveur" });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
