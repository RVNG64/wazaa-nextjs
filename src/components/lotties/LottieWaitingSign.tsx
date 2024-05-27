import React, { useEffect, useRef } from 'react';
import axios from 'axios';

interface LottieWaitingSignProps {
  animationUrl: string;
}

const LottieWaitingSign: React.FC<LottieWaitingSignProps> = ({ animationUrl }) => {
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

  return <div ref={animationContainer} className="waiting-sign_lottie-animation" />;
};

export default LottieWaitingSign;
