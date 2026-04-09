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