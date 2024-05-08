import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import '../WazaaLoading/WazaaLoading.css';

interface LottieSuccessCheckProps {
  animationData: any;
}

const LottieSuccessCheck: React.FC<LottieSuccessCheckProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="event-edit_success-lottie-animation" />;
};

export default LottieSuccessCheck;
