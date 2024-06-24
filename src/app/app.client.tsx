// src/app/app.client.tsx
'use client';
import React, { useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthProvider.client';
import { adVideos } from '../components/VideoAd';
import dynamic from 'next/dynamic';

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });
const CookieConsent = dynamic(() => import('react-cookie-consent'), { ssr: false });
const FontAwesomeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon), { ssr: false });
const AdBlockDetect = dynamic(() => import('../utils/AdBlockDetect'), { ssr: false });
const Popup = dynamic(() => import('../components/PopupArrival'), { ssr: false });
const SideMenu = dynamic(() => import("../components/SideMenu"), { ssr: false });
const Navbar = dynamic(() => import("../components/Navbar.client"), { ssr: false });
const Footer = dynamic(() => import("../components/Footer.client"), { ssr: false });
const VideoAd = dynamic(() => import("../components/VideoAd"), { ssr: false });

interface StyleWithCustomProperties extends React.CSSProperties {
  '--window-height'?: string;
}

function App({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [runTour, setRunTour] = useState(false);
  const [selectedAdVideo, setSelectedAdVideo] = useState('');
  const [showAd, setShowAd] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { currentUser, loading } = useContext(AuthContext);
  const location = usePathname() || '/';
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenPopup');

    if (!hasSeenPopup) {
      setTimeout(() => {
        setShowPopup(true);
      }, 6000); // 6000 ms = 6 secondes
    }
  }, []);

  const divStyle: StyleWithCustomProperties = {
    '--window-height': `${windowHeight}px`,
  };

  // Gestion de l'affichage des publicités en tenant compte du bloqueur de publicités
  useEffect(() => {
    if (!adBlockDetected) {
      const firstAdTimer = setTimeout(() => {
        setShowAd(true);
      }, 300000); // Affichage après 5 minutes

      const adVideoInterval = setInterval(() => {
        setShowAd(true);
      }, 950000); // Affichage toutes les 15 minutes

      return () => {
        clearTimeout(firstAdTimer);
        clearInterval(adVideoInterval);
      };
    }
  }, [adBlockDetected]);

  // Sélection aléatoire d'une vidéo publicitaire
  useEffect(() => {
    if (showAd && !adBlockDetected) {
      // Sélection aléatoire d'une vidéo lors de l'affichage de l'annonce
      const randomVideo = adVideos[Math.floor(Math.random() * adVideos.length)];
      setSelectedAdVideo(randomVideo.src);
    }
  }, [showAd, adBlockDetected]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // ou un loader, selon le cas
  }

  const handleAdVideoCloseAd = () => {
    setShowAd(false);
  };

  const handleAdBlockDetected = () => {
    setAdBlockDetected(true);
    setShowAd(false); // Ne pas afficher la publicité si un bloqueur est détecté
  };

  const handleAdBlockNotDetected = () => {
    setAdBlockDetected(false);
  };

  const steps = [
    {
      target: '.App',
      content: 'Bienvenue sur Wazaa! La toute nouvelle plateforme pour ne plus rien rater des événements autour de vous.',
      disableBeacon: true,
    },
    {
      target: '.map-container',
      content: 'Voici le coeur de Wazaa: la carte interactive. Vous pouvez y retrouver les événements autour de vous. Uniquement dans le Sud-Ouest pour le moment. Bientôt à Bordeaux... et dans toute la France!',
      disableBeacon: true,
    },
    {
      target: '.map-container',
      content: 'Lorsque vous vous déplacerez sur la carte, vous verrez apparaître le bouton "Chercher dans cette zone" dans le coin supérieur droit de la carte. Cliquez dessus pour voir les événements dans cette zone.',
      disableBeacon: true,
    },
    {
      target: '.map-container',
      content: 'Cliquez sur les marqueurs pour voir les aperçus des événements.',
      disableBeacon: true,
    },
    {
      target: '.map-container',
      content: 'En cliquant sur un aperçu, vous pourrez voir plus de détails sur l\'événement, le partager, ou l\'ajouter à vos favoris.',
      disableBeacon: true,
    },
    {
      target: '.search-icon',
      content: 'Ici, vous pouvez filtrer les événements sur la carte par date.',
      disableBeacon: true,
    },
    {
      target: '.mobile-menu_container',
      content: 'A présent, découvrons ensemble votre menu.',
      disableBeacon: true,
    },
    {
      target: '.mobile-menu_container',
      content: 'Ici, vous pourrez aux fonctionnalités principales de Wazaa.',
      disableBeacon: true,
    },
    {
      target: '.mobile-menu_container',
      content: 'De gauche à droite: nous contacter, la recherche avancée, la création d\'événements, vos favoris, et basculer entre la vue carte et liste.',
      disableBeacon: true,
    },
    {
      target: '.burger-menu-btn',
      content: 'Dans cette section, accédez notamment à votre profil, à vos événements, et à la FAQ.',
      disableBeacon: true,
    },
    {
      target: '.burger-menu-btn',
      content: 'C\'est également ici que vous pouvez vous inscrire et vous connecter. Nous vous conseillons bien sûr de créer un compte gratuitement pour profiter pleinement de toutes les fonctionnalités de Wazaa.',
      disableBeacon: true,
    },
    {
      target: '.App',
      content: 'C\'est tout pour le tutoriel. A nous de vous souhaiter une bonne exploration de votre univers Wazaa: cet outil est le vôtre, bonne découverte !',
      disableBeacon: true,
    },
    // ... autres étapes ...
  ];

  const joyrideStyles = {
    options: {
      arrowColor: '#F0F8FF',
      backgroundColor: '#F0F8FF',
      overlayColor: 'rgba(79, 26, 0, 0.4)',
      primaryColor: '#000',
      textColor: '#007AFF',
      width: 900,
      zIndex: 1000,
    },
    tooltip: {
      fontSize: '1.2em',
      borderRadius: '8px',
      backgroundColor: '#F0F8FF',
      primaryColor: '#000',
    },
    buttonClose: {
      color: '#007AFF',
    },
    buttonNext: {
      backgroundColor: '#007AFF',
      borderRadius: '5px',
      color: '#F0F8FF',
    },
    buttonBack: {
      backgroundColor: '#007AFF',
      borderRadius: '5px',
      color: '#F0F8FF',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  };

  const handlePathChange = (path: string) => {
    if (currentPath !== path) {
      setCurrentPath(path);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    localStorage.setItem('hasSeenPopup', 'true');
  };

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    console.log(status);
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false);
    }
  };

  // Fonction pour démarrer le tutoriel
  const startTour = () => {
    setRunTour(true);
  };

  if (loading) {
    return null; // Remplacer par un loader/spinner si nécessaire
  }

  return (
    <>
      <div className="App" style={divStyle}>
        {currentPath === '/' && (
          <button
            className="start-tour-button"
            onClick={startTour}
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span className="tour-text">{isHovering ? "Démarrer le tutoriel" : ""}</span>
          </button>
        )}
        {/* Joyride configuration */}
        {currentPath === '/' && isClient &&
          <Joyride
            run={runTour}
            steps={steps}
            showSkipButton={true}
            styles={joyrideStyles}
            continuous={true}
            scrollToFirstStep={true}
            disableOverlayClose={true}
            showProgress={true}
            spotlightClicks={true}
            spotlightPadding={2}
            callback={handleJoyrideCallback}
          />
        }
        <Navbar onPathChange={handlePathChange} />
        <SideMenu />
        {children}
        {currentPath !== "/" && currentPath !== "/match" && <Footer />}
        {showAd && !adBlockDetected && (
          <VideoAd videoSrc={selectedAdVideo} onClose={handleAdVideoCloseAd} />
        )}
        <Popup show={showPopup} onClose={handleClosePopup} />
        <AdBlockDetect onDetected={handleAdBlockDetected} onNotDetected={handleAdBlockNotDetected} />
        <CookieConsent
          location="top"
          buttonText="J'accepte"
          declineButtonText="Je refuse"
          enableDeclineButton
          cookieName="wazaaCookieConsent"
          style={{
            background: "rgba(0, 0, 0, 1)",
            animation: "slide-down 1s ease-in-out",
            zIndex: 5000,
            padding: '20px',
            fontSize: '16px',
            width: '100%', // Responsive width
            left: '50%',
            textAlign: 'left',
            transform: 'translateX(-50%)',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          buttonStyle={{ color: "#fff", fontSize: "15px", background: "#4CAF50", padding: '10px 20px', borderRadius: '5px', textAlign: 'center' }}
          declineButtonStyle={{ background: "transparent", border: "none", color: '#efefef', fontSize: '15px', textAlign: 'center' }}
          expires={150}
          onDecline={() => {
            console.log('Cookies non acceptés');
          }}
        >
          Hello! Nous utilisons des cookies pour pimenter votre expérience sur Wazaa.<br />
          Acceptez pour naviguer avec style.{" "}
          <a href="/mentions-legales"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "underline",
              color: '#FFC107', // Or any other color you prefer
              fontSize: '15px'
            }}>
            En savoir plus
          </a>
        </CookieConsent>
      </div>
    </>
  );
}

export default App;
