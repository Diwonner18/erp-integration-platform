-- 1. Update handle_new_user to auto-assign 'cliente' for non-company emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );

  -- Auto-assign gerenciador_tecnico for specific email
  IF NEW.email = 'diwonner13@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'gerenciador_tecnico')
    ON CONFLICT (user_id, role) DO NOTHING;
  -- Auto-assign admin for specific email
  ELSIF NEW.email = 'carla@ctguedes.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  -- Auto-assign cliente for non-company emails
  ELSIF NEW.email NOT LIKE '%@ctguedes.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  -- Company emails (@ctguedes.com.br) without specific assignment will use self_assign_area RPC

  RETURN NEW;
END;
$$;

-- 2. Drop the permissive INSERT policy that allows any user to self-insert as cliente
DROP POLICY IF EXISTS "Users can insert own role as cliente only" ON public.user_roles;

-- 3. Add a RESTRICTIVE policy to block all direct INSERTs from regular users
CREATE POLICY "Block direct role inserts"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gerenciador_tecnico'::app_role)
);