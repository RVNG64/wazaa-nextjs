import React from 'react';
import { useRouter } from 'next/navigation';
import LottieCatLoader from './lotties/LottieCatLoader';
import catLoaderLottie from '../assets/Cat Loader- 1708704667675.json';

interface LoginRequiredPopupProps {
  onClose: () => void;
}

const LoginRequiredPopup: React.FC<LoginRequiredPopupProps> = ({ onClose }) => {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="coming-soon-popup">
      <div className="popup-details_connect-alert">
        <h2>Hey! <LottieCatLoader animationData={catLoaderLottie} /></h2>
        <p>Il faut être connecté pour utiliser cette fonctionnalité.</p>
        <button onClick={() => navigate('/connexion-choice')}>Connexion</button>
        <button onClick={() => navigate('/inscription-choice')}>Inscription</button>
        <button onClick={onClose} className='popup-details_connect-alert_close'>Fermer</button>
      </div>
    </div>
  );
};

export default LoginRequiredPopup;
