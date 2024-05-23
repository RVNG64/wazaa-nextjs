// src/components/EventDetailsMapPopup.tsx
'use client';
import React, { useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { auth } from '../utils/firebase';
import { POI } from '../contexts/EventContext';
import MiniMap from './MiniMapEventDetails.client';

interface EventDetailsMapPopupProps {
  selectedPoi: POI | null;
  showDetails: boolean;
  handleCloseDetails: (event: React.MouseEvent) => void;
  isFavorite: boolean;
  setIsFavorite: React.Dispatch<React.SetStateAction<boolean>>;
  favoriteMessage: string;
  setFavoriteMessage: React.Dispatch<React.SetStateAction<string>>;
  showConnectAlert: boolean;
  setShowConnectAlert: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: (path: string) => void;
  showSharePopup: boolean;
  setShowSharePopup: React.Dispatch<React.SetStateAction<boolean>>;
  showShareConfirmation: boolean;
  setShowShareConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  topOfPopup: React.RefObject<HTMLDivElement>;
}

const EventDetailsMapPopup: React.FC<EventDetailsMapPopupProps> = React.memo(({
  selectedPoi,
  showDetails,
  handleCloseDetails,
  isFavorite,
  setIsFavorite,
  favoriteMessage,
  setFavoriteMessage,
  showConnectAlert,
  setShowConnectAlert,
  navigate,
  showSharePopup,
  setShowSharePopup,
  showShareConfirmation,
  setShowShareConfirmation
}) => {
  const topOfPopup = useRef<HTMLDivElement>(null);
  const currentLocation = usePathname();

  // Fonction pour remonter en haut de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentLocation]);

  // Vérifie si l'événement est déjà en favori
  useEffect(() => {
    const checkIfFavorite = async () => {
      const userId = auth.currentUser?.uid;
      const poiId = selectedPoi && typeof selectedPoi['@id'] === 'string'
      ? selectedPoi['@id'].split('/').pop()
      : null;

      if (userId && poiId) {
        try {
          const response = await fetch(`/api/users/favoritesJSON?userId=${userId}`);
          if (!response.ok) throw new Error('Erreur lors de la récupération des favoris');

          const favorites = await response.json();
          setIsFavorite(favorites.some((event: POI) => event['@id'].split('/').pop() === poiId));
        } catch (error) {
          console.error('Erreur:', error);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkIfFavorite();
  }, [selectedPoi, auth.currentUser]);

  // Fonction pour ajouter un événement aux favoris
  const addToFavorites = async (eventId: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      console.error("Utilisateur non connecté");
      return false;
    }

    try {
      const response = await fetch(`/api/users/addFavorite?userId=${auth.currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        console.log('Événement ajouté aux favoris');
        return true;
      } else {
        console.error('Erreur lors de l\'ajout de l\'événement aux favoris');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    return false;
  };

  // Fonction pour retirer un événement des favoris
  const removeFromFavorites = async (eventId: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      console.error("Utilisateur non connecté");
      return false;
    }

    try {
      const response = await fetch(`/api/users/removeFavorite?userId=${auth.currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        console.log('Événement retiré des favoris');
        return true;
      } else {
        console.error('Erreur lors de la suppression de l\'événement des favoris');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    return false;
  };

  const toggleFavorite = useCallback(async () => {
    if (!auth.currentUser) {
      setShowConnectAlert(true);
      return;
    }

    const eventId = selectedPoi && typeof selectedPoi['@id'] === 'string'
      ? selectedPoi['@id'].split('/').pop()
      : null;

    if (eventId) {
      let success = isFavorite ? await removeFromFavorites(eventId) : await addToFavorites(eventId);

      if (success) {
        setIsFavorite(!isFavorite); // Mettre à jour l'état isFavorite
        refreshFavorites(); // Mettre à jour la liste des favoris
        setFavoriteMessage(!isFavorite ? "Ajouté aux favoris!" : "Retiré des favoris!");
        setTimeout(() => setFavoriteMessage(""), 3000); // Cache le message après 3 secondes
      }
    }
  }, [selectedPoi, isFavorite]);

  const refreshFavorites = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const response = await fetch(`/api/users/favoritesJSON?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des favoris');
        }
        const favorites = await response.json();
        // Mettre à jour l'état avec les favoris
        // ...
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    }
  }, []);

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

  // Formatage de la date en format français
  const frenchFormatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!selectedPoi) return null;

  const poiName = selectedPoi['rdfs:label']?.fr?.[0] || 'Nom inconnu';
  const poiDescription = selectedPoi['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Description non disponible';
  const addressObject = selectedPoi['isLocatedAt']?.[0]?.['schema:address']?.[0];
  const streetAddress = addressObject?.['schema:streetAddress']?.[0] || '';
  const postalCode = addressObject?.['schema:postalCode'] || '';
  const addressLocality = addressObject?.['schema:addressLocality'] || '';

  let poiAddress = 'Adresse non disponible';
  if (streetAddress) {
    const cityAndPostalCode = [postalCode, addressLocality].filter(part => part).join(' ');
    poiAddress = [streetAddress, cityAndPostalCode].filter(part => part).join(', ');
  }

  const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
  const poster = selectedPoi['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;
  const poiImage = Array.isArray(poster) ? poster[0] : poster;
  const latitude = selectedPoi['isLocatedAt']?.[0]?.['schema:geo']?.['schema:latitude'];
  const longitude = selectedPoi['isLocatedAt']?.[0]?.['schema:geo']?.['schema:longitude'];
  // Conversion de la latitude et de la longitude en nombres
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Extraction et mise en forme d'autres données
  const audience = selectedPoi['hasAudience']?.map(aud => aud['rdfs:label']?.fr?.[0]).join(', ') || 'Non spécifié';
  const themes = selectedPoi['hasTheme']?.map(theme => theme['rdfs:label']?.fr?.[0]).join(', ') || 'Généraliste';
  const startDate = selectedPoi['schema:startDate']?.[0] || '';
  const endDate = selectedPoi['schema:endDate']?.[0] || '';
  const reducedMobilityAccess = selectedPoi['reducedMobilityAccess'] ? 'Oui' : 'Non';
  const bookingContacts = selectedPoi['hasBookingContact']?.map(contact => contact['schema:legalName']).join(', ') || '';
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const startTime = formatTime(selectedPoi['takesPlaceAt']?.[0]?.['startTime'] || '');
  const endTime = formatTime(selectedPoi['takesPlaceAt']?.[0]?.['endTime'] || '');
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : 'Non spécifié';

  // Extraction et mise en forme des données relatives aux offres
  const offerDetails = selectedPoi['offers']?.map(offer => offer['schema:description']?.fr?.[0]).join(', ') || 'Non spécifié';
  const paymentMethods = selectedPoi['offers']?.flatMap(offer => offer['schema:acceptedPaymentMethod']?.map(method => method['rdfs:label']?.fr?.[0])).join(', ') || 'Non spécifié';
  const priceDetails = selectedPoi['offers']?.map(offer => {
      const priceSpec = offer['schema:priceSpecification']?.[0];
      return priceSpec
        ? `Min: ${priceSpec['schema:minPrice'] || 'Non spécifié'},
            Max: ${priceSpec['schema:maxPrice'] || 'Non spécifié'},
            Currency: ${priceSpec['schema:priceCurrency'] || 'Non spécifié'}`
        : 'Non spécifié';
  }).join('; ');

  // Formatage et affichage des dates
  const formattedStartDate = frenchFormatDate(startDate);
  const formattedEndDate = frenchFormatDate(endDate);
  const isSameDate = startDate === endDate;
  const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;

  const popupVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

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
      <AnimatePresence>
        {showDetails && (
          <>
            <motion.div
              className="popup-details_overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(event) => handleCloseDetails(event)}
              transition={{ duration: 0.3 }}
            ></motion.div>

            <motion.div
              className="details-popup"
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", stiffness: 50 }}
              ref={topOfPopup}
            >
              {poiImage && (
                <div className="popup-details_image-container">
                  <Image src={poiImage} alt={poiName} className="popup-details_image" width={696} height={600} />
                  <button onClick={handleCloseDetails} className="popup-details_close-btn">
                    <i className="fas fa-times"></i> {/* Icône de fermeture */}
                  </button>
                </div>
              )}

              {/* Header: Titre, thèmes, favori, partage  */}
              <motion.div
                className="popup-details_header"
                variants={headerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h2 variants={itemVariants} className="popup-details_title">{poiName}</motion.h2>
                {bookingContacts && (
                  <motion.div
                    className="popup-details_organization"
                    variants={itemVariants}
                  >
                    {bookingContacts}
                  </motion.div>
                )}
                <motion.div
                  className="popup-details_themes"
                  variants={themesContainerVariant}
                >
                  {themes.split(',').map((theme, index) => (
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
                        <button onClick={() => navigate('/inscription-choice')}>S&apos;inscrire</button>
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
                className="popup-details_body"
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

                <p className="popup-details_description">{poiDescription}</p>

                <div className="popup-details_address">
                  <i className="fas fa-map-marker-alt popup-details_item-icon"></i> {poiAddress}
                  {selectedPoi['isLocatedAt'] && (
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
                  {reducedMobilityAccess && (
                    <motion.p className="popup-details_reduced-mobility" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                      <i className="fa fa-wheelchair popup-details_item-icon"></i>
                      Accessibilité aux PMR: {reducedMobilityAccess}
                    </motion.p>
                  )}
                </motion.div>

                <div className="popup-details_ad-container">
                  {renderAd()}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

EventDetailsMapPopup.displayName = 'EventDetailsMapPopup'; // Nom pour le débogage

export default EventDetailsMapPopup;
