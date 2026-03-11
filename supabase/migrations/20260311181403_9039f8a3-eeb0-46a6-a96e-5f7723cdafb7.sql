-- =============================================
-- V1 + V2: Fix privilege escalation on user_roles
-- =============================================

-- Drop the dangerous policy that allows any role self-assignment
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- New policy: users can only self-assign 'cliente' role
CREATE POLICY "Users can insert own role as cliente only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'cliente');

-- Admin-only function to assign internal roles
CREATE OR REPLACE FUNCTION public.assign_internal_role(
  _target_user_id uuid,
  _role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  
  IF _role != 'cliente' AND (_target_email IS NULL OR _target_email NOT LIKE '%@ctguedes.com.br') THEN
    RAISE EXCEPTION 'Roles internos só podem ser atribuídos a e-mails @ctguedes.com.br.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- =============================================
-- V3: Auto-fill created_by via trigger
-- =============================================

CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_created_by_obras BEFORE INSERT ON public.obras FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_propostas BEFORE INSERT ON public.propostas FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_medicoes BEFORE INSERT ON public.medicoes FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_programacoes BEFORE INSERT ON public.programacoes FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_materiais BEFORE INSERT ON public.materiais FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_equipamentos BEFORE INSERT ON public.equipamentos FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_epis BEFORE INSERT ON public.epis FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_boletins BEFORE INSERT ON public.boletins_medicao FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_despesas BEFORE INSERT ON public.despesas FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_horas_extras BEFORE INSERT ON public.horas_extras FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_alteracoes BEFORE INSERT ON public.alteracoes_escopo FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_relatorios BEFORE INSERT ON public.relatorios_diarios FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_clientes BEFORE INSERT ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_modelos BEFORE INSERT ON public.modelos_contrato FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
CREATE TRIGGER set_created_by_valores BEFORE INSERT ON public.valores_unitarios FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- =============================================
-- V5: Convert ALL policies from RESTRICTIVE to PERMISSIVE
-- =============================================

-- aceites_digitais
DROP POLICY IF EXISTS "Admins full access aceites" ON public.aceites_digitais;
DROP POLICY IF EXISTS "Clientes can insert own aceite" ON public.aceites_digitais;
DROP POLICY IF EXISTS "Clientes view own aceites" ON public.aceites_digitais;
DROP POLICY IF EXISTS "Comercial view aceites" ON public.aceites_digitais;

CREATE POLICY "Admins full access aceites" ON public.aceites_digitais FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes can insert own aceite" ON public.aceites_digitais FOR INSERT TO authenticated
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));
CREATE POLICY "Clientes view own aceites" ON public.aceites_digitais FOR SELECT TO authenticated
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));
CREATE POLICY "Comercial view aceites" ON public.aceites_digitais FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'));

-- alteracoes_escopo
DROP POLICY IF EXISTS "Admins full access alteracoes" ON public.alteracoes_escopo;
DROP POLICY IF EXISTS "Comercial can view alteracoes" ON public.alteracoes_escopo;
DROP POLICY IF EXISTS "Obras can manage alteracoes" ON public.alteracoes_escopo;

CREATE POLICY "Admins full access alteracoes" ON public.alteracoes_escopo FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Comercial can view alteracoes" ON public.alteracoes_escopo FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'));
CREATE POLICY "Obras can manage alteracoes" ON public.alteracoes_escopo FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- aprovacoes
DROP POLICY IF EXISTS "Admins full access aprovacoes" ON public.aprovacoes;
DROP POLICY IF EXISTS "Aprovadores can update" ON public.aprovacoes;
DROP POLICY IF EXISTS "Users view own aprovacoes" ON public.aprovacoes;

CREATE POLICY "Admins full access aprovacoes" ON public.aprovacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Aprovadores can update" ON public.aprovacoes FOR UPDATE TO authenticated
  USING (aprovador_id = auth.uid()) WITH CHECK (aprovador_id = auth.uid());
CREATE POLICY "Users view own aprovacoes" ON public.aprovacoes FOR SELECT TO authenticated
  USING (solicitante_id = auth.uid() OR aprovador_id = auth.uid());

-- boletins_medicao
DROP POLICY IF EXISTS "Admins full access boletins" ON public.boletins_medicao;
DROP POLICY IF EXISTS "Financeira can manage boletins" ON public.boletins_medicao;
DROP POLICY IF EXISTS "Obras can view boletins" ON public.boletins_medicao;

