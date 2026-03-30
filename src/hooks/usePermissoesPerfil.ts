import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

// Hook para buscar permissoes do perfil do usuario logado para um modulo especifico
export const useUserModulePermissions = (modulo: string) => {
  const { effectiveType, user } = useAuth();
  const perfil = effectiveType || user?.type || '';

  // Admin e GT sempre tem acesso total (baseado no role REAL, não impersonado)
  const isFullAccess = user?.type === 'admin' || user?.type === 'gerenciador_tecnico' || user?.isDemo;

  const query = useQuery({
    queryKey: ['permissoes_perfil', perfil, modulo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissoes_perfil')
        .select('*')
        .eq('perfil', perfil)
        .eq('modulo', modulo)
        .maybeSingle();
      if (error) throw error;
      return data as PermissaoPerfil | null;
    },
    enabled: !!perfil && !!modulo && !isFullAccess,
  });

  if (isFullAccess) {
    return {
      acesso_modulo: true,
      pesquisar: true,
      incluir_editar: true,
      excluir: true,
      isLoading: false,
    };
  }

  return {
    acesso_modulo: query.data?.acesso_modulo ?? true,
    pesquisar: query.data?.pesquisar ?? true,
    incluir_editar: query.data?.incluir_editar ?? false,
    excluir: query.data?.excluir ?? false,
    isLoading: query.isLoading,
  };
};

// Hook para buscar TODAS permissoes do perfil do usuario (para Sidebar)
export const useAllUserPermissions = () => {
  const { effectiveType, user } = useAuth();
  const perfil = effectiveType || user?.type || '';
  const isFullAccess = user?.type === 'admin' || user?.type === 'gerenciador_tecnico' || user?.isDemo;

  const query = useQuery({
    queryKey: ['permissoes_perfil', perfil],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissoes_perfil')
        .select('*')
        .eq('perfil', perfil);
      if (error) throw error;
      return data as PermissaoPerfil[];
    },
    enabled: !!perfil && !isFullAccess,
  });

  const hasModuleAccess = (modulo: string): boolean => {
    if (isFullAccess) return true;
    if (!query.data) return true; // default allow while loading
    const perm = query.data.find(p => p.modulo === modulo);
    return perm?.acesso_modulo ?? true;
  };

  return { hasModuleAccess, isLoading: query.isLoading, isFullAccess };
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
