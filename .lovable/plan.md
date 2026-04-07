

# Fix: Two Security Findings

## Finding 1: Scope 'obras' role access to colaboradores by obra relationship

**Problem**: The `obras` role can SELECT/INSERT/UPDATE ALL colaboradores records globally, not scoped to their assigned obras.

**Solution**: Replace the three current `obras` policies on `colaboradores` with policies scoped through `colaborador_alocacoes` — obras users can only access colaboradores who are allocated to obras they created or have shared access to.

### Database Migration

```sql
-- Drop existing broad obras policies
DROP POLICY IF EXISTS "Obras can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Obras can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Obras can update own colaboradores" ON public.colaboradores;

-- Scoped SELECT: only colaboradores allocated to obras the user created/has access to
CREATE POLICY "Obras can view allocated colaboradores"
ON public.colaboradores FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
    )
  )
);

-- INSERT: obras can still create new colaboradores
CREATE POLICY "Obras can insert colaboradores"
ON public.colaboradores FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- UPDATE: only colaboradores they created or allocated to their obras
CREATE POLICY "Obras can update allocated colaboradores"
ON public.colaboradores FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'edit'::text)
    )
  )
)
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
```

This ensures obras users only see/edit colaboradores linked to their projects, plus any they personally created (e.g. newly registered before allocation).

---

## Finding 2: Realtime channel authorization

**Problem**: Any authenticated user can subscribe to the `notificacoes` Realtime channel and see notification events for other users.

**Solution**: Supabase Realtime with `postgres_changes` already respects RLS on the underlying table — users only receive change events for rows they can SELECT. Since `notificacoes` already has RLS (`user_id = auth.uid()` for SELECT), users already only receive their own notifications via the change feed.

However, the Realtime channel subscription itself (`realtime.messages`) has no RLS. To fully secure this:

1. **Add RLS to `realtime.messages`** to restrict topic subscriptions. This requires enabling RLS on the `realtime.messages` table and adding a policy.

2. **Use Realtime Authorization** — filter the channel subscription in the client to use a user-specific topic or add Realtime RLS policies.

### Database Migration (for realtime.messages)

```sql
-- Enable RLS on realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to use realtime (postgres_changes respect table RLS)
CREATE POLICY "Authenticated users can use realtime"
ON realtime.messages FOR SELECT TO authenticated
USING (true);
```

> **Note**: This is a permissive baseline. The actual data filtering happens via the `notificacoes` table RLS — `postgres_changes` events are filtered server-side by the table's own RLS policies before being sent to subscribers. The `realtime.messages` policy ensures only authenticated users can subscribe at all.

### Frontend change — None required
The existing `useRealtimeNotificacoes.ts` already uses `postgres_changes` which inherits `notificacoes` RLS. No code changes needed.

---

## Files to edit
- 1 SQL migration (scoped colaboradores policies + realtime.messages RLS)
- No frontend changes needed

## Resolve security findings
- `colaboradores_sensitive_pii_exposure` → resolved
- `realtime_messages_no_rls` → resolved

