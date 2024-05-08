import React, { useEffect, useState } from 'react';

const languages = ['Hello', 'Bonjour', 'Hola', 'Kaixo','Ciao', 'Hallo', '你好', 'こんにちは'];

const WelcomeScreen: React.FC<{ onFinished?: () => void }> = ({ onFinished }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [languageIndex, setLanguageIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2300); // Durée de l'animation

    return () => {
      clearTimeout(timer); // Nettoie le timer
    };
  }, []);

  // Lorsque l'animation est terminée, on appelle la fonction onFinished
  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000); // X seconde pour la durée de l'animation

      return () => {
        clearTimeout(timer); // Nettoie le timer
      };
    }
  }, [isAnimating]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLanguageIndex((prevIndex) => (prevIndex + 1) % languages.length);
    }, 250); // Change la langue toutes les secondes

    return () => {
      clearInterval(interval); // Nettoie l'intervalle
    };
  }, []);

  return isVisible ? (
    <div className={`entrance-screen ${isAnimating ? '' : 'closed'}`}>
      <h1 className='entrance-screen_title'>WAZAA</h1>
    </div>
  ) : null;
};

export default WelcomeScreen;
