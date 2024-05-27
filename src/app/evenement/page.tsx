// src/app/evenement/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../utils/firebase';
import { faUsers, faLock, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';

const LottieAnimation = dynamic(() => import('../../components/lotties/LottieMarkerEventCreation'), { ssr: false });
const FontAwesomeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../components/ScrollToTopButton'), { ssr: false });

const ROUTES = {
  // PUBLIC_EVENT_CREATION: '/creation-evenement-public',
  // PRIVATE_EVENT_CREATION: '/creation-evenement-prive',
  PUBLIC_EVENT_CREATION: '/creation-evenement',
  PRIVATE_EVENT_CREATION: '/creation-evenement',
  PRO_SIGN_IN: '/connexion-pro',
  PRIVATE_SIGN_IN: '/connexion'
};

const NewEvents = () => {
  const [eventType, setEventType] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const animationData = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627156/Animation_-_1708647580453_oarpqk.json';
  const calendarData = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627386/Calendar_-_1712091697562_amlidv.json';
  const [, setCurrentAnimation] = useState<any>(animationData);
  const [screenAnimation, setScreenAnimation] = useState('screen-start');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const publicDisabledTooltip = "Inscrivez-vous en tant que professionnels pour créer un événement public.";
  const [userType, setUserType] = useState('');
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  const fetchUserType = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const response = await axios.get(`/api/users/${auth.currentUser.uid}`);
        console.log('Réponse de la récupération du profil utilisateur:', response.data);
        if (response.data && response.data.type) {
          console.log('Type de l\'utilisateur:', response.data.type);
          setUserType(response.data.type);
          console.log('Type de l\'utilisateur après la récupération:', response.data.type); // Utilisation de response.data.type
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserType();
    }
  }, [fetchUserType]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => setLoggedIn(!!user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Cela déclenche l'animation lorsque le composant est monté
    setScreenAnimation('screen-end');
  }, []);

  const toggleTooltip = (id: string) => {
    setShowTooltip(showTooltip === id ? null : id);
  };

  const navigateToEventCreation = (isPublicEvent: boolean) => {
    const route = isPublicEvent ? ROUTES.PUBLIC_EVENT_CREATION : ROUTES.PRIVATE_EVENT_CREATION;
    navigate(route);
  };

  const navigateToSignIn = (isProAccount: boolean) => {
    const route = isProAccount ? ROUTES.PRO_SIGN_IN : ROUTES.PRIVATE_SIGN_IN;
    navigate(route);
  };

  const handleEventTypeSelection = (type: string) => {
    setEventType(type);
    setCurrentAnimation(type === 'PRIVE' ? calendarData : animationData);

    if (loggedIn) {
      // Si l'utilisateur est connecté
      if (type === 'PRIVE') {
        // Redirection vers la création d'événement privé
        navigateToEventCreation(false);
      } else {
        // Pour un événement public, redirection vers la connexion PRO
        navigateToEventCreation(true);
      }
    } else {
      // Si l'utilisateur n'est pas connecté
      if (type === 'PUBLIC') {
        navigateToSignIn(true); // Redirection vers la connexion PRO pour les événements publics
      }
      // Aucune logique n'est nécessaire ici pour 'PRIVE', car le bouton de connexion s'affiche déjà dans ce cas
    }
  };

  const handleAccountTypeSelection = (type: string) => {
    navigateToSignIn(type === 'PRO');
  };

  return (
    <div className={`new-event-container ${screenAnimation}`}>
      <h1>Créer un nouvel événement</h1>
      <div className="new-event_content-wrapper">
        <div className="new-event_animation-section">
          <LottieAnimation animationUrl={calendarData} />
        </div>
        <div className="new-event_buttons-section">
          {eventType === '' && (
            <>
              <div className="new-event_tooltip">
                <button
                  onClick={() => handleEventTypeSelection('PUBLIC')}
                  className={`new-event_btn-particulier ${userType !== 'organizer' ? 'new-event_disabled' : ''}`}
                  disabled={userType !== 'organizer'}
                >
                  <FontAwesomeIcon icon={faUsers} /> Public
                </button>
                <FontAwesomeIcon icon={faQuestionCircle} onClick={() => toggleTooltip('public')} />
                {showTooltip === 'public' && <span className="new-event_tooltiptext">Un événement ouvert à tous, comme des festivals ou des concerts.</span>}
                {userType !== 'organizer' && <span className="new-event_disabled-tooltip">{publicDisabledTooltip}</span>}
              </div>
              <div className="new-event_tooltip">
                <button onClick={() => handleEventTypeSelection('PRIVE')} className="new-event_btn-pro">
                  <FontAwesomeIcon icon={faLock} /> Privé
                </button>
                <FontAwesomeIcon icon={faQuestionCircle} onClick={() => toggleTooltip('prive')} />
                {showTooltip === 'prive' && <span className="new-event_tooltiptext">Un événement sur invitation, comme des mariages ou des fêtes privées.</span>}
              </div>
            </>
          )}

          {eventType === 'PRIVE' && !loggedIn && (
            <div className="new-event-login-section">
              <h4>Connectez-vous pour créer un événement privé</h4>
              <button onClick={() => handleAccountTypeSelection('PRO')} className="new-event_btn-pro">Je suis un professionnel</button>
              <button onClick={() => handleAccountTypeSelection('PARTICULIER')} className="new-event_btn-particulier">Je suis un particulier</button>
            </div>
          )}
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default NewEvents;
