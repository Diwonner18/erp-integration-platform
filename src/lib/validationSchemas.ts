import { z } from 'zod';

// ==================== SHARED VALIDATORS ====================

const uuidSchema = z.string().uuid();
const nonEmptyString = z.string().trim().min(1, 'Campo obrigatório').max(500);
const optionalString = z.string().trim().max(500).optional().nullable();
const positiveNumber = z.number().min(0, 'Valor deve ser positivo');
const optionalPositiveNumber = z.number().min(0).optional().nullable();
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional().nullable();

// ==================== ENTITY SCHEMAS ====================

export const obraInsertSchema = z.object({
  nome: nonEmptyString,
  cliente_id: uuidSchema.optional().nullable(),
  endereco: optionalString,
  escopo: optionalString,
  data_inicio: dateString,
  data_previsao: dateString,
  valor_contrato: optionalPositiveNumber,
  metragem: optionalPositiveNumber,
  status: z.enum(['programacao_pendente', 'programada', 'em_andamento', 'pausada', 'concluida', 'cancelada']).optional(),
  proposta_id: uuidSchema.optional().nullable(),
  responsavel_id: uuidSchema.optional().nullable(),
  progresso: z.number().min(0).max(100).optional().nullable(),
});

export const propostaInsertSchema = z.object({
  titulo: nonEmptyString,
  cliente_id: uuidSchema.optional().nullable(),
  descricao: optionalString,
  valor: optionalPositiveNumber,
  prazo_execucao: optionalString,
  condicoes_pagamento: optionalString,
  data_validade: dateString,
  status: z.enum(['rascunho', 'pendente', 'em_analise', 'aprovada', 'rejeitada', 'cancelada']).optional(),
  obra_id: uuidSchema.optional().nullable(),
});

export const medicaoInsertSchema = z.object({
  obra_id: uuidSchema,
  numero: optionalString,
  descricao: optionalString,
  valor: optionalPositiveNumber,
  valor_bruto: optionalPositiveNumber,
  percentual: z.number().min(0).max(100).optional().nullable(),
  periodo_inicio: dateString,
  periodo_fim: dateString,
  data_medicao: dateString,
  observacoes: optionalString,
  status: z.enum(['em_elaboracao', 'pendente', 'aprovada', 'rejeitada']).optional(),
});

export const materialInsertSchema = z.object({
  nome: nonEmptyString,
  obra_id: uuidSchema,
  quantidade: optionalPositiveNumber,
  valor_unitario: optionalPositiveNumber,
  valor_total: optionalPositiveNumber,
  unidade: optionalString,
  fornecedor: optionalString,
  status: optionalString,
  data_entrega: dateString,
});

export const equipamentoInsertSchema = z.object({
  nome: nonEmptyString,
  obra_id: uuidSchema,
  quantidade: z.number().int().min(1).optional().nullable(),
  valor_unitario: optionalPositiveNumber,
  fornecedor: optionalString,
  status: optionalString,
  data_inicio: dateString,
  data_fim: dateString,
});

export const programacaoInsertSchema = z.object({
  obra_id: uuidSchema,
  data_programada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  tipo: z.enum(['visita', 'execucao', 'medicao', 'entrega', 'outro']).optional(),
  status: z.enum(['programada', 'confirmada', 'em_execucao', 'executada', 'cancelada']).optional(),
  descricao: optionalString,
  responsavel: optionalString,
  observacoes: optionalString,
  hora_inicio: optionalString,
  hora_fim: optionalString,
  notificar_cliente: z.boolean().optional().nullable(),
});

export const epiInsertSchema = z.object({
  tipo: nonEmptyString,
  obra_id: uuidSchema,
  funcionario: optionalString,
  quantidade: z.number().int().min(1).optional().nullable(),
  data_entrega: dateString,
  validade: dateString,
  certificado_aprovacao: optionalString,
});

export const despesaInsertSchema = z.object({
  descricao: nonEmptyString,
  valor: positiveNumber,
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  categoria: z.enum(['material', 'mao_de_obra', 'equipamento', 'transporte', 'alimentacao', 'outro']).optional(),
  obra_id: uuidSchema.optional().nullable(),
  comprovante_url: optionalString,
});

export const boletimInsertSchema = z.object({
  obra_id: uuidSchema,
  medicao_id: uuidSchema.optional().nullable(),
  numero: optionalString,
  valor: optionalPositiveNumber,
  data_emissao: dateString,
  observacoes: optionalString,
  status: z.enum(['rascunho', 'emitido', 'aprovado', 'pago']).optional(),
});

export const relatorioDiarioInsertSchema = z.object({
  obra_id: uuidSchema,
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  atividades: optionalString,
  ocorrencias: optionalString,
  clima: optionalString,
  mao_de_obra_presente: z.number().int().min(0).optional().nullable(),
  temperatura_min: optionalPositiveNumber,
  temperatura_max: optionalPositiveNumber,
});

export const horasExtrasInsertSchema = z.object({
  funcionario: nonEmptyString,
  horas: z.number().min(0.5, 'Mínimo 0.5 horas').max(24, 'Máximo 24 horas'),
  obra_id: uuidSchema,
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  motivo: optionalString,
  valor_hora: optionalPositiveNumber,
  status: z.enum(['pendente', 'aprovada', 'rejeitada']).optional(),
});

export const alteracaoEscopoInsertSchema = z.object({
  descricao: nonEmptyString,
  obra_id: uuidSchema,
  justificativa: optionalString,
  impacto_valor: optionalPositiveNumber,
  impacto_prazo: z.number().int().min(0).optional().nullable(),
  status: z.enum(['pendente', 'em_analise', 'aprovada', 'rejeitada']).optional(),
});

// ==================== HELPER ====================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
