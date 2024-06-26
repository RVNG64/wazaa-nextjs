import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../utils/api';
import { auth } from '../utils/firebase';
import { motion } from 'framer-motion';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import dynamic from 'next/dynamic';

const Image = dynamic(() => import('next/image'), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });
const MiniMap = dynamic(() => import('./MiniMapEventDetails.client'), { ssr: false });

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
interface NativeMapDetailsPopupProps {
  eventData: any;
  isNativeMapDetailsPopup: boolean;
  onClose?: () => void;
  onResetSelectedEvent?: () => void; // Fonction pour réinitialiser l'événement sélectionné
}

const NativeMapDetailsPopup: React.FC<NativeMapDetailsPopupProps> = ({ eventData, isNativeMapDetailsPopup, onClose, onResetSelectedEvent }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [, setFavoriteNativeEvents] = useState<Event[]>([]);
  const [showConnectAlert, setShowConnectAlert] = useState<boolean>(false);
  const [showAttendanceConnectAlert, setShowAttendanceConnectAlert] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState<boolean>(false);
  const [showShareConfirmation, setShowShareConfirmation] = useState<boolean>(false);
  const [favoriteMessage, setFavoriteMessage] = useState<string>('');
  const [nativeEvent, ] = useState<Event | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [, setPlayer] = useState<YouTubePlayer | null>(null);
  const videoSrc = eventData.videoUrl;
  const topOfPopup = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const currentLocation = usePathname();

  // Fonction pour remonter en haut de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentLocation]);

  // Vérifier si l'événement est un favori
  useEffect(() => {
    const checkIfFavorite = async () => {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      const nativeEventId = eventData.eventID;
      console.log('ID de l\'événement natif:', nativeEventId);

      if (userId && nativeEventId) {
        try {
          // Appel de l'API pour récupérer les favoris natifs de l'utilisateur
          const response = await api.get(`/api/users/${userId}/nativeFavorites`);
          console.log('Réponse checkif:', response);
          if (response.status === 200) {
            const favorites = await response.data;

            // Vérification si l'événement actuel est dans la liste des favoris
            const isFavorited = favorites.some((favEvent: { eventID: string }) => favEvent.eventID === nativeEventId);
            console.log('Est favori:', isFavorited);

            setIsFavorite(isFavorited);
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

    if (isNativeMapDetailsPopup) {
      checkIfFavorite();
    }
  }, [isNativeMapDetailsPopup, eventData.eventID]);

  const fetchCurrentStatus = useCallback(async () => {
    // Assurez-vous que l'événement est chargé et que l'utilisateur est connecté
    const firebaseId = auth.currentUser ? auth.currentUser.uid : null;
    const eventId = nativeEvent ? nativeEvent.eventID : null;
    console.log('ID de l\'événement (fetchCurrentStatus):', eventId);
    console.log('ID Firebase (fetchCurrentStatus):', firebaseId);

    if (!eventId || !firebaseId) {
      console.log("Informations nécessaires pour la requête manquantes (fetchCurrentStatus");
      return;
    }

    try {
      const response = await api.get(`/api/events/${eventId}/attendance/currentStatus?firebaseId=${firebaseId}`);
      console.log('Réponse API fetchCurrentStatus:', response);
      if (response.status === 200) {
        const data = await response.data;
        console.log('Données API data fetchCurrentStatus:', data);
        if (data && data.status) {
          setSelectedStatus(data.status);
          console.log('Statut mis à jour (fetchCurrentStatus):', data.status);
        } else {
          console.log("Aucun statut n'a été trouvé pour cet utilisateur");
        }
      } else {
        throw new Error("La requête n'a pas réussi");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut actuel:', error);
    }
  }, [nativeEvent]);

  // Appeler cette fonction dans useEffect lors du chargement du composant ou lorsque les données nécessaires sont disponibles
  useEffect(() => {
    if (nativeEvent && auth.currentUser) {
      console.log('Début de la récupération du statut actuel pour l\'événement:', nativeEvent);
      fetchCurrentStatus();
      console.log('Statut actuel:', selectedStatus);
    }
  }, [nativeEvent, fetchCurrentStatus, selectedStatus]);

  // Vérifier la présence de toutes les données nécessaires
  if (!eventData || !isNativeMapDetailsPopup) return null;

  const showStatusMessage = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000); // Message affiché pendant 3 secondes
  };

  const updateAttendanceStatus = async (status: string) => {
    const firebaseId = auth.currentUser ? auth.currentUser.uid : null;
    const eventId = nativeEvent ? nativeEvent.eventID : null;

    console.log('Mise à jour du statut de présence:', status);
    console.log('ID de l\'événement:', eventId);
    console.log('ID Firebase:', firebaseId);

    try {
      await api.post(`/api/events/${eventId}/attendance`, {
        firebaseId,
        status,
      });
      setSelectedStatus(status);
      showStatusMessage(`Statut de présence mis à jour: ${status}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de présence', error);
    }
  };

  const handleAttendanceStatusClick = (status: string) => {
    console.log('Statut de présence:', status);
    console.log('Utilisateur actuel:', auth.currentUser);
    if (!auth.currentUser) {
      // Si l'utilisateur n'est pas connecté, afficher une alerte
      setShowAttendanceConnectAlert(true);
    } else {
      // Sinon, mettre à jour le statut de présence
      updateAttendanceStatus(status);
    }
  };

  const translateStatusToFrench = (status: string) => {
    const statusTranslations: { [key: string]: string } = {
      'Participating': 'Participe',
      'Maybe': 'Peut-être',
      'Not Participating': 'Absent',
    };

    return statusTranslations[status as keyof typeof statusTranslations] || status;
  };

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
/*
  const defaultPriceOptions = {
    isFree: false,
    uniquePrice: 0,
    priceRange: { min: 0, max: 0 }
  }; */

  // Utilisation de valeurs par défaut si certaines données ne sont pas disponibles
  const {
    name = 'Nom inconnu',
    organizerName = 'Organisateur inconnu',
    description = 'Description non spécifiée',
    location,
    address = location?.address || '',
    postalCode = location?.postalCode || '',
    city = location?.city || '',
    fullAddress = `${address}, ${postalCode} ${city}`,
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
    if (onResetSelectedEvent) onResetSelectedEvent(); // Réinitialiser l'événement sélectionné
    router.back(); // Retour à la page précédente
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

  const refreshFavorites = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const response = await api.get(`/api/users/${userId}/nativeFavorites`);
        if (response.status === 200) {
          throw new Error('Erreur lors du chargement des favoris');
        }
        const updatedFavorites = await response.data;

        // Mettre à jour l'état avec les favoris actualisés
        setFavoriteNativeEvents(updatedFavorites);

      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    }
  };

  const addToFavorites = async (eventId: string): Promise<boolean> => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      console.error("Utilisateur non connecté");
      return false;
    }

    try {
      const response = await api.post(`/api/users/${userId}/addNativeFavorite`, {
        eventID: eventId
      });

      if (response.status === 200) {
        console.log('Ajouté aux favoris natifs');
        // Appeler une fonction pour rafraîchir la liste des favoris
        await refreshFavorites();
        return true;
      } else {
        console.error('Erreur lors de l\'ajout aux favoris');
        return false;
      }
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  };

  const removeFromFavorites = async (eventId: string): Promise<boolean> => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      console.error("Utilisateur non connecté");
      return false;
    }

    try {
      const response = await api.post(`/api/users/${userId}/removeNativeFavorite`, {
        eventID: eventId
      });

      if (response.status === 200) {
        console.log('Retiré des favoris natifs');
        // Appeler une fonction pour rafraîchir la liste des favoris
        await refreshFavorites();
        return true;
      } else {
        console.error('Erreur lors de la suppression des favoris');
        return false;
      }
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

    console.log('Événement:', eventData);
    const eventId = eventData ? eventData.eventID : null;
    console.log('ID de l\'événement:', eventId);

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
      console.log('Succès:', success);

      if (success) {
        setIsFavorite(!isFavorite); // Mise à jour de l'état isFavorite
        setFavoriteMessage(isFavorite ? "Retiré des favoris!" : "Ajouté aux favoris!");
        setTimeout(() => setFavoriteMessage(""), 3000); // Cache le message après 3 secondes

        await refreshFavorites(); // Rafraîchir la liste des favoris
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
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

  const popupShareVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <>
      <AnimatePresence>
        {isNativeMapDetailsPopup && (
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
                  <Image src={photoUrl} alt={name} className="popup-details_image" width={500} height={600} />
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
                <motion.h1 variants={itemVariants} className="popup-details_title">{name}</motion.h1>
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

                {
                  eventData.type === 'private' && (
                    <>
                      <h3 className="popup-details_status-title">Présent(e) ?</h3>
                      {
                        selectedStatus && (
                          <div className="popup-details_status">
                            <i className="fas fa-user-check popup-details_attendance-item-icon"></i>
                            <span>Votre statut: <strong>{translateStatusToFrench(selectedStatus)}</strong></span>
                          </div>
                        )
                      }
                      {
                        !selectedStatus && (
                          <div className="popup-details_status">
                            <i className="fas fa-user-check popup-details_attendance-item-icon"></i>
                            <span>Choisissez votre statut de participation:</span>
                          </div>
                        )
                      }
                      {
                        showAttendanceConnectAlert && (
                          <>
                            <div className="popup-details_overlay"></div>
                            <div className="popup-details_connect-alert">
                              <i className="fas fa-exclamation-triangle popup-details_attendance-item-icon"></i>
                              <p>Veuillez vous connecter pour indiquer votre participation.</p>
                              <button onClick={() => navigate('/connexion-choice')}>Se connecter</button>
                              <button onClick={() => navigate('/inscription-choice')}>S&apos;inscrire</button>
                              <button onClick={() => setShowAttendanceConnectAlert(false)}>Annuler</button>
                            </div>
                          </>
                        )
                      }
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          className={`attendance-button participating-icon ${selectedStatus === 'Participating' ? 'attendance-button_selected' : ''}`}
                          onClick={() => handleAttendanceStatusClick('Participating')}
                          title="Participe"
                        ></button>
                        <button
                          className={`attendance-button maybe-icon ${selectedStatus === 'Maybe' ? 'attendance-button_selected' : ''}`}
                          onClick={() => handleAttendanceStatusClick('Maybe')}
                          title="Peut-être"
                        ></button>
                        <button
                          className={`attendance-button not-participating-icon ${selectedStatus === 'Not Participating' ? 'attendance-button_selected' : ''}`}
                          onClick={() => handleAttendanceStatusClick('Not Participating')}
                          title="Absent"
                        ></button>
                      </div>
                      {statusMessage && <div className="popup-details_status-confirmation-message">{statusMessage}</div>}
                    </>
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

export default NativeMapDetailsPopup;
