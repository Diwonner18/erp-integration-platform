
-- Update handle_new_user to use new admin emails
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

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  IF NEW.email = 'diwonner13@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'gerenciador_tecnico')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email IN ('carla.todesco@ctguedes.com.br', 'adm@ctguedes.com.br') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email NOT LIKE '%@ctguedes.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'cliente')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update assign_internal_role to allow both admin emails
CREATE OR REPLACE FUNCTION public.assign_internal_role(_target_user_id uuid, _role app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _caller_role app_role;
  _target_email text;
BEGIN
  SELECT role INTO _caller_role FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerenciador_tecnico');
  IF _caller_role IS NULL THEN
    RAISE EXCEPTION 'Apenas administradores ou gerenciadores técnicos podem atribuir roles.';
  END IF;

  SELECT email INTO _target_email FROM auth.users WHERE id = _target_user_id;

  IF _role = 'admin' AND _target_email NOT IN ('carla.todesco@ctguedes.com.br', 'adm@ctguedes.com.br') THEN
    RAISE EXCEPTION 'O role admin só pode ser atribuído a e-mails autorizados.';
  END IF;

  IF _role = 'gerenciador_tecnico' AND _target_email NOT IN ('diwonner13@gmail.com', 'aline.guedes@ctguedes.com.br', 'clara.todescog@ctguedes.com.br', 'agostinho@ctguedes.com.br') THEN
    RAISE EXCEPTION 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;
