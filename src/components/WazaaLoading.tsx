import React from 'react';
import LottieWorldMapLoading from './lotties/LottieWorldMapLoading';
import worldLottie from '../assets/Earth1- 1708701894997.json';

const LoadingAnimation = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-map-animation_overlay">
      <div className="loading-map-animation">
        <LottieWorldMapLoading animationData={worldLottie} />
      </div>
    </div>
  );
};

export default LoadingAnimation;
