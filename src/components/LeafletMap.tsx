// src/components/LeafletMap.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { POI, useEvents } from '../contexts/EventContext';
import { NativeEvent, useNativeEvents } from '../contexts/NativeEventContext';
import { usePathname } from 'next/navigation';
import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSearch } from '../contexts/EventFilter';
import { categories } from '../components/EventFilterBar.client';
import { CategoryProvider } from '../contexts/CategoryChangeContext';
import dynamic from 'next/dynamic';

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), { ssr: false });
const NativeMapDetailsPopup = dynamic(() => import('../components/NativeMapDetailsPopup.client'), { ssr: false });
const LoadingAnimation = dynamic(() => import('../components/WazaaLoading'), { ssr: false });
const ListViewToggle = dynamic(() => import('../components/ListToggleView'), { ssr: false });
const ListView = dynamic(() => import('../components/ListView'), { ssr: false });
const SideMenu = dynamic(() => import('../components/SideMenu'), { ssr: false });
const WelcomeScreen = dynamic(() => import('../components/WelcomeScreen'), { ssr: false });
const MobileMenu = dynamic(() => import('../components/MobileMenu'), { ssr: false });
const DateDisplay = dynamic(() => import('../components/DateDisplay'), { ssr: false });
const EventFilterBar = dynamic(() => import('../components/EventFilterBar.client'), { ssr: false });
const SearchEventsButton = dynamic(() => import('../components/SearchEventsButton'), { ssr: false });
const InitializeMapEvents = dynamic(() => import('../components/InitializeMapEvents'), { ssr: false });
const UpdateMapRef = dynamic(() => import('../components/UpdateMapRef'), { ssr: false });
const EventDetailsMapPopup = dynamic(() => import('../components/EventDetailsMapPopup'), { ssr: false });

const mapMarker = new L.Icon({
  iconUrl: '/map-marker.svg',
  iconRetinaUrl: '/map-marker.svg',
  iconAnchor: [12, 55],
  popupAnchor: [-18, -40],
  iconSize: [25, 55],
  className: 'map-marker'
});

export default function Map() {
  console.log("Map component rendered.");

  const position: [number, number] = useMemo(() => [43.4833, -1.4833], []); // Coordonnées par défaut
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedNativeEvent, setSelectedNativeEvent] = useState<NativeEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListViewVisible, setIsListViewVisible] = useState(false);
  const { searchStartDate, searchEndDate, searchQuery } = useSearch();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredEvents] = useState<POI[]>([]);
  const location = usePathname();
  const [, setCurrentPath] = useState(location);
  const { events } = useEvents();
  const { nativeEvents } = useNativeEvents();
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const listViewRef = useRef<HTMLDivElement>(null);
  const listViewToggleRef = useRef<HTMLDivElement>(null);
  const detailPopupRef = useRef<HTMLDivElement>(null);
  const topOfPopup = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Gérer la fermeture de la vue liste lorsqu'on clique en dehors de la popup ou du bouton de bascule
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (detailPopupRef.current && detailPopupRef.current.contains(event.target as Node)) ||
        (listViewToggleRef.current && listViewToggleRef.current.contains(event.target as Node)) ||
        (listViewRef.current && listViewRef.current.contains(event.target as Node))
      ) {
        // Ne pas fermer si on clique à l'intérieur de la popup de détails, sur le bouton de basculement ou à l'intérieur de la vue liste
        return;
      }
      // Fermer la vue liste et les détails
      setShowDetails(false);
      setIsListViewVisible(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails, isListViewVisible]);

  // Met à jour les détails de l'événement en fonction de l'URL
  useEffect(() => {
    if (location) {
      const path = location;
      const eventId = path.split('/event/')[1];
      if (eventId) {
        // Vérifier si l'événement existe et ouvrir la popup
        const event = events.find(e => e['@id'].includes(eventId));
        if (event && selectedPoi !== event) { // Ajouter cette vérification
          setSelectedPoi(event);
          setShowDetails(true);
        }
      }
      setCurrentPath(path);
    }
  }, [location, events, selectedPoi]);

  // Ferme les détails de l'événement
  const handleCloseDetails = useCallback((event: React.MouseEvent) => {
    console.log("handleCloseDetails called in Map component.");
    event.stopPropagation();
    if (showDetails) {
      setShowDetails(false);
      if (window.history.state && window.history.state.eventPopup) {
        console.log("Navigating back in history in Map component.");
        window.history.back();
      }
    }
  }, [showDetails]);

  // Ferme les détails de l'événement si l'utilisateur clique sur le bouton "Retour"
  useEffect(() => {
    console.log("useEffect for handleOutsideClick is called in Map component.");

    const handleOutsideClick = (event: MouseEvent) => {
      if (showDetails && topOfPopup.current && !topOfPopup.current.contains(event.target as Node)) {
        console.log("Outside click detected, closing details in Map component.");
        handleCloseDetails(event as unknown as React.MouseEvent);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleCloseDetails, showDetails]);

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

  // Formatage des lettres accentuées pour les URL
  const removeAccents = useCallback((str: string) => {
    const accents =
      'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut =
      'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';

    return str.split('').map((letter: string, index: number) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');
  }, []);

  // Création d'un slug pour l'événement
  const createEventSlug = useCallback((eventName: string) => {
    const noAccents = removeAccents(eventName);
    return noAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  }, [removeAccents]);

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
        console.error("Latitude ou longitude non définie.");
      }
    }
  };

  // Gestion de l'événement de clic sur le marqueur natif
  const handleNativeMarkerClick = useCallback((nativeEvent: NativeEvent) => {
    const eventName = nativeEvent.name;
    const eventId = nativeEvent.eventID;
    const eventSlug = createEventSlug(eventName);
    const city = nativeEvent.location?.city;
    const citySlug = city ? createEventSlug(city) : 'evenement';

    // Utiliser window.history.pushState uniquement si la vue liste n'est pas visible
    if (!isListViewVisible) {
      window.history.pushState({ eventPopup: true }, '', `/events/${citySlug}/${eventSlug}/${eventId}`);
    }
    setSelectedNativeEvent(nativeEvent);
    setShowDetails(true);
  }, [createEventSlug, isListViewVisible]);

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
  const handleMarkerClick = useCallback((poi: POI) => {
    const eventName = poi['rdfs:label']?.fr?.[0] || '';
    const eventId = poi['@id'].split('/').pop();
    const eventSlug = createEventSlug(eventName);
    const city = poi.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
    const citySlug = city ? createEventSlug(city) : 'evenement';

    // Utiliser window.history.pushState uniquement si la vue liste n'est pas visible
    if (!isListViewVisible) {
      window.history.pushState({ eventPopup: true }, '', `/event/${citySlug}/${eventSlug}/${eventId}`);
    }
    setSelectedPoi(poi);
    setShowDetails(true);
  }, [createEventSlug, isListViewVisible]);

  // Basculer entre la vue liste et la vue carte
  const toggleListView = useCallback((isListView: boolean) => {
    setIsListViewVisible(isListView);
  }, []);

  const updateSelectedEvent = useCallback((event: POI | NativeEvent) => {
    if ('@id' in event) { // Si c'est un POI
      setSelectedPoi(event);
      setShowDetails(true);
    } else { // Si c'est un NativeEvent
      setSelectedNativeEvent(event);
      setShowDetails(true);
    }
  }, []);

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
  const formattedStartDate = useMemo(() => new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }), [startDate]);
  const formattedEndDate = useMemo(() => new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }), [endDate]);

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
      <header className="map-title-container">
        <h1 className="map-title">WAZAA</h1>
        <h2 className="map-title">, un monde d&apos;événements autour de vous</h2>
      </header>
      <CategoryProvider onCategoryChange={handleCategoryChange}>
        <EventFilterBar />
      </CategoryProvider>
      <LoadingAnimation isLoading={isLoading} />
      <ListViewToggle onToggle={toggleListView} ref={listViewToggleRef} />
      {isListViewVisible && (
        <>
          <div className="list-item_overlay"></div>
          <div ref={listViewRef}>
            <ListView
              isVisible={isListViewVisible}
              events={poisFiltres}
              nativeEvents={filteredNativeEvents}
              onEventClick={updateSelectedEvent}
            />
          </div>
        </>
      )}
      <SideMenu />
      <WelcomeScreen />

        <MapContainer
          center={position}
          zoom={11}
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
        {showDetails && selectedPoi && (
          <div ref={detailPopupRef}> {/* Ajout de la référence */}
            <EventDetailsMapPopup
              selectedPoi={selectedPoi}
              setShowDetails={setShowDetails}
              isListViewVisible={isListViewVisible}
            />
          </div>
        )}
        {showDetails && selectedNativeEvent && (
          <div ref={detailPopupRef}> {/* Ajout de la référence */}
            <NativeMapDetailsPopup
              eventData={selectedNativeEvent}
              isNativeMapDetailsPopup={showDetails}
              onClose={() => setShowDetails(false)}
              onResetSelectedEvent={() => setSelectedNativeEvent(null)}
            />
          </div>
        )}
    </>
  );
}
