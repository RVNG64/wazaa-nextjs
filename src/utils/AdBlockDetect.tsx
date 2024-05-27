import React, { useEffect } from 'react';

interface AdBlockDetectProps {
  onDetected: () => void;
  onNotDetected: () => void;
}

const checkAdBlocker = async () => {
  try {
    const response = await fetch(new Request("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      method: 'HEAD',
      mode: 'no-cors'
    }));
    return !response.ok;
  } catch (e) {
    return true;
  }
};

const AdBlockDetect: React.FC<AdBlockDetectProps> = ({ onDetected, onNotDetected }) => {

  useEffect(() => {
    checkAdBlocker().then((isBlocked) => {
      if (isBlocked) {
        onDetected();
      } else {
        onNotDetected();
      }
    });
  }, [onDetected, onNotDetected]);

  return null;
}

export default AdBlockDetect;
