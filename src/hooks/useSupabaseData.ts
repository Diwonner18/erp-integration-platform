import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate, Json } from '@/integrations/supabase/types';
import {
  obraInsertSchema, propostaInsertSchema, medicaoInsertSchema,
  materialInsertSchema, equipamentoInsertSchema, programacaoInsertSchema,
  epiInsertSchema, despesaInsertSchema, boletimInsertSchema,
  relatorioDiarioInsertSchema, horasExtrasInsertSchema, alteracaoEscopoInsertSchema,
  valorUnitarioInsertSchema, modeloContratoInsertSchema,
  obraUpdateSchema, propostaUpdateSchema, medicaoUpdateSchema,
  materialUpdateSchema, equipamentoUpdateSchema, programacaoUpdateSchema,
  epiUpdateSchema, horasExtrasUpdateSchema, alteracaoEscopoUpdateSchema,
  valorUnitarioUpdateSchema, modeloContratoUpdateSchema, relatorioDiarioUpdateSchema,
  validateInput,
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

// ==================== CLIENT-SCOPED HOOKS (defense in depth) ====================
// These hooks add explicit cliente_id filters on top of RLS for the cliente profile.

export const useObrasCliente = () => {
  return useQuery({
    queryKey: ['obras_cliente'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from('obras')
        .select('*, clientes!inner(razao_social, user_id)')
        .eq('clientes.user_id', uid)
        .order('created_at', { ascending: false })
        .limit(DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
  });
};

export const usePropostasCliente = () => {
  return useQuery({
    queryKey: ['propostas_cliente'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      // Get cliente IDs first via separate query (RLS already filters)
      const { data: clientes } = await supabase.from('clientes').select('id').eq('user_id', uid);
      const clienteIds = (clientes || []).map(c => c.id);
      if (clienteIds.length === 0) return [];
      const { data, error } = await supabase
        .from('propostas')
        .select('id, titulo, descricao, valor, status, data_validade, created_at, cliente_id, obra_id')
        .in('cliente_id', clienteIds)
        .neq('status', 'rascunho')
        .order('created_at', { ascending: false })
        .limit(DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
  });
};

export const useBoletinsCliente = () => {
  return useQuery({
    queryKey: ['boletins_cliente'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      // Get obra_ids the cliente owns
      const { data: clientes } = await supabase.from('clientes').select('id').eq('user_id', uid);
      const clienteIds = (clientes || []).map(c => c.id);
      if (clienteIds.length === 0) return [];
      const { data: obras } = await supabase.from('obras').select('id, nome').in('cliente_id', clienteIds);
      const obraIds = (obras || []).map(o => o.id);
      if (obraIds.length === 0) return [];
      const obrasMap = new Map((obras || []).map(o => [o.id, o.nome]));
      const { data, error } = await supabase
        .from('boletins_medicao')
        .select('id, numero, valor, status, data_emissao, obra_id, created_at, medicoes(numero)')
        .in('obra_id', obraIds)
        .order('created_at', { ascending: false })
        .limit(DEFAULT_LIMIT);
      if (error) throw error;
      // Attach obra name without exposing other clientes
      return (data || []).map(b => ({ ...b, obras: { nome: obrasMap.get(b.obra_id) || '-' } }));
    },
  });
};

export const useMedicoesCliente = () => {
  return useQuery({
    queryKey: ['medicoes_cliente'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data: clientes } = await supabase.from('clientes').select('id').eq('user_id', uid);
      const clienteIds = (clientes || []).map(c => c.id);
      if (clienteIds.length === 0) return [];
      const { data: obras } = await supabase.from('obras').select('id, nome').in('cliente_id', clienteIds);
      const obraIds = (obras || []).map(o => o.id);
      if (obraIds.length === 0) return [];
      const obrasMap = new Map((obras || []).map(o => [o.id, o.nome]));
      const { data, error } = await supabase
        .from('medicoes')
        .select('id, numero, descricao, valor, status, data_medicao, periodo_inicio, periodo_fim, obra_id, created_at')
        .in('obra_id', obraIds)
        .eq('status', 'aprovada')
        .order('created_at', { ascending: false })
        .limit(DEFAULT_LIMIT);
      if (error) throw error;
      return (data || []).map(m => ({ ...m, obras: { nome: obrasMap.get(m.obra_id) || '-' } }));
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

export const useRetencao = (id: string | undefined) => {
  return useQuery({
    queryKey: ['retencoes', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('retencoes').select('*, obras(nome, clientes(razao_social))').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });
};

export const useRetencaoFollowups = (retencaoId: string | undefined) => {
  return useQuery({
    queryKey: ['retencao_followups', retencaoId],
    enabled: !!retencaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from('retencao_followups').select('*').eq('retencao_id', retencaoId!).order('data', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useRetencaoPagamentos = (retencaoId: string | undefined) => {
  return useQuery({
    queryKey: ['retencao_pagamentos', retencaoId],
    enabled: !!retencaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from('retencao_pagamentos').select('*').eq('retencao_id', retencaoId!).order('data_pagamento', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateRetencao = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, observacoes }: { id: string; observacoes: string }) => {
      const { data, error } = await supabase.from('retencoes').update({ observacoes }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['retencoes'] }); },
  });
};

export const useCreateRetencaoFollowup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followup: { retencao_id: string; data: string; horario: string; tipo_contato: string; observacoes?: string }) => {
      const { data, error } = await supabase.from('retencao_followups').insert(followup).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['retencao_followups'] }); },
  });
};

export const useCreateRetencaoPagamento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pagamento: { retencao_id: string; tipo: string; valor: number; data_pagamento: string; descricao?: string }) => {
      const { data, error } = await supabase.from('retencao_pagamentos').insert(pagamento).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['retencao_pagamentos'] }); queryClient.invalidateQueries({ queryKey: ['retencoes'] }); },
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
      const { data, error } = await supabase.from('notificacoes').select('*').order('created_at', { ascending: false }).limit(DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
  });
};

