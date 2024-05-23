// src/pages/events/[citySlug]/[eventSlug]/[eventId]/page.tsx
/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';
import { NativeEvent } from '../../../../../contexts/NativeEventContext';
import { AnimatePresence, motion } from 'framer-motion';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { auth } from '../../../../../utils/firebase';
import MobileMenu from '../../../../../components/MobileMenu';
import ScrollToTopButton from '../../../../../components/ScrollToTopButton';
import MiniMap from '../../../../../components/MiniMapEventDetails.client';

const NativeEventDetails = () => {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId;
  const [nativeEvent, setNativeEvent] = useState<NativeEvent | null>(null);
  const [, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectAlert, setShowConnectAlert] = useState(false);
  const [showAttendanceConnectAlert, setShowAttendanceConnectAlert] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  // const { nativeEvents } = useNativeEvents();
  const videoSrc = nativeEvent?.videoUrl || '';
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const currentLocation = usePathname();

  // Scroll jusqu'en haut de la popup lors de la navigation
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentLocation]);

  // Fonction pour remonter en haut de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentLocation]);

  // Vérifier si l'événement est un favori
  useEffect(() => {
    const checkIfFavorite = async () => {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      const nativeEventId = nativeEvent ? nativeEvent.eventID : null;

      if (userId && nativeEventId) {
        try {
          const response = await fetch(`/api/users/nativeFavorites?userId=${userId}`);
          if (response.ok) {
            const favorites = await response.json();
            setIsFavorite(favorites.some((favEvent: { eventID: string; }) => favEvent.eventID === nativeEventId));
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

    if (nativeEvent) {
      checkIfFavorite();
    }
  }, [nativeEvent, auth.currentUser]);

  // Fonction pour récupérer les détails de l'événement natif
  useEffect(() => {
    const loadNativeEventDetails = async () => {
      console.log('Chargement des détails de l\'événement natif...');
      try {
        setIsLoading(true);
        if (eventId) {
          // Récupération de l'événement natif par son ID
          console.log('Récupération de l\'événement natif par son ID:', eventId);
          const response = await fetch(`/api/events/${eventId}`);
          console.log('Réponse de l\'événement natif:', response);
          if (response.ok) {
            const event = await response.json();
            console.log('Evénement natif trouvé:', event);
            setNativeEvent(event);
            console.log('Evénement natif:', nativeEvent);
          } else {
            setError('Événement natif non trouvé');
          }
        }
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des détails de l\'événement natif');
        setIsLoading(false);
      }
    };

    if (eventId) {
      loadNativeEventDetails();
    }
  }, [eventId]);

  const fetchCurrentStatus = async () => {
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
      const response = await fetch(`/api/events/${eventId}/attendance/currentStatus?firebaseId=${firebaseId}`);
      console.log('Réponse API fetchCurrentStatus:', response);
      if (response.ok) {
        const data = await response.json();
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
  };

  // Appeler cette fonction dans useEffect lors du chargement du composant ou lorsque les données nécessaires sont disponibles
  useEffect(() => {
    if (nativeEvent && auth.currentUser) {
      console.log('Début de la récupération du statut actuel pour l\'événement:', nativeEvent);
      fetchCurrentStatus();
      console.log('Statut actuel:', selectedStatus);
    }
  }, [nativeEvent, auth.currentUser]);

  if (!nativeEvent) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        Chargement des détails de l'événement...
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!nativeEvent) {
    return <div className="error-container"></div>;
  }

  const handleBackToMap = () => {
    navigate('/'); // Rediriger vers la page d'accueil
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        Chargement des détails de l'événement...
      </div>
    );
  }

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

  const defaultPriceOptions = {
    isFree: false,
    uniquePrice: 0,
    priceRange: { min: 0, max: 0 }
  };

  // Utilisation de valeurs par défaut si certaines données ne sont pas disponibles
  const {
    name = 'Nom inconnu',
    organizerName = 'Organisateur inconnu',
    description = 'Description non spécifiée',
    location = {},
    photoUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png',
    videoUrl,
    startDate,
    endDate,
    startTime,
    endTime,
    priceOptions = defaultPriceOptions,
    audience = 'Locale',
    capacity,
    acceptedPayments,
    // website,
    ticketLink,
    // category,
    tags,
    accessibleForDisabled,
  } = nativeEvent || {};

  // Extraction des données de localisation
  const { address, postalCode, city, latitude, longitude } = location;
  const addressNative = address || '';
  const postalCodeNative = postalCode || '';
  const cityNative = city || '';
  const fullAddress = `${addressNative}, ${postalCodeNative} ${cityNative}`;

  // Extraction des dates
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const isSameDate = formattedStartDate === formattedEndDate;
  const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;

  // Extraction des horaires
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);
  const timeRange = formattedStartTime && formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : 'Non spécifié';

  const displayAcceptedPayments = () => {
    return acceptedPayments && acceptedPayments.length > 0
      ? acceptedPayments.join(', ')
      : 'Non spécifié';
  };

  const displayPrice = () => {
    if (!priceOptions) return "Non spécifié";

    const { isFree, uniquePrice = 0, priceRange = { min: 0, max: 0 } } = priceOptions;

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
        const response = await fetch(`/api/users/nativeFavorites?userId=${userId}`);
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

  const addToFavorites = async (eventId: string): Promise<boolean> => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      return false;
    }

    try {
      const response = await fetch(`/api/users/addNativeFavorite?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventID: eventId })
      });

      if (response.ok) {
        console.log('Ajouté aux favoris natifs');
        return true;
      } else {
        console.error('Erreur lors de l\'ajout aux favoris');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    return false;
  };

  const showStatusMessage = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000); // Message affiché pendant 3 secondes
  };

  const updateAttendanceStatus = async (status: string) => {
    const firebaseId = auth.currentUser ? auth.currentUser.uid : null;
    const eventId = nativeEvent ? nativeEvent.eventID : null;

    try {
      await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseId, status })
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

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    event.target.mute(); // Mettre en sourdine par défaut
  };

  const removeFromFavorites = async (eventId: string): Promise<boolean> => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      // Si l'utilisateur n'est pas connecté, retourner false
      return false;
    }

    try {
      const response = await fetch(`/api/users/removeNativeFavorite?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventID: eventId })
      });

      if (response.ok) {
        console.log('Retiré des favoris natifs');
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

    const eventId = nativeEvent ? nativeEvent.eventID : null;

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

  const eventName = nativeEvent.name;
  const eventDescription = nativeEvent.description || `Découvre l'événement ${eventName} sur Wazaa`;
  const eventImage = nativeEvent.photoUrl;
  const eventSlug = createEventSlug(eventName);
  const cityN = nativeEvent.location?.city;
  const citySlug = cityN ? createEventSlug(cityN) : 'evenement';

  const canonicalUrl = `https://www.wazaa.app/events/${citySlug}/${eventSlug}/${eventId}`;

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
        <Head>
          <title>{eventName} | Wazaa</title>
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
        </Head>
      <AnimatePresence>
        <div ref={topRef} className="event-details-container">

        <div className="event-details">
          {photoUrl && (
            <div className="popup-details_image-container event-details_image-container">
              <Image src={photoUrl} alt={name} className="popup-details_image event-details_image" width={600} height={650} />
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
                      <button onClick={() => navigate('/inscription-choice')}>S'inscrire</button>
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
                    {showShareConfirmation && <div className="popup-details_confirmation-message">Lien de l'événement copié !</div>}
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
                nativeEvent.type === 'private' && (
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
                            <button onClick={() => navigate('/inscription-choice')}>S'inscrire</button>
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
};

export default NativeEventDetails;
