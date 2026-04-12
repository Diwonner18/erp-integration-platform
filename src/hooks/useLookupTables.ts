import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTiposEpi = () => {
  return useQuery({
    queryKey: ['tipos_epi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_epi' as any)
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data as { id: string; nome: string; ativo: boolean }[];
    },
  });
};

export const useCategoriasHoraExtra = () => {
  return useQuery({
    queryKey: ['categorias_hora_extra'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_hora_extra' as any)
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data as { id: string; nome: string; ativo: boolean }[];
    },
  });
};

export const useTiposHoraExtra = () => {
  return useQuery({
    queryKey: ['tipos_hora_extra'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_hora_extra' as any)
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data as { id: string; nome: string; ativo: boolean }[];
    },
  });
};
