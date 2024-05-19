const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Organizer = require('../../models/Organizer');
const mailer = require('../../services/mailer');

router.post('/signup-pro', [
  // Firebase ID must be not empty
  body('firebaseId').not().isEmpty().withMessage('Firebase ID is required'),
  // Organization name must be not empty
  body('organizationName').not().isEmpty().withMessage('Organization name is required'),
  // First name must be not empty
  body('firstName').not().isEmpty().withMessage('First name is required'),
  // Last name must be not empty
  body('lastName').not().isEmpty().withMessage('Last name is required'),
  // Email must be a valid email address
  body('email').isEmail().withMessage('Enter a valid email address'),
  // Email must be not empty
  body('email').not().isEmpty().withMessage('Email is required'),
  ],

  async (req, res, next) => {
    console.log("Receiving signup request with data:", req.body);
    next();
  },

  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firebaseId, organizationName, firstName, lastName, email } = req.body;

  try {
    let existingOrganizer = await Organizer.findOne({ email });

    if (existingOrganizer) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    } else {
      // If the Organizer doesn't exist, create a new one
      const newOrganizer = new Organizer({
        firebaseId,
        organizationName,
        firstName,
        lastName,
        email,
      });
      console.log('About to save new Organizer:', newOrganizer);
      await newOrganizer.save();
      console.log('Finished saving new Organizer');
    }

    // Send confirmation email
    let htmlContent = `
      <div style="font-family: Poppins, sans-serif; color: #000; padding: 20px; text-align: justify;">
        <h1 style="color: #000; font-family: Sora, sans-serif;">Bienvenue sur WAZAA, ${firstName}!</h1>
        <p>Bonjour <strong>${firstName}</strong>,</p> <br /> <br />
        <p>Nous sommes ravis de vous accueillir dans notre communauté. Votre compte <strong>${organizationName}</strong> a été créé avec succès.</p>
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

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Inscription réussie à WAZAA',
      text: `Félicitations ${firstName}! Votre compte a été créé avec succès.`,
      html: htmlContent,
    };

    mailer.sendEmail(mailOptions)
      .then(info => {
        console.log('Email sent successfully: ' + info.response);
        res.json('Organizer added and email sent!');
      })
      .catch(err => {
        console.log('Error occurred while sending email:', err);
        res.status(500).json('Error: ' + err);
      });

    // Send notification email to admin
    let adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hello@wazaa.app',
      subject: `Nouvelle inscription sur WAZAA - ${organizationName}`,
      text: `Une nouvelle organisation nommée ${organizationName} s'est inscrite sur WAZAA. \n
      Nom du contact: ${firstName} ${lastName},\n
      Email: ${email}.`,
      // Vous pouvez inclure plus de détails si nécessaire
    };

    mailer.sendEmail(adminMailOptions)
      .then(info => {
        console.log('Email notification sent to admin: ' + info.response);
      })
      .catch(err => {
        console.error('Error occurred while sending email to admin:', err);
      });

  } catch(err) {
    console.log('Error occurred:', err);
    res.status(500).json('Error: ' + err);
  }
});

module.exports = router;
