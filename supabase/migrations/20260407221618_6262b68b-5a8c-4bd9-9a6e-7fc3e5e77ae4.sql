-- Block GT from inserting privileged roles (admin or gerenciador_tecnico)
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