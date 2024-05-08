import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieWaitingSignProps {
  animationData: any;
}

const LottieWaitingSign: React.FC<LottieWaitingSignProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="waiting-sign_lottie-animation" />;
};

export default LottieWaitingSign;