export const useAprovacoes = () => {
  return useQuery({
    queryKey: ['aprovacoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('aprovacoes').select('*').order('created_at', { ascending: false }).limit(DEFAULT_LIMIT);
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
      validateInput(obraInsertSchema, obra);
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
      validateInput(obraUpdateSchema, updates);
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
      validateInput(propostaInsertSchema, proposta);
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
      validateInput(propostaUpdateSchema, updates);
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
      validateInput(medicaoInsertSchema, medicao);
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
      validateInput(medicaoUpdateSchema, updates);
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
      validateInput(programacaoInsertSchema, prog);
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
      validateInput(programacaoUpdateSchema, updates);
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
      validateInput(materialInsertSchema, material);
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
      validateInput(materialUpdateSchema, updates);
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
      validateInput(equipamentoInsertSchema, equip);
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
      validateInput(equipamentoUpdateSchema, updates);
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
      validateInput(epiInsertSchema, epi);
      const { data, error } = await supabase.from('epis').insert(epi).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['epis'] }); },
  });
};

export const useUpdateEPI = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'epis'> & { id: string }) => {
      validateInput(epiUpdateSchema, updates);
      const { data, error } = await supabase.from('epis').update(updates).eq('id', id).select().single();
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
      validateInput(horasExtrasInsertSchema, he);
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
      validateInput(horasExtrasUpdateSchema, updates);
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
      validateInput(despesaInsertSchema, despesa);
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
      validateInput(boletimInsertSchema, boletim);
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
      validateInput(alteracaoEscopoInsertSchema, alt);
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
      validateInput(alteracaoEscopoUpdateSchema, updates);
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
      validateInput(valorUnitarioInsertSchema, valor);
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
      validateInput(valorUnitarioUpdateSchema, updates);
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
      validateInput(modeloContratoInsertSchema, modelo);
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
      validateInput(modeloContratoUpdateSchema, updates);
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
      validateInput(relatorioDiarioInsertSchema, relatorio);
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
      validateInput(relatorioDiarioUpdateSchema, updates);
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

export const useCreateAceiteDigital = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { proposta_id: string; cliente_id: string }) => {
      const { data, error } = await supabase.from('aceites_digitais').insert({
        proposta_id: params.proposta_id,
        cliente_id: params.cliente_id,
        assinatura_digital: `aceite_digital_${Date.now()}`,
      }).select().single();
      if (error) throw error;
      // Also update proposta status to aprovada
      await supabase.from('propostas').update({ status: 'aprovada' }).eq('id', params.proposta_id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aceites_digitais'] });
      queryClient.invalidateQueries({ queryKey: ['propostas'] });
    },
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

// ==================== AUDIT LOG ====================

export const useAuditLog = () => {
  return useMutation({
    mutationFn: async (params: {
      acao: string;
      descricao?: string;
      tabela?: string;
      registro_id?: string;
      entidade?: string;
      entidade_id?: string;
      dados_anteriores?: Record<string, unknown> | null;
      dados_novos?: Record<string, unknown> | null;
      modulo?: string;
      nivel_sensibilidade?: string;
    }) => {
      const { data, error } = await supabase.rpc('insert_audit_log', {
        _acao: params.acao,
        _descricao: params.descricao ?? null,
        _tabela: params.tabela ?? null,
        _registro_id: params.registro_id ?? null,
        _entidade: params.entidade ?? null,
        _entidade_id: params.entidade_id ?? null,
        _dados_anteriores: (params.dados_anteriores as unknown as Json) ?? null,
        _dados_novos: (params.dados_novos as unknown as Json) ?? null,
        _modulo: params.modulo ?? null,
        _nivel_sensibilidade: params.nivel_sensibilidade ?? 'baixo',
      });
      if (error) throw error;
      return data;
    },
  });
};

// ==================== ACESSOS COMPARTILHADOS ====================

export const useAcessosCompartilhados = (tabela?: string, registroId?: string) => {
  return useQuery({
    queryKey: ['acessos_compartilhados', tabela, registroId],
    queryFn: async () => {
      let query = supabase.from('acessos_compartilhados').select('*');
      if (tabela) query = query.eq('tabela', tabela);
      if (registroId) query = query.eq('registro_id', registroId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCheckRecordAccess = (tabela: string, registroId: string, nivel: string = 'view') => {
  return useQuery({
    queryKey: ['record_access', tabela, registroId, nivel],
    enabled: !!registroId,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase.rpc('has_record_access', {
        _user_id: user.id,
        _tabela: tabela,
        _registro_id: registroId,
        _nivel: nivel,
      });
      if (error) throw error;
      return data as boolean;
    },
  });
};

export const useSolicitarAcesso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tabela: string; registro_id: string; comentario?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase.from('aprovacoes').insert({
        tipo: 'acesso_registro',
        referencia_id: params.registro_id,
        referencia_tabela: params.tabela,
        solicitante_id: user.id,
        comentario: params.comentario || null,
        status: 'pendente',
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aprovacoes'] });
    },
  });
};

export const useInsertAcessoCompartilhado = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      user_id: string;
      tabela: string;
      registro_id: string;
      nivel_acesso: 'view' | 'edit' | 'all';
      aprovacao_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase.from('acessos_compartilhados').insert({
        user_id: params.user_id,
        tabela: params.tabela,
        registro_id: params.registro_id,
        nivel_acesso: params.nivel_acesso,
        concedido_por: user.id,
        aprovacao_id: params.aprovacao_id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acessos_compartilhados'] });
      queryClient.invalidateQueries({ queryKey: ['record_access'] });
    },
  });
};
