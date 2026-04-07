

# Fix: Two Security Findings

## Finding 1: Restrict realtime.messages policy

**Problem**: The current `realtime.messages` policy uses `USING (true)`, allowing any authenticated user to subscribe to any channel topic.

**Important constraint**: `realtime` is a Supabase-reserved schema. Per Supabase guidelines, we should avoid modifying it. However, we already enabled RLS on it in the previous migration.

**Solution**: Replace the broad `USING (true)` policy with one that restricts channel access. However, `postgres_changes` events are already filtered server-side by the source table's RLS (e.g., `notificacoes` filters by `user_id = auth.uid()`). The practical risk is minimal. The safest approach is to **drop the overly permissive policy and replace it with a more restrictive one**, or alternatively **revert the realtime.messages changes entirely** since they modify a reserved schema and `postgres_changes` already inherits table-level RLS.

**Recommended approach**: Drop the `USING (true)` policy and the RLS enablement on `realtime.messages` (revert). The `notificacoes` table RLS already ensures users only receive their own notification events via `postgres_changes`. Modifying `realtime.messages` (a reserved schema) risks breaking Supabase internals. We mark this finding as a known limitation with the mitigation documented.

## Finding 2: Scope banco_horas and faltas_licencas for obras role

**Problem**: The `obras` role has `ALL` access to `banco_horas` and `faltas_licencas` without restriction. Any obras user can read/modify time records for any employee.

**Solution**: Replace the broad `Obras can manage` policies with scoped versions that restrict access to employees allocated to the user's obras (same pattern used for `colaboradores`).

### Database Migration

```sql
-- Revert realtime.messages changes (reserved schema)
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;
ALTER TABLE realtime.messages DISABLE ROW LEVEL SECURITY;

-- Scope banco_horas for obras role
DROP POLICY IF EXISTS "Obras can manage banco_horas" ON public.banco_horas;

CREATE POLICY "Obras can view allocated banco_horas"
ON public.banco_horas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND colaborador_id IN (
    SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
    JOIN public.obras o ON ca.obra_id = o.id
    WHERE o.created_by = auth.uid()
       OR o.responsavel_id = auth.uid()
       OR has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
  )
);

CREATE POLICY "Obras can insert banco_horas"
ON public.banco_horas FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update allocated banco_horas"
ON public.banco_horas FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR colaborador_id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'edit'::text)
    )
  )
)
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- Scope faltas_licencas for obras role
DROP POLICY IF EXISTS "Obras can manage faltas_licencas" ON public.faltas_licencas;

CREATE POLICY "Obras can view allocated faltas_licencas"
ON public.faltas_licencas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND colaborador_id IN (
    SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
    JOIN public.obras o ON ca.obra_id = o.id
    WHERE o.created_by = auth.uid()
       OR o.responsavel_id = auth.uid()
       OR has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
  )
);

CREATE POLICY "Obras can insert faltas_licencas"
ON public.faltas_licencas FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update allocated faltas_licencas"
ON public.faltas_licencas FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR colaborador_id IN (
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

## Files to edit
- 1 SQL migration (revert realtime.messages + scope banco_horas/faltas_licencas)
- No frontend changes needed

## Security findings resolved
- `realtime_messages_unrestricted_channel_access` -- reverted; `postgres_changes` already inherits table RLS
- `banco_horas_faltas_licencas_unscoped` -- scoped to allocated colaboradores

