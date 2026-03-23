

# Notificacoes em Tempo Real com Supabase Realtime

## Situacao atual

As notificacoes usam `useQuery` do React Query, que so busca dados quando o componente monta ou quando ha invalidacao manual. Nao ha escuta em tempo real -- o usuario precisa recarregar a pagina para ver novas notificacoes.

## Solucao

Usar o **Supabase Realtime** (channel subscription) para escutar INSERTs e UPDATEs na tabela `notificacoes`, e automaticamente invalidar o cache do React Query quando chega uma nova notificacao. Tambem adicionar um indicador visual (badge com contagem) no icone do sino no Header que aparece mesmo sem abrir o painel.

## O que precisa ser feito

### 1. Habilitar Realtime na tabela `notificacoes` (migration)

A tabela `notificacoes` precisa ser adicionada a publicacao `supabase_realtime` para que o Supabase envie eventos em tempo real.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;
```

### 2. Criar hook `useRealtimeNotificacoes`

Novo hook em `src/hooks/useRealtimeNotificacoes.ts` que:
- Abre um channel Supabase Realtime escutando `INSERT` e `UPDATE` na tabela `notificacoes`
- Quando recebe evento, invalida a query `['notificacoes']` no React Query
- Opcionalmente mostra um toast sonner para notificacoes novas
- Retorna a contagem de nao lidas para uso no Header

### 3. Integrar no Header

- Importar o hook no `Header.tsx`
- Mostrar badge com contagem de nao lidas no icone do sino (ja existe o icone, falta o badge)
- O NotificationPanel ja consome `useNotificacoes`, entao atualiza automaticamente via invalidacao

### 4. Integrar no MainLayout

- Chamar `useRealtimeNotificacoes` no `MainLayout` para que a subscription fique ativa em todas as paginas

## Arquivos

| Tipo | Arquivo |
|---|---|
| Migration | 1 SQL (habilitar realtime) |
| Novo | `src/hooks/useRealtimeNotificacoes.ts` |
| Alteracao | `src/components/Layout/Header.tsx` (badge no sino) |
| Alteracao | `src/components/Layout/MainLayout.tsx` (ativar subscription) |

