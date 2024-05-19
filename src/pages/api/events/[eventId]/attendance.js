// src/pages/api/events/[eventId]/attendance.js
import Event from '../../../../models/Event';
import dbConnect from '../../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const eventId = req.query.eventId;

  switch (method) {
    case 'POST':
      const { firebaseId, status } = req.body;
      console.log('Mise à jour du statut de présence:', req.body);
      console.log('ID de l\'événement:', eventId);

      try {
        const event = await Event.findOne({ eventID: eventId, type: 'private' });
        if (!event) {
          return res.status(404).send({ message: "Événement non trouvé ou n'est pas privé" });
        }
        console.log('Événement trouvé:', event);

        const attendanceIndex = event.attendance.findIndex(a => a.firebaseId === firebaseId);
        if (attendanceIndex > -1) {
          event.attendance[attendanceIndex].status = status;
        } else {
          event.attendance.push({ firebaseId, status });
        }
        console.log('Statut de présence mis à jour:', event.attendance);

        await event.save();
        console.log('Statut de présence enregistré');
        res.send({ message: 'Statut de présence mis à jour' });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de présence:', error);
        res.status(500).send({ message: "Erreur interne du serveur" });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
