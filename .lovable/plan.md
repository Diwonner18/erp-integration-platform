

# Corrigir Modais que Não Salvam no Banco de Dados

## Problema

Patricia reportou que "não está sendo possível salvar". A causa raiz é que **6 modais** usam `setTimeout` para simular chamadas de API, mostrando toast de sucesso mas **sem persistir dados no Supabase**. Ao recarregar a página, tudo desaparece.

## Modais Afetados

| Modal | Problema | Hook Supabase disponível |
|-------|----------|--------------------------|
| `NovaPropostaModal.tsx` | Simula insert com setTimeout | `useInsertProposta` (existe) |
| `EditPropostaModal.tsx` | Simula update com setTimeout e dados locais | `useUpdateProposta` (existe) |
| `NovoBoletimModal.tsx` | Simula insert com setTimeout | `useInsertBoletim` (existe) |
| `AdicionarMaterialModal.tsx` | Simula insert com setTimeout | `useInsertMaterial` (existe) |
| `EditMaterialModal.tsx` | Simula update com setTimeout e dados locais | `useUpdateMaterial` (existe) |
| `SugestaoEscopoModal.tsx` | Simula insert com setTimeout | `useInsertAlteracaoEscopo` (existe) |

## O que Será Feito

Para cada modal:

1. **Importar o hook correto** do `useSupabaseData.ts` (já existem hooks para todas essas operações)
2. **Substituir o setTimeout** pela chamada real ao Supabase via `mutateAsync`
3. **Mapear campos do formulário** para as colunas corretas da tabela (ex: `cliente` → `cliente_id`, `valor` → campo numérico)
4. **Adicionar selects de dados reais** onde necessário (ex: dropdown de clientes e obras vindos do Supabase em vez de texto livre)
5. **Tratar erros reais** do Supabase (RLS, validação) no catch

### Detalhes por Modal

**NovaPropostaModal** — Usar `useInsertProposta`, adicionar select de `cliente_id` e `obra_id` com dados do `useClientes` e `useObras`. Campos: titulo, descricao, valor (numérico), data_validade, cliente_id, obra_id.

**EditPropostaModal** — Receber proposta real do Supabase (não o tipo local), usar `useUpdateProposta` com `mutateAsync({ id, ...fields })`. Remover prop `onSave` e usar invalidação automática do React Query.

**NovoBoletimModal** — Usar `useInsertBoletim`, mapear campos para schema do banco (numero, obra_id, medicao_id, valor, data_emissao, observacoes).

**AdicionarMaterialModal** — Usar `useInsertMaterial`, mapear para schema (nome, obra_id, quantidade, valor_unitario, unidade, fornecedor).

**EditMaterialModal** — Usar `useUpdateMaterial`, remover prop `onSave`.

**SugestaoEscopoModal** — Usar `useInsertAlteracaoEscopo`, mapear para schema (obra_id, descricao, justificativa, impacto_valor, impacto_prazo).

### Páginas Pai

As páginas que usam esses modais (Propostas.tsx, BoletinsMedicao.tsx, Materiais.tsx, AlteracoesEscopo.tsx) precisarão de ajustes menores para remover lógica local de state que simula persistência, já que o React Query fará refetch automático após mutação.

## Arquivos a Editar

- `src/components/Comercial/NovaPropostaModal.tsx`
- `src/components/Comercial/EditPropostaModal.tsx`
- `src/components/Financeiro/NovoBoletimModal.tsx`
- `src/components/Obras/AdicionarMaterialModal.tsx`
- `src/components/Obras/EditMaterialModal.tsx`
- `src/components/Obras/SugestaoEscopoModal.tsx`
- Páginas pai que passam props `onSave` locais (ajustes menores)

