CREATE OR REPLACE FUNCTION public.assign_internal_role(_target_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _caller_role app_role;
  _target_email text;
BEGIN
  SELECT role INTO _caller_role FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin';
  IF _caller_role IS NULL THEN
    RAISE EXCEPTION 'Apenas administradores podem atribuir roles internos.';
  END IF;

  SELECT email INTO _target_email FROM auth.users WHERE id = _target_user_id;

  IF _role = 'admin' AND _target_email IS DISTINCT FROM 'carla@ctguedes.com.br' THEN
    RAISE EXCEPTION 'O role admin só pode ser atribuído ao e-mail carla@ctguedes.com.br.';
  END IF;

  IF _role != 'cliente' AND (_target_email IS NULL OR _target_email NOT LIKE '%@ctguedes.com.br') THEN
    RAISE EXCEPTION 'Roles internos só podem ser atribuídos a e-mails @ctguedes.com.br.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;