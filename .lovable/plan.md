

# Fix: Add CHECK constraint to `nivel_acesso` column

## Problem
The `acessos_compartilhados.nivel_acesso` column is `text NOT NULL DEFAULT 'view'` with no database-level constraint. A direct API call could write arbitrary values.

## Solution
One SQL migration to add a CHECK constraint restricting values to `'view'`, `'edit'`, `'all'`.

```sql
ALTER TABLE public.acessos_compartilhados
  ADD CONSTRAINT nivel_acesso_valid
  CHECK (nivel_acesso IN ('view', 'edit', 'all'));
```

The value `'all'` is included because the existing `has_record_access` function and the Aprovacoes UI both use it as a valid level.

## Files changed
- 1 SQL migration
- No frontend changes
- Mark `nivel_acesso_unconstrained` as fixed

