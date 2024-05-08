import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieAlertBlueProps {
  animationData: any;
}

const LottieAlertBlue: React.FC<LottieAlertBlueProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="popup-arrival_lottie-alert-blue" />;
};

export default LottieAlertBlue;
