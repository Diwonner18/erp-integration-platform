

## Plano: Migrar frontend para consumir dados reais do Supabase

### Problema

23 paginas usam `useState<any[]>([])` com dados vazios. O types.ts so tem `profiles` e `user_roles` -- as 20 novas tabelas criadas no SQL Editor ainda nao estao refletidas nos tipos.

### Etapa 0 -- Atualizar types.ts

O arquivo `src/integrations/supabase/types.ts` precisa ser regenerado para incluir todas as 20+ tabelas. Isso acontece automaticamente quando o Supabase detecta as novas tabelas -- basta forcar a sincronizacao.

### Etapa 1 -- Criar hooks React Query

Criar um arquivo `src/hooks/useSupabaseData.ts` com hooks reutilizaveis:

```text
useObras()          -> supabase.from('obras').select('*, clientes(*)')
usePropostas()      -> supabase.from('propostas').select('*, clientes(*)')
useMedicoes()       -> supabase.from('medicoes').select('*, obras(*)')
useProgramacoes()   -> supabase.from('programacoes').select('*, obras(*)')
useMateriais()      -> supabase.from('materiais').select('*')
useEquipamentos()   -> supabase.from('equipamentos').select('*')
useEPIs()           -> supabase.from('epis').select('*')
useBoletins()       -> supabase.from('boletins_medicao').select('*')
useDespesas()       -> supabase.from('despesas').select('*')
useRetencoes()      -> supabase.from('retencoes').select('*')
useHorasExtras()    -> supabase.from('horas_extras').select('*')
useAlteracoesEscopo() -> supabase.from('alteracoes_escopo').select('*')
useValoresUnitarios() -> supabase.from('valores_unitarios').select('*')
useModelosContrato()  -> supabase.from('modelos_contrato').select('*')
useAceites()        -> supabase.from('aceites_digitais').select('*')
useNotificacoes()   -> supabase.from('notificacoes').select('*')
useAprovacoes()     -> supabase.from('aprovacoes').select('*')
useRelatoriosDiarios() -> supabase.from('relatorios_diarios').select('*')
useClientes()       -> supabase.from('clientes').select('*')
```

Cada hook retorna `{ data, isLoading, error, refetch }` via `useQuery`. Tambem criarei mutation hooks (`useCreateObra`, `useUpdateProposta`, etc.) com `useMutation` + `invalidateQueries`.

### Etapa 2 -- Migrar as 23 paginas

Substituir `useState<any[]>([])` pelo hook correspondente em cada pagina. Adicionar skeleton/loading states e empty states. As paginas afetadas:

**Admin (4)**: GerenciarUsuarios, Permissoes, Aprovacoes, Automacao
**Comercial (4)**: Propostas, ValoresUnitarios, AceitesDigitais, ModelosContrato
**Obras (10)**: Medicoes, AlteracoesEscopo, Materiais, MateriaisEquipamentos, HorasExtras, EPIs, ObrasAgendadas, EquipeAtiva, RelatorioDiarioObra, ObrasConcluidas/EmAndamento
**Financeiro (5)**: BoletinsMedicao, ControleFinanceiro, ControleRetencoes, LancamentoDespesas, FechamentoMensal
**Cliente (4)**: MinhasObras, MinhasPropostas, MeusPagamentos, SolicitarAgendamento
**Shared (1)**: Programacao

### Etapa 3 -- Dashboard com contagens reais

O Dashboard passara a mostrar contagens reais (`obras.count`, `medicoes.count`, `programacoes.count`) em vez de valores hardcoded.

### Etapa 4 -- NotificationPanel real

O painel de notificacoes consumira `notificacoes` e permitira marcar como lida.

### Ordem de execucao

Dado o volume (23 paginas + hooks + mutations), vou implementar em blocos:
1. Atualizar types.ts + criar todos os hooks
2. Migrar paginas de Obras (maior volume)
3. Migrar paginas Comercial + Financeiro
4. Migrar paginas Admin + Cliente + Dashboard

Cada bloco sera entregue com loading states e tratamento de erro.

