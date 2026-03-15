

## Fix: GT cannot update/demote admin roles

### Problem
The RESTRICTIVE UPDATE policy `GT cannot update to admin role` on `user_roles` only has a `WITH CHECK` (validates new value) but no `USING` clause (defaults to TRUE). This allows a `gerenciador_tecnico` to target an admin's role row and change it to a non-admin value like `obras`, effectively demoting the admin.

### Fix
Add a `USING` condition identical to the `WITH CHECK`: `has_role(auth.uid(), 'admin'::app_role) OR (role <> 'admin'::app_role)`. In the `USING` context, `role` refers to the **current** row value, blocking GT from even selecting admin rows as update targets.

Similarly, verify the RESTRICTIVE DELETE policy `GT cannot delete admin role` has a proper `USING` condition.

### Migration SQL
```sql
DROP POLICY IF EXISTS "GT cannot update to admin role" ON public.user_roles;
CREATE POLICY "GT cannot update to admin role"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  AS RESTRICTIVE
  USING (has_role(auth.uid(), 'admin'::app_role) OR (role <> 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (role <> 'admin'::app_role));
```

### Files
- 1 new SQL migration only. No frontend changes needed.

