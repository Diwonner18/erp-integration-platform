
-- Update insert_audit_log to auto-fill data_expiracao (default 5 years)
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  _acao text,
  _descricao text DEFAULT NULL::text,
  _tabela text DEFAULT NULL::text,
  _registro_id uuid DEFAULT NULL::uuid,
  _entidade text DEFAULT NULL::text,
  _entidade_id text DEFAULT NULL::text,
  _dados_anteriores jsonb DEFAULT NULL::jsonb,
  _dados_novos jsonb DEFAULT NULL::jsonb,
  _modulo text DEFAULT NULL::text,
  _nivel_sensibilidade text DEFAULT 'baixo'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid;
  _email text;
  _nome text;
  _role text;
  _new_id uuid;
BEGIN
  _uid := auth.uid();

  SELECT p.email, p.full_name INTO _email, _nome
  FROM public.profiles p
  WHERE p.id = _uid;

  SELECT ur.role::text INTO _role
  FROM public.user_roles ur
  WHERE ur.user_id = _uid
  LIMIT 1;

  INSERT INTO public.logs_auditoria (
    acao, descricao, tabela, registro_id, entidade, entidade_id,
    dados_anteriores, dados_novos, modulo, nivel_sensibilidade,
    user_id, usuario_email, usuario_nome, usuario_tipo,
    origem, created_at, data_expiracao
  ) VALUES (
    _acao, _descricao, _tabela, _registro_id, _entidade, _entidade_id,
    _dados_anteriores, _dados_novos, _modulo, _nivel_sensibilidade,
    _uid, _email, _nome, _role,
    'sistema', now(), now() + interval '5 years'
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$function$;
