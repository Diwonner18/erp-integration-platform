import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PermissaoPerfil {
  id: string;
  perfil: string;
  modulo: string;
  pesquisar: boolean;
  incluir_editar: boolean;
  excluir: boolean;
  acesso_modulo: boolean;
}

export const useAllPermissoesPerfil = () => {
  return useQuery({
    queryKey: ['permissoes_perfil'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissoes_perfil')
        .select('*')
        .order('perfil')
        .order('modulo');
      if (error) throw error;
      return data as PermissaoPerfil[];
    },
  });
};

export const usePermissoesPerfil = (perfil: string) => {
  return useQuery({
    queryKey: ['permissoes_perfil', perfil],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissoes_perfil')
        .select('*')
        .eq('perfil', perfil)
        .order('modulo');
      if (error) throw error;
      return data as PermissaoPerfil[];
    },
    enabled: !!perfil,
  });
};

export const useUpsertPermissoesPerfil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permissions: Partial<PermissaoPerfil>[]) => {
      const { error } = await supabase
        .from('permissoes_perfil')
        .upsert(
          permissions.map(p => ({
            id: p.id,
            perfil: p.perfil,
            modulo: p.modulo,
            pesquisar: p.pesquisar,
            incluir_editar: p.incluir_editar,
            excluir: p.excluir,
            acesso_modulo: p.acesso_modulo,
          })),
          { onConflict: 'perfil,modulo' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes_perfil'] });
    },
  });
};
