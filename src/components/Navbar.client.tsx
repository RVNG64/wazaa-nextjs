'use client'
// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import '../utils/firebase';
import Image from 'next/image';
import ReactDatePicker from 'react-datepicker';
import { useSearch } from '../contexts/EventFilter';
import { motion } from 'framer-motion';
import LottieCalendarMobile from './lotties/LottieCalendarMobile';
import calendarLottie from '../assets/Calendar - 1712091697562.json';
import "react-datepicker/dist/react-datepicker.css";

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
  const isInitialLargeScreen = window.innerWidth > 768;
  const [showEventFilter, setShowEventFilter] = useState(isInitialLargeScreen);
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
    // Gestion de l'affichage de EventFilter en fonction de la route et de la taille de l'écran
    const handleEventFilterVisibility = () => {
      if (location.pathname === "/") {
        setShowEventFilter(isInitialLargeScreen);
      } else {
        setShowEventFilter(false);
      }
    };

    handleEventFilterVisibility();
  }, [location, isInitialLargeScreen]);

  const handleToggleEventFilter = () => {
    if (location.pathname === "/" && !isInitialLargeScreen) {
      setShowEventFilter(!showEventFilter);
    }
  };

  useEffect(() => {
    // Appeler onPathChange avec le chemin actuel
    onPathChange(location.pathname);
  }, [location, onPathChange]); // Réagir aux changements de location et onPathChange

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${auth.currentUser.uid}`);
          const userData = await response.json();
          if (userData) {
            setProfilePicUrl(userData.profilePic || '/profile.svg');
            setUserType(userData.type); // Stocker le type d'utilisateur (par exemple, 'user' ou 'organizer')
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil utilisateur:', error);
        }
      }
    };

    fetchUserProfile();
  }, [auth.currentUser]);

  const handleProfileRedirect = () => {
    if (userType === 'organizer') {
      router.push('/profil-pro');
    } else {
      router.push('/profil');
    }
  };

  const toggleMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    console.log("showEventFilter changed to: ", showEventFilter);
  }, [showEventFilter]);

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

      {isHomePage && !isInitialLargeScreen && (
        <div className="search-icon">
          <div
            className=""
            onClick={handleToggleEventFilter}
          >
            <LottieCalendarMobile animationData={calendarLottie} />
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
                  <a href="" onClick={handleProfileRedirect}>Profil</a>
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
