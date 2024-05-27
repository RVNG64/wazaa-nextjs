import React from 'react';
import Image from 'next/image';
import '../styles/eventCard.css';

const EventCard = ({ event, onCardClick }: { event: any; onCardClick: (event: any) => void }) => {

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';

    // Détection du format de date et conversion si nécessaire
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    let convertedDateString = dateString;
    if (dateRegex.test(dateString)) {
      const parts = dateString.split('/');
      convertedDateString = `${parts[1]}/${parts[0]}/${parts[2]}`; // Convertir en JJ/MM/AAAA
    }

    const date = new Date(convertedDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Déterminez si l'événement est natif ou POI
  const isNativeEvent = event.eventID !== undefined;

  // Extraction des données en fonction du type d'événement
  const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
  const image = isNativeEvent
    ? event.photoUrl || defaultImageUrl
    : event['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;

  const title = isNativeEvent
    ? event.name
    : event['rdfs:label']?.fr?.[0] || 'Titre non disponible';

  const description = isNativeEvent
    ? event.description
    : event['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Description non disponible';

  const city = isNativeEvent
    ? event.location?.city
    : event['isLocatedAt']?.[0]?.['schema:address']?.[0]?.['schema:addressLocality'] || 'Ville non disponible';

  const startDate = isNativeEvent ? event.startDate : event['schema:startDate']?.[0];
  const endDate = isNativeEvent ? event.endDate : event['schema:endDate']?.[0];

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const isSameDate = startDate === endDate;
  const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}` || 'Non spécifié';

  return (
    <div className="event-card" onClick={onCardClick}>

      {image !== 'default-image-url' && (
        <div className="event-card_image-container">
          <Image src={image} alt={title} className="event-image" width={300} height={200} />
        </div>
      )}

      <h3 className="event-title">{title}</h3>
      <div className="event-card-content-container">
        <p className="event-description">{description}</p>
        <div className="event-card-content">
          <p className="event-info"><i className="fas fa-calendar-alt"></i> {displayDate}</p>
          <p className="event-location"><i className="fas fa-map-marker-alt"></i> {city}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
