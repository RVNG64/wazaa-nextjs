import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import MiniMap from './MiniMapEventDetails.client';

interface Event {
  eventID: string;
  name: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  photoUrl?: string;
  videoUrl?: string;
  description?: string;
  userOrganizer?: string;
  professionalOrganizer?: string;
  website?: string;
  ticketLink?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  audience?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  accessibleForDisabled?: boolean;
  priceOptions?: {
    isFree: boolean;
    uniquePrice?: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  acceptedPayments?: string[];
  capacity?: number;
  type: 'public' | 'private';
  validationStatus: 'pending' | 'approved' | 'rejected' | 'default';
  views: number;
  favoritesCount: number;
}

//Définition des props du composant
interface NativeEventDetailsPopupProps {
  eventData: any;
  isPreview?: boolean;
  onClose?: () => void;
}

const NativeEventDetailsPopup: React.FC<NativeEventDetailsPopupProps> = ({ eventData, isPreview, onClose }) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const videoSrc = eventData.videoUrl;
  const topOfPopup = useRef<HTMLDivElement>(null);

  // Vérifier la présence de toutes les données nécessaires
  if (!eventData || !isPreview) return null;

  // Fonction pour vérifier le format de la date et la formater si nécessaire
  const formatDate = (dateString: string) => {
    // Vérifie si la chaîne est déjà au format DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }

    // Convertir en format DD/MM/YYYY si nécessaire
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      let day = date.getDate().toString().padStart(2, '0');
      let month = (date.getMonth() + 1).toString().padStart(2, '0');
      let year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      return 'Date non spécifiée';
    }
  };

  // Fonction pour vérifier le format de l'heure et la formater si nécessaire
  const formatTime = (time: Date | string) => {
    if (time instanceof Date) {
      let hours = time.getHours().toString().padStart(2, '0');
      let minutes = time.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (typeof time === 'string') {
      // Vérifie si la chaîne est déjà au format HH:MM
      const timeRegex = /^\d{2}:\d{2}$/;
      if (timeRegex.test(time)) {
        return time;
      }
      // Sinon, tente de convertir à partir d'une chaîne
      const parsedTime = new Date(`1970-01-01T${time}Z`);
      if (!isNaN(parsedTime.getTime())) {
        let hours = parsedTime.getUTCHours().toString().padStart(2, '0');
        let minutes = parsedTime.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    return 'Heure non spécifiée';
  };

  // Utilisation de valeurs par défaut si certaines données ne sont pas disponibles
  const {
    name = 'Nom inconnu',
    organizerName = 'Organisateur inconnu',
    description = 'Description non spécifiée',
    location,
    address = location?.address,
    postalCode = location?.postalCode,
    city = location?.city,
    fullAddress = address && postalCode && city ? `${address}, ${postalCode} ${city}` : 'Adresse non spécifiée',
    latitude = location?.latitude,
    longitude = location?.longitude,
    photoUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png',
    videoUrl,
    startDate,
    endDate,
    formattedStartDate = formatDate(startDate),
    formattedEndDate = formatDate(endDate),
    isSameDate = formattedStartDate === formattedEndDate,
    displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`,
    startTime,
    endTime,
    formattedStartTime = formatTime(startTime),
    formattedEndTime = formatTime(endTime),
    timeRange = formattedStartTime && formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : 'Non spécifié',
    priceOptions,
    audience = 'Locale',
    capacity,
    acceptedPayments,
    // website,
    ticketLink,
    // category,
    tags,
    accessibleForDisabled,
  } = eventData;

  const handleCloseDetails = () => {
    if (onClose) onClose();
  };

  const displayAcceptedPayments = () => {
    return acceptedPayments && acceptedPayments.length > 0
      ? acceptedPayments.join(', ')
      : 'Non spécifié';
  };

  const displayPrice = () => {
    if (!priceOptions) return "Non spécifié";

    const { isFree, uniquePrice, priceRange } = priceOptions;

    if (isFree) {
      return "Gratuit";
    } else if (uniquePrice > 0) {
      return `${uniquePrice} €`;
    } else if (priceRange.min > 0 && priceRange.max > 0) {
      return `De ${priceRange.min} € à ${priceRange.max} €`;
    } else {
      return "Non spécifié";
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    event.target.mute(); // Mettre en sourdine par défaut
  };

  // Fonction pour extraire l'ID de la vidéo YouTube
  const extractYouTubeID = (url: string) => {
    if (!url) {
      return "" // Retourner une chaîne vide si l'URL est vide
    }
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : undefined;
  };

  const videoId = extractYouTubeID(videoSrc);

  // Options pour le lecteur YouTube
  const opts = {
    height: '300px',
    width: '95%',
    playerVars: {
      autoplay: 0, // Lecture automatique désactivée
      controls: 1, // Affiche les contrôles du lecteur
      modestbranding: 1, // Masque le logo YouTube
      rel: 0, // Désactive les vidéos recommandées à la fin
      showinfo: 0, // Masque le titre de la vidéo et l'icône YouTube
      cc_load_policy: 1, // Active les sous-titres
      mute: 1, // Mettre en sourdine
    },
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

  return (
    <>
      <AnimatePresence>
        {isPreview && (
          <>
            <motion.div
              className="popup-details_overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCloseDetails}
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

              {photoUrl && (
                <div className="popup-details_image-container">
                  <Image src={photoUrl} alt={name} className="popup-details_image" width={696} height={600} />
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
                <motion.h2 variants={itemVariants} className="popup-details_title">{name}</motion.h2>
                {organizerName && (
                  <motion.div
                    className="popup-details_organization"
                    variants={itemVariants}
                  >
                    {organizerName}
                  </motion.div>
                )}
                <motion.div
                  className="popup-details_themes"
                  variants={themesContainerVariant}
                >
                  {
                    Array.isArray(tags) && tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        className="popup-details_theme-tag"
                        variants={themeTagVariant}
                      >
                        #{tag.trim()}
                      </motion.span>
                    ))
                  }
                </motion.div>
              </motion.div>

              {videoUrl && (
                <motion.div className="popup-details_video-container" variants={containerVariants}>
                  <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} />
                </motion.div>
              )}

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

                {
                  ticketLink && (
                    <button className="popup-details_native-ticket-btn">
                      <span>
                        <a href={ticketLink} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
                          Billetterie
                        </a>
                      </span>
                    </button>
                  )
                }

                <p className="popup-details_description">{description}</p>

                <div className="popup-details_address">
                  <i className="fas fa-map-marker-alt popup-details_item-icon"></i> {address}
                  {latitude && longitude && (
                    <MiniMap
                      lat={latitude}
                      lng={longitude}
                    />
                  )}
                </div>

                <motion.div className="popup-details_additional-info" variants={containerVariants}>
                  <motion.p className="popup-details_audience" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                    <i className="fas fa-users popup-details_item-icon"></i>
                    Capacité: {capacity} personnes
                  </motion.p>
                  <motion.p className="popup-details_audience" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                    <i className="fas fa-users popup-details_item-icon"></i>
                    Tarif: {displayPrice()}
                  </motion.p>
                </motion.div>

                {acceptedPayments && (
                  <motion.div className="popup-details_additional-info" variants={containerVariants}>
                    <motion.p className="popup-details_audience" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                      <i className="fas fa-credit-card popup-details_item-icon"></i>
                      Paiements acceptés: {displayAcceptedPayments()}
                    </motion.p>
                  </motion.div>
                )}

                <motion.div className="popup-details_additional-info" variants={containerVariants}>
                  <motion.p className="popup-details_audience" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                    <i className="fas fa-users popup-details_item-icon"></i>
                    Audience: {audience}
                  </motion.p>
                  {accessibleForDisabled && (
                    <motion.p className="popup-details_reduced-mobility" variants={itemVariant} whileHover={{ scale: 1.05 }}>
                      <i className="fa fa-wheelchair popup-details_item-icon"></i>
                      Accessibilité aux PMR: {accessibleForDisabled ? 'Oui' : 'Non'}
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
};

export default NativeEventDetailsPopup;
