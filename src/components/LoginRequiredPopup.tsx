import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const LottieCatLoader = dynamic(() => import('./lotties/LottieCatLoader'), { ssr: false });

interface LoginRequiredPopupProps {
  onClose: () => void;
}

const LoginRequiredPopup: React.FC<LoginRequiredPopupProps> = ({ onClose }) => {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  const catLoaderLottie = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716623951/Cat_Loader-_1708704667675_lgqnvt.json';

  return (
    <div className="coming-soon-popup">
      <div className="popup-details_connect-alert">
        <h2>Hey! <LottieCatLoader animationUrl={catLoaderLottie} /></h2>
        <p>Il faut être connecté pour utiliser cette fonctionnalité.</p>
        <button onClick={() => navigate('/connexion-choice')}>Connexion</button>
        <button onClick={() => navigate('/inscription-choice')}>Inscription</button>
        <button onClick={onClose} className='popup-details_connect-alert_close'>Fermer</button>
      </div>
    </div>
  );
};

export default LoginRequiredPopup;
