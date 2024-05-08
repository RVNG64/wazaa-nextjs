import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface AboutLottieProps {
  animationData: any;
}

const AboutLottie: React.FC<AboutLottieProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="side-menu_lottie-world-animation" style={{ height: '35px', width: '35px' }} />;
};

export default AboutLottie;
