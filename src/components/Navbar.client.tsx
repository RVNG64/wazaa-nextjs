'use client'
// src/components/Navbar.client.tsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import '../utils/firebase';
import ReactDatePicker from 'react-datepicker';
import { AuthContext } from '../contexts/AuthProvider.client';
import { useSearch } from '../contexts/EventFilter';
import { motion } from 'framer-motion';
import LottieCalendarMobile from './lotties/LottieCalendarMobile';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';

const Image = dynamic(() => import('next/image'), { ssr: false });

const EventFilter = ({ showEventFilter }: { showEventFilter: boolean }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { setSearchStartDate, setSearchEndDate } = useSearch();

  // Calcul des dates par défaut
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 6);

  // États pour les dates de début et de fin
  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDateState, setEndDateState] = useState<Date | null>(endDate);

  useEffect(() => {
    if (startDate && endDateState) {
      setSearchStartDate(startDate.toISOString().split('T')[0]);
      setSearchEndDate(endDateState.toISOString().split('T')[0]);
    }
  }, [startDate, endDateState, setSearchStartDate, setSearchEndDate]);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      setSearchStartDate(date.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDateState(date);
      setSearchEndDate(date.toISOString().split('T')[0]);
    }
  };

  return (
    <div className={`filter-container ${showEventFilter ? 'eventFilter_active' : ''}`}>
      <button onClick={() => setShowDatePicker(!showDatePicker)} className="eventFilter_date-toggle">
        Sélectionner les dates
      </button>

      {(showDatePicker || window.innerWidth <= 768) && (
        <div className="date-picker-animation-container">
          <div className="date-picker-wrapper">
            <label htmlFor="startDate" className="date-label">Du</label>
            <ReactDatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              id="startDate"
              dateFormat="dd/MM/yyyy"
              className="filter-date"
            />
          </div>
          <div className="date-picker-wrapper">
            <label htmlFor="endDate" className="date-label">Au</label>
            <ReactDatePicker
              selected={endDateState}
              onChange={handleEndDateChange}
              id="endDate"
              dateFormat="dd/MM/yyyy"
              className="filter-date"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const Navbar = ({ onPathChange }: { onPathChange: (path: string) => void }) => {
  const { currentUser } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const burgerContainerRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const route = useRouter();

  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [profilePicUrl, setProfilePicUrl] = useState("/profile.svg");
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showEventFilter, setShowEventFilter] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    // Nettoyer l'inscription en désinscrivant l'auditeur d'état d'authentification
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('Déconnecté avec succès');
      router.push('/');
    }).catch((error) => {
      console.error('Erreur de déconnexion', error);
    });
  }

  useEffect(() => {
    // Function to update screen size state
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1025);
    };

    // Set initial state
    handleResize();

    // Setup resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup listener when component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (burgerContainerRef.current && burgerContainerRef.current.contains(event.target as Node)) {
        // Clic à l'intérieur du burger container, ne fait rien
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gère la taille de l'écran pour déterminer la visibilité de EventFilter
  useEffect(() => {
    // Manage the visibility of event filter based on route and screen size
    const handleEventFilterVisibility = () => {
      if (pathname === "/") {
        setShowEventFilter(isLargeScreen);
      } else {
        setShowEventFilter(false);
      }
    };

    handleEventFilterVisibility();
  }, [pathname, isLargeScreen]);

  const handleToggleEventFilter = () => {
    // Toggle event filter for small screens on the home page
    if (pathname === "/" && !isLargeScreen) {
      setShowEventFilter(!showEventFilter);
    }
  };

  // Vérification de l'URL actuelle pour afficher ou masquer EventFilter
  useEffect(() => {
    if (onPathChange) {
      onPathChange(location.pathname);
    }
  }, [pathname, onPathChange]);

  useEffect(() => {
    if (currentUser) {
      setIsLoggedIn(true);
      fetchUserProfile(currentUser.uid);
    } else {
      setIsLoggedIn(false);
    }
  }, [currentUser]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      if (userData) {
        setProfilePicUrl(userData.profilePic || '/profile.svg');
        setUserType(userData.type);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
    }
  };

  const handleProfileRedirect = () => {
    console.log('handleProfileRedirect appelé');
    if (!currentUser) {
      console.log('Utilisateur non authentifié, redirection vers /connexion');
      router.push('/connexion');
    } else if (userType === 'organizer') {
      console.log('Redirection vers /profil-pro');
      router.push('/profil-pro');
    } else {
      console.log('Redirection vers /profil');
      router.push('/profil');
    }
  };

  const toggleMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
/*
  useEffect(() => {
    console.log("showEventFilter changed to: ", showEventFilter);
  }, [showEventFilter]);
*/

  const calendarLottie = "https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627386/Calendar_-_1712091697562_amlidv.json";
  return (
    <nav className="navbar">
      {/*}
      <video autoPlay muted loop className="wizard_video-background navbar_video-background">
        <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1679239423/FREE_4K_Light_Leak_o8bz1x.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge les vidéos HTML5.
      </video>
      */}
      <div
        className="navbar-brand"
        onClick={() => window.location.href = '/'}
      >WAZAA</div>

      {isHomePage && !isLargeScreen && (
        <div className="search-icon">
          <div
            className=""
            onClick={handleToggleEventFilter}
          >
            <LottieCalendarMobile animationUrl={calendarLottie} />
          </div>
        </div>
      )}

      {showEventFilter && <EventFilter showEventFilter={showEventFilter} />}

      {/* Icône de profil */}
      <div className="navbar__rightcontainer">
        <button className="add-event-btn" onClick={isLoggedIn ? () => router.push('/evenement') : () => router.push('/inscription-choice')}>
          {isLoggedIn ? 'Créer un événement' : 'Créer un compte gratuitement'}
        </button>
        <div className="navbar__burger-container" onClick={toggleMenu} ref={burgerContainerRef}>
          <motion.button
            className="burger-menu-btn"
            animate={isMenuOpen ? "open" : "closed"}
            variants={{
              open: { rotate: 90 },
              closed: { rotate: 0 },
            }}
          >
            <span className="burger-menu-icon"></span>
          </motion.button>
          {isMenuOpen && (
            <motion.div
              className={`dropdown-menu ${isMenuOpen ? 'show' : ''}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              ref={dropdownRef}
            >
              {isLoggedIn ? (
                <>
                  {/* <a href="/friends">Mes amis</a>
                  <a href="/chat">Messagerie</a>
                  <a href="/" className="dropdown__back-to-map">Retour à la carte</a> */}
                  <a href="/evenement">Créer un événement</a>
                  <a href="/mes-evenements">Mes événements</a>
                  <a href="/recherche-avancee">Recherche avancée</a>
                  <a onClick={handleProfileRedirect}>Profil</a>
                  <a href="/faq">FAQ</a>
                  <a href="/qui-sommes-nous">Qui sommes-nous ?</a>
                  <a href="/mentions-legales">Mentions Légales</a>
                  <a onClick={handleLogout} href="/" className="logOut">Déconnexion</a>
                </>
              ) : (
                <>
                  {/* <a href="/" className="dropdown__back-to-map">Retour à la carte</a> */}
                  <a href="/inscription-choice">Créer un compte</a>
                  <a href="/connexion-choice">Connexion</a>
                  <a href="/evenement">Créer un événement</a>
                  <a href="/qui-sommes-nous">Qui sommes-nous ?</a>
                  <a href="/faq">FAQ</a>
                  <a href="/mentions-legales">Mentions Légales</a>
                </>
              )}
            </motion.div>
          )}
        <Image src={profilePicUrl} alt="Profile" className="navbar__profile" width={40} height={40} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
