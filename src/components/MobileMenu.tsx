// src/components/MobileMenu.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LoginRequiredPopup from '../components/LoginRequiredPopup';
import ContactPopup from '../components/ContactPopup';

const MobileMenu = ({ toggleListView: parentToggleListView }: { toggleListView?: () => void }) => {
  const [isVisible, setIsVisible] = useState(window.innerWidth < 576);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isListViewActive, setIsListViewActive] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const auth = getAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth < 576);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkIfNearBottom = () => {
      if (location.pathname === '/') {
        // Sur la page d'accueil, le menu ne doit pas être caché en bas de page
        setIsNearBottom(false);
        return;
      }

      const scrolledFromTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalHeight = document.body.offsetHeight;

      if (totalHeight - (scrolledFromTop + windowHeight) < 400) {
        setIsNearBottom(true);
      } else {
        setIsNearBottom(false);
      }
    };

    window.addEventListener('scroll', checkIfNearBottom);
    return () => window.removeEventListener('scroll', checkIfNearBottom);
  }, [location.pathname]);

  const toggleContactPopup = () => {
    setShowContactPopup(!showContactPopup);
  };

  const openLoginRequiredPopup = () => {
    setShowLoginRequiredPopup(true);
  };

  const toggleListView = () => {
    setIsListViewActive(!isListViewActive);
    parentToggleListView?.();
  }

  const handleMapListViewToggle = () => {
    if (location.pathname === '/') {
      toggleListView();
    } else {
      navigate('/');
    }
  };

  if (!isVisible || isNearBottom) return null;

  return (
    <>
      <div className={`mobile-menu_container ${isNearBottom ? 'hide' : 'show'}`}>
        <button onClick={isLoggedIn ? () => navigate('/favoris') : openLoginRequiredPopup}>
          <i className="fas fa-heart"></i>
        </button>
        <button onClick={toggleContactPopup}>
          <i className="fas fa-envelope"></i>
        </button>
        <button onClick={isLoggedIn ? () => navigate('/mes-evenements') : () => navigate('/evenement')}>
          <i className="fas fa-plus"></i>
        </button>
        <button onClick={() => navigate('/recherche-avancee')}>
          <i className="fas fa-search"></i>
        </button>
        <button onClick={handleMapListViewToggle}>
          <i className={location.pathname === '/' ? (isListViewActive ? "fas fa-map" : "fas fa-list") : "fas fa-globe-americas"}></i>
        </button>
      </div>
      {showContactPopup && <ContactPopup onClose={toggleContactPopup} />}
      {showLoginRequiredPopup && <LoginRequiredPopup onClose={() => setShowLoginRequiredPopup(false)} />}
    </>
  );
};

export default MobileMenu;
