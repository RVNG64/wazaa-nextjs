import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';

interface VideoAdProps {
  onClose: () => void;
  videoSrc: string;
}

export const adVideos = [
  { id: 1, src: 'https://www.youtube.com/watch?v=3393O1uD_w8', title: 'La pause pub - Canal Plus' },
  { id: 2, src: 'https://www.youtube.com/watch?v=A3yBbB-4eTU&t=62s', title: 'La pause Pub - OMEGA' },
  { id: 3, src: 'https://www.youtube.com/watch?v=NoMqvniiEkk', title: 'La pause Pub - Kenzo World' },
  { id: 4, src: 'https://www.youtube.com/watch?v=Tcwtq9NrVd4', title: 'La pause Pub - iPhone 15 Plus' },
  { id: 5, src: 'https://www.youtube.com/watch?v=XpEeSsowQuM', title: 'La pause Pub - Deezer' },
  { id: 6, src: 'https://www.youtube.com/watch?time_continue=31&v=M7FIvfx5J10&embeds_referring_euri=https%3A%2F%2Flareclame.fr%2F&source_ve_path=MjM4NTE&feature=emb_title', title: 'La pause Pub - Volvo Trucks' },
  { id: 7, src: 'https://www.youtube.com/watch?v=dDTZl_3_yZI', title: 'La pause Pub - Apple TV+' },
  { id: 8, src: 'https://www.youtube.com/watch?v=eWgn9BZTuko', title: 'La pause Pub - Netflix: Ça arrive en 2024' },
  { id: 9, src: 'https://www.youtube.com/watch?v=84pFHcb6oLQ', title: 'La pause Pub - Un jour peut-être Reef fera mieux que Free.' },
  { id: 10, src: 'https://www.youtube.com/watch?v=I9doXIK-TW4', title: 'La pause Pub - Cartier' },
  { id: 11, src: 'https://www.youtube.com/watch?v=1OYi2pbNK_4', title: 'La pause Pub - Nike Women: This is us' },
  { id: 12, src: 'https://www.youtube.com/watch?v=olG2xqsmcUI', title: 'La pause Pub - Bouygues Telecom: Laura et Cédric' },
  // ... autres vidéos ...
];

const VideoAd: React.FC<VideoAdProps> = ({ onClose, videoSrc }) => {
  const [, setIsVideoLoaded] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [, setVideoEnded] = useState(false);
  const [isMuted, ] = useState(true);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const video = adVideos.find(adVideo => adVideo.src === videoSrc);
  const [countDown, setCountDown] = useState(10);
  const videoRef = useRef(null);

  // Permet à l'utilisateur de fermer la publicité après 10 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCountDown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer); // Arrête l'intervalle une fois que nous atteignons 0
          setCanClose(true);  // Permettre de fermer la publicité
          return 0;
        }
        return prevCount - 1; // Décrémenter le compteur
      });
    }, 1000); // Décrémente chaque seconde

    return () => clearInterval(timer);
  }, []);

  // Fonction pour extraire l'ID de la vidéo YouTube
  const extractYouTubeID = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : undefined;
  };

  const videoId = extractYouTubeID(videoSrc);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    event.target.mute(); // Mettre en sourdine par défaut
    setIsVideoLoaded(true);
  };

  const onPlayerError = () => {
    setIsVideoLoaded(false); // Afficher un message d'erreur
    onClose(); // Fermer la publicité en cas d'erreur
  }

  const toggleMute = () => {
    if (player) {
      if (player.isMuted()) {
        player.unMute();
      } else {
        player.mute();
      }
    }
  };

  // Options pour le lecteur YouTube
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      controls: 0, // Masque les contrôles du lecteur
      modestbranding: 1, // Masque le logo YouTube
      rel: 0, // Désactive les vidéos recommandées à la fin
      showinfo: 0, // Masque le titre de la vidéo et l'icône YouTube
      cc_load_policy: 1, // Active les sous-titres
    },
  };

  // Fonction pour fermer la publicité après la fin de la vidéo
  const onVideoEnd = () => {
    setVideoEnded(true);

    setTimeout(() => {
      onClose();
    }, 2000); // Ferme la publicité automatiquement après 2 secondes
  };

  return (
    <div className="video-ad-overlay">
      <div className="video-ad-container">
        <YouTube videoId={videoId} opts={opts} onEnd={onVideoEnd} ref={videoRef} onReady={onPlayerReady} onError={onPlayerError} />
        <div className="video-ad-info">
          <h3 className="video-ad-title">{video ? video.title : 'Publicité'}</h3>
          {canClose ? (
            <button onClick={onClose} className="video-ad-close-btn">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          ) : (
            <div className="countdown-timer">{countDown}s</div>
          )}
        </div>
        <button onClick={toggleMute} className="mute-toggle-btn">
          {isMuted ? 'Activer le son' : 'Désactiver le son'}
        </button>
      </div>
    </div>
  );
};

export default VideoAd;
