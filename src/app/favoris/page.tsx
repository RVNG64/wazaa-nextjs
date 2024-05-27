// src/pages/favoris.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../utils/firebase';
import axios from 'axios';
import { motion } from 'framer-motion';
import { POI } from '../../contexts/EventContext';
import { NativeEvent } from '../../contexts/NativeEventContext';
import dynamic from 'next/dynamic';

const NativeMapDetailsPopup = dynamic(() => import('../../components/NativeMapDetailsPopup.client'), { ssr: false });
const MiniMap = dynamic(() => import('../../components/MiniMapEventDetails.client'), { ssr: false });
const PastEventsView = dynamic(() => import('../../components/PastEventsView'), { ssr: false });
const EventCard = dynamic(() => import('../../components/EventCard'), { ssr: false });
const MobileMenu = dynamic(() => import('../../components/MobileMenu'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../components/ScrollToTopButton'), { ssr: false });
const Image = dynamic(() => import('next/image'), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

interface Ad {
  id: number;
  adUrl: string;
  link: string;
}

const MyEvents = () => {
  console.log('Rendering MyEvents Component');

  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [showConnectAlert, setShowConnectAlert] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isListViewVisible, setIsListViewVisible] = useState(false);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [, setRecommendationsError] = useState('');
  const [selectedNativeEvent, setSelectedNativeEvent] = useState<NativeEvent | null>(null);
  const location = typeof window !== 'undefined' ? window.location.pathname : '';
  const topOfPopup = React.createRef<HTMLDivElement>();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [nextAd, setNextAd] = useState<Ad | null>(null);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const previousLocation = useRef(location);
  const [currentPath, setCurrentPath] = useState(location);

  useEffect(() => {
    if (showDetails && topOfPopup.current) {
      topOfPopup.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showDetails, topOfPopup]);

  // Effets pour gérer les changements de location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkPathChange = () => {
        const currentPath = window.location.pathname;

        if (currentPath !== location && showDetails) {
          setShowDetails(false);
        }
      };

      window.addEventListener('popstate', checkPathChange);

      return () => {
        window.removeEventListener('popstate', checkPathChange);
      };
    }
  }, [location, showDetails]);

  // Fonction pour gérer le clic sur un événement recommandé
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prevIndex =>
        prevIndex === recommendations.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Change de slide toutes les 7 secondes

    return () => clearInterval(interval);
  }, [recommendations.length]);

  useEffect(() => {
    if (previousLocation.current !== location) {
      setCurrentPath(location);
      previousLocation.current = location;
    }
  }, [location]);

  // Ferme les détails de l'événement si l'utilisateur clique sur le bouton "Retour"
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = (event: PopStateEvent) => {
        if (showDetails) {
          setShowDetails(false);
          event.preventDefault(); // Empêcher le navigateur de changer l'URL
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [showDetails]);

  // Fonction pour gérer les transitions entre les publicités
  useEffect(() => {
    const adInterval = setInterval(() => {
      setIsFading(true); // Commence le fondu enchaîné
      setNextAd(getRandomAd()); // Prépare la prochaine annonce

      setTimeout(() => {
        if (nextAd) {
          setAd(nextAd); // Met à jour l'annonce après la fin de l'animation
        }
        setIsFading(false); // Fin du fondu enchaîné
      }, 1000); // Durée de la transition CSS
    }, 30000); // Durée de l'annonce: 30 secondes

    return () => clearInterval(adInterval);
  }, [nextAd]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      const userId = auth.currentUser?.uid;
      let eventId: string | undefined;

      if (selectedPoi) {
        if ('@id' in selectedPoi) {
          eventId = selectedPoi['@id'].split('/').pop();
        } else if ((selectedPoi as NativeEvent).eventID) {
          eventId = (selectedPoi as NativeEvent).eventID;
        }
      }

      if (userId && eventId) {
        try {
          const url = eventId.includes('native')
            ? `/api/users/nativeFavorites?userId=${userId}`
            : `/api/users/favoritesJSON?userId=${userId}`;

          const response = await fetch(url);
          if (!response.ok) throw new Error('Erreur lors de la récupération des favoris');

          const favorites: (POI | NativeEvent)[] = await response.json();
          setIsFavorite(favorites.some((event: POI | NativeEvent) => {
            return '@id' in event
              ? event['@id'].split('/').pop() === eventId
              : event.eventID === eventId;
          }));
        } catch (error) {
          console.error('Erreur:', error);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkIfFavorite();
  }, [selectedPoi]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (auth.currentUser) {
        try {
          const userId = auth.currentUser.uid;
          const response = await axios.get(`/api/users/favoritesJSON?userId=${userId}`);
          const nativeResponse = await axios.get(`/api/users/nativeFavorites?userId=${userId}`);
          const now = new Date();

          const upcomingFavorites: POI[] = [];
          const pastFavorites: POI[] = [];
          const upcomingNativeFavorites: NativeEvent[] = [];
          const pastNativeFavorites: NativeEvent[] = [];

          response.data.forEach((event: POI) => {
            const eventEndDate = new Date(event['schema:endDate']?.[0]);
            if (eventEndDate < now) {
              pastFavorites.push(event);
            } else {
              upcomingFavorites.push(event);
            }
          });

          nativeResponse.data.forEach((event: NativeEvent) => {
            const eventEndDate = new Date(event.endDate);
            if (eventEndDate < now) {
              pastNativeFavorites.push(event);
            } else {
              upcomingNativeFavorites.push(event);
            }
          });

          upcomingFavorites.sort((a, b) => {
            const dateA = new Date(a['schema:startDate']?.[0] || "").getTime();
            const dateB = new Date(b['schema:startDate']?.[0] || "").getTime();
            return dateA - dateB;
          });

          upcomingNativeFavorites.sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateA - dateB;
          });

          const allUpcomingFavorites = [...upcomingFavorites, ...upcomingNativeFavorites].sort((a, b) => {
            const dateAString = 'schema:startDate' in a ? a['schema:startDate'][0] : a.startDate;
            const dateBString = 'schema:startDate' in b ? b['schema:startDate'][0] : b.startDate;

            const dateA = new Date(convertToDateISO(dateAString)).getTime();
            const dateB = new Date(convertToDateISO(dateBString)).getTime();

            return dateA - dateB;
          });

          const allPastFavorites = [...pastFavorites, ...pastNativeFavorites];

          setFavorites(allUpcomingFavorites);
          setPastEvents(allPastFavorites);
        } catch (error) {
          console.error('Erreur lors de la récupération des favoris', error);
        }
      }
    };

    fetchFavorites();

    const fetchRecommendations = async () => {
      if (auth.currentUser) {
        try {
          const userId = auth.currentUser.uid;
          const response = await axios.get(`/api/users/recommendations?userId=${userId}`);
          setRecommendations(response.data);
          if (response.data.length === 0) {
            setRecommendationsError('Aucune recommandation disponible pour le moment.');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des recommandations', error);
          setRecommendationsError('Impossible de charger les recommandations.');
        }
      }
    };

    fetchRecommendations();
  }, []);

  /* Fonction pour récupérer les favoris
  useEffect(() => {
    fetchFavorites();
  }, [auth.currentUser]); */

  // Fonction pour gérer la navigation dans le carousel (précédent)
  const handlePrevClick = () => {
    if (carouselIndex === 0) {
      setCarouselIndex(recommendations.length - 3); // Remplacez 3 par le nombre de cartes visibles à la fois
    } else {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  // Fonction pour gérer la navigation dans le carousel (suivant)
  const handleNextClick = () => {
    if (carouselIndex >= recommendations.length - 3) { // Remplacez 3 par le nombre de cartes visibles à la fois
      setCarouselIndex(0);
    } else {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  // Fonction pour récupérer les recommandations
  const fetchRecommendations = async () => {
    if (auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        const response = await axios.get(`/api/users/recommendations?userId=${userId}`);
        setRecommendations(response.data);
        if (response.data.length === 0) {
          setRecommendationsError('Aucune recommandation disponible pour le moment.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations', error);
        setRecommendationsError('Impossible de charger les recommandations.');
      }
    }
  };

  // Conversion de la date en format ISO pour trier les événements
  const convertToDateISO = (dateString: string) => {
    // Convertit "JJ/MM/AAAA" en "AAAA-MM-JJ"
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // Pour le format "AAAA-MM-JJ", retourne tel quel
    return dateString;
  };

  // Fonction pour récupérer les favoris
  const fetchFavorites = async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const response = await axios.get(`/api/users/favoritesJSON?userId=${userId}`);
        const nativeResponse = await axios.get(`/api/users/nativeFavorites?userId=${userId}`);
        const now = new Date();

        // Séparation des événements passés et à venir
        const upcomingFavorites: POI[] = [];
        const pastFavorites: POI[] = [];
        const upcomingNativeFavorites: NativeEvent[] = [];
        const pastNativeFavorites: NativeEvent[] = [];

        // Logique de tri et de répartition pour les événements POI
        response.data.forEach((event: POI) => {
          const eventEndDate = new Date(event['schema:endDate']?.[0]);
          if (eventEndDate < now) {
            pastFavorites.push(event);
          } else {
            upcomingFavorites.push(event);
          }
        });

        // Logique de tri et de répartition pour les événements natifs
        nativeResponse.data.forEach((event: NativeEvent) => {
          const eventEndDate = new Date(event.endDate);
          if (eventEndDate < now) {
            pastNativeFavorites.push(event);
          } else {
            upcomingNativeFavorites.push(event);
          }
        });

        // Tri des événements à venir
        upcomingFavorites.sort((a, b) => {
          const dateA = new Date(a['schema:startDate']?.[0] || "").getTime();
          const dateB = new Date(b['schema:startDate']?.[0] || "").getTime();
          return dateA - dateB;
        });

        upcomingNativeFavorites.sort((a, b) => {
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return dateA - dateB;
        });

        // Fusionner et trier uniquement les favoris à venir
        const allUpcomingFavorites = [...upcomingFavorites, ...upcomingNativeFavorites].sort((a, b) => {
          const dateAString = 'schema:startDate' in a ? a['schema:startDate'][0] : a.startDate;
          const dateBString = 'schema:startDate' in b ? b['schema:startDate'][0] : b.startDate;

          const dateA = new Date(convertToDateISO(dateAString)).getTime();
          const dateB = new Date(convertToDateISO(dateBString)).getTime();

          return dateA - dateB;
        });

        const allPastFavorites = [...pastFavorites, ...pastNativeFavorites]; // Pas besoin de trier ici si ce n'est pas nécessaire

        // Mettre à jour les états avec les listes fusionnées
        setFavorites(allUpcomingFavorites);
        setPastEvents(allPastFavorites);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris', error);
    }
    fetchRecommendations();
  };

  const toggleListView = () => {
    setIsListViewVisible(!isListViewVisible);
  };

  const addToFavorites = async (eventId: string, isNativeEvent: boolean): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      console.error("Utilisateur non connecté");
      return false;
    }

    const addFavoriteUrl = isNativeEvent
      ? `/api/users/addNativeFavorite?userId=${auth.currentUser.uid}`
      : `/api/users/addFavorite?userId=${auth.currentUser.uid}`;

    try {
      const response = await fetch(addFavoriteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        console.log('Événement ajouté aux favoris');
        await fetchFavorites(); // Mettre à jour la liste des favoris
        return true;
      } else {
        console.error('Erreur lors de l\'ajout de l\'événement aux favoris');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    return false;
  };

  const removeFromFavorites = async (eventId: string, isNativeEvent: boolean): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      console.error("Utilisateur non connecté");
      return false;
    }

    const removeFavoriteUrl = isNativeEvent
      ? `/api/users/removeNativeFavorite?userId=${auth.currentUser.uid}`
      : `/api/users/removeFavorite?userId=${auth.currentUser.uid}`;

    try {
      const response = await fetch(removeFavoriteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        console.log('Événement retiré des favoris');
        await fetchFavorites(); // Mettre à jour la liste des favoris
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
    return `${day}/${month}/${year}`;
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    window.history.pushState({}, '', '/favoris');
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
    const adLinkUrl = ad.adUrl || 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
    const adLink = isValidImageUrl(adLinkUrl) ? adLinkUrl : 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
    const adImage = Array.isArray(adLink) ? adLink[0] : adLink;

    return (
      <div className={`popup-details_ad-container advanced-search-banner ${isFading ? 'fade-out' : ''}`}>
        <p className="popup-details_ad-label">Publicité</p>
        <a href={ad.link} target="_blank" rel="noopener noreferrer">
          <Image src={adImage} alt={`Publicité ${ad.id}`} className="popup-details_ad" width={500} height={300} priority style={{ width: 'auto', height: '100%' }} />
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

    const isValidImageUrl = (url: any) => {
      return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));
    };

  const renderDetailsPopup = () => {
    if (!selectedPoi) return null;

    const poiName = selectedPoi['rdfs:label']?.fr?.[0] || 'Nom inconnu';
    const poiDescription = selectedPoi['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Description non disponible';
    const addressObject = selectedPoi['isLocatedAt']?.[0]?.['schema:address']?.[0];
    const streetAddress = addressObject?.['schema:streetAddress']?.[0] || '';
    const postalCode = addressObject?.['schema:postalCode'] || '';
    const addressLocality = addressObject?.['schema:addressLocality'] || '';

    // Construction de l'adresse complète
    const addressParts = [streetAddress, postalCode && addressLocality ? `${postalCode} ${addressLocality}` : postalCode || addressLocality];
    const poiAddress = addressParts.filter(Boolean).join(', ') || 'Adresse non disponible';

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

    const toggleFavorite = async () => {
      if (!auth.currentUser) {
        setShowConnectAlert(true);
        return;
      }

      let eventId: string | undefined;
      let isNativeEvent = false;

      if (selectedPoi) {
        if ('@id' in selectedPoi) {
          eventId = selectedPoi['@id'].split('/').pop();
        } else if ((selectedPoi as NativeEvent).eventID) {
          eventId = (selectedPoi as NativeEvent).eventID;
          isNativeEvent = true;
        }
      }

      if (eventId) {
        let success = isFavorite
          ? await removeFromFavorites(eventId, isNativeEvent)
          : await addToFavorites(eventId, isNativeEvent);

        if (success) {
          setIsFavorite(!isFavorite);
          refreshFavorites();
          setFavoriteMessage(!isFavorite ? "Ajouté aux favoris!" : "Retiré des favoris!");
          setTimeout(() => setFavoriteMessage(""), 3000);
        }
      }
    };

    const refreshFavorites = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        return;
      }

      try {
        const poiResponse = await axios.get(`/api/users/favoritesJSON?userId=${userId}`);
        const nativeResponse = await axios.get(`/api/users/nativeFavorites?userId=${userId}`);

        if (poiResponse.status === 200 && nativeResponse.status === 200) {
          const poiFavorites = poiResponse.data;
          const nativeFavorites = nativeResponse.data;

          const combinedFavorites = [...poiFavorites, ...nativeFavorites];
          setFavorites(combinedFavorites);
        } else {
          throw new Error('Erreur lors du chargement des favoris');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };

    // Fonction pour partager l'événement
    const shareOnSocialMedia = (platform: string) => {
      if (typeof window !== 'undefined') {
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
      }
    };

    const copyToClipboard = () => {
      if (typeof window !== 'undefined') {
        const eventUrl = window.location.href;
        navigator.clipboard.writeText(eventUrl)
          .then(() => {
            setShowShareConfirmation(true);
            setTimeout(() => setShowShareConfirmation(false), 3000);
          })
          .catch(err => console.error("Impossible de copier le lien", err));
      }
    };

    // Fonction pour partager l'événement
    const shareEvent = () => {
      setShowSharePopup(true);
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
                    <Image src={poiImage} alt={poiName} className="popup-details_image" width={696} height={600} style={{ width: '100%', height: '100%' }} />
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
                  <motion.h1 variants={itemVariants} className="popup-details_title">{poiName}</motion.h1>
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
                        <Image src="/icon-facebook.svg" alt="Facebook" width={40} height={40} style={{ width: '100%', height: '100%' }} />
                      </button>
                      <button onClick={() => shareOnSocialMedia('twitter')} className="popup-details_social-share-btn">
                        <Image src="/icon-twitter.svg" alt="Twitter" width={40} height={40} style={{ width: '100%', height: '100%' }} />
                      </button>
                      <button onClick={() => shareOnSocialMedia('whatsapp')} className="popup-details_social-share-btn">
                        <Image src="/icon-whatsapp.svg" alt="WhatsApp" width={40} height={40} style={{ width: '100%', height: '100%' }} />
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

  const renderRecommendation = (event: any) => {
    if (!event) return null;

    const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
    const posterUrl = event.image && event.image.length > 0 ? event.image[0] : defaultImageUrl;
    const poster = isValidImageUrl(posterUrl) ? posterUrl : defaultImageUrl;
    const image = Array.isArray(poster) ? poster[0] : poster;
    const title = event.title ?? 'Titre non disponible';
    const startDate = event.startDate ?? '';
    const formattedStartDate = startDate ? frenchFormatDate(startDate) : 'Date non disponible';
    const address = event.address ?? 'Adresse non disponible';

    return (
      <div key={event.id} className="myEvents__recommendation-item" onClick={() => handleRecoClick(event)}>
        <div className="myEvents__recommendation-image-container">
          <Image src={image} alt={title} className="myEvents__recommendation-image" width={300} height={200} style={{ width: '100%', height: '100%' }} priority />
        </div>

        <div className="myEvents__recommendation-content">
          <h3 className="myEvents__recommendation-title">{title}</h3>
          <div className="myEvents__recommendation-infos-container">
            <p className="myEvents__recommendation-date">
              <i className="fa fa-calendar-alt"></i> {formattedStartDate}
            </p>
            <p className="myEvents__recommendation-address">
              <i className="fa fa-map-marker-alt"></i> {address}
            </p>
          </div>
        </div>
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

  // Fonction pour gérer le clic sur un marqueur
  const handleMarkerClick = (event: POI | NativeEvent) => {
    if ('@id' in event) {
      if (selectedPoi?.['@id'] === event['@id']) return;

      const eventName = event['rdfs:label']?.fr?.[0] || '';
      const eventId = event['@id'].split('/').pop();
      const eventSlug = createEventSlug(eventName);
      const city = event.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
      const citySlug = city ? createEventSlug(city) : 'evenement';

      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/event/${citySlug}/${eventSlug}/${eventId}`);
      }
      setSelectedPoi(event);
      setShowDetails(true);
    } else {
      if (selectedNativeEvent?.eventID === event.eventID) return;

      const eventName = event.name || '';
      const eventId = event.eventID;
      const eventSlug = createEventSlug(eventName);
      const city = event.location?.city;
      const citySlug = city ? createEventSlug(city) : 'evenement';

      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/events/${citySlug}/${eventSlug}/${eventId}`);
      }
      setSelectedNativeEvent(event);
      setShowDetails(true);
    }
  };

  // Fonction pour gérer le clic sur un événement recommandé
  const handleRecoClick = async (event: any) => {
    const eventName = event.title ?? '';
    let eventId = event.id.split('/').pop();
    if (selectedPoi?.['@id'] === eventId) return;  // Vérifiez ici aussi

    const eventSlug = createEventSlug(eventName);
    const city = event.address?.split(',').pop();
    const citySlug = city ? createEventSlug(city) : 'evenement';

    try {
      const response = await axios.get(`/api/event/${eventId}`);

      if (response.data) {
        window.history.pushState({}, '', `/event/${citySlug}/${eventSlug}/${eventId}`);
        setSelectedPoi(response.data); // Met à jour avec les données complètes de l'événement
        setShowDetails(true); // Ouvre la popup
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'événement', error);
    }
  };

  // Fonction pour vérifier le format de la date et la formater si nécessaire
  const formatNativeDate = (dateString: string): string => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateRegex.test(dateString)) {
      return dateString;
    }

    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const [day, month, year] = dateParts;
      return `${year}-${month}-${day}`;
    }

    return '';
  };

  return (
    <div className="myEvents">
      <ScrollToTopButton />
      <MobileMenu />

      <h1>Mes Favoris</h1>
      <button onClick={toggleListView} className="myEvents__toggle-view-btn">
        Voir les événements passés
      </button>
      <div className="myEvents__container">
        {favorites.length > 0 ? (
          favorites.map(event => <EventCard key={event['@id']} event={event} onCardClick={() => handleMarkerClick(event)} />
          )
        ) : (
          <div>Aucun événement en favori.</div>
        )}
      </div>

      <div className="myEvents-ad-container">
        {renderAd()}
      </div>

      <div className="myEvents__recommendations">
        <h2>Recommandations</h2>
        <div className="myEvents__carousel-container">
        <div className="myEvents__carousel-track" style={{ transform: `translateX(-${carouselIndex * (100 / 3)}%)` }}> {/* Remplacez 3 par le nombre de cartes visibles à la fois */}
        {recommendations.map(event => (
          <div className="myEvents__carousel-item" key={event.id} onClick={() => handleRecoClick(event)}>
            {renderRecommendation(event)}
          </div>
        ))}
        </div>
        </div>
        <div className="myEvents__carousel-navigation">
          <button className="myEvents__carousel-button prev" onClick={handlePrevClick}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="myEvents__carousel-button next" onClick={handleNextClick}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {renderDetailsPopup()}
      {showDetails && selectedNativeEvent && (
        <NativeMapDetailsPopup
          eventData={selectedNativeEvent}
          isNativeMapDetailsPopup={showDetails}
          onClose={() => setShowDetails(false)}
          onResetSelectedEvent={() => setSelectedNativeEvent(null)}
        />
      )}
      {isListViewVisible && (
        <>
          <div className="list-item_overlay"></div>
          <PastEventsView
            isVisible={isListViewVisible}
            events={pastEvents}
            onEventClick={handleMarkerClick}
          />
        </>
      )}
    </div>
  );
};

export default MyEvents;
