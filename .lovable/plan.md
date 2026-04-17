
The scanner flags a real privilege escalation risk on `user_roles`:

1. **Insert risk**: Restrictive policy "Only admins can insert privileged roles" already blocks `admin` and `gerenciador_tecnico` assignments to others. But the scanner notes that GTs can still insert other non-privileged roles for any user — which is actually the intended behavior (GT manages operational users). However, we should verify the restrictive policy correctly blocks `gerenciador_tecnico` insertion by GTs.

2. **Update risk**: The current `WITH CHECK` only blocks promoting to `admin`/`gerenciador_tecnico`, but a GT could downgrade/change any existing role for any user without restriction.

3. **Edge function check**: `manage-user/index.ts` already validates allowed emails for `admin` and `gerenciador_tecnico` roles, but RLS at the DB level is the source of truth.

# Plan: Restrict GT role management to non-privileged roles only

## Database migration
Add/strengthen RESTRICTIVE RLS policies on `public.user_roles`:

1. **Restrict GT INSERT** to only non-privileged roles (`obras`, `financeira`, `comercial`, `cliente`):
   - New RESTRICTIVE policy: GTs can only insert rows where `role NOT IN ('admin', 'gerenciador_tecnico')`.

2. **Restrict GT UPDATE** to only operate on rows that are currently non-privileged AND only set to non-privileged roles:
   - New RESTRICTIVE policy: GTs updating user_roles must satisfy both:
     - USING: existing role is not `admin` or `gerenciador_tecnico`
     - WITH CHECK: new role is not `admin` or `gerenciador_tecnico`

3. **Restrict GT DELETE** similarly: GTs cannot delete `admin` or `gerenciador_tecnico` rows (only admins can).

These are RESTRICTIVE policies — they combine via AND with existing permissive ones, closing the loophole without breaking legitimate GT workflows (managing obras/financeira/comercial/cliente users).

Admins remain unaffected (their permissive policies allow full management).

## Mark finding as fixed
After migration is applied, mark `user_roles_gt_privilege_escalation` as fixed with explanation of the new restrictive policies.

## What we will NOT change
- Edge function `manage-user` already enforces allowed emails — no changes needed.
- Admin policies remain untouched.
- `Prevent self-role assignment` policy stays in place.
