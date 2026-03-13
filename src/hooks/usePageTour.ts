import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTour } from './useTour';
import { getPageTourSteps } from '@/components/Tour/pageTourSteps';
import { useAuth } from '@/contexts/AuthContext';

export const usePageTour = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const tour = useTour(user?.id ? `page_${user.id}_${pathname}` : undefined);
  const steps = getPageTourSteps(pathname);

  const startPageTour = useCallback(() => {
    if (steps.length > 0) {
      tour.startTour(steps.length);
    }
    return steps.length > 0;
  }, [steps, tour]);

  return {
    steps,
    hasSteps: steps.length > 0,
    startPageTour,
    tour,
  };
};
