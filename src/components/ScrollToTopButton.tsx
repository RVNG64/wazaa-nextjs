import React, { useState, useEffect } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Fonction pour gérer le défilement
  const toggleVisibility = () => {
    if (window.scrollY > 300) { // Déclenche la visibilité du bouton lorsqu'on descend de 300px
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className={`scroll-to-top-button ${isVisible ? 'visible' : ''}`}
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    )
  );
};

export default ScrollToTopButton;
