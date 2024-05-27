// src/app/event/[citySlug]/[eventSlug]/[eventId]/EventDetailsClient.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEvents, POI, Theme, fetchEventById } from '../../../../../contexts/EventContext';
import { auth } from '../../../../../utils/firebase';
import dynamic from 'next/dynamic';

const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });
const Image = dynamic(() => import('next/image'), { ssr: false });
const MobileMenu = dynamic(() => import('../../../../../components/MobileMenu'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../../../../components/ScrollToTopButton'), { ssr: false });
const MiniMap = dynamic(() => import('../../../../../components/MiniMapEventDetails.client'), { ssr: false });

interface EventDetailsClientProps {
  eventId: string;
}

const EventDetailsClient: React.FC<EventDetailsClientProps> = ({ eventId }) => {
  const { events } = useEvents();
  const [eventData, setEventData] = useState<POI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [showConnectAlert, setShowConnectAlert] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const searchParams = useParams();
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const currentLocation = usePathname();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Fonction pour remonter en haut de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mettre à jour les données de l'événement
  useEffect(() => {
    const event = events.find(e => e['@id'].split('/').pop() === eventId);
    setEventData(event || null);
  }, [eventId, events]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      const poiId = eventData ? eventData['@id'].split('/').pop() : null;

      if (userId && poiId) {
        try {
          const response = await fetch(`/api/users/favoritesJSON?userId=${userId}`);
          if (response.ok) {
            const favorites = await response.json();
            console.log('Favoris:', favorites);
            setIsFavorite(favorites.some((event: any) => event.URI_ID_du_POI === poiId));
          } else {
            console.error('Erreur lors de la récupération des favoris');
            setIsFavorite(false);
          }
        } catch (error) {
          console.error('Erreur:', error);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkIfFavorite();
  }, [eventData]);

  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        setIsLoading(true);
        if (eventId) {
          const event = await fetchEventById(eventId);
          if (event) {
            setEventData(event);
          } else {
            setError('Événement non trouvé');
          }
        }
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des détails de l\'événement');
        setIsLoading(false);
      }
    };

    loadEventDetails();
  }, [eventId, events]);

  const handleBackToMap = () => {
    navigate('/'); // Rediriger vers la page d'accueil
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        Chargement des détails de l&apos;événement...
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!eventData) {
    return <div className="error-container"></div>;
  }

  const frenchFormatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startTime = formatTime(eventData['takesPlaceAt']?.[0]?.['startTime'] || '');
  const endTime = formatTime(eventData['takesPlaceAt']?.[0]?.['endTime'] || '');
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : 'Non spécifié';
  // Formatage et affichage des dates
  const startDate = eventData['schema:startDate']?.[0] || '';
  const endDate = eventData['schema:endDate']?.[0] || '';
  const formattedStartDate = frenchFormatDate(startDate);
  const formattedEndDate = frenchFormatDate(endDate);
  const isSameDate = startDate === endDate;
  const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;

  // Extraction des informations
  const {
    eventName,
    eventDescription,
    eventImage,
    eventAddress,
    eventThemes,
    eventAccessibility,
    eventOrganizer,
    audience,
    lat,
    lng,
  } = extractEventDetails(eventData);

  const addToFavorites = async (eventId: string): Promise<boolean> => {
    try {
      if (auth.currentUser && auth.currentUser.uid) {
        const response = await fetch(`/api/users/addFavorite?userId=${auth.currentUser.uid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.currentUser.uid}`
          },
          body: JSON.stringify({ eventId }),
        });
        if (response.ok) {
          console.log('Événement ajouté aux favoris');
          return true;
        } else {
          console.error('Erreur lors de l\'ajout de l\'événement aux favoris');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    return false;
  };

  const removeFromFavorites = async (eventId: string): Promise<boolean> => {
    try {
      if (auth.currentUser && auth.currentUser.uid) {
        const response = await fetch(`/api/users/removeFavorite?userId=${auth.currentUser.uid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.currentUser.uid}`
          },
          body: JSON.stringify({ eventId }),
        });
        console.log('Événement retiré des favoris');
        return response.ok;
      }
      return false;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  };

  const toggleFavorite = async () => {
    if (!auth.currentUser) {
      setShowConnectAlert(true);
      return;
    }

    const eventId = eventData ? eventData['@id'].split('/').pop() : null;

    if (!eventId) {
      console.error("ID de l'événement non trouvé");
      return;
    }

    try {
      let success = false;
      if (isFavorite) {
        success = await removeFromFavorites(eventId);
      } else {
        success = await addToFavorites(eventId);
      }

      if (success) {
        // Mise à jour de l'état isFavorite après confirmation du serveur
        setIsFavorite(!isFavorite);
        setFavoriteMessage(isFavorite ? "Retiré des favoris!" : "Ajouté aux favoris!");
        setTimeout(() => setFavoriteMessage(""), 3000); // Cache le message après 3 secondes

        // Rafraîchir la liste des favoris
        await refreshFavorites();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
    }
  };

  // Fonction pour partager l'événement
  const refreshFavorites = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const response = await fetch(`/api/users/favoritesJSON?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des favoris');
        }
        // const favorites = await response.json();
        // Mettre à jour l'état avec les favoris
        // ...
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    }
  };

  const shareOnSocialMedia = (platform: string) => {
    const eventUrl = window.location.href;
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${eventUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${eventUrl}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?text=${eventUrl}`;
        break;
    }

    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    const eventUrl = window.location.href;
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        setShowShareConfirmation(true);
        setTimeout(() => setShowShareConfirmation(false), 3000);
      })
      .catch(err => console.error("Impossible de copier le lien", err));
  };

  // Fonction pour partager l'événement
  const shareEvent = () => {
    setShowSharePopup(true);
  };

  const getRandomAd = () => {
    const ads = [
      { id: 1, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342943/adidas1_bt47mn.jpg', link: 'https://www.adidas.fr/' },
      { id: 2, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342928/adidas2_dfk9vi.webp', link: 'https://www.adidas.fr/' },
      { id: 3, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342941/AppleTV_ay8rsa.jpg', link: 'https://www.apple.com/fr/tv/' },
      { id: 4, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342942/jo24_qaagid.jpg', link: 'https://www.paris2024.org/fr/' },
      { id: 5, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342941/AirFrance_jd5lzp.webp', link: 'https://www.airfrance.fr/' },
      { id: 6, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342906/sony-brand-lenses-banner_gwurpc.jpg', link: 'https://www.sony.fr/' },
      { id: 7, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342906/nike_d8pm9o.jpg', link: 'https://www.nike.com/fr/' },
      { id: 8, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342906/NikeLogoHeader_c7imij.jpg', link: 'https://www.nike.com/fr/' },
      { id: 9, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709342941/Nikeskate_biwjtk.webp', link: 'https://www.nike.com/fr/' },
      { id: 10, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709371348/backmarket_mlmqfu.png', link: 'https://www.backmarket.fr/' },
      { id: 11, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709371348/Dune2_augoxm.jpg', link: 'https://www.cgrcinemas.fr/films-a-l-affiche/278742-dune-deuxieme-partie/' },
      { id: 12, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709371348/BHM-Festival_bkwehm.jpg', link: 'https://www.biarritzhallmusic.com/' },
      { id: 13, adUrl: 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1709371348/FR-ANG-FranceRugby_t49at9.webp', link: 'https://www.ffr.fr/equipe-de-france/rugby-a-xv/xv-de-france-masculin/rencontres/tournoi-des-six-nations-2024/france-angleterre-16-mars-2024' },
      // ... autres publicités
    ];
    return ads[Math.floor(Math.random() * ads.length)];
  };

  const renderAd = () => {
    const ad = getRandomAd();
    return (
      <div className="popup-details_ad-container">
        <p className="popup-details_ad-label">Publicité</p>
        <a href={ad.link} target="_blank" rel="noopener noreferrer">
          <Image src={ad.adUrl} alt={`Publicité ${ad.id}`} className="popup-details_ad" width={300} height={250} />
        </a>
      </div>
    );
  };

  // Formatage des lettres accentuées pour les URL
  const removeAccents = (str: string) => {
    const accents =
      'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut =
      'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';

    return str.split('').map((letter: string, index: number) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');
  };

  const createEventSlug = (eventName: string) => {
    const noAccents = removeAccents(eventName);
    return noAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  const eventN = eventData['rdfs:label']?.fr?.[0];
  const eventSlug = createEventSlug(eventN);
  const city = eventData.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
  const citySlug = city ? createEventSlug(city) : 'evenement';
  const canonicalUrl = `https://www.wazaa.app/event/${citySlug}/${eventSlug}/${eventId}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        delay: 0.5,
        when: "afterChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5
      }
    }
  };

  const themesContainerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const themeTagVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const timeCapsuleVariant = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.5
      }
    }
  };

  const itemVariant = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        delay: 0.2,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const popupShareVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <>
      {/*<Head>
        <title>{eventName} | Wazaa </title>
        <meta name="description" content={`${eventDescription.substring(0, 150)}...`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${eventName} | Wazaa`} />
        <meta property="og:description" content={`${eventDescription.substring(0, 150)}...`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={eventImage} />
        <meta property="og:image:secure_url" content={eventImage} />
        <meta property="og:image:alt" content={eventName} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Wazaa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="WAZAA" />
        <meta name="twitter:creator" content="WAZAA" />
        <meta name="twitter:title" content={eventName} />
        <meta name="twitter:description" content={`${eventDescription.substring(0, 150)}...`} />
        <meta name="twitter:image" content={eventImage} />
        <meta name="twitter:url" content={canonicalUrl} />
      </Head> */}
      <AnimatePresence>
        <div ref={topRef} className="event-details-container">

        <div className="event-details">
          {eventImage && (
            <div className="popup-details_image-container event-details_image-container">
              <Image src={eventImage} alt={eventName} className="popup-details_image event-details_image" width={600} height={650} priority style={{ width: 'auto' }} />
            </div>
          )}

          {/* Header: Titre, thèmes, favori, partage  */}
          <motion.div
            className="popup-details_header"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="popup-details_title">{eventName}</motion.h1>
            {eventOrganizer && (
              <motion.div
                className="popup-details_organization"
                variants={itemVariants}
              >
                {eventOrganizer}
              </motion.div>
            )}
            <motion.div
              className="popup-details_themes"
              variants={themesContainerVariant}
            >
              {eventThemes.split(',').map((theme: string, index: number) => (
                <motion.span
                  key={index}
                  className="popup-details_theme-tag"
                  variants={themeTagVariant}
                >
                  #{theme.trim()}
                </motion.span>
              ))}
            </motion.div>

            <div className="popup-details_actions">
              <button onClick={toggleFavorite} className={`popup-details_favorite-btn ${isFavorite ? 'favorited' : ''}`}>
                <i className={`fa-heart ${isFavorite ? 'fas' : 'far'}`}></i>
              </button>
              <button onClick={shareEvent} className="popup-details_share-btn">
                <i className="fas fa-share-alt"></i> {/* Icône pour partager */}
              </button>
              {favoriteMessage && <div className="popup-details_confirmation-message">{favoriteMessage}</div>}
              {showConnectAlert && (
                <>
                  <div className="popup-details_overlay"></div>
                  <div className="popup-details_connect-alert">
                    <p>Veuillez vous connecter pour ajouter un événement à vos favoris.</p>
                    <button onClick={() => navigate('/connexion-choice')}>Se connecter</button>
                    <button onClick={() => setShowConnectAlert(false)}>Annuler</button>
                  </div>
                </>
              )}
              {showSharePopup && (
              <>
                <motion.div
                  className="popup-details_share-overlay"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setShowSharePopup(false)}
                ></motion.div>
                <motion.div
                  className="popup-details_share-popup"
                  variants={popupShareVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <button className="popup-details_close-share-btn" onClick={() => setShowSharePopup(false)}>
                    <i className="fas fa-times"></i> {/* Icône de croix */}
                  </button>
                  <button onClick={() => shareOnSocialMedia('facebook')} className="popup-details_social-share-btn">
                    <Image src="/icon-facebook.svg" alt="Facebook" width={40} height={40} />
                  </button>
                  <button onClick={() => shareOnSocialMedia('twitter')} className="popup-details_social-share-btn">
                    <Image src="/icon-twitter.svg" alt="Twitter" width={40} height={40} />
                  </button>
                  <button onClick={() => shareOnSocialMedia('whatsapp')} className="popup-details_social-share-btn">
                    <Image src="/icon-whatsapp.svg" alt="WhatsApp" width={40} height={40} />
                  </button>
                  <button onClick={copyToClipboard} className="popup-details_social-share-btn">
                    <i className="fas fa-copy"></i>  Copier le lien
                  </button>
                  {showShareConfirmation && <div className="popup-details_confirmation-message">Lien de l&apos;événement copié !</div>}
                </motion.div>
              </>
              )}
              </div>
            </motion.div>

            <motion.div
              className="popup-details_body event-details-body"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="popup-details_time-capsule" variants={timeCapsuleVariant}>
                <motion.div className="popup-details_date" variants={itemVariant}>
                  <i className="fas fa-calendar-alt popup-details_item-icon"></i>
                  {displayDate}
                </motion.div>
                <motion.div className="popup-details_time" variants={itemVariant}>
                  <i className="fas fa-clock popup-details_item-icon"></i>
                  {timeRange}
                </motion.div>
              </motion.div>

              <button className="popup-details_ticket-btn">
                <span>Billetterie</span>
              </button>

              <p className="popup-details_description">{eventDescription}</p>

              <div className="popup-details_address">
                <i className="fas fa-map-marker-alt popup-details_item-icon"></i> {eventAddress}
                {eventData['isLocatedAt'] && (
                  <MiniMap
                    lat={lat}
                    lng={lng}
                  />
                )}
              </div>

              <motion.div className="popup-details_additional-info" variants={containerVariants}>
                <motion.p className="popup-details_audience" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                  <i className="fas fa-users popup-details_item-icon"></i>
                  Audience: {audience}
                </motion.p>
                {eventAccessibility && (
                  <motion.p className="popup-details_reduced-mobility" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                    <i className="fa fa-wheelchair popup-details_item-icon"></i>
                    Accessibilité aux PMR: {eventAccessibility}
                  </motion.p>
                )}
              </motion.div>

              <div className="popup-details_ad-container">
                {renderAd()}
              </div>
            </motion.div>
          </div>
          <button onClick={handleBackToMap} className="back-to-map-btn">
            <i className="fas fa-arrow-left"></i> Retour à la carte
          </button>
        </div>
      </AnimatePresence>
      <MobileMenu />
      <ScrollToTopButton />
    </>
  );
}

function extractEventDetails(eventData: POI) {
  const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
  const poster = eventData['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;
  const eventImage = Array.isArray(poster) ? poster[0] : poster;
  const latitude = eventData['isLocatedAt']?.[0]?.['schema:geo']?.['schema:latitude'];
  const longitude = eventData['isLocatedAt']?.[0]?.['schema:geo']?.['schema:longitude'];
  const addressObject = eventData['isLocatedAt']?.[0]?.['schema:address']?.[0];
  const streetAddress = addressObject?.['schema:streetAddress']?.[0] || '';
  const postalCode = addressObject?.['schema:postalCode'] || '';
  const addressLocality = addressObject?.['schema:addressLocality'] || '';

  let eventAddress = 'Adresse non disponible';
  if (streetAddress) {
    const cityAndPostalCode = [postalCode, addressLocality].filter(part => part).join(' ');
    eventAddress = [streetAddress, cityAndPostalCode].filter(part => part).join(', ');
  }

  return {
    eventName: eventData['rdfs:label']?.fr?.[0] || 'Événement inconnu',
    eventImage,
    eventDescription: eventData['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Description non disponible',
    eventStartDate: eventData['takesPlaceAt']?.[0]?.['startDate'] || 'Date inconnue',
    eventEndDate: eventData['takesPlaceAt']?.[0]?.['endDate'] || 'Date inconnue',
    eventStartTime: eventData['takesPlaceAt']?.[0]?.['startTime'] || '',
    eventEndTime: eventData['takesPlaceAt']?.[0]?.['endTime'] || '',
    eventAddress,
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
    eventThemes: eventData['hasTheme']?.map((theme: Theme) => theme['rdfs:label']?.fr?.[0]).join(', ') || '',
    eventAccessibility: eventData['reducedMobilityAccess'] ? 'Oui' : 'Non',
    eventOrganizer: eventData['hasBookingContact']?.map(contact => contact['schema:legalName']).join(', ') || '',
    audience: eventData['hasAudience']?.map(aud => aud['rdfs:label']?.fr?.[0]).join(', ') || 'Non spécifié',
  };
}

export default EventDetailsClient;
