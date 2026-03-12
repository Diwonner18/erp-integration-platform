
-- Drop all 5 RESTRICTIVE policies on acessos_compartilhados
DROP POLICY IF EXISTS "Admins delete acessos" ON public.acessos_compartilhados;
DROP POLICY IF EXISTS "Admins insert acessos" ON public.acessos_compartilhados;
DROP POLICY IF EXISTS "Admins select acessos" ON public.acessos_compartilhados;
DROP POLICY IF EXISTS "Admins update acessos" ON public.acessos_compartilhados;
DROP POLICY IF EXISTS "Users view own acessos" ON public.acessos_compartilhados;

-- Recreate as PERMISSIVE
CREATE POLICY "Admins full access acessos"
ON public.acessos_compartilhados
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own acessos"
ON public.acessos_compartilhados
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
