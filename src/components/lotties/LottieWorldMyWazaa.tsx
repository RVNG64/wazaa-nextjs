import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieWorldMyWazaaProps {
  animationData: any;
}

const LottieWorldMyWazaa: React.FC<LottieWorldMyWazaaProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="side-menu_lottie-world-animation" style={{ height: '45px', width: '45px', marginRight: '-7px' }} />;
};

export default LottieWorldMyWazaa;
