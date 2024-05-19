// src/app/recherche-avancee/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../utils/firebase';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThList, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { POI } from '../../contexts/EventContext';
import { motion, AnimatePresence } from 'framer-motion';
import MobileMenu from '../../components/MobileMenu';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import MiniMap from '../../components/MiniMapEventDetails.client';
import LoginRequiredPopup from '../../components/LoginRequiredPopup';
import LottieLoupe from '../../components/lotties/LottieLoupe';
import LottieLoupeFiles from '../../components/lotties/LottieLoupeFiles';
import loupeFiles from '../../assets/LoupeFiles - 1709065825491.json';
import loupe from '../../assets/Loupe - 1708980970911.json';
import '../../styles/advancedSearch.css';

interface Ad {
  id: number;
  adUrl: string;
  link: string;
}

const AdvancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [theme, setTheme] = useState('');
  const [audience, setAudience] = useState('');
  const [organizerType, setOrganizerType] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchIn, setSearchIn] = useState('events');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [showConnectAlert, setShowConnectAlert] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isChangingView, setIsChangingView] = useState(false);
  const [nextAd, setNextAd] = useState<Ad | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [dateError, setDateError] = useState('');
  const [error, setError] = useState('');
  const topOfPopup = React.createRef<HTMLDivElement>();
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const location = usePathname();
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const suggestions = ["#Concert", "#Festival", "#Théâtre", "#Exposition", "#Conférence", "#Spectacle", "#Danse", "#Salon", "#Marché", "#Course"];

  // Fonction pour obtenir des suggestions aléatoires
  const getRandomSuggestions = (suggestions: string[], count: number) => {
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Génération des suggestions aléatoires au montage du composant
  useEffect(() => {
    setRandomSuggestions(getRandomSuggestions(suggestions, 5));
  }, []); // Le tableau de dépendances vide [] assure que cet effet ne s'exécute qu'une fois, au montage du composant

  // Gestion des suggestions de recherche
  const onSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion.replace('#', '')); // Supprimer le symbole # avant d'ajouter au searchTerm
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // L'utilisateur est connecté
        setIsLoggedIn(true);
      } else {
        // L'utilisateur n'est pas connecté
        setIsLoggedIn(false);
      }
    });

    // Nettoyer l'abonnement
    return () => unsubscribe();
  }, []);

  // Convertir la chaîne en objet Date pour DatePicker
  const startDateObj = startDate ? parseISO(startDate) : null;
  const endDateObj = endDate ? parseISO(endDate) : null;

  // Mise à jour des fonctions de changement pour DatePicker
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date ? format(date, 'yyyy-MM-dd') : '');
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date ? format(date, 'yyyy-MM-dd') : '');
  };

  useEffect(() => {
    const adSearchInterval = setInterval(() => {
      setIsFading(true); // Commence le fondu enchaîné
      setNextAd(getRandomAd()); // Prépare la prochaine annonce

      setTimeout(() => {
        if (nextAd) {
          setAd(nextAd); // Met à jour l'annonce après la fin de l'animation
        }
        setIsFading(false); // Fin du fondu enchaîné
      }, 1000); // Durée de la transition CSS
    }, 10000); // Durée de l'annonce: 30 secondes

    return () => clearInterval(adSearchInterval);
  }, [nextAd, searchPerformed]);

  useEffect(() => {
    let timeoutId: number;
    if (showError) {
      // Typecast le retour de setTimeout en `number`
      timeoutId = window.setTimeout(() => {
        setShowError(false);
        setDateError(''); // Réinitialisez également le message d'erreur
      }, 5000) as unknown as number;
    }
    return () => clearTimeout(timeoutId);
  }, [showError]);

  useEffect(() => {
    if (showDetails && topOfPopup.current) {
      topOfPopup.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showDetails]);

  // Validation des dates (obligatoires pour la recherche)
  const validateDates = () => {
    if (!startDate || !endDate) {
      setDateError("Les dates sont obligatoires pour effectuer une recherche.");
      setShowError(true);
      return false;
    }
    setDateError('');
    setShowError(false);
    return true;
  };

  useEffect(() => {
    // setResults([]);
    // setTotalPages(0);
  }, [searchTerm, startDate, endDate, eventType, theme, audience, organizerType, searchIn]);

  useEffect(() => {
    if (showDetails && topOfPopup.current) {
      topOfPopup.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showDetails]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      const userId = auth.currentUser?.uid;
      const poiId = selectedPoi && typeof selectedPoi['@id'] === 'string'
      ? selectedPoi['@id'].split('/').pop()
      : null;

      if (userId && poiId) {
        try {
          const response = await fetch(`/api/users/favoritesJSON`);
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

  const handleCloseDetails = () => {
    setShowDetails(false);
    window.history.pushState({}, '', '/recherche-avancee');
  };

  const addToFavorites = async (eventId: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      console.error("Utilisateur non connecté");
      return false;
    }

    try {
      const response = await fetch(`/api/users/addFavorite`, {
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

  const removeFromFavorites = async (eventId: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      console.error("Utilisateur non connecté");
      return false;
    }

    try {
      const response = await fetch(`/api/users/removeFavorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        console.log('Événement retiré des favoris');
        setIsFavorite(false); // Mettre à jour l'état isFavorite
        return true;
      } else {
        console.error('Erreur lors de la suppression de l\'événement des favoris');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    return false;
  };

  const frenchFormatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchResults = async (page = 1) => {
    setIsLoading(true);
    setSearchPerformed(true);

    try {
      const uniqueSearchParam = new Date().getTime();

      const response = await axios.post(`/api/events/search`, {
        searchTerm,
        startDate,
        endDate,
        eventType,
        theme,
        audience,
        searchIn,
        page,
        _noCache: uniqueSearchParam
      });
      setResults(response.data.results);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);

      return response.data; // Retourner les résultats pour les tests
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
      return []; // Retourner un tableau vide en cas d'erreur
    } finally {
      setIsLoading(false);
    }
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

  const [ad, setAd] = useState<Ad>(getRandomAd());

  const renderAd = () => {
    return (
      <div className={`popup-details_ad-container advanced-search-banner ${isFading ? 'fade-out' : ''}`}>
        <p className="popup-details_ad-label">Publicité</p>
        <a href={ad.link} target="_blank" rel="noopener noreferrer">
          <Image src={ad.adUrl} alt={`Publicité ${ad.id}`} className="popup-details_ad" width={300} height={250} priority />
        </a>
      </div>
    );
  };

  const renderDetailsPopup = () => {
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
    const poiImage = selectedPoi['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;
    const latitude = selectedPoi['isLocatedAt']?.[0]?.['schema:geo']?.['schema:latitude'];
    const longitude = selectedPoi['isLocatedAt']?.[0]?.['schema:geo']?.['schema:longitude'];
    // Conversion de la latitude et de la longitude en nombres
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Extraction et mise en forme d'autres données
    const audience = selectedPoi['hasAudience']?.map(aud => aud['rdfs:label']?.fr?.[0]).filter(Boolean).join(', ') || 'Non spécifié';
    const themes = selectedPoi['hasTheme']?.map(theme => theme['rdfs:label']?.fr?.[0]).filter(Boolean).join(', ') || '';
    const startDate = selectedPoi['schema:startDate']?.[0] || '';
    const endDate = selectedPoi['schema:endDate']?.[0] || '';
    const reducedMobilityAccess = selectedPoi['reducedMobilityAccess'] ? 'Oui' : 'Non';
    const bookingContacts = selectedPoi['hasBookingContact']?.map(contact => contact['schema:legalName']).filter(Boolean).join(', ') || 'Non spécifié';

    // Formatage du temps
    const formatTime = (timeString: string | undefined) => {
      if (!timeString) return '';
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const startTime = formatTime(selectedPoi['takesPlaceAt']?.[0]?.['startTime']);
    const endTime = formatTime(selectedPoi['takesPlaceAt']?.[0]?.['endTime']);
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : 'Non spécifié';

    // Formatage et affichage des dates
    const formattedStartDate = frenchFormatDate(startDate);
    const formattedEndDate = frenchFormatDate(endDate);
    const isSameDate = startDate === endDate;
    const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;

    const toggleFavorite = async () => {
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
    };

    const refreshFavorites = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const response = await fetch(`/api/users/favoritesJSON`);
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
    };

    // Fonction pour partager l'événement
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

  const handleMarkerClick = (poi: POI) => {
    const eventName = poi['rdfs:label']?.fr?.[0] || '';
    const eventId = poi['@id'].split('/').pop();
    const eventSlug = createEventSlug(eventName);
    const city = poi.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
    const citySlug = city ? createEventSlug(city) : 'evenement';

    window.history.pushState(null, '', `/event/${citySlug}/${eventSlug}/${eventId}`);
    setSelectedPoi(poi);
    setShowDetails(true);
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchResults(page);
    }
  };

  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }

  // Pagination et affichage des numéros de page autour de la page actuelle
  const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="advanced-search-pagination">
        {currentPage > 1 && (
          <button onClick={() => onPageChange(currentPage - 1)}>
            <i className="fa fa-arrow-left"></i> Précédent
          </button>
        )}
        {pages}
        {currentPage < totalPages && (
          <button onClick={() => onPageChange(currentPage + 1)}>
            Suivant <i className="fa fa-arrow-right"></i>
          </button>
        )}
      </div>
    );
  };

  // Fonction de recherche
  const onSearch = () => {
    if (!isLoggedIn) {
      setShowLoginRequiredPopup(true); // Afficher la popup si l'utilisateur n'est pas connecté
      return; // Ne pas procéder à la recherche
    }

    if (!validateDates()) {
      return;
    }
    setResults([]);
    setCurrentPage(1);
    setTotalPages(0);
    fetchResults(1);
  };

  // Fonction de gestion du pression de touche
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  // Fonction pour basculer entre les modes d'affichage Grille et Liste
  const toggleViewMode = () => {
    setIsChangingView(true);
    setTimeout(() => {
      setViewMode(viewMode === 'list' ? 'grid' : 'list');
      setIsChangingView(false);
    }, 500); // La durée correspond à la transition CSS
  };

  const sortResults = (columnName: string) => {
    let direction: 'asc' | 'desc' = sortColumn === columnName && sortDirection === 'asc' ? 'desc' : 'asc';
    if (columnName === sortColumn) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    const sortedResults = [...results].sort((a, b) => {
      let aValue, bValue;

      switch (columnName) {
        case 'title':
          aValue = a['rdfs:label']['fr'] ? (a['rdfs:label']['fr'][0] as string).toLowerCase() : '';
          bValue = b['rdfs:label']['fr'] ? (b['rdfs:label']['fr'][0] as string).toLowerCase() : '';
          break;
        case 'city':
          aValue = a['isLocatedAt'] && a['isLocatedAt'][0]['schema:address']
            ? (a['isLocatedAt'][0]['schema:address'][0]['schema:addressLocality'] as string).toLowerCase()
            : '';
          bValue = b['isLocatedAt'] && b['isLocatedAt'][0]['schema:address']
            ? (b['isLocatedAt'][0]['schema:address'][0]['schema:addressLocality'] as string).toLowerCase()
            : '';
          break;
        case 'date':
          aValue = a['schema:startDate'] ? new Date(a['schema:startDate'][0]) : new Date(0);
          bValue = b['schema:startDate'] ? new Date(b['schema:startDate'][0]) : new Date(0);
          break;
        case 'organizer':
          aValue = a['hasBookingContact']
            ? (a['hasBookingContact'] as { 'schema:legalName': string }[]).map(contact => contact['schema:legalName']).join(', ').toLowerCase()
            : '';
          bValue = b['hasBookingContact']
            ? (b['hasBookingContact'] as { 'schema:legalName': string }[]).map(contact => contact['schema:legalName']).join(', ').toLowerCase()
            : '';
          break;
        default:
          return 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });

    setResults(sortedResults);
    setSortColumn(columnName);
    setSortDirection(direction);
  };

  interface ListViewProps {
    results: POI[];
    sortResults: (columnName: string) => void;
  }

  const ListView = ({ results, sortResults }: ListViewProps) => {
    return (
      <div className="advanced-search-list-table-container">
        <table className="advanced-search-list-table">
          <thead>
            <tr>
              <th onClick={() => sortResults('title')}>Titre</th>
              <th onClick={() => sortResults('city')}>Ville</th>
              <th onClick={() => sortResults('date')}>Date</th>
              <th onClick={() => sortResults('organizer')}>Organisateur</th>
              <th className="advanced-search-list-details-header">Détails</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result['@id']}>
                <td className="advanced-search-list-hover-image-container" onClick={() => handleMarkerClick(result)}><strong>
                  {result['rdfs:label']['fr'] ? result['rdfs:label']['fr'].join(', ') : 'Titre non disponible'}
                  {result['hasMainRepresentation'] &&
                    result['hasMainRepresentation'][0]['ebucore:hasRelatedResource'] &&
                    result['hasMainRepresentation'][0]['ebucore:hasRelatedResource'][0]['ebucore:locator'] &&
                    typeof result['hasMainRepresentation'][0]['ebucore:hasRelatedResource'][0]['ebucore:locator'] === 'string' &&
                    result['hasMainRepresentation'][0]['ebucore:hasRelatedResource'][0]['ebucore:locator'].trim() !== '' && (
                      <Image
                        src={result['hasMainRepresentation'][0]['ebucore:hasRelatedResource'][0]['ebucore:locator']}
                        alt={result['rdfs:label']['fr'] ? result['rdfs:label']['fr'].join(', ') : 'Image non disponible'}
                        className="advanced-search-list-hover-image"
                        width={150}
                        height={250}
                      />
                  )}
                </strong></td>
                <td>
                  {result['isLocatedAt'] && result['isLocatedAt'][0]['schema:address']
                    ? result['isLocatedAt'][0]['schema:address'][0]['schema:addressLocality']
                    : 'Ville non disponible'}
                </td>
                <td>
                  {result['schema:startDate']
                    ? new Date(result['schema:startDate'][0]).toLocaleDateString()
                    : 'Date non disponible'}
                </td>
                <td>
                  {result['hasBookingContact']
                    ? result['hasBookingContact'].map(contact => contact['schema:legalName']).join(', ')
                    : 'Contact non disponible'}
                </td>
                <td className="advanced-search-list-details" onClick={() => handleMarkerClick(result)}>
                  <button className="advanced-search-list-details-link" onClick={() => handleMarkerClick(result)}>
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  interface GridViewProps {
    results: POI[];
  }

  const GridView = ({ results }: GridViewProps) => {
    const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844553/hervemake_An_emotional_brain_in_mosaic_art_each_tile_representi_1333df50-ecae-4912-9edc-84d82f6edf67_kcft2v.png';

    return (
      <div className="advanced-search-grid-container">
        {results.map((result) => (
          <div className="advanced-search-grid-item" key={result['@id']}>
            <div className="advanced-search-grid-item-image-container">
              <Image
                src={result['hasMainRepresentation'] ? result['hasMainRepresentation'][0]['ebucore:hasRelatedResource'][0]['ebucore:locator'] : defaultImageUrl}
                alt={result['rdfs:label']['fr'] ? result['rdfs:label']['fr'].join(', ') : 'Image non disponible'}
                className="advanced-search-grid-item-image"
                width={300}
                height={200}
              />
              <div className="advanced-search-grid-item-overlay">
                <div className="advanced-search-grid-item-overlay-content">
                  <h3 className="advanced-search-grid-item-title">
                    {result['rdfs:label']['fr'] ? result['rdfs:label']['fr'].join(', ') : 'Titre non disponible'}
                  </h3>
                  <p className="advanced-search-grid-item-date">
                    {result['schema:startDate'] ? new Date(result['schema:startDate'][0]).toLocaleDateString() : 'Date non disponible'}
                  </p>
                  <p className="advanced-search-grid-item-city">
                    {result['isLocatedAt'] && result['isLocatedAt'][0]['schema:address'] ? result['isLocatedAt'][0]['schema:address'][0]['schema:addressLocality'] : 'Ville non disponible'}
                  </p>
                  <button className="advanced-search-grid-item-link" onClick={() => handleMarkerClick(result)}>
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="advanced-search-container">
      <h1>Recherche avancée</h1>
      <LottieLoupe animationData={loupe} />
      {isLoading && (
        <div className="advanced-search-loading-overlay">
          <LottieLoupeFiles animationData={loupeFiles} />
        </div>
      )}

      <div className="advanced-search-inputs">
        <div className="advanced-search-search-bar">
          {/* <i className="fa fa-search advanced-search-search-icon"></i> */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mot-clé, titre, organisateur..."
            className="advanced-search-search-input"
          />
          <button className="advanced-search-search-button" onClick={onSearch}>Rechercher</button>
        </div>

        <div className="advanced-search-suggestions">
          {randomSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="advanced-search-suggestion-button"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="advanced-search-filters-container">
          <div className="advanced-search-date-picker-container">
            {dateError && <div className="advanced-search-date-error">{dateError}</div>}
            <label htmlFor="startDate">Du</label>
            <ReactDatePicker
              id="startDate"
              selected={startDateObj}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              className="advanced-search-date-picker"
            />
          </div>
          <div className="advanced-search-date-picker-container">
            <label htmlFor="endDate">Au</label>
            <ReactDatePicker
              id="endDate"
              selected={endDateObj}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              className="advanced-search-date-picker"
            />
          </div>
        </div>
      </div>

      <div className="advanced-search-view-mode-toggle">
        <button className="advanced-search-view-mode-button" onClick={toggleViewMode}>
          <FontAwesomeIcon icon={viewMode === 'list' ? faThLarge : faThList} />
          {viewMode === 'list' ? ' Grille' : ' Liste'}
        </button>
      </div>

      <div className={`advanced-search-results ${isChangingView ? 'advanced-search-results-changing' : ''}`}>
        {!isLoading && searchPerformed && (
          <>
            {viewMode === 'list' ? (
              <ListView results={results} sortResults={sortResults} />
            ) : (
              <GridView results={results} />
            )}
          </>
        )}
        {!isLoading && searchPerformed && results.length === 0 && !error && (
          <div>Aucun résultat trouvé pour votre recherche.</div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <div className="advanced-search-ad-container">
        {renderAd()}
      </div>
      {showLoginRequiredPopup && <LoginRequiredPopup onClose={() => setShowLoginRequiredPopup(false)} />}
      {renderDetailsPopup()}
      <ScrollToTopButton />
      <MobileMenu />
    </div>
  );
};

export default AdvancedSearch;
