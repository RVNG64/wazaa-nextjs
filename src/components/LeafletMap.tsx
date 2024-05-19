// src/components/LeafletMap.tsx
'use client';
import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { POI, useEvents, EventsProvider } from '../contexts/EventContext';
import { NativeEvent, useNativeEvents } from '../contexts/NativeEventContext';
import { useRouter, usePathname } from 'next/navigation';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { auth } from '../utils/firebase';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { useSearch } from '../contexts/EventFilter';
import NativeMapDetailsPopup from '../components/NativeMapDetailsPopup.client';
import EventDetails from '../app/event/[citySlug]/[eventSlug]/[eventId]/page';
import LoadingAnimation from '../components/WazaaLoading';
import ListViewToggle from '../components/ListToggleView';
import ListView from '../components/ListView';
import SideMenu from '../components/SideMenu';
import WelcomeScreen from '../components/WelcomeScreen';
import MobileMenu from '../components/MobileMenu';
import DateDisplay from '../components/DateDisplay';
import MiniMap from '../components/MiniMapEventDetails.client';
import EventFilterBar from "../components/EventFilterBar.client";
import { categories } from '../components/EventFilterBar.client';
import { CategoryProvider } from '../contexts/CategoryChangeContext';
import '../styles/dateDisplay.css'
import '../styles/wazaaLoading.css'
import '../styles/welcomeScreen.css'
import '../styles/map.css';
import '../styles/eventFilterBar.css';

const mapMarker = new L.Icon({
  iconUrl: '/map-marker.svg',
  iconRetinaUrl: '/map-marker.svg',
  iconAnchor: [12, 55],
  popupAnchor: [-18, -40],
  iconSize: [25, 55],
  className: 'map-marker'
});

type SearchEventsButtonProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchEventsButton = ({ setIsLoading }: SearchEventsButtonProps) => {
  const map = useMap();
  const { fetchEventsInBounds, setEvents } = useEvents();
  const { fetchNativeEventsInBounds, setNativeEvents } = useNativeEvents();
  const [showSearchButton, setShowSearchButton] = useState(false);

  useMapEvents({
    moveend: () => setShowSearchButton(true),
    zoomend: () => setShowSearchButton(true),
  });

  const handleSearch = () => {
    setIsLoading(true);
    const bounds = map.getBounds();
    fetchEventsInBounds(bounds).then(newEvents => {
      setEvents(newEvents);
    });
    fetchNativeEventsInBounds(bounds).then(newNativeEvents => {
      setNativeEvents(newNativeEvents);
      setShowSearchButton(false);
      setIsLoading(false);
    });
  };

  return (
    <>
      {showSearchButton ? (
        <button className="search-events-btn" onClick={handleSearch}>
          Chercher dans cette zone
        </button>
      ) : null}
    </>
  );
};

// Initialise les événements pour les limites actuelles de la carte(à l'arrivée sur le site)
const InitializeMapEvents = () => {
  const { initializeEvents } = useEvents();
  const { initializeNativeEvents } = useNativeEvents();
  const map = useMap();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      console.log("Initialisation des événements pour les limites actuelles de la carte");
      const bounds = map.getBounds();
      console.log("Limites actuelles de la carte:", bounds);
      if (bounds.isValid()) { // S'assure que les limites de la carte sont valides
        initializeEvents(bounds);
        initializeNativeEvents(bounds);
        isInitialized.current = true;
      }
    }
  }, [map, initializeEvents, initializeNativeEvents]);

  return null; // Ce composant ne rend rien
};


interface UpdateMapRefProps {
  mapRef: MutableRefObject<L.Map | null>;
}

const UpdateMapRef: React.FC<UpdateMapRefProps> = ({ mapRef }) => {
  const { initializeNativeEvents } = useNativeEvents();

  useMapEvents({
    load: (mapEvent) => {
      const mapInstance = mapEvent.target as L.Map;
      mapRef.current = mapInstance;
      const bounds = mapInstance.getBounds();
      initializeNativeEvents(bounds);
    },
  });

  return null;
};

