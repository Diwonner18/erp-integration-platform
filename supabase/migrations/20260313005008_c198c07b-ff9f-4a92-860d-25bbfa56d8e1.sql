CREATE POLICY "GT cannot delete admin role"
ON public.user_roles AS RESTRICTIVE
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR role != 'admin'::app_role
);