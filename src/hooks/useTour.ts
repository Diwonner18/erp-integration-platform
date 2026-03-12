import { useState, useEffect, useCallback } from 'react';

const TOUR_KEY_PREFIX = 'tour_completed_';

export const useTour = (userId?: string) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const storageKey = userId ? `${TOUR_KEY_PREFIX}${userId}` : null;

  useEffect(() => {
    if (!storageKey || !userId) return;
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Small delay to let Dashboard render first
      const timer = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey, userId]);

  const startTour = useCallback((steps: number) => {
    setShowWelcome(false);
    setTotalSteps(steps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= totalSteps - 1) {
        setIsActive(false);
        if (storageKey) localStorage.setItem(storageKey, 'true');
        return 0;
      }
      return prev + 1;
    });
  }, [totalSteps, storageKey]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    setShowWelcome(false);
    setIsActive(false);
    setCurrentStep(0);
    if (storageKey) localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const resetTour = useCallback(() => {
    if (storageKey) localStorage.removeItem(storageKey);
    setCurrentStep(0);
    setShowWelcome(true);
  }, [storageKey]);

  return {
    showWelcome,
    isActive,
    currentStep,
    totalSteps,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    resetTour,
    setShowWelcome,
  };
};
