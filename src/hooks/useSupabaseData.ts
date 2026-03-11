import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import {
  obraInsertSchema, propostaInsertSchema, medicaoInsertSchema,
  materialInsertSchema, equipamentoInsertSchema, programacaoInsertSchema,
  epiInsertSchema, despesaInsertSchema, boletimInsertSchema,
  relatorioDiarioInsertSchema, validateInput,
} from '@/lib/validationSchemas';

const DEFAULT_LIMIT = 1000;

// ==================== QUERY HOOKS ====================

export const useObras = (status?: Tables<'obras'>['status']) => {
  return useQuery({
    queryKey: ['obras', status],
    queryFn: async () => {
      let query = supabase.from('obras').select('*, clientes(razao_social)');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
  });
};

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('*').order('razao_social');
      if (error) throw error;
      return data;
    },
  });
};

export const usePropostas = () => {
  return useQuery({
    queryKey: ['propostas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('propostas').select('*, clientes(razao_social)').order('created_at', { ascending: false }).limit(DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
  });
};

export const useMedicoes = (obraId?: string) => {
  return useQuery({
    queryKey: ['medicoes', obraId],
    queryFn: async () => {
      let query = supabase.from('medicoes').select('*, obras(nome, clientes(razao_social))');
      if (obraId) query = query.eq('obra_id', obraId);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(DEFAULT_LIMIT);
      return data;
    },
  });
};

export const useProgramacoes = () => {
  return useQuery({
    queryKey: ['programacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programacoes').select('*, obras(nome, endereco, clientes(razao_social))').order('data_programada', { ascending: false }).limit(DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
  });
};

export const useMateriais = (obraId?: string) => {
  return useQuery({
    queryKey: ['materiais', obraId],
    queryFn: async () => {
      let query = supabase.from('materiais').select('*, obras(nome)');
      if (obraId) query = query.eq('obra_id', obraId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useEquipamentos = (obraId?: string) => {
  return useQuery({
    queryKey: ['equipamentos', obraId],
    queryFn: async () => {
      let query = supabase.from('equipamentos').select('*, obras(nome)');
      if (obraId) query = query.eq('obra_id', obraId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useEPIs = (obraId?: string) => {
  return useQuery({
    queryKey: ['epis', obraId],
    queryFn: async () => {
      let query = supabase.from('epis').select('*, obras(nome)');
      if (obraId) query = query.eq('obra_id', obraId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useBoletins = () => {
  return useQuery({
    queryKey: ['boletins_medicao'],
    queryFn: async () => {
      const { data, error } = await supabase.from('boletins_medicao').select('*, obras(nome, clientes(razao_social)), medicoes(numero)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useDespesas = () => {
  return useQuery({
    queryKey: ['despesas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('despesas').select('*, obras(nome)').order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useRetencoes = () => {
  return useQuery({
    queryKey: ['retencoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('retencoes').select('*, obras(nome, clientes(razao_social))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useHorasExtras = () => {
  return useQuery({
    queryKey: ['horas_extras'],
    queryFn: async () => {
      const { data, error } = await supabase.from('horas_extras').select('*, obras(nome)').order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAlteracoesEscopo = () => {
  return useQuery({
    queryKey: ['alteracoes_escopo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('alteracoes_escopo').select('*, obras(nome)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useValoresUnitarios = () => {
  return useQuery({
    queryKey: ['valores_unitarios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('valores_unitarios').select('*, clientes(razao_social)').order('servico');
      if (error) throw error;
      return data;
    },
  });
};

export const useModelosContrato = () => {
  return useQuery({
    queryKey: ['modelos_contrato'],
    queryFn: async () => {
      const { data, error } = await supabase.from('modelos_contrato').select('*').order('titulo');
      if (error) throw error;
      return data;
    },
  });
};

export const useAceitesDigitais = () => {
  return useQuery({
    queryKey: ['aceites_digitais'],
    queryFn: async () => {
      const { data, error } = await supabase.from('aceites_digitais').select('*, propostas(titulo, valor), clientes(razao_social)').order('aceito_em', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useNotificacoes = () => {
  return useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notificacoes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAprovacoes = () => {
  return useQuery({
    queryKey: ['aprovacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('aprovacoes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useRelatoriosDiarios = (obraId?: string) => {
  return useQuery({
    queryKey: ['relatorios_diarios', obraId],
    queryFn: async () => {
      let query = supabase.from('relatorios_diarios').select('*, obras(nome)');
      if (obraId) query = query.eq('obra_id', obraId);
      const { data, error } = await query.order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      return data;
    },
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data;
    },
  });
};

// ==================== DASHBOARD COUNTS ====================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const [obras, medicoes, propostas, programacoes, aprovacoes] = await Promise.all([
        supabase.from('obras').select('id, status', { count: 'exact', head: false }),
        supabase.from('medicoes').select('id, status', { count: 'exact', head: false }),
        supabase.from('propostas').select('id, status', { count: 'exact', head: false }),
        supabase.from('programacoes').select('id, status', { count: 'exact', head: false }),
        supabase.from('aprovacoes').select('id, status', { count: 'exact', head: false }),
      ]);

      return {
        obrasAtivas: (obras.data || []).filter(o => o.status === 'em_andamento').length,
        obrasTotal: obras.data?.length || 0,
        medicoesCount: medicoes.data?.length || 0,
        medicoesPendentes: (medicoes.data || []).filter(m => m.status === 'pendente').length,
        propostasTotal: propostas.data?.length || 0,
        propostasPendentes: (propostas.data || []).filter(p => p.status === 'pendente').length,
        programacoesTotal: programacoes.data?.length || 0,
        aprovacoesPendentes: (aprovacoes.data || []).filter(a => a.status === 'pendente').length,
      };
    },
  });
};

// ==================== MUTATION HOOKS ====================

export const useCreateObra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (obra: TablesInsert<'obras'>) => {
      const { data, error } = await supabase.from('obras').insert(obra).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['obras'] }); queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] }); },
  });
};

export const useUpdateObra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'obras'> & { id: string }) => {
      const { data, error } = await supabase.from('obras').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['obras'] }); queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] }); },
  });
};

export const useCreateProposta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposta: TablesInsert<'propostas'>) => {
      const { data, error } = await supabase.from('propostas').insert(proposta).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['propostas'] }); },
  });
};

export const useUpdateProposta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'propostas'> & { id: string }) => {
      const { data, error } = await supabase.from('propostas').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['propostas'] }); },
  });
};

export const useCreateMedicao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (medicao: TablesInsert<'medicoes'>) => {
      const { data, error } = await supabase.from('medicoes').insert(medicao).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medicoes'] }); queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] }); },
  });
};

export const useUpdateMedicao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'medicoes'> & { id: string }) => {
      const { data, error } = await supabase.from('medicoes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medicoes'] }); },
  });
};

export const useCreateProgramacao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prog: TablesInsert<'programacoes'>) => {
      const { data, error } = await supabase.from('programacoes').insert(prog).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programacoes'] }); },
  });
};

