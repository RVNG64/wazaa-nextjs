import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieLikeTindaBtnProps {
  animationData: any;
}

const LottieLikeTindaBtn: React.FC<LottieLikeTindaBtnProps> = ({ animationData }) => {
  const animationContainer = useRef(null);

  useEffect(() => {
    if (animationContainer.current) {
      const anim = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData
      });

      return () => anim.destroy(); // Nettoyer l'animation à la désallocation
    }
  }, [animationData]);

  return <div ref={animationContainer} className="tindaSwipe_lottie-like-tinda-btn" />;
};

export default LottieLikeTindaBtn;
