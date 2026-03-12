

# Substituir números hardcoded por dados reais do Supabase em RelatoriosObra

## Problema
A página `RelatoriosObra.tsx` exibe números fixos (23, 12, 8, 15, 5 alertas) que não refletem os dados reais do banco.

## Solução

### `src/pages/Obras/RelatoriosObra.tsx`
- Importar `useObras` e `useProgramacoes` do hook `useSupabaseData`
- Calcular contagens dinamicamente a partir dos dados:
  - **Obras Concluídas**: `obras.filter(o => o.status === 'concluida').length`
  - **Em Andamento**: `obras.filter(o => o.status === 'em_andamento').length`
  - **Agendadas**: `obras.filter(o => o.status === 'programada' || o.status === 'programacao_pendente').length`
  - **Equipe Ativa**: contagem de membros únicos nas `programacoes` ativas (campo `equipe` jsonb), ou fallback para 0
- **Central de Alertas**: zerar os valores hardcoded (0 Críticos, 0 Médios, 0 Baixo, total 0) — futuramente poderá ser conectada a uma tabela de alertas
- Adicionar skeleton loading enquanto os dados carregam

