// src/pages/api/events/updateStatus.js
import Event from '../../../models/Event';
import { sendEmail } from '../../utils/mailer';
import dbConnect from '../../../utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'PUT') {
    const { validationStatus } = req.body; // 'approved' ou 'rejected'
    const eventId = req.query.eventId;

    if (!['approved', 'rejected'].includes(validationStatus)) {
      return res.status(400).send('Statut non valide');
    }

    try {
      const event = await Event.findOneAndUpdate(
        { eventID: eventId },
        { validationStatus },
        { new: true }
      ).populate('professionalOrganizer');

      if (!event) {
        return res.status(404).send('Événement non trouvé');
      }

      // Récupération des informations de l'organisateur
      if (event.professionalOrganizer) {
        const organizerEmail = event.professionalOrganizer.email;
        let mailOptions;

        // Envoi d'un e-mail à l'organisateur
        if (validationStatus === 'approved') {
          mailOptions = {
            from: process.env.EMAIL_USER,
            to: organizerEmail,
            subject: `Validation de votre événement "${event.name}" sur WAZAA`,
            html: `
              <div style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                  <h1 style="color: #4CAF50; font-size: 24px; text-align: center;">Félicitations, votre événement a été approuvé!</h1>
                  <p>Bonjour <strong>${event.professionalOrganizer.firstName}</strong>,</p>
                  <p>Nous sommes heureux de vous annoncer que votre événement <strong>${event.name}</strong> a été approuvé et est désormais visible sur <a href="https://www.wazaa.app" style="color: #007bff; text-decoration: none;">WAZAA</a>.</p>

                  <h2 style="color: #333;">Quelles sont les prochaines étapes ?</h2>
                  <ul>
                    <li>Vérifiez les détails de votre événement en ligne ici : <a href="https://www.wazaa.app/event/${event.eventID}" style="color: #007bff; text-decoration: none;">Voir l'événement</a></li>
                    <li>Partagez votre événement sur les réseaux sociaux pour atteindre un public plus large.</li>
                    <li>Mettez régulièrement à jour les informations de l'événement pour assurer une communication précise avec vos participants.</li>
                  </ul>

                  <h3 style="color: #333;">Intéressé par la promotion de votre événement ?</h3>
                  <p>Explorez nos services de promotion et augmentez la visibilité de votre événement. Contactez-nous à : <a href="mailto:hello@wazaa.app" style="color: #007bff; text-decoration: none;">hello@wazaa.app</a>.</p>

                  <h2 style="color: #333;">Besoin d'aide ?</h2>
                  <p>Nos équipes sont là pour vous assister. N'hésitez pas à nous contacter pour toute question ou assistance nécessaire.</p>

                  <p style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">Merci de choisir WAZAA pour vos événements !</p>
                  <p style="text-align: center;"><strong>L'équipe WAZAA</strong></p>
                </div>
              </div>
            `
          };
        } else if (validationStatus === 'rejected') {
          mailOptions = {
            from: process.env.EMAIL_USER,
            to: organizerEmail,
            subject: `Votre événement "${event.name}" sur WAZAA a été refusé`,
            html: `
              <div style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                  <h1 style="color: #E53E3E; font-size: 24px; text-align: center;">Malheureusement, votre événement n'a pas été approuvé.</h1>
                  <p>Bonjour <strong>${event.professionalOrganizer.firstName}</strong>,</p>
                  <p>Nous regrettons de vous informer que votre événement <strong>${event.name}</strong> n'a pas été approuvé pour publication sur <a href="https://www.wazaa.app" style="color: #007bff; text-decoration: none;">WAZAA</a>.</p>

                  <h2 style="color: #333;">Pourquoi mon événement n'a-t-il pas été approuvé ?</h2>
                  <p>Plusieurs raisons peuvent expliquer ce rejet, telles que :</p>
                  <ul>
                    <li>Non-respect des <strong>normes de la communauté</strong>.</li>
                    <li>Informations <strong>incomplètes</strong> ou incorrectes.</li>
                    <li>Contenu média (photos, vidéos) jugé <strong>inapproprié</strong> ou de <strong>mauvaise qualité</strong>.</li>
                  </ul>

                  <p>Nous vous encourageons à revoir les critères mentionnés et à ajuster votre événement en conséquence. Vous pouvez le soumettre à nouveau une fois les modifications effectuées.</p>

                  <h2 style="color: #333;">Besoin d'aide supplémentaire ?</h2>
                  <p>Si vous souhaitez discuter des détails spécifiques du rejet ou si vous avez besoin d'assistance pour la modification de votre événement, n'hésitez pas à répondre à cet e-mail.</p>

                  <p style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">Nous espérons que ces ajustements permettront à votre événement d'être publié et de réussir sur WAZAA !</p>
                  <p style="text-align: center;"><strong>L'équipe WAZAA</strong></p>
                </div>
              </div>
            `
          };
        } else {
          console.error('Statut de validation non valide');
          return res.status(400).send('Statut de validation non valide');
        }

        try {
          if (mailOptions) {
            await sendEmail(mailOptions);
            console.log('Email envoyé avec succès');
          }
        } catch (mailError) {
          console.error('Erreur lors de l\'envoi de l\'email', mailError);
        }
      }

      res.json(event);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de validation:', error);
      res.status(500).send('Erreur serveur');
    }
  } else if (req.method === 'GET') {
    try {
      console.log('Récupération des événements en attente...');
      const pendingEvents = await Event.find({ validationStatus: 'pending' });
      console.log('Pending events:', pendingEvents);
      res.json(pendingEvents);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements en attente:', error);
      res.status(500).send('Erreur serveur');
    }
  } else {
    res.setHeader('Allow', ['PUT', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