CREATE POLICY "Admins full access boletins" ON public.boletins_medicao FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Financeira can manage boletins" ON public.boletins_medicao FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira')) WITH CHECK (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can view boletins" ON public.boletins_medicao FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'));

-- clientes
DROP POLICY IF EXISTS "Admins full access clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes view own data" ON public.clientes;
DROP POLICY IF EXISTS "Comercial full access clientes" ON public.clientes;
DROP POLICY IF EXISTS "Internal users can view clientes" ON public.clientes;

CREATE POLICY "Admins full access clientes" ON public.clientes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes view own data" ON public.clientes FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Comercial full access clientes" ON public.clientes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial')) WITH CHECK (has_role(auth.uid(), 'comercial'));
CREATE POLICY "Internal users can view clientes" ON public.clientes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras') OR has_role(auth.uid(), 'financeira'));

-- despesas
DROP POLICY IF EXISTS "Admins full access despesas" ON public.despesas;
DROP POLICY IF EXISTS "Financeira can manage despesas" ON public.despesas;
DROP POLICY IF EXISTS "Obras can insert despesas" ON public.despesas;
DROP POLICY IF EXISTS "Obras can view despesas" ON public.despesas;

CREATE POLICY "Admins full access despesas" ON public.despesas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Financeira can manage despesas" ON public.despesas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira')) WITH CHECK (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can insert despesas" ON public.despesas FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'obras'));
CREATE POLICY "Obras can view despesas" ON public.despesas FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'));

-- epis
DROP POLICY IF EXISTS "Admins full access epis" ON public.epis;
DROP POLICY IF EXISTS "Obras can manage epis" ON public.epis;

CREATE POLICY "Admins full access epis" ON public.epis FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Obras can manage epis" ON public.epis FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- equipamentos
DROP POLICY IF EXISTS "Admins full access equipamentos" ON public.equipamentos;
DROP POLICY IF EXISTS "Obras can manage equipamentos" ON public.equipamentos;

CREATE POLICY "Admins full access equipamentos" ON public.equipamentos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Obras can manage equipamentos" ON public.equipamentos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- horas_extras
DROP POLICY IF EXISTS "Admins full access horas_extras" ON public.horas_extras;
DROP POLICY IF EXISTS "Financeira can view horas_extras" ON public.horas_extras;
DROP POLICY IF EXISTS "Obras can manage horas_extras" ON public.horas_extras;

CREATE POLICY "Admins full access horas_extras" ON public.horas_extras FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Financeira can view horas_extras" ON public.horas_extras FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can manage horas_extras" ON public.horas_extras FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- logs_auditoria
DROP POLICY IF EXISTS "Admins can view logs" ON public.logs_auditoria;
DROP POLICY IF EXISTS "System can insert logs" ON public.logs_auditoria;

CREATE POLICY "Admins can view logs" ON public.logs_auditoria FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert logs" ON public.logs_auditoria FOR INSERT TO authenticated
  WITH CHECK (true);

-- materiais
DROP POLICY IF EXISTS "Admins full access materiais" ON public.materiais;
DROP POLICY IF EXISTS "Financeira can view materiais" ON public.materiais;
DROP POLICY IF EXISTS "Obras can manage materiais" ON public.materiais;

CREATE POLICY "Admins full access materiais" ON public.materiais FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Financeira can view materiais" ON public.materiais FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can manage materiais" ON public.materiais FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- medicoes
DROP POLICY IF EXISTS "Admins full access medicoes" ON public.medicoes;
DROP POLICY IF EXISTS "Clientes view own medicoes" ON public.medicoes;
DROP POLICY IF EXISTS "Financeira can view medicoes" ON public.medicoes;
DROP POLICY IF EXISTS "Obras can manage medicoes" ON public.medicoes;

CREATE POLICY "Admins full access medicoes" ON public.medicoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes view own medicoes" ON public.medicoes FOR SELECT TO authenticated
  USING (obra_id IN (SELECT o.id FROM obras o JOIN clientes c ON o.cliente_id = c.id WHERE c.user_id = auth.uid()));
CREATE POLICY "Financeira can view medicoes" ON public.medicoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can manage medicoes" ON public.medicoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- modelos_contrato
DROP POLICY IF EXISTS "Admins full access modelos" ON public.modelos_contrato;
DROP POLICY IF EXISTS "Comercial can manage modelos" ON public.modelos_contrato;

