// src/pages/api/contactForm.js
import { createRouter } from 'next-connect';
import { sendEmail } from '../../utils/mailer';

const router = createRouter();

router.post(async (req, res) => {
  const { nom, prenom, email, objet, message } = req.body;

  const mailOptions = {
    from: email, // Expéditeur
    to: process.env.EMAIL_USER, // Destinataire
    subject: `Message de ${prenom} ${nom} - ${objet}`, // Sujet
    text: message, // corps du texte
    html: `<p>${message}</p>`, // corps HTML
  };

  try {
    const info = await sendEmail(mailOptions);
    console.log('Email sent successfully: ' + info.response);
    res.status(200).json({ message: 'Message sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error });
  }
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).end('Internal server error');
  },
  onNoMatch: (req, res) => {
    res.status(404).end('Route not found');
  },
});
