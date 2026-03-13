
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

  -- Check if user already has a role (e.g. assigned by manage-user edge function)
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

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
$function$;
