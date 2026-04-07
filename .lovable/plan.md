

# Fix: Two Security Findings

## Finding 1: realtime_messages_no_rls — Ignore (Known Limitation)

**Problem**: The scanner reports no RLS on `realtime.messages`. We already reverted RLS on this reserved schema in the previous migration because modifying `realtime.*` risks breaking Supabase internals.

**Resolution**: Mark as ignored. The `notificacoes` table has its own RLS (`user_id = auth.uid()`), and Supabase `postgres_changes` filters events server-side using the source table's RLS before delivery. Users only receive their own notification events regardless of channel subscription. This is documented in our `realtime-data-filtering` memory.

**Action**: Use `manage_security_finding` to set `ignore: true` with justification.

## Finding 2: gerenciador_tecnico_privilege_escalation — Restrict GT Role Assignment

**Problem**: The GT has `ALL` access on `user_roles` via the permissive policy "Gerenciador tecnico can manage roles". Existing restrictive policies block GT from:
- Assigning/updating to `admin` role
- Deleting `admin` role records
- Self-assignment (via `self_assign_area` and edge function checks)

However, GT can still assign the `gerenciador_tecnico` role to any user, effectively creating more GTs.

**Solution**: Add a new RESTRICTIVE policy on `user_roles` for INSERT and UPDATE that prevents GT users from assigning the `gerenciador_tecnico` role. Only admins should be able to assign `admin` or `gerenciador_tecnico`. The edge function `manage-user` already enforces an allowlist for GT emails, but RLS should enforce this at the database level too.

Regarding `has_record_access()` granting GT blanket access — this is intentional by design (GT is a trusted supervisory role with visibility across all shared records). We will mark this as acknowledged.

### Database Migration

```sql
-- Restrict GT from assigning gerenciador_tecnico role via RLS
CREATE POLICY "Only admins can assign privileged roles"
ON public.user_roles AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);

-- Also restrict UPDATE to prevent GT from changing someone's role TO gerenciador_tecnico
-- (existing policy only blocks updating TO admin)
DROP POLICY IF EXISTS "GT cannot update to admin role" ON public.user_roles;
CREATE POLICY "Only admins can update to privileged roles"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role != 'admin'::app_role
)
-- Keep existing admin-only restriction; additionally block GT self-promotion is already handled
-- Note: We keep the admin check as-is since GT assigning GT is blocked by the INSERT policy
;
```

Wait — the existing restrictive INSERT policy "Block direct role inserts" already requires the caller to be admin or GT. Combined with the new policy, GT inserts would need `role NOT IN (admin, gerenciador_tecnico)`. This correctly limits GT to only assigning operational roles (obras, financeira, comercial, cliente).

### Final Migration SQL

```sql
-- Block GT from inserting privileged roles (admin or gerenciador_tecnico)
-- Existing "Block direct role inserts" requires admin or GT to insert
-- This further restricts: only admin can insert admin/GT roles
CREATE POLICY "Only admins can insert privileged roles"
ON public.user_roles AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);

-- Replace existing update restriction to also block GT→GT promotion
DROP POLICY IF EXISTS "GT cannot update to admin role" ON public.user_roles;
CREATE POLICY "Only admins can update to privileged roles"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);
```

### Security Finding Management
- `realtime_messages_no_rls` → ignore (postgres_changes inherits table RLS; reserved schema)
- `gerenciador_tecnico_privilege_escalation` → resolved via migration (GT restricted to operational roles only; blanket `has_record_access` is intentional for supervisory role)

## Files to edit
- 1 SQL migration
- No frontend changes