CREATE POLICY "Admins full access modelos" ON public.modelos_contrato FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Comercial can manage modelos" ON public.modelos_contrato FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial')) WITH CHECK (has_role(auth.uid(), 'comercial'));

-- notificacoes
DROP POLICY IF EXISTS "Admins full access notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Users update own notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Users view own notificacoes" ON public.notificacoes;

CREATE POLICY "Admins full access notificacoes" ON public.notificacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own notificacoes" ON public.notificacoes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own notificacoes" ON public.notificacoes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- obra_checklist
DROP POLICY IF EXISTS "Admins full access checklist" ON public.obra_checklist;
DROP POLICY IF EXISTS "Obras can manage checklist" ON public.obra_checklist;

CREATE POLICY "Admins full access checklist" ON public.obra_checklist FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Obras can manage checklist" ON public.obra_checklist FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- obras
DROP POLICY IF EXISTS "Admins full access obras" ON public.obras;
DROP POLICY IF EXISTS "Clientes view own obras" ON public.obras;
DROP POLICY IF EXISTS "Internal users can view obras" ON public.obras;
DROP POLICY IF EXISTS "Obras team can manage obras" ON public.obras;

CREATE POLICY "Admins full access obras" ON public.obras FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes view own obras" ON public.obras FOR SELECT TO authenticated
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));
CREATE POLICY "Internal users can view obras" ON public.obras FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras') OR has_role(auth.uid(), 'financeira') OR has_role(auth.uid(), 'comercial'));
CREATE POLICY "Obras team can manage obras" ON public.obras FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- programacoes
DROP POLICY IF EXISTS "Admins full access programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Clientes view own programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Comercial can view programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Financeira can view programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Obras can manage programacoes" ON public.programacoes;

CREATE POLICY "Admins full access programacoes" ON public.programacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes view own programacoes" ON public.programacoes FOR SELECT TO authenticated
  USING (obra_id IN (SELECT o.id FROM obras o JOIN clientes c ON o.cliente_id = c.id WHERE c.user_id = auth.uid()));
CREATE POLICY "Comercial can view programacoes" ON public.programacoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'));
CREATE POLICY "Financeira can view programacoes" ON public.programacoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can manage programacoes" ON public.programacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- propostas
DROP POLICY IF EXISTS "Admins full access propostas" ON public.propostas;
DROP POLICY IF EXISTS "Clientes view own propostas" ON public.propostas;
DROP POLICY IF EXISTS "Comercial full access propostas" ON public.propostas;
DROP POLICY IF EXISTS "Internal users can view propostas" ON public.propostas;

CREATE POLICY "Admins full access propostas" ON public.propostas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clientes view own propostas" ON public.propostas FOR SELECT TO authenticated
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));
CREATE POLICY "Comercial full access propostas" ON public.propostas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial')) WITH CHECK (has_role(auth.uid(), 'comercial'));
CREATE POLICY "Internal users can view propostas" ON public.propostas FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras') OR has_role(auth.uid(), 'financeira'));

-- relatorios_diarios
DROP POLICY IF EXISTS "Admins full access relatorios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Obras can manage relatorios" ON public.relatorios_diarios;

CREATE POLICY "Admins full access relatorios" ON public.relatorios_diarios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Obras can manage relatorios" ON public.relatorios_diarios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras')) WITH CHECK (has_role(auth.uid(), 'obras'));

-- retencoes
DROP POLICY IF EXISTS "Admins full access retencoes" ON public.retencoes;
DROP POLICY IF EXISTS "Financeira can manage retencoes" ON public.retencoes;

CREATE POLICY "Admins full access retencoes" ON public.retencoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Financeira can manage retencoes" ON public.retencoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira')) WITH CHECK (has_role(auth.uid(), 'financeira'));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- valores_unitarios
DROP POLICY IF EXISTS "Admins full access valores" ON public.valores_unitarios;
DROP POLICY IF EXISTS "Comercial can manage valores" ON public.valores_unitarios;
DROP POLICY IF EXISTS "Financeira can view valores" ON public.valores_unitarios;
DROP POLICY IF EXISTS "Obras can view valores" ON public.valores_unitarios;

CREATE POLICY "Admins full access valores" ON public.valores_unitarios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Comercial can manage valores" ON public.valores_unitarios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial')) WITH CHECK (has_role(auth.uid(), 'comercial'));
CREATE POLICY "Financeira can view valores" ON public.valores_unitarios FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'));
CREATE POLICY "Obras can view valores" ON public.valores_unitarios FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'));