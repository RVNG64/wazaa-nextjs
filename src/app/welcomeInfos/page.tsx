import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '../../utils/firebase';
import '../styles/WelcomeInfos.css';

// Définition des types pour les étapes
type StepType = 'next' | 'options';

interface Step {
  id: string;
  type: StepType;
  message: string;
  options?: string[];
}

// Étapes pour compléter le profil de l'utilisateur
const profileCompletionSteps: Step[] = [
  {
    id: 'country',
    type: 'next',
    message: `Dans quel pays habitez-vous ?`,
  },
  {
    id: 'city',
    type: 'next',
    message: `Dans quelle ville habitez-vous ?`,
  },
  {
    id: 'gender',
    type: 'options',
    message: `Quel est votre genre?`,
    options: ['Homme', 'Femme', 'Autre'],
  },
  {
    id: 'phone',
    type: 'next',
    message: `Quel est ton numéro de téléphone ? (Aucune information n'est communiquée à des tiers)`,
  },
  {
    id: 'dob',
    type: 'options',
    message: `Quel âge avez-vous ?`,
    options: ['Moins de 18 ans', '18-24 ans', '25-34 ans', '35-44 ans', '45-54 ans', '55-et plus'],
  },
  {
    id: 'howwemet',
    type: 'options',
    message: `Comment nous avez-vous connu ?`,
    options: ['Réseaux sociaux', 'Bouche à oreille', 'Internet', 'Presse', 'Publicité', 'Evénement', 'Autre'],
  },
];

const WelcomeInfos: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [profileData, setProfileData] = useState({});
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const [user] = useState(auth.currentUser);
  const [errorMessage, setErrorMessage] = useState('');

  const validateCountry = (country: string): boolean => {
    const firstChar = country.charAt(0);
    return firstChar === firstChar.toUpperCase();
  };

  const validateCity = (city: string): boolean => {
    const firstChar = city.charAt(0);
    return firstChar === firstChar.toUpperCase();
  };

  const validateZip = (zip: string): boolean => {
    const zipRegex = /^[0-9]{2,6}$/;
    return zipRegex.test(zip);
  };

  const validateInput = (): boolean => {
    switch (currentStep.id) {
      case 'city':
        if (!validateCity(inputValue)) {
          setErrorMessage('La ville doit commencer par une lettre majuscule.');
          return false;
        }
        break;
      case 'zip':
        if (!validateZip(inputValue)) {
          setErrorMessage('Le code postal doit contenir de 2 à 6 chiffres.');
          return false;
        }
        break;
      case 'country':
        if (!validateCountry(inputValue)) {
          setErrorMessage('Le pays doit commencer par une lettre majuscule.');
          return false;
        }
        break;
      case 'phone':
        if (!validatePhoneNumber(inputValue)) {
          setErrorMessage('Le numéro de téléphone doit contenir 10 chiffres.');
          return false;
        }
        break;
      default:
        break;
    }

    setErrorMessage(''); // Clear the error message if validation succeeds
    return true;
  };

  // Passer à l'étape suivante
  const nextStep = (input: string) => {
    // Valider l'entrée de l'utilisateur
    if (!validateInput()) {
      return;
    }

    // Enregistrer les données de l'étape actuelle
    let updatedProfileData = { ...profileData, [currentStep.id]: input };

    if (currentStepIndex < profileCompletionSteps.length - 1) {
      setProfileData(updatedProfileData);
      setCurrentStepIndex(currentStepIndex + 1);
      setInputValue('');
    } else {
      // L'utilisateur a terminé la configuration du profil
      console.log("Sending data to server:", updatedProfileData);

      fetch(`/user/profileInfos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseId: user?.uid, // Pass the user's id here
          hasCompletedProfile: true,
          profileData: updatedProfileData, // Pass the profile data here
        }),
      })
      .then(() => navigate('/profil'))
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;

    // Vérifier si le numéro a 10 chiffres
    if (!phoneRegex.test(phone)) {
      return false;
    }

    // Vérifier si tous les chiffres sont identiques
    const uniqueChars = new Set(phone.split(''));
    if (uniqueChars.size === 1) {
      return false;
    }

    return true;
  };


  // Gestion des réponses de l'utilisateur
  const handleOptionClick = (option: string) => {
    console.log(`L'utilisateur a choisi : ${option}`);
    console.log(`Profil après mise à jour :`, { ...profileData, [currentStep.id]: option });
    nextStep(option);
  };

  // Gestion des réponses de l'utilisateur pour les questions ouvertes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Cette fonction sera appelée lorsque le bouton "précédent" est cliqué
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Obtenir l'étape actuelle
  const currentStep = profileCompletionSteps[currentStepIndex];

  useEffect(() => {
    console.log('Etat du profil mis à jour :', profileData);
  }, [profileData]);

  return (
    <div className="fade-in-profile-completion">
      <video autoPlay muted loop className="wizard_video-background">
        <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1679239423/FREE_4K_Light_Leak_o8bz1x.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge les vidéos HTML5.
      </video>
      <div className="profile-completion-wizard">

        {currentStepIndex > 0 && (
          <button className="completion__back-button" onClick={prevStep}>Précédent</button>
        )}
{/*
        <div className="progressBarWizard">
          <div
            className="progressBarWizard__fill"
            style={{ width: `${(currentStepIndex / profileCompletionSteps.length) * 100}%` }}
          />
        </div> */}

        <p className="profile-completion-message">{currentStep.message}</p>
        {errorMessage && <p className="completion__error-message">{errorMessage}</p>}

        {currentStep.type === 'next' ? (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="profile-completion-input"
            />
            <button className="profile-completion-button" onClick={() => nextStep(inputValue)}>Suivant</button>
          </>
        ) : (
          currentStep.options?.map(option => (
            <button key={option} className="profile-completion-button" onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default WelcomeInfos;
