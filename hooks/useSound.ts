'use client';

import { useState, useCallback, useEffect } from 'react';

export const useSound = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    const savedSoundSetting = localStorage.getItem('blast-tangle-sound');
    if (savedSoundSetting !== null) {
      setIsSoundEnabled(JSON.parse(savedSoundSetting));
    }
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => {
      const newState = !prev;
      localStorage.setItem('blast-tangle-sound', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback((soundId: string) => {
    if (isSoundEnabled) {
      const soundElement = document.getElementById(soundId) as HTMLAudioElement;
      if (soundElement) {
        soundElement.currentTime = 0;
        soundElement.play().catch(error => console.error(`Error playing sound ${soundId}:`, error));
      }
    }
  }, [isSoundEnabled]);

  return { playSound, isSoundEnabled, toggleSound };
};
