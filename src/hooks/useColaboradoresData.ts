import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ==================== COLABORADORES ====================

export const useColaboradores = () => {
  return useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('colaboradores').select('*').order('nome');
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useColaborador = (id: string) => {
  return useQuery({
    queryKey: ['colaboradores', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('colaboradores').select('*').eq('id', id).single();
      if (error) throw error;
      return data as any;
    },
  });
};

export const useCreateColaborador = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (colab: any) => {
      const { data, error } = await (supabase as any).from('colaboradores').insert(colab).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colaboradores'] }); },
  });
};

export const useUpdateColaborador = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await (supabase as any).from('colaboradores').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colaboradores'] }); },
  });
};

export const useDeleteColaborador = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('colaboradores').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colaboradores'] }); },
  });
};

// ==================== BENEFÍCIOS ====================

export const useColaboradorBeneficios = (colaboradorId: string) => {
  return useQuery({
    queryKey: ['colaborador_beneficios', colaboradorId],
    enabled: !!colaboradorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('colaborador_beneficios').select('*').eq('colaborador_id', colaboradorId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateBeneficio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (beneficio: any) => {
      const { data, error } = await (supabase as any).from('colaborador_beneficios').insert(beneficio).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colaborador_beneficios'] }); },
  });
};

export const useDeleteBeneficio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('colaborador_beneficios').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colaborador_beneficios'] }); },
  });
};

// ==================== ALOCAÇÕES ====================

export const useColaboradorAlocacoes = (colaboradorId: string) => {
  return useQuery({
    queryKey: ['colaborador_alocacoes', colaboradorId],
    enabled: !!colaboradorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('colaborador_alocacoes').select('*, obras(nome)').eq('colaborador_id', colaboradorId).order('data_inicio', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateAlocacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alocacao: any) => {
      const { data, error } = await (supabase as any).from('colaborador_alocacoes').insert(alocacao).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['colaborador_alocacoes'] }); },
  });
};

// ==================== BANCO DE HORAS ====================

export const useBancoHoras = (colaboradorId: string) => {
  return useQuery({
    queryKey: ['banco_horas', colaboradorId],
    enabled: !!colaboradorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('banco_horas').select('*').eq('colaborador_id', colaboradorId).order('data', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateBancoHoras = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bh: any) => {
      const { data, error } = await (supabase as any).from('banco_horas').insert(bh).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banco_horas'] }); },
  });
};

// ==================== FALTAS E LICENÇAS ====================

export const useFaltasLicencas = (colaboradorId: string) => {
  return useQuery({
    queryKey: ['faltas_licencas', colaboradorId],
    enabled: !!colaboradorId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('faltas_licencas').select('*').eq('colaborador_id', colaboradorId).order('data_inicio', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateFaltaLicenca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fl: any) => {
      const { data, error } = await (supabase as any).from('faltas_licencas').insert(fl).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faltas_licencas'] }); },
  });
};
