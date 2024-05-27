import React, { useEffect, useRef } from 'react';
import axios from 'axios';

interface LottieLoupeProps {
  animationUrl: string;
}

const LottieLoupe: React.FC<LottieLoupeProps> = ({ animationUrl }) => {
  const animationContainer = useRef<HTMLDivElement | null>(null);
  const lottieInstance = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnimation = async () => {
      try {
        const response = await axios.get(animationUrl);
        const animationData = response.data;

        if (isMounted && animationContainer.current && animationData) {
          const Lottie = (await import('lottie-web')).default;
          lottieInstance.current = Lottie.loadAnimation({
            container: animationContainer.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData,
          });
        }
      } catch (error) {
        console.error('Error loading animation data:', error);
      }
    };

    loadAnimation();

    return () => {
      isMounted = false;
      if (lottieInstance.current) {
        lottieInstance.current.destroy();
        lottieInstance.current = null;
      }
    };
  }, [animationUrl]);

  return <div ref={animationContainer} className="advSearch_lottie-loupe" />;
};

export default LottieLoupe;
