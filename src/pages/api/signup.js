// src/app/api/signup.js
import { validationResult, body } from 'express-validator'; // Add missing import for 'body'
import User from '../../models/User';
import mailer from '../../services/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Validation des champs de formulaire
  // Firebase ID requis pour l'authentification
  body('firebaseId').not().isEmpty().withMessage('Firebase ID is required')(req, res); // Wrap the form field validations in a function call
  body('firstName').not().isEmpty().withMessage('First name is required')(req, res); // Wrap the form field validations in a function call
  body('lastName').not().isEmpty().withMessage('Last name is required')(req, res); // Wrap the form field validations in a function call
  body('email').isEmail().withMessage('Enter a valid email address').not().isEmpty()(req, res); // Wrap the form field validations in a function call
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')(req, res); // Wrap the form field validations in a function call

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firebaseId, firstName, lastName, email } = req.body;
  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const newUser = new User({
      firebaseId,
      firstName,
      lastName,
      email,
    });

    await newUser.save();

    const htmlContent = `
      <div style="font-family: Poppins, sans-serif; color: #000; padding: 20px; text-align: justify;">
        <h1 style="color: #000; font-family: Sora, sans-serif;">Bienvenue sur WAZAA, ${firstName}!</h1>
        <p>Bonjour <strong>${firstName}</strong>,</p> <br /> <br />
        <p>Nous sommes ravis de vous accueillir dans notre communauté. Votre compte a été créé avec succès.</p>
        <p>Voici quelques ressources pour vous aider à commencer :</p>
        <ul>
          <li><a href="https://www.wazaa.app/faq" style="color: #5e9ca0; text-decoration: none;">Foire aux questions</a></li>
          <li><a href="https://www.wazaa.app/recherche-avancee" style="color: #5e9ca0; text-decoration: none;">Faîtes votre première recherche avancée et ajoutez votre premier événement en favori</a></li>
          <li><a href="https://www.wazaa.app/mes-evenements" style="color: #5e9ca0; text-decoration: none;">Créez votre premier événement</a></li>
        </ul>
        <p>Merci de faire partie de notre réseau croissant.</p>
        <p>Bonne exploration,</p>
        <p><strong>L'équipe WAZAA</strong></p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Inscription réussie à WAZAA',
      text: `Félicitations ${firstName}! Votre compte a été créé avec succès.`,
      html: htmlContent,
    };

    // Envoie d'email simplifié pour l'exemple
    await mailer.sendWelcomeEmail(firstName, email);
    return res.status(201).json({ message: 'Utilisateur créé et email envoyé.' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Erreur du serveur' });
  }
}
