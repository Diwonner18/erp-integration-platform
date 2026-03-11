
-- =====================================================
-- CONVERTER TODAS AS 71 RLS POLICIES PARA PERMISSIVE
-- =====================================================
-- Problema: Todas as policies são RESTRICTIVE, o que bloqueia todo acesso via RLS.
-- Solução: Dropar e recriar cada policy com AS PERMISSIVE explícito.

-- =====================================================
-- 1. aceites_digitais (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access aceites" ON public.aceites_digitais;
DROP POLICY IF EXISTS "Clientes can insert own aceite" ON public.aceites_digitais;
DROP POLICY IF EXISTS "Clientes view own aceites" ON public.aceites_digitais;
DROP POLICY IF EXISTS "Comercial view aceites" ON public.aceites_digitais;

CREATE POLICY "Admins full access aceites" ON public.aceites_digitais AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clientes can insert own aceite" ON public.aceites_digitais AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

CREATE POLICY "Clientes view own aceites" ON public.aceites_digitais AS PERMISSIVE FOR SELECT TO authenticated
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

CREATE POLICY "Comercial view aceites" ON public.aceites_digitais AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

-- =====================================================
-- 2. alteracoes_escopo (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access alteracoes" ON public.alteracoes_escopo;
DROP POLICY IF EXISTS "Comercial can view alteracoes" ON public.alteracoes_escopo;
DROP POLICY IF EXISTS "Obras can manage alteracoes" ON public.alteracoes_escopo;

CREATE POLICY "Admins full access alteracoes" ON public.alteracoes_escopo AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Comercial can view alteracoes" ON public.alteracoes_escopo AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Obras can manage alteracoes" ON public.alteracoes_escopo AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 3. aprovacoes (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access aprovacoes" ON public.aprovacoes;
DROP POLICY IF EXISTS "Aprovadores can update" ON public.aprovacoes;
DROP POLICY IF EXISTS "Users view own aprovacoes" ON public.aprovacoes;

CREATE POLICY "Admins full access aprovacoes" ON public.aprovacoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Aprovadores can update" ON public.aprovacoes AS PERMISSIVE FOR UPDATE TO authenticated
  USING (aprovador_id = auth.uid())
  WITH CHECK (aprovador_id = auth.uid());

CREATE POLICY "Users view own aprovacoes" ON public.aprovacoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (solicitante_id = auth.uid() OR aprovador_id = auth.uid());

-- =====================================================
-- 4. boletins_medicao (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access boletins" ON public.boletins_medicao;
DROP POLICY IF EXISTS "Financeira can manage boletins" ON public.boletins_medicao;
DROP POLICY IF EXISTS "Obras can view boletins" ON public.boletins_medicao;

CREATE POLICY "Admins full access boletins" ON public.boletins_medicao AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can manage boletins" ON public.boletins_medicao AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role))
  WITH CHECK (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can view boletins" ON public.boletins_medicao AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 5. clientes (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes view own data" ON public.clientes;
DROP POLICY IF EXISTS "Comercial full access clientes" ON public.clientes;
DROP POLICY IF EXISTS "Internal users can view clientes" ON public.clientes;

CREATE POLICY "Admins full access clientes" ON public.clientes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clientes view own data" ON public.clientes AS PERMISSIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Comercial full access clientes" ON public.clientes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role))
  WITH CHECK (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Internal users can view clientes" ON public.clientes AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role));

-- =====================================================
-- 6. despesas (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access despesas" ON public.despesas;
DROP POLICY IF EXISTS "Financeira can manage despesas" ON public.despesas;
DROP POLICY IF EXISTS "Obras can insert despesas" ON public.despesas;
DROP POLICY IF EXISTS "Obras can view despesas" ON public.despesas;

CREATE POLICY "Admins full access despesas" ON public.despesas AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can manage despesas" ON public.despesas AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role))
  WITH CHECK (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can insert despesas" ON public.despesas AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can view despesas" ON public.despesas AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 7. epis (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access epis" ON public.epis;
DROP POLICY IF EXISTS "Obras can manage epis" ON public.epis;

CREATE POLICY "Admins full access epis" ON public.epis AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Obras can manage epis" ON public.epis AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 8. equipamentos (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access equipamentos" ON public.equipamentos;
DROP POLICY IF EXISTS "Obras can manage equipamentos" ON public.equipamentos;

CREATE POLICY "Admins full access equipamentos" ON public.equipamentos AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Obras can manage equipamentos" ON public.equipamentos AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 9. horas_extras (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access horas_extras" ON public.horas_extras;
DROP POLICY IF EXISTS "Financeira can view horas_extras" ON public.horas_extras;
DROP POLICY IF EXISTS "Obras can manage horas_extras" ON public.horas_extras;

CREATE POLICY "Admins full access horas_extras" ON public.horas_extras AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can view horas_extras" ON public.horas_extras AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can manage horas_extras" ON public.horas_extras AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 10. logs_auditoria (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view logs" ON public.logs_auditoria;
DROP POLICY IF EXISTS "System can insert logs" ON public.logs_auditoria;

CREATE POLICY "Admins can view logs" ON public.logs_auditoria AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert logs" ON public.logs_auditoria AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 11. materiais (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access materiais" ON public.materiais;
DROP POLICY IF EXISTS "Financeira can view materiais" ON public.materiais;
DROP POLICY IF EXISTS "Obras can manage materiais" ON public.materiais;

CREATE POLICY "Admins full access materiais" ON public.materiais AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can view materiais" ON public.materiais AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can manage materiais" ON public.materiais AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 12. medicoes (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access medicoes" ON public.medicoes;
DROP POLICY IF EXISTS "Clientes view own medicoes" ON public.medicoes;
DROP POLICY IF EXISTS "Financeira can view medicoes" ON public.medicoes;
DROP POLICY IF EXISTS "Obras can manage medicoes" ON public.medicoes;

CREATE POLICY "Admins full access medicoes" ON public.medicoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clientes view own medicoes" ON public.medicoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (obra_id IN (SELECT o.id FROM obras o JOIN clientes c ON o.cliente_id = c.id WHERE c.user_id = auth.uid()));

CREATE POLICY "Financeira can view medicoes" ON public.medicoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can manage medicoes" ON public.medicoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 13. modelos_contrato (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access modelos" ON public.modelos_contrato;
DROP POLICY IF EXISTS "Comercial can manage modelos" ON public.modelos_contrato;

CREATE POLICY "Admins full access modelos" ON public.modelos_contrato AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Comercial can manage modelos" ON public.modelos_contrato AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role))
  WITH CHECK (has_role(auth.uid(), 'comercial'::app_role));

-- =====================================================
-- 14. notificacoes (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Users update own notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Users view own notificacoes" ON public.notificacoes;

CREATE POLICY "Admins full access notificacoes" ON public.notificacoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own notificacoes" ON public.notificacoes AS PERMISSIVE FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own notificacoes" ON public.notificacoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 15. obra_checklist (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access checklist" ON public.obra_checklist;
DROP POLICY IF EXISTS "Obras can manage checklist" ON public.obra_checklist;

CREATE POLICY "Admins full access checklist" ON public.obra_checklist AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Obras can manage checklist" ON public.obra_checklist AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 16. obras (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access obras" ON public.obras;
DROP POLICY IF EXISTS "Clientes view own obras" ON public.obras;
DROP POLICY IF EXISTS "Internal users can view obras" ON public.obras;
DROP POLICY IF EXISTS "Obras team can manage obras" ON public.obras;

CREATE POLICY "Admins full access obras" ON public.obras AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clientes view own obras" ON public.obras AS PERMISSIVE FOR SELECT TO authenticated
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

CREATE POLICY "Internal users can view obras" ON public.obras AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role) OR has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Obras team can manage obras" ON public.obras AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 17. profiles (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated
  USING (id = auth.uid());

-- =====================================================
-- 18. programacoes (5 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Clientes view own programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Comercial can view programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Financeira can view programacoes" ON public.programacoes;
DROP POLICY IF EXISTS "Obras can manage programacoes" ON public.programacoes;

CREATE POLICY "Admins full access programacoes" ON public.programacoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clientes view own programacoes" ON public.programacoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (obra_id IN (SELECT o.id FROM obras o JOIN clientes c ON o.cliente_id = c.id WHERE c.user_id = auth.uid()));

CREATE POLICY "Comercial can view programacoes" ON public.programacoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Financeira can view programacoes" ON public.programacoes AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can manage programacoes" ON public.programacoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 19. propostas (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access propostas" ON public.propostas;
DROP POLICY IF EXISTS "Clientes view own propostas" ON public.propostas;
DROP POLICY IF EXISTS "Comercial full access propostas" ON public.propostas;
DROP POLICY IF EXISTS "Internal users can view propostas" ON public.propostas;

CREATE POLICY "Admins full access propostas" ON public.propostas AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clientes view own propostas" ON public.propostas AS PERMISSIVE FOR SELECT TO authenticated
  USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

CREATE POLICY "Comercial full access propostas" ON public.propostas AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role))
  WITH CHECK (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Internal users can view propostas" ON public.propostas AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role));

-- =====================================================
-- 20. relatorios_diarios (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access relatorios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Obras can manage relatorios" ON public.relatorios_diarios;

CREATE POLICY "Admins full access relatorios" ON public.relatorios_diarios AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Obras can manage relatorios" ON public.relatorios_diarios AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- =====================================================
-- 21. retencoes (2 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access retencoes" ON public.retencoes;
DROP POLICY IF EXISTS "Financeira can manage retencoes" ON public.retencoes;

CREATE POLICY "Admins full access retencoes" ON public.retencoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can manage retencoes" ON public.retencoes AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role))
  WITH CHECK (has_role(auth.uid(), 'financeira'::app_role));

-- =====================================================
-- 22. user_roles (3 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role as cliente only" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own role as cliente only" ON public.user_roles AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'cliente'::app_role);

CREATE POLICY "Users can view own roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 23. valores_unitarios (4 policies)
-- =====================================================
DROP POLICY IF EXISTS "Admins full access valores" ON public.valores_unitarios;
DROP POLICY IF EXISTS "Comercial can manage valores" ON public.valores_unitarios;
DROP POLICY IF EXISTS "Financeira can view valores" ON public.valores_unitarios;
DROP POLICY IF EXISTS "Obras can view valores" ON public.valores_unitarios;

CREATE POLICY "Admins full access valores" ON public.valores_unitarios AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Comercial can manage valores" ON public.valores_unitarios AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role))
  WITH CHECK (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Financeira can view valores" ON public.valores_unitarios AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

CREATE POLICY "Obras can view valores" ON public.valores_unitarios AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role));
