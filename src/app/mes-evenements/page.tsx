// src/app/mes-evenements/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../utils/firebase';
import dynamic from 'next/dynamic';

const Link = dynamic(() => import('next/link'), { ssr: false });
const Image = dynamic(() => import('next/image'), { ssr: false });
const LottieHandWaiting = dynamic(() => import('../../components/lotties/LottieHandWaiting'), { ssr: false });
const MobileMenu = dynamic(() => import('../../components/MobileMenu'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../components/ScrollToTopButton'), { ssr: false });

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

const EventsOrganized = () => {
  console.log('Composant EventsOrganized monté');
  const [events, setEvents] = useState<Event[]>([]);

  // Récupération des événements organisés par l'utilisateur connecté
  useEffect(() => {
    if (auth.currentUser) {
      let isMounted = true;
      const fetchEvents = async () => {
        try {
          const userId = auth.currentUser?.uid;
          if (userId) {
            const response = await axios.get(`/api/organized/events/${userId}`);
            const correctedEvents = response.data.map((event: Event) => ({
              ...event,
              startTime: correctTimeFormat(event.startTime),
              endTime: correctTimeFormat(event.endTime)
            }));

            const sortedEvents = correctedEvents.sort((a: Event, b: Event) => {
              const dateA = new Date(a.startDate.split('/').reverse().join('-')).getTime();
              const dateB = new Date(b.startDate.split('/').reverse().join('-')).getTime();
              return dateA - dateB;
            });

            if (isMounted) {
              setEvents(sortedEvents);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des événements:", error);
        }
      };

      if (auth.currentUser) {
        fetchEvents();
      }
      return () => { isMounted = false; };
    }
  }, []);

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

  const city = events[0]?.location?.city;
  const citySlug = city ? createEventSlug(city) : 'evenement';

  const correctTimeFormat = (timeString: string) => {
    if (!timeString) return '';
    const timePattern = /^\d{2}:\d{2}$/; // Format HH:MM
    if (timePattern.test(timeString)) {
      // Si le format est déjà correct, retourner tel quel
      return timeString;
    } else {
      // Sinon, convertir en format HH:MM
      const date = new Date(timeString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  };

  const getEventStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En cours de publication'; // Si le statut est en attente
      case 'approved':
        return 'Publié'; // Si le statut est approuvé
      case 'rejected':
        return 'Publication refusée'; // Si le statut est rejeté
      case 'default':
        return 'Non publié'; // Si le statut est par défaut
      default:
        return ''; // Statut par défaut
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

  const animationData = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627770/handWait_-_1711447749795_brjm3i.json';

  if (events.length === 0) {
    return (
      <div className="no-events_container">
        <h2 className="no-events_title">Commencez votre aventure d&apos;organisateur!</h2>
        <LottieHandWaiting animationUrl={animationData} />
        <p className="no-events_text">Vous n&apos;avez pas encore organisé d&apos;événements.
          Créez votre premier événement et partagez-le avec vos amis ou le monde entier!</p>
        <Link href="/evenement" className="no-events_create-event-button">Créer mon premier événement</Link>
      </div>
    );
  }

  const eventId = events[0].eventID;

  return (
    <div className="events-organized_container">
      <h1 className="events-organized_title">Mes Événements Organisés</h1>
      <Link href="/evenement" className="events-organized_create-event-button">
        <i className="fas fa-plus-circle"></i> Créer un Événement
      </Link>
      <div className="events-organized_list">
        {events.map(event => (
          <div key={event.eventID} className="events-organized_card">
            {event.photoUrl && <Image src={event.photoUrl} alt={event.name} className="events-organized_image" width={300} height={200} />}
            <div className="events-organized_content">
              <h3 className="events-organized_event-title">{event.name}</h3>
              <div className="events-organized_event-details">
                <p className="events-organized_event-date"><strong>Date:</strong> {event.startDate}{event.startDate !== event.endDate && ` - ${event.endDate}`}</p>
                <p className="events-organized_event-time"><strong>Horaires:</strong> {event.startTime} - {event.endTime}</p>
                <p className="events-organized_event-place"><strong>Lieu:</strong> {event.location?.address || 'Non spécifié'}</p>
                <p className="events-organized_event-status"><strong>Statut:</strong> {getEventStatus(event.validationStatus)}</p>
              </div>

              <div className="events-organized_actions">
                {/* Afficher le bouton uniquement si l'événement est approuvé */}
                {event.validationStatus === 'approved' && (
                  <a href={`/events/${citySlug}/${createEventSlug(event.name)}/${event.eventID}`} target="_blank" rel="noopener noreferrer" className="events-organized_action-button events-organized_watch-event-button">
                    Voir l&apos;Événement
                  </a>
                )}

                {/* Lien pour modifier l'événement */}
                <Link href={`/mes-evenements/modifier/${event.eventID}`} className="events-organized_action-button events-organized_publish-event-button">
                  {event.validationStatus === 'default' ? 'Publier' : 'Modifier'}
                </Link>

                {/* Lien pour aller à la page de gestion des participants */}
                <Link href={`/mes-evenements/participants/${event.eventID}`} className="events-organized_action-button events-organized_attendance-button">
                  Participants
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="advanced-search-ad-container">
        {renderAd()}
      </div>
      <ScrollToTopButton />
      <MobileMenu />
    </div>
  );
};

export default EventsOrganized;
