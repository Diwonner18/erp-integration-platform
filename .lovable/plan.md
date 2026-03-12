

# Lote 6 - Gestão de Retenções com Persistência no Supabase

## Objetivo

Substituir dados mock em `DetalhesRetencao.tsx` por dados reais do Supabase e implementar persistência para observações, follow-ups e pagamentos.

## Plano

### 1. Migration - Criar 2 novas tabelas

**`retencao_followups`**: agenda de follow-ups vinculados a uma retenção
- `id`, `retencao_id` (FK retencoes), `data` (date), `horario` (time), `tipo_contato` (text), `observacoes` (text), `created_by` (uuid), `created_at`

**`retencao_pagamentos`**: registro de pagamentos/liberações
- `id`, `retencao_id` (FK retencoes), `tipo` (text), `valor` (numeric), `data_pagamento` (date), `descricao` (text), `created_by` (uuid), `created_at`

Para observações, usar a coluna `observacoes` que **não existe** na tabela `retencoes` -- adicionar via `ALTER TABLE`.

RLS: admin e financeira com full access. Triggers `set_created_by` nas novas tabelas.

### 2. Hooks - Adicionar em `useSupabaseData.ts`

- `useRetencao(id)` - busca retenção individual com join em `obras(nome, clientes(razao_social))`
- `useRetencaoFollowups(retencaoId)` - lista follow-ups
- `useRetencaoPagamentos(retencaoId)` - lista pagamentos
- `useUpdateRetencao` - mutation para salvar observações
- `useCreateRetencaoFollowup` - mutation para agendar follow-up
- `useCreateRetencaoPagamento` - mutation para registrar pagamento

### 3. Refatorar `DetalhesRetencao.tsx`

- Substituir mock data por `useRetencao(id)` com dados reais (obra, cliente, tipo, percentual, valor, base_calculo, status)
- Histórico: combinar follow-ups + pagamentos em timeline ordenada por data
- Observações: carregar/salvar via `useUpdateRetencao`
- Follow-up: persistir via `useCreateRetencaoFollowup`
- Pagamento: persistir via `useCreateRetencaoPagamento`
- Relatório: gerar PDF real via `exportUtils`

### 4. Melhorar `ControleRetencoes.tsx`

- Adicionar botão para navegar ao detalhe (`/retencoes/:id`)
- Adicionar navegação por clique no item da lista

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| Migration SQL | Criar `retencao_followups`, `retencao_pagamentos`, add `observacoes` a `retencoes` |
| `useSupabaseData.ts` | Hooks de query e mutation para retenções |
| `DetalhesRetencao.tsx` | Dados reais do Supabase, persistência completa |
| `ControleRetencoes.tsx` | Navegação para detalhes |

