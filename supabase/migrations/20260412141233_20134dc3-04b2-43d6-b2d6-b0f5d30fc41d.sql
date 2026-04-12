
-- V1: Split GT ALL policy on user_roles into granular per-operation policies

-- Drop the existing ALL policy
DROP POLICY IF EXISTS "Gerenciador tecnico can manage roles" ON public.user_roles;

-- GT can SELECT all roles (needed for user management UI)
CREATE POLICY "GT can select user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- GT can INSERT roles (restricted by existing RESTRICTIVE policies)
CREATE POLICY "GT can insert user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- GT can UPDATE roles (restricted by existing RESTRICTIVE policies)
CREATE POLICY "GT can update user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- GT can DELETE roles (restricted by existing RESTRICTIVE policies)
CREATE POLICY "GT can delete user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
