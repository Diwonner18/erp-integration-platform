
-- RLS policies for gerenciador_tecnico: SELECT on all data tables
CREATE POLICY "Gerenciador tecnico can view obras" ON public.obras FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view propostas" ON public.propostas FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view medicoes" ON public.medicoes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view despesas" ON public.despesas FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view materiais" ON public.materiais FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view equipamentos" ON public.equipamentos FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view epis" ON public.epis FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view horas_extras" ON public.horas_extras FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view programacoes" ON public.programacoes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view boletins" ON public.boletins_medicao FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view relatorios" ON public.relatorios_diarios FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view clientes" ON public.clientes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view alteracoes" ON public.alteracoes_escopo FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view retencoes" ON public.retencoes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view logs" ON public.logs_auditoria FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view notificacoes" ON public.notificacoes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view aprovacoes" ON public.aprovacoes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view aceites" ON public.aceites_digitais FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view modelos" ON public.modelos_contrato FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view valores" ON public.valores_unitarios FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view acessos" ON public.acessos_compartilhados FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view obra_checklist" ON public.obra_checklist FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view retencao_followups" ON public.retencao_followups FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Gerenciador tecnico can view retencao_pagamentos" ON public.retencao_pagamentos FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- profiles: ALL for gerenciador_tecnico (view all + manage)
CREATE POLICY "Gerenciador tecnico can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- user_roles: ALL for gerenciador_tecnico
CREATE POLICY "Gerenciador tecnico can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role)) WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- Update assign_internal_role to accept gerenciador_tecnico callers
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
  -- Check caller is admin or gerenciador_tecnico
  SELECT role INTO _caller_role FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerenciador_tecnico');
  IF _caller_role IS NULL THEN
    RAISE EXCEPTION 'Apenas administradores ou gerenciadores técnicos podem atribuir roles.';
  END IF;

  SELECT email INTO _target_email FROM auth.users WHERE id = _target_user_id;

  IF _role = 'admin' AND _target_email IS DISTINCT FROM 'carla@ctguedes.com.br' THEN
    RAISE EXCEPTION 'O role admin só pode ser atribuído ao e-mail carla@ctguedes.com.br.';
  END IF;

  IF _role = 'gerenciador_tecnico' AND _target_email IS DISTINCT FROM 'diwonner13@gmail.com' THEN
    RAISE EXCEPTION 'O role gerenciador_tecnico só pode ser atribuído ao e-mail diwonner13@gmail.com.';
  END IF;

  IF _role NOT IN ('cliente', 'gerenciador_tecnico') AND (_target_email IS NULL OR _target_email NOT LIKE '%@ctguedes.com.br') THEN
    RAISE EXCEPTION 'Roles internos só podem ser atribuídos a e-mails @ctguedes.com.br.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;

-- Update has_record_access to also grant access to gerenciador_tecnico
CREATE OR REPLACE FUNCTION public.has_record_access(_user_id uuid, _tabela text, _registro_id uuid, _nivel text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    has_role(_user_id, 'admin'::app_role)
    OR has_role(_user_id, 'gerenciador_tecnico'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.acessos_compartilhados
      WHERE user_id = _user_id
        AND tabela = _tabela
        AND registro_id = _registro_id
        AND (expira_em IS NULL OR expira_em > now())
        AND (
          (_nivel = 'view')
          OR (_nivel = 'edit' AND nivel_acesso IN ('edit', 'all'))
          OR (_nivel = 'delete' AND nivel_acesso = 'all')
        )
    )
$function$;