export const useUpdateProgramacao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'programacoes'> & { id: string }) => {
      const { data, error } = await supabase.from('programacoes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programacoes'] }); },
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (material: TablesInsert<'materiais'>) => {
      const { data, error } = await supabase.from('materiais').insert(material).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materiais'] }); },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'materiais'> & { id: string }) => {
      const { data, error } = await supabase.from('materiais').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materiais'] }); },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('materiais').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materiais'] }); },
  });
};

export const useCreateEquipamento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equip: TablesInsert<'equipamentos'>) => {
      const { data, error } = await supabase.from('equipamentos').insert(equip).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['equipamentos'] }); },
  });
};

export const useUpdateEquipamento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'equipamentos'> & { id: string }) => {
      const { data, error } = await supabase.from('equipamentos').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['equipamentos'] }); },
  });
};

export const useDeleteEquipamento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['equipamentos'] }); },
  });
};

export const useCreateEPI = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (epi: TablesInsert<'epis'>) => {
      const { data, error } = await supabase.from('epis').insert(epi).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['epis'] }); },
  });
};

export const useCreateHorasExtras = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (he: TablesInsert<'horas_extras'>) => {
      const { data, error } = await supabase.from('horas_extras').insert(he).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['horas_extras'] }); },
  });
};

export const useUpdateHorasExtras = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'horas_extras'> & { id: string }) => {
      const { data, error } = await supabase.from('horas_extras').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['horas_extras'] }); },
  });
};

export const useCreateDespesa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (despesa: TablesInsert<'despesas'>) => {
      const { data, error } = await supabase.from('despesas').insert(despesa).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['despesas'] }); },
  });
};

export const useCreateBoletim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (boletim: TablesInsert<'boletins_medicao'>) => {
      const { data, error } = await supabase.from('boletins_medicao').insert(boletim).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['boletins_medicao'] }); },
  });
};

export const useCreateAlteracaoEscopo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alt: TablesInsert<'alteracoes_escopo'>) => {
      const { data, error } = await supabase.from('alteracoes_escopo').insert(alt).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alteracoes_escopo'] }); },
  });
};

export const useUpdateAlteracaoEscopo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'alteracoes_escopo'> & { id: string }) => {
      const { data, error } = await supabase.from('alteracoes_escopo').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alteracoes_escopo'] }); },
  });
};

export const useCreateValorUnitario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (valor: TablesInsert<'valores_unitarios'>) => {
      const { data, error } = await supabase.from('valores_unitarios').insert(valor).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['valores_unitarios'] }); },
  });
};

export const useUpdateValorUnitario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'valores_unitarios'> & { id: string }) => {
      const { data, error } = await supabase.from('valores_unitarios').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['valores_unitarios'] }); },
  });
};

export const useCreateModeloContrato = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (modelo: TablesInsert<'modelos_contrato'>) => {
      const { data, error } = await supabase.from('modelos_contrato').insert(modelo).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['modelos_contrato'] }); },
  });
};

export const useUpdateModeloContrato = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'modelos_contrato'> & { id: string }) => {
      const { data, error } = await supabase.from('modelos_contrato').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['modelos_contrato'] }); },
  });
};

export const useUpdateAprovacao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'aprovacoes'> & { id: string }) => {
      const { data, error } = await supabase.from('aprovacoes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['aprovacoes'] }); queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] }); },
  });
};

export const useUpdateNotificacao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'notificacoes'> & { id: string }) => {
      const { data, error } = await supabase.from('notificacoes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notificacoes'] }); },
  });
};

export const useCreateRelatorioDiario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relatorio: TablesInsert<'relatorios_diarios'>) => {
      const { data, error } = await supabase.from('relatorios_diarios').insert(relatorio).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['relatorios_diarios'] }); },
  });
};

export const useUpdateRelatorioDiario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'relatorios_diarios'> & { id: string }) => {
      const { data, error } = await supabase.from('relatorios_diarios').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['relatorios_diarios'] }); },
  });
};

export const useDeleteProgramacao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('programacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['programacoes'] }); },
  });
};

export const useDeleteEPI = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('epis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['epis'] }); },
  });
};
