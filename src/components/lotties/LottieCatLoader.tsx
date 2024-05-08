import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieCatLoaderProps {
  animationData: any;
}

const LottieCatLoader: React.FC<LottieCatLoaderProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="cat-loader_lottie-animation" />;
};

export default LottieCatLoader;
