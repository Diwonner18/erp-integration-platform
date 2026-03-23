import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotificacoes } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

export const useRealtimeNotificacoes = () => {
  const queryClient = useQueryClient();
  const { data: notificacoes = [] } = useNotificacoes();

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  useEffect(() => {
    const channel = supabase
      .channel('notificacoes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
          const novo = payload.new as { titulo?: string };
          if (novo?.titulo) {
            toast.info(`Nova notificação: ${novo.titulo}`);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notificacoes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { unreadCount };
};
