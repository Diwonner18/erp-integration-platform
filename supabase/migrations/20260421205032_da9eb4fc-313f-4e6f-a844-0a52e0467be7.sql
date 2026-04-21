-- 1. Drop GT direct write policies on user_roles (keep SELECT)
DROP POLICY IF EXISTS "GT can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "GT can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "GT can delete user_roles" ON public.user_roles;

-- 2. Add dados_solicitacao column to aprovacoes
ALTER TABLE public.aprovacoes
  ADD COLUMN IF NOT EXISTS dados_solicitacao jsonb;

-- 3. Create apply_role_change function
CREATE OR REPLACE FUNCTION public.apply_role_change(_aprovacao_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _caller uuid;
  _aprov record;
  _action text;
  _target_user_id uuid;
  _new_role app_role;
  _old_role app_role;
BEGIN
  _caller := auth.uid();
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'Não autenticado.';
  END IF;

  IF NOT has_role(_caller, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem aplicar mudanças de role.';
  END IF;

  SELECT * INTO _aprov FROM public.aprovacoes WHERE id = _aprovacao_id;
  IF _aprov.id IS NULL THEN
    RAISE EXCEPTION 'Aprovação não encontrada.';
  END IF;

  IF _aprov.status <> 'pendente'::aprovacao_status THEN
    RAISE EXCEPTION 'Aprovação já foi processada (status: %).', _aprov.status;
  END IF;

  IF _aprov.tipo NOT IN ('atribuicao_role', 'alteracao_role') THEN
    RAISE EXCEPTION 'Tipo de aprovação não suportado: %.', _aprov.tipo;
  END IF;

  IF _aprov.dados_solicitacao IS NULL THEN
    RAISE EXCEPTION 'Aprovação sem dados_solicitacao.';
  END IF;

  _action := _aprov.dados_solicitacao->>'action';
  _target_user_id := (_aprov.dados_solicitacao->>'target_user_id')::uuid;
  _new_role := (_aprov.dados_solicitacao->>'role_pretendido')::app_role;

  IF _target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id ausente.';
  END IF;

  IF _action IN ('create', 'update') THEN
    IF _new_role IS NULL THEN
      RAISE EXCEPTION 'role_pretendido ausente.';
    END IF;

    -- Capture previous role for audit
    SELECT role INTO _old_role FROM public.user_roles WHERE user_id = _target_user_id LIMIT 1;

    -- Remove existing roles before assigning new (single role per user pattern)
    DELETE FROM public.user_roles WHERE user_id = _target_user_id;

    -- Reuse hardened assign_internal_role (validates allowed emails for admin/GT)
    PERFORM public.assign_internal_role(_target_user_id, _new_role);

  ELSE
    RAISE EXCEPTION 'Action inválida: %.', _action;
  END IF;

  -- Mark approval as approved
  UPDATE public.aprovacoes
  SET status = 'aprovada'::aprovacao_status,
      data_resposta = now(),
      aprovador_id = _caller
  WHERE id = _aprovacao_id;

  -- Audit log
  PERFORM public.insert_audit_log(
    'role_change_applied',
    format('Role aplicado via aprovação %s: usuário %s recebeu role %s (anterior: %s)',
      _aprovacao_id, _target_user_id, _new_role, COALESCE(_old_role::text, 'nenhum')),
    'user_roles',
    NULL,
    'user_roles',
    _target_user_id::text,
    jsonb_build_object('role_anterior', _old_role),
    jsonb_build_object('role_novo', _new_role, 'aprovacao_id', _aprovacao_id),
    'admin',
    'alto'
  );
END;
$$;