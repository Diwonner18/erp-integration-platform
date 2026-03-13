

## Fix: Prevent self-role assignment on `user_roles`

### Problem
The `gerenciador_tecnico` can assign roles to themselves via direct API calls to `user_roles`, bypassing the Edge Function restrictions. This allows privilege escalation.

### Solution
Add three RESTRICTIVE RLS policies on `user_roles` to prevent any user from modifying their own role assignments:

1. **RESTRICTIVE INSERT** — `user_id <> auth.uid()` prevents self-assignment
2. **RESTRICTIVE UPDATE** — `user_id <> auth.uid()` prevents self-modification  
3. **RESTRICTIVE DELETE** — `user_id <> auth.uid()` prevents self-removal

These work alongside existing policies. The `manage-user` Edge Function uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS), so admin user management is unaffected.

### Migration SQL
```sql
CREATE POLICY "Prevent self-role assignment"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (user_id <> auth.uid());

CREATE POLICY "Prevent self-role modification"
ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
USING (user_id <> auth.uid());

CREATE POLICY "Prevent self-role deletion"
ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
USING (user_id <> auth.uid());
```

### Impact
- GT manages other users' roles: works (via Edge Function + service role key)
- GT assigns role to themselves via API: blocked
- Admin manages all roles: works (Edge Function bypasses RLS)
- `handle_new_user` trigger: works (SECURITY DEFINER bypasses RLS)

