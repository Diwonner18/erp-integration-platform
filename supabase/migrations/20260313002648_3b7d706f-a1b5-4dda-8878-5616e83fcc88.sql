CREATE POLICY "GT cannot update to admin role"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role != 'admin'::app_role
);