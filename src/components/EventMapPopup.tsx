import React from 'react';
import { motion } from 'framer-motion';
import '../styles/eventMapPopup.css';
import dynamic from 'next/dynamic';

const Image = dynamic(() => import('next/image'), { ssr: false });

const EventMapPopup = ({ event, onClose }: { event: any, onClose: any }) => {
  if (!event) return null;

  // Déterminer si l'événement est de type Native ou POI
  const isNativeEvent = event.eventID ? true : false;

  // Extraction des données de manière conditionnelle
  const title = isNativeEvent ? event.name : event['rdfs:label'].fr[0];
  const image = isNativeEvent ? event.photoUrl : (event['hasMainRepresentation'][0]['ebucore:hasRelatedResource'][0]['ebucore:locator'] || 'default-image.jpg');
  const description = isNativeEvent ? event.description : (event['hasDescription'][0]['dc:description'].fr[0] || 'Pas de description disponible');
  const startDate = isNativeEvent ? event.startDate : event['schema:startDate'][0];
  const endDate = isNativeEvent ? event.endDate : event['schema:endDate'][0];

  return (
    <motion.div
      className="eventMap-popup_container"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="eventMap-popup_content">
        <button onClick={onClose} className="eventMap-popup_close-btn">✖</button>
        <h3 className="eventMap-popup_title">{title}</h3>
        <Image className="eventMap-popup_poster" src={image} alt={title} />
        <p>{description}</p>
        <span className="eventMap-popup_dates">{`Du ${startDate} au ${endDate}`}</span>
        <button className="eventMap-popup_details-button">Voir plus</button>
      </div>
    </motion.div>
  );
};

export default EventMapPopup;
