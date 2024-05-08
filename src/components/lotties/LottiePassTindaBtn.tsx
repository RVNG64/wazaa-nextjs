import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottiePassTindaBtnProps {
  animationData: any;
}

const LottiePassTindaBtn: React.FC<LottiePassTindaBtnProps> = ({ animationData }) => {
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

  return <div ref={animationContainer} className="tindaSwipe_lottie-pass-tinda-btn" />;
};

export default LottiePassTindaBtn;
