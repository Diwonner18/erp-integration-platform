

# Fix: Three Security Findings

## Finding 1: `user_roles_gt_escalation` — Add USING clause to UPDATE policy

**Current state**: The RESTRICTIVE UPDATE policy "Only admins can update to privileged roles" has a `WITH CHECK` that prevents writing admin/GT values, but no `USING` clause. This means a GT user could select existing admin role records and update them (e.g., demote an admin to 'obras'). While the scanner's specific concern (escalation TO privileged roles) is already blocked by WITH CHECK, we should add a USING clause for defense in depth.

**Fix**: Drop and recreate the UPDATE restrictive policy with both USING and WITH CHECK:
- USING: prevent non-admins from modifying records that currently have privileged roles
- WITH CHECK: prevent non-admins from setting roles to privileged values (already exists)

```sql
DROP POLICY IF EXISTS "Only admins can update to privileged roles" ON public.user_roles;
CREATE POLICY "Only admins can update to privileged roles"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);
```

## Finding 2: `realtime_messages_no_policies` — Ignore (Known Limitation)

Same as previously addressed `realtime_messages_no_rls`. The `realtime` schema is reserved by Supabase — modifying it risks breaking internals. Source table RLS on `notificacoes` (`user_id = auth.uid()`) ensures `postgres_changes` events are filtered server-side before delivery.

## Finding 3: `logs_auditoria_no_insert_policy` — Ignore (By Design)

All writes to `logs_auditoria` go through the `insert_audit_log` SECURITY DEFINER function, which captures identity from the authenticated session. There is no permissive INSERT policy, so direct client inserts are already denied by Postgres RLS. This is secure by design.

## Actions
1. One SQL migration (recreate UPDATE policy with USING clause)
2. Mark `user_roles_gt_escalation` as fixed
3. Mark `realtime_messages_no_policies` as ignored
4. Mark `logs_auditoria_no_insert_policy` as ignored

## Files to edit
- 1 SQL migration
- No frontend changes

