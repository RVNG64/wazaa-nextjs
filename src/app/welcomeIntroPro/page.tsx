// src/app/welcomeIntroPro/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useFetchFirstName from '../../hooks/useFetchFirstName';

// Définition des types pour les étapes
type StepType = 'next' | 'options';

interface Step {
  id: string;
  type: StepType;
  message?: string;
  getMessage?: () => string;
  options?: string[];
}

const WelcomeIntroPro: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const firstName = useFetchFirstName();
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  /*
  useEffect(() => {
    if (!auth.currentUser) {
      console.log("Aucun utilisateur n'est connecté");
    } else {
      console.log(`L'utilisateur ${auth.currentUser.uid} est connecté`);
    }
  }, [auth]);
  */

  // Étapes pour l'introduction de l'application
  const steps: Step[] = [
    {
      id: 'welcome',
      type: 'next',
      getMessage: () => `Bonjour ${firstName}, bienvenue sur Wazaa !`,
    },
    {
      id: 'continue_signup',
      type: 'next',
      message: 'Afin de finaliser votre inscription, nous allons terminer ensemble la configuration de votre compte. Cela ne prendra que deux minutes.',
    },
    {
      id: 'ready',
      type: 'options',
      message: 'Êtes-vous prêt ?',
      options: ['C\'est parti !'],
    },
  ];

  // Passer à l'étape suivante
  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsAnimating(true); // Commence l'animation
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        setIsAnimating(false); // Termine l'animation
      }, 500); // Durée de l'animation (en ms)
    } else {
      handleCompletion();
    }
  };

  // Gestion des réponses de l'utilisateur
  const handleOptionClick = (option: string) => {
    nextStep();
  };

  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex];

  // Appelé lorsque l'utilisateur a terminé l'introduction
  const handleCompletion = () => {
    navigate("/welcomeInfosPro");  // changer vers le tableau de bord
  };

  return (
    <div className="fade-in-intro-wizard">
        <video autoPlay muted loop className="wizard_video-background">
          <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1679239423/FREE_4K_Light_Leak_o8bz1x.mp4" type="video/mp4" />
          Votre navigateur ne prend pas en charge les vidéos HTML5.
        </video>

        <div className={`intro-wizard ${isAnimating ? 'animating' : ''}`}>

        <div key={currentStep.id + currentStepIndex} className="intro-wizard-message" >
          {currentStep.getMessage?.() || currentStep.message || ''}
        </div>

        {currentStep.type === 'next' ? (
          <button className="intro-wizard-button" onClick={nextStep}>Suivant</button>
        ) : (
          currentStep.options?.map(option => (
            <button key={option} className="intro-wizard-button" onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default WelcomeIntroPro;
