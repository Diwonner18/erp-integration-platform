
-- Update handle_new_user to auto-assign gerenciador_tecnico for diwonner13@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  END IF;

  RETURN NEW;
END;
$function$;

-- Insert role for existing user if they exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'gerenciador_tecnico'::app_role
FROM auth.users
WHERE email = 'diwonner13@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
