// src/pages/api/organized/events/update/[eventId].js
// src/pages/api/organized/events/update/[eventId].js
import { validationResult } from 'express-validator';
import Event from '../../../../../models/Event';
import dbConnect from '../../../../../utils/dbConnect';
import { sendEmail } from '../../../../../utils/mailer';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query: { eventId }, body } = req;

  switch (method) {
    case 'PUT':
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const eventToUpdate = await Event.findOne({ eventID: eventId });

        if (!eventToUpdate) {
          return res.status(404).json({ message: 'Aucun événement trouvé avec l\'identifiant fourni.' });
        }

        const updateData = {
          ...body,
          validationStatus: body.validationStatus || eventToUpdate.validationStatus
        };

        console.log('Données de mise à jour :', updateData);

        const event = await Event.findOneAndUpdate(
          { eventID: eventId },
          updateData,
          { new: true, runValidators: true }
        );

        if (!event) {
          return res.status(404).json({ message: 'Aucun événement trouvé avec l\'identifiant fourni.' });
        }

        console.log('Événement mis à jour :', event);

        // Envoi d'un email si nécessaire
        if (event.validationStatus === 'pending') {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nouvel événement "${event.name}" en attente de validation ou mis à jour`,
            html: `
              <h1>Nouvel événement en attente de validation ou mis à jour</h1>
              <p>Bonjour,</p>
              <p>Un nouvel événement "<strong>${event.name}</strong>" a été créé et attend votre validation avant d'être publié sur WAZAA.</p>
              <p>Connectez-vous à votre compte administrateur pour examiner et approuver ou rejeter l'événement.</p>
              <p>Merci de votre attention.</p>
              <p>Passionnément,</p>
              <p>L'équipe WAZAA</p>
            `
          };

          try {
            await sendEmail(mailOptions);
            console.log(`E-mail bien envoyé à l'administrateur pour la validation de l'événement "${event.name}"`);
          } catch (mailError) {
            console.error('Erreur lors de l\'envoi de l\'e-mail', mailError);
          }
        }

        res.json(event);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        res.status(500).send('Erreur serveur');
      }
      break;

    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
