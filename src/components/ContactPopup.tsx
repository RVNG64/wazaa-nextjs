// src/components/ContactPopup.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ContactPopup = ({ onClose }: { onClose: () => void }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const data = {
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      email: formData.get('email') as string,
      objet: formData.get('objet') as string,
      message: formData.get('message') as string,
    };

    // Validation
    if (!data.nom || !data.prenom || !data.email || !data.message) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    console.log("Data:", data);

    axios.post(`/api/contactForm`, data)
      .then((response) => {
        console.log('Response:', response);
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
          onClose();
        }, 5000);
      })
      .catch((error) => {
        console.error('Error:', error);
        setErrorMessage('Erreur lors de l\'envoi de l\'email.'); // Afficher un message d'erreur
      });
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const popupVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: "-100vh", opacity: 0 },
  };

  return (
    <motion.div
      className="contact-popup"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="contact-popup-content"
        onClick={e => e.stopPropagation()}
        variants={popupVariants}
      >
        <span className="close-popup" onClick={onClose}>&times;</span>
        <h2>Contactez-nous</h2>
        {emailSent && <div className="success-message">Email envoyé avec succès!</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <label>Nom</label>
          <input type="text" name="nom" />

          <label>Prénom</label>
          <input type="text" name="prenom" />

          <label>Email</label>
          <input type="email" name="email" />

          <label>Objet</label>
          <select name="objet">
            <option value="Général">Général</option>
            <option value="Partenariat">Partenariat</option>
            <option value="Bug">Signaler un bug</option>
            <option value="Feedback">Une idée à nous proposer ?</option>
            <option value="Autre">Autre</option>
            {/* Ajoutez d'autres options si nécessaire */}
          </select>

          <label>Message</label>
          <textarea name="message"></textarea>

          <button type="submit">Envoyer</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ContactPopup;
