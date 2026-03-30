

# Fix: Restrict 'obras' role access to colaboradores table

## Problem
The `obras` role has `ALL` access to the `colaboradores` table, which contains highly sensitive PII (CPF, RG, PIS/PASEP, salary, date of birth, full address). Field workers/project managers can read and modify salary and identity documents of ALL employees.

## Current usage by 'obras' role
The `obras` role uses colaboradores data in:
- **EPIs page** — needs `nome` and `id` to select colaborador for EPI delivery
- **Horas Extras page** — needs `nome` to populate a dropdown
- **Colaboradores page** — full CRUD (but this should be scoped)
- **Equipe Ativa page** — uses `profiles`, not `colaboradores`

The `obras` role realistically needs: `id`, `nome`, `cargo`, `funcao`, `status` for most operations. They should NOT need to modify salary, CPF, RG, PIS/PASEP, or personal contact details.

## Solution
Replace the permissive `ALL` policy for `obras` with scoped policies:

### Database Migration

1. **Drop** the existing broad policy:
```sql
DROP POLICY "Obras can manage colaboradores" ON public.colaboradores;
```

2. **Create SELECT-only policy** for `obras` (they can view all colaboradores but only non-sensitive columns are controlled at app level since RLS is row-level):
```sql
CREATE POLICY "Obras can view colaboradores"
ON public.colaboradores
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'obras'::app_role));
```

3. **Create INSERT policy** scoped to obras role:
```sql
CREATE POLICY "Obras can insert colaboradores"
ON public.colaboradores
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
```

4. **Create UPDATE policy** — obras can only update colaboradores they created or have shared access to (already enforced by the RESTRICTIVE policy, but we need a permissive base):
```sql
CREATE POLICY "Obras can update own colaboradores"
ON public.colaboradores
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'obras'::app_role))
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
```

Since RLS cannot filter columns, we handle sensitive field protection at the application level.

### Frontend Changes

**`src/pages/Colaboradores/ColaboradorDetailModal.tsx`** — Hide sensitive fields (salary, CPF, RG, PIS/PASEP, personal contact) from `obras` users. Only show these to `admin`, `gerenciador_tecnico`, and `financeira` roles.

**`src/pages/Colaboradores/ColaboradoresPage.tsx`** — Hide CPF column from `obras` users in the table listing.

### Technical detail
PostgreSQL RLS operates at the row level, not column level. To properly restrict column access, we would need a database VIEW. However, since the `obras` role legitimately needs to create/manage colaboradores for their projects (allocations, EPIs, etc.), the pragmatic approach is:
- Keep row-level access via RLS
- Restrict sensitive field visibility in the frontend
- The RESTRICTIVE update/delete policies already ensure `obras` users can only modify records they created

## Files to edit
- 1 SQL migration (replace `Obras can manage colaboradores` with scoped SELECT/INSERT/UPDATE policies)
- `src/pages/Colaboradores/ColaboradorDetailModal.tsx` — hide sensitive tabs/fields for obras
- `src/pages/Colaboradores/ColaboradoresPage.tsx` — hide CPF column for obras