export default function Map() {
  const position: [number, number] = [43.4833, -1.4833]; // Coordonnées par défaut
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedNativeEvent, setSelectedNativeEvent] = useState<NativeEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListViewVisible, setIsListViewVisible] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const { searchStartDate, searchEndDate, searchQuery } = useSearch();
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  const [showConnectAlert, setShowConnectAlert] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredEvents, setFilteredEvents] = useState<POI[]>([]);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const location = usePathname();
  const [currentPath, setCurrentPath] = useState(location);
  const { events } = useEvents();
  const { nativeEvents } = useNativeEvents();
  const topOfPopup = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Met à jour les détails de l'événement en fonction de l'URL
  useEffect(() => {
    if (location) {
      const path = location;
      const eventId = path.split('/event/')[1];
      if (eventId) {
        // Vérifier si l'événement existe et ouvrir la popup
        const event = events.find(e => e['@id'].includes(eventId));
        if (event) {
          setSelectedPoi(event);
          setShowDetails(true);
        }
      }
      setCurrentPath(path);
    }
  }, [location, events]);

  // Ferme les détails de l'événement si l'utilisateur clique sur le bouton "Retour"
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Vérifier si topOfPopup.current n'est pas null avant de l'utiliser
      if (showDetails && topOfPopup.current && !topOfPopup.current.contains(event.target as Node)) {
        handleCloseDetails(event as unknown as React.MouseEvent);
      }
    };

    // Ajouter l'écouteur d'événement au document
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      // Nettoyer l'écouteur d'événement
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showDetails, topOfPopup]);

  // Déclencheur pour fermer les détails de l'événement si l'URL change
  useEffect(() => {
    const handleLocationChange = () => {
      if (showDetails) {
        setShowDetails(false);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [showDetails]);

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

  // Scroll vers le haut de la popup lorsqu'elle est ouverte
  useEffect(() => {
    if (showDetails && topOfPopup.current) {
      topOfPopup.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showDetails]);

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

  // Création d'un slug pour l'événement
  const createEventSlug = (eventName: string) => {
    const noAccents = removeAccents(eventName);
    return noAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  // Centrer la carte sur le marqueur natif
  const centerMapOnNativeMarker = (nativeEvent: NativeEvent) => {
    if (mapRef.current && nativeEvent.location) {
      const currentZoom = mapRef.current.getZoom();
      const { latitude, longitude } = nativeEvent.location;

      if (typeof latitude === 'number' && typeof longitude === 'number') {
        const markerLatLng = L.latLng(latitude, longitude);

        // Calcul de la distance en mètres
        const distance = mapRef.current.getCenter().distanceTo(markerLatLng);

        if (distance > 5000) {  // Seulement recentrer si la distance est significative, 1 km
          console.log("Centering map on native marker", nativeEvent);
          mapRef.current.flyTo(markerLatLng, currentZoom, { duration: 1 });
        } else {
          console.log("Native marker is already in the center or close enough");
        }
      } else {
        console.error("Latitude or longitude is undefined.");
      }
    }
  };

  // Gestion de l'événement de clic sur le marqueur natif
  const handleNativeMarkerClick = (nativeEvent: NativeEvent) => {
    const eventName = nativeEvent.name;
    const eventId = nativeEvent.eventID;
    const eventSlug = createEventSlug(eventName);
    const city = nativeEvent.location?.city;
    const citySlug = city ? createEventSlug(city) : 'evenement';

    window.history.pushState({ eventPopup: true }, '', `/events/${citySlug}/${eventSlug}/${eventId}`);
    setSelectedNativeEvent(nativeEvent);
    setShowDetails(true);
  }

  // Centrer la carte sur le marqueur POI
  const centerMapOnMarker = (poi: POI) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const markerLatLng = L.latLng(
        parseFloat(poi['isLocatedAt'][0]['schema:geo']['schema:latitude']),
        parseFloat(poi['isLocatedAt'][0]['schema:geo']['schema:longitude'])
      );

      // Calcul de la distance en mètres
      const distance = mapRef.current.getCenter().distanceTo(markerLatLng);

      if (distance > 5000) {  // Seulement recentrer si la distance est significative, 1 km
        console.log("Centering map on marker", poi);
        mapRef.current.flyTo(markerLatLng, currentZoom, { duration: 1 });
      } else {
        console.log("Marker is already in the center or close enough");
      }
    }
  };

  // Gestion de l'événement de clic sur le marqueur
  const handleMarkerClick = (poi: POI) => {
    const eventName = poi['rdfs:label']?.fr?.[0] || '';
    const eventId = poi['@id'].split('/').pop();
    const eventSlug = createEventSlug(eventName);
    const city = poi.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
    const citySlug = city ? createEventSlug(city) : 'evenement';

    window.history.pushState({ eventPopup: true }, '', `/event/${citySlug}/${eventSlug}/${eventId}`);
    setSelectedPoi(poi);
    setShowDetails(true);
  };

  //
  const toggleListView = () => {
    setIsListViewVisible(!isListViewVisible);
  };

  // Ferme les détails de l'événement
  const handleCloseDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDetails(false);
    // window.history.back();
    if (window.history.state && window.history.state.eventPopup) {
      window.history.back();
    }
  };

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

  // Popup d'affichage des détails de l'événement
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
  };

  const updateSelectedEvent = (event: POI | NativeEvent) => {
    if ('@id' in event) { // Si c'est un POI
      const eventName = event['rdfs:label']?.fr?.[0] || '';
      const eventId = event['@id'].split('/').pop();
      const eventSlug = createEventSlug(eventName);
      const city = event.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
      const citySlug = city ? createEventSlug(city) : 'evenement';

      window.history.pushState({}, '', `/event/${citySlug}/${eventSlug}/${eventId}`);
      setSelectedPoi(event);
      setShowDetails(true);
    } else { // Si c'est un NativeEvent
      const eventName = event.name;
      const eventId = event.eventID;
      const eventSlug = createEventSlug(eventName);
      const city = event.location?.city;
      const citySlug = city ? createEventSlug(city) : 'evenement';

      window.history.pushState({}, '', `/events/${citySlug}/${eventSlug}/${eventId}`);
      setSelectedNativeEvent(event);
      setShowDetails(true);
    }
  };

  const isEventInPeriod = (poi: POI, dateDebut: Date, dateFin: Date) => {
    const startDate = poi['takesPlaceAt']?.[0]?.['startDate'] ? new Date(poi['takesPlaceAt'][0]['startDate']) : new Date();
    const endDate = poi['takesPlaceAt']?.[0]?.['endDate'] ? new Date(poi['takesPlaceAt'][0]['endDate']) : startDate;
    return startDate <= dateFin && endDate >= dateDebut;
  };

  // Pour le code postal:
  const getCodePostal = (poi: POI) => {
    return poi['isLocatedAt']?.[0]?.['schema:address']?.[0]?.['schema:postalCode'] || '';
  };

  const estCodePostalValide = (codePostalEtCommune: string) => {
    const codePostal = codePostalEtCommune.split('#')[0];
    return codePostal.startsWith("40") || codePostal.startsWith("64");
  };

  const currentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const defaultEndDate = () => {
    const now = new Date();
    now.setDate(now.getDate() + 6); // Ajoute une semaine à la date actuelle
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // États initiaux pour les dates basés sur les valeurs par défaut ou dynamiques.
  const [startDate, setStartDate] = useState(displayCurrentDate());
  const [endDate, setEndDate] = useState(displayDefaultEndDate());

  // Fonction pour obtenir la date actuelle formatée
  function displayCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Fonction pour obtenir la date de fin par défaut formatée (+6 jours)
  function displayDefaultEndDate() {
    const now = new Date();
    now.setDate(now.getDate() + 6);
    return now.toISOString().split('T')[0];
  }

  // Écoutez les changements sur les props externes `searchStartDate` et `searchEndDate`
  // et mettez à jour les états locaux en conséquence.
  useEffect(() => {
    if (searchStartDate && searchEndDate) {
      setStartDate(searchStartDate);
      setEndDate(searchEndDate);
    }
  }, [searchStartDate, searchEndDate]);

  // Affiche les dates formatées dans DateDisplay
  const formattedStartDate = new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const formattedEndDate = new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // Convertit une date au format 'YYYY-MM-DD'
  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const startDateISO = searchStartDate ? formatNativeDate(searchStartDate) : currentDate();
  const endDateISO = searchEndDate ? formatNativeDate(searchEndDate) : defaultEndDate();

  // Convertit les dates de recherche en format ISO
  const isNativeEventInPeriod = (event: NativeEvent) => {
    const formattedStartDate = formatNativeDate(event.startDate);
    const formattedEndDate = formatNativeDate(event.endDate);

    // Utiliser les valeurs par défaut si les dates formatées sont vides
    const eventStartDate = formattedStartDate ? new Date(formattedStartDate) : new Date();
    const eventEndDate = formattedEndDate ? new Date(formattedEndDate) : new Date();

    const startDate = startDateISO ? new Date(startDateISO) : new Date();
    const endDate = endDateISO ? new Date(endDateISO) : new Date();

    return eventStartDate >= startDate && eventEndDate <= endDate;
  };

  // Filtrer les événements natifs en fonction de la période
  const filteredNativeEvents = nativeEvents.filter(isNativeEventInPeriod);

  const matchesCategory = (event: POI, keywords: string[] | undefined) => {
    if (!keywords) return true; // si aucun mot-clé, tout correspond
    return keywords.some(keyword =>
      event['rdfs:label']['fr'][0].toLowerCase().includes(keyword) ||
      event.hasDescription?.[0]?.['dc:description']?.fr?.[0].toLowerCase().includes(keyword) ||
      event.hasTheme?.some(theme => theme['rdfs:label']['fr'][0].toLowerCase().includes(keyword))
    );
  };

  const handleCategoryChange = (category: string) => {
    console.log("Catégorie sélectionnée:", category);
    console.log("Mots-clés de la catégorie: ", categories.find((c: { id: string; }) => c.id === category)?.keywords);
    console.log("Événements filtrés: ", filteredEvents);
    setActiveCategory(category);
  };

  const poisFiltres = events.filter(event => {
    const dateDebut = new Date(formatDate(searchStartDate || currentDate()));
    const dateFin = searchEndDate ? new Date(formatDate(searchEndDate)) : new Date(defaultEndDate());
    const inTimeFrame = isEventInPeriod(event, dateDebut, dateFin);
    const label = event['rdfs:label']?.fr?.[0];
    const description = event['hasDescription']?.[0]?.['dc:description']?.fr?.[0];
    const latitude = event['isLocatedAt']?.[0]?.['schema:geo']?.['schema:latitude'];
    const longitude = event['isLocatedAt']?.[0]?.['schema:geo']?.['schema:longitude'];

    if (!label || !description || !latitude || !longitude) {
      return false; // Ne pas inclure ce POI si l'une des propriétés est manquante
    }

    const matchesCategoryKeywords = matchesCategory(event, categories.find(c => c.id === activeCategory)?.keywords);
    const queryMatch = searchQuery.toLowerCase();
    const matchesQuery = event['rdfs:label']?.fr?.[0]?.toLowerCase().includes(queryMatch) ||
                          event.hasDescription?.[0]?.['dc:description']?.fr?.[0]?.toLowerCase().includes(queryMatch);
    const codePostalValide = estCodePostalValide(getCodePostal(event));

    return inTimeFrame && matchesCategoryKeywords && codePostalValide && (searchQuery ? matchesQuery : true);
  });

  // Création de marqueurs pour les événements natifs
  const nativeEventMarkers = filteredNativeEvents.map((event: NativeEvent, index: any) => {
    if (event.location && event.location.latitude && event.location.longitude) {
      // Préparation des données pour le rendu
      const { latitude, longitude } = event.location;
      const formattedStartDate = formatNativeDate(event.startDate);
      const formattedEndDate = formatNativeDate(event.endDate);
      const displayDate = formattedStartDate === formattedEndDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;
      const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
      const poster = event.photoUrl || defaultImageUrl;
      const posterUrl = Array.isArray(poster) ? poster[0] : poster;
      const description = event.description || '';

      const cardVariants = {
        hidden: { y: 300 },
        visible: { y: 0 }
      };

      return (
        <Marker
          key={`${event.eventID}-${index}`}
          position={[latitude, longitude]}
          eventHandlers={{
            click: () => centerMapOnNativeMarker(event),
          }}
          icon={mapMarker}
        >
          <Popup className='leaflet-popup-container'>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="custom-popup-container"
              onClick={() => handleNativeMarkerClick(event)}
            >
              <div className="custom-popup-image-container">
                <Image
                  src={posterUrl}
                  alt={event.name}
                  width={240}
                  height={270}
                  className="custom-popup-image"
                />
              </div>
              <div className="custom-popup-content">
                <h2 className="custom-popup-title">{event.name}</h2>
                <p className="custom-popup-description">
                  {description}
                </p>
                <p className="custom-popup-address">
                  {event.location.address || 'Adresse inconnue'}, {event.location.postalCode} {event.location.city}
                </p>
                <p className="custom-popup-date">
                  {displayDate}
                </p>
                <button className="custom-view-more-button">
                  Voir plus
                </button>
              </div>
            </motion.div>
          </Popup>
        </Marker>
      );
    }
    return null;
  });

  // Formatage de la date en format français
  const frenchFormatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Création des clusters pour les marqueurs
  const createWazaaClusterIcon = (cluster: any) => {
    const count = cluster.getChildCount(); // Obtenir le nombre de marqueurs dans le cluster
    let size = 'small';
    if (count > 10) size = 'medium';
    if (count > 20) size = 'large';

    // Créer une icône personnalisée
    return L.divIcon({
      html: `<div class="${size}-cluster pulse-cluster"><span class="cluster-count">${count}</span></div>`,
      className: 'wazaa-cluster ', // Classe CSS personnalisée pour le style
    });
  };

  return (
    <>
      <Head>
        <title>WAZAA - un monde d&apos;événements autour de vous</title>
        <link rel="canonical" href="https://www.wazaa.app/" />
        <meta name="description" content="Plongez dans un univers d'événements près de chez vous ! Explorez dès maintenant une mosaïque d'expériences uniques, musicales, culturelles, touristiques et bien d'autres avec Wazaa !" />
        <meta property="og:title" content="WAZAA - un monde d'événements autour de vous" />
        <meta property="og:description" content="Plongez dans un univers d'événements près de chez vous ! Explorez dès maintenant une mosaïque d'expériences uniques, musicales, culturelles, touristiques et bien d'autres avec Wazaa !" />
        <meta property="og:url" content="https://www.wazaa.app/" />
        <meta property="og:image" content="%PUBLIC_URL%/og-image.png" />
        <meta property="og:image:secure_url" content="%PUBLIC_URL%/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="WAZAA - un monde d'événements autour de vous" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="WAZAA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@wazaa_app" />
        <meta name="twitter:creator" content="@wazaa_app" />
        <meta name="twitter:title" content="WAZAA - un monde d'événements autour de vous" />
        <meta name="twitter:description" content="Plongez dans un univers d'événements près de chez vous ! Explorez dès maintenant une mosaïque d'expériences uniques, musicales, culturelles, touristiques et bien d'autres avec Wazaa !" />
        <meta name="twitter:image" content="%PUBLIC_URL%/og-image.png" />
        <meta name="twitter:image:alt" content="WAZAA - un monde d'événements autour de vous" />
        <meta name="twitter:url" content="https://www.wazaa.app/" />
        <meta name="twitter:domain" content="wazaa.app" />

        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          rel="stylesheet"
        />
      </Head>
        <CategoryProvider onCategoryChange={handleCategoryChange}>
          <EventFilterBar />
        </CategoryProvider>
        <LoadingAnimation isLoading={isLoading} />
        <h1 className="h1-visually-hidden">WAZAA - Un monde d&apos;événements autour de vous</h1>
        <ListViewToggle onToggle={toggleListView} />
        {isListViewVisible && (
          <>
            <div className="list-item_overlay"></div>
            <ListView
              isVisible={isListViewVisible}
              events={poisFiltres}
              nativeEvents={filteredNativeEvents}
              onEventClick={updateSelectedEvent} />
          </>
        )}
        <SideMenu />
        <WelcomeScreen />

        <MapContainer
          center={position}
          zoom={12}
          ref={mapRef}
          className="map-container"
        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/hervemake/clu1zgvkj00p601qsgono9buy/tiles/{z}/{x}/{y}?access_token={accessToken}"
            accessToken="pk.eyJ1IjoiaGVydmVtYWtlIiwiYSI6ImNsdTF4YWJwdDBwbGQyanBycWNhNTVwYXYifQ.-5kyVD1mw6czBW4orrodwg"
          />

          <DateDisplay startDate={formattedStartDate} endDate={formattedEndDate} />
          <SearchEventsButton setIsLoading={setIsLoading} />
          <UpdateMapRef mapRef={mapRef} />
          <InitializeMapEvents />

          <MarkerClusterGroup
              chunkedLoading={true} // Chargement par lots
              zoomToBoundsOnClick={true} // Zoom sur le groupe de marqueurs au clic
              spiderfyOnMaxZoom={true} // Affiche les marqueurs au zoom maximum
              showCoverageOnHover={false} // Affiche la zone de couverture au survol
              // removeOutsideVisibleBounds={true}
              maxClusterRadius={30} // Rayon maximum du regroupement
              spiderfyDistanceMultiplier={2} // Distance entre les marqueurs regroupés
              disableClusteringAtZoom={18} // Désactive le regroupement à partir de ce niveau de zoom
              iconCreateFunction={createWazaaClusterIcon} // Fonction pour créer une icône de regroupement personnalisée
          >
            {poisFiltres.map((poi, index) => {
              const latitude = parseFloat(poi['isLocatedAt'][0]['schema:geo']['schema:latitude']);
              const longitude = parseFloat(poi['isLocatedAt'][0]['schema:geo']['schema:longitude']);
              // const isActive = selectedPoi && selectedPoi['@id'] === poi['@id'];
              // const markerClassName = isActive ? "animated-marker" : "standard-marker";
              /* const customIcon = new L.Icon({
                ...mapMarker.options, // Réutilise les options existantes
                className: markerClassName // Changer la classe dynamiquement
              }); */
              const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
              const poster = poi['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;
              const posterUrl = Array.isArray(poster) ? poster[0] : poster;

              let displayDescription = poi['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || '';
              const DESCRIPTION_LIMIT = 100;
              if (displayDescription.length > DESCRIPTION_LIMIT) {
                displayDescription = displayDescription.substring(0, DESCRIPTION_LIMIT) + '...';
              }
              const formattedStartDate = frenchFormatDate(poi['schema:startDate']?.[0]);
              const formattedEndDate = frenchFormatDate(poi['schema:endDate']?.[0]);

              // Détermine si les dates de début et de fin sont identiques
              const isSameDate = poi['schema:startDate']?.[0] === poi['schema:endDate']?.[0];
              const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;

              const cardVariants = {
                hidden: { y: 300 },
                visible: { y: 0 }
              };

              if (!isNaN(latitude) && !isNaN(longitude)) {
                return (
                  <Marker
                    key={`${poi['@id']}-${index}`}
                    eventHandlers={{
                      click: () => centerMapOnMarker(poi),
                    }}
                    position={[latitude, longitude]}
                    icon={mapMarker}
                    >
                    <Popup className='leaflet-popup-container'>
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={cardVariants}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        className="custom-popup-container"
                        onClick={() => handleMarkerClick(poi)}
                      >
                        <div className="custom-popup-image-container">
                          <Image
                            src={posterUrl}
                            alt={poi['rdfs:label']['fr'][0]}
                            width={240}
                            height={270}
                            className="custom-popup-image"
                          />
                        </div>
                        <div className="custom-popup-content">
                          <h2 className="custom-popup-title">{poi['rdfs:label']['fr'][0]}</h2>
                          <p className="custom-popup-description">
                            {displayDescription}
                          </p>
                          <div className="custom-popup_infos">
                            <div className="custom-popup-info-item">
                              <i className="fas fa-map-marker-alt custom-popup-icon"></i>
                              <p className="custom-popup-address">
                                {poi['isLocatedAt']?.[0]?.['schema:address']?.[0]?.['schema:addressLocality'] || 'Localité inconnue'}
                              </p>
                            </div>
                            <div className="custom-popup-info-item">
                              <i className="fas fa-calendar-alt custom-popup-icon"></i>
                              <p className="custom-popup-date">
                                {displayDate}
                              </p>
                            </div>
                          </div>
                          <button className="custom-view-more-button">
                            Voir plus
                          </button>
                        </div>
                      </motion.div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
            {nativeEventMarkers}
          </MarkerClusterGroup>
          {/*
          <button className="map_responsive-create-event-button" onClick={() => navigate('/evenement')}>
            <i className="fas fa-plus"></i>
          </button> */}
        </MapContainer>
        <MobileMenu toggleListView={toggleListView} />
        {renderDetailsPopup()}
        {showDetails && selectedNativeEvent && (
          <NativeMapDetailsPopup
            eventData={selectedNativeEvent}
            isNativeMapDetailsPopup={showDetails}
            onClose={() => setShowDetails(false)}
            onResetSelectedEvent={() => setSelectedNativeEvent(null)}
          />
        )}
        {showDetails && selectedPoi && (
          <EventDetails/>
        )}
    </>
  );
}
