-- Restrictive policy: GT INSERT limited to non-privileged roles
CREATE POLICY "GT restrict insert to non-privileged roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  NOT public.has_role(auth.uid(), 'gerenciador_tecnico'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);

-- Restrictive policy: GT UPDATE limited to non-privileged rows and non-privileged target roles
CREATE POLICY "GT restrict update to non-privileged roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  NOT public.has_role(auth.uid(), 'gerenciador_tecnico'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
)
WITH CHECK (
  NOT public.has_role(auth.uid(), 'gerenciador_tecnico'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);

-- Restrictive policy: GT DELETE cannot remove admin or gerenciador_tecnico rows
CREATE POLICY "GT restrict delete of privileged roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  NOT public.has_role(auth.uid(), 'gerenciador_tecnico'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role)
);