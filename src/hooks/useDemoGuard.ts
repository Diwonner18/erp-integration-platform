import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCallback } from 'react';

export const useDemoGuard = () => {
  const { user } = useAuth();
  const isDemoUser = user?.isDemo ?? false;

  const guardAction = useCallback(
    (fn: () => void) => {
      if (isDemoUser) {
        toast.info('Modo demonstração — ação bloqueada', {
          description: 'Usuários de demonstração não podem realizar alterações.',
        });
        return;
      }
      fn();
    },
    [isDemoUser]
  );

  return { isDemoUser, guardAction };
};
