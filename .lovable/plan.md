
The scanner is flagging that any authenticated user could subscribe to the `notificacoes-realtime` channel. However, there are critical considerations here:

1. **Reserved schema warning**: The instructions explicitly state we must NOT modify `realtime` schema (it's a Supabase-reserved schema). Adding RLS policies on `realtime.messages` would violate this rule and risk service degradation.

2. **Memory note confirms**: The memory `security/realtime-data-filtering` says: *"o uso de RLS manual no schema reservado 'realtime' foi revertido para evitar interferências"*. We already tried this before and reverted it.

3. **How Supabase Realtime actually works with `postgres_changes`**: The current code uses `postgres_changes` (NOT broadcast). For `postgres_changes`, Supabase server-side applies the table's RLS to each event before delivering — users only receive events for rows they could SELECT. The `notificacoes` SELECT policy is `user_id = auth.uid()`, so users physically cannot receive other users' notification payloads.

4. **The toast shows only the title of the inserted row**: Looking at `useRealtimeNotificacoes.ts`, the payload comes from `postgres_changes`. RLS filters this server-side.

**Real risk assessment**: The scanner is generic and assumes `broadcast`/`presence` channels. For `postgres_changes`, the table's RLS is the authorization mechanism. Current setup IS secure.

**However**, there is one minor issue: when ANY notification is inserted (even for another user), the channel fires `INSERT` event. Supabase filters by RLS, but to be extra safe, we should add a server-side filter on the subscription using `filter: 'user_id=eq.<current_user_id>'`. This is the documented Supabase pattern and reduces unnecessary network traffic + adds defense-in-depth.

# Plano: Fortalecer subscription de Realtime com filtro server-side

## Contexto
O scanner sinaliza risco teórico. Na prática, o RLS da tabela `notificacoes` (`user_id = auth.uid()`) já filtra eventos `postgres_changes` no servidor antes da entrega. NÃO podemos modificar o schema `realtime` (regra crítica do Supabase).

## Solução: Defense-in-depth no client
Adicionar filtro `user_id=eq.<uid>` na subscription do canal. Isso:
- Reduz tráfego de rede (servidor só envia eventos do próprio usuário)
- Adiciona camada extra além do RLS
- É a prática oficial recomendada pelo Supabase

## Mudança em 1 arquivo

**`src/hooks/useRealtimeNotificacoes.ts`**:
- Obter `user.id` via `useAuth()` ou `supabase.auth.getUser()`
- Adicionar `filter: \`user_id=eq.${userId}\`` nas duas subscriptions (INSERT e UPDATE)
- Não criar canal se não houver usuário autenticado
- Usar nome de canal único por usuário: `notificacoes-${userId}`

## Após implementar
- Marcar a finding `notificacoes_realtime_no_channel_auth` como `mark_as_fixed` com explicação técnica clara: RLS da tabela já filtra + filtro adicional no client por user_id + impossibilidade de modificar schema reservado `realtime`.

## O que NÃO faremos
- NÃO criar policies em `realtime.messages` (proibido pelas regras do Supabase)
- NÃO mudar a tabela `notificacoes` (RLS já está correto)
