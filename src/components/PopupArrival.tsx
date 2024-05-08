import React from 'react';
import LottieAlertBlue from './lotties/LottieAlertBlue';
import lottieAlert from '../assets/Alert popup - 1709143571071.json';

const Popup = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  if (!show) return null;

  // Gestionnaire de clic pour fermer la popup
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  return (
    <div className="popup-backdrop" onClick={handleBackdropClick}>
      <div className="popup-container" onClick={e => e.stopPropagation()}>
        <LottieAlertBlue animationData={lottieAlert} />
        <h1 className="popup-title">Bienvenue dans votre univers WAZAA !</h1>
        <p className="popup-intro">
          Imaginez un monde où chaque journée vous offre la possibilité de découvrir, à chaque coin de rue, des événements qui correspondent à vos passions et à vos centres d&apos;intérêt... En quelques clics !
        </p>
        <p className="popup-intro" style={{ fontWeight: 'bold' }}>
          Ce monde existe, et il s&apos;appelle Wazaa.
        </p>
        <p className="popup-body">
          À travers un voyage visuel et interactif, naviguez à travers une mosaïque d&apos;événements, des plus intimes aux grands rassemblements, et laissez-vous surprendre par la diversité des expériences qui s&apos;offrent à vous.
        </p>
        <p className="popup-body">
          Plongez au cœur de l&apos;action, connectez-vous aux événements qui font vibrer le monde, partagez et créez-vous des souvenirs inoubliables.
          En Famille, en amis, entre collègues ou en solo.
        </p>
        <p className="popup-body">
          En Famille, en amis, entre collègues ou en solo.
        </p>
        <p className="popup-body">
          Avec Wazaa, chaque clic vous rapproche de la découverte, de l&apos;émotion et de la convivialité.
        </p>
        <div className="popup-footer">
          <p>Prêt.e à découvrir votre monde ?</p>
        </div>
        <div className="popup-arrival_button">
          <button onClick={onClose}>Commencer l&apos;exploration de mon Wazaa</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
