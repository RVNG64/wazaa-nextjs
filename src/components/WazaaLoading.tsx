import React from 'react';
import dynamic from 'next/dynamic';

const LottieWorldMapLoading = dynamic(() => import('./lotties/LottieWorldMapLoading'), { ssr: false });

const LoadingAnimation = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  const worldLottie = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627571/Earth1-_1708701894997_nerun5.json';

  return (
    <div className="loading-map-animation_overlay">
      <div className="loading-map-animation">
        <LottieWorldMapLoading animationUrl={worldLottie} />
      </div>
    </div>
  );
};

export default LoadingAnimation;
