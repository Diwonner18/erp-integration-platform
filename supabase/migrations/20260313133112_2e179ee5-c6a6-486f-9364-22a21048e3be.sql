
CREATE POLICY "Prevent self-role assignment"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (user_id <> auth.uid());

CREATE POLICY "Prevent self-role modification"
ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
USING (user_id <> auth.uid());

CREATE POLICY "Prevent self-role deletion"
ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
USING (user_id <> auth.uid());
