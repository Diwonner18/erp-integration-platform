-- 1. Drop the insecure INSERT policy
DROP POLICY IF EXISTS "System can insert logs" ON public.logs_auditoria;

-- 2. Create SECURITY DEFINER function for audit log insertion
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  _acao text,
  _descricao text DEFAULT NULL,
  _tabela text DEFAULT NULL,
  _registro_id uuid DEFAULT NULL,
  _entidade text DEFAULT NULL,
  _entidade_id text DEFAULT NULL,
  _dados_anteriores jsonb DEFAULT NULL,
  _dados_novos jsonb DEFAULT NULL,
  _modulo text DEFAULT NULL,
  _nivel_sensibilidade text DEFAULT 'baixo'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    origem, created_at
  ) VALUES (
    _acao, _descricao, _tabela, _registro_id, _entidade, _entidade_id,
    _dados_anteriores, _dados_novos, _modulo, _nivel_sensibilidade,
    _uid, _email, _nome, _role,
    'sistema', now()
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;