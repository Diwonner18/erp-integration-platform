-- =========================================================
-- 1. Realtime channel authorization (notificacoes-<user_id>)
-- =========================================================
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own notification channel" ON realtime.messages;
CREATE POLICY "Users can subscribe to own notification channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notificacoes-' || auth.uid()::text
);

-- =========================================================
-- 2. Remove blanket gerenciador_tecnico bypass in has_record_access
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_record_access(_user_id uuid, _tabela text, _registro_id uuid, _nivel text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    has_role(_user_id, 'admin'::app_role)
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

-- =========================================================
-- 3. Add explicit GT permissive policies (preserve current operational access
--    for tables that previously relied on the bypass for UPDATE/DELETE).
--    SELECT for GT already exists on these tables.
-- =========================================================

-- obras
DROP POLICY IF EXISTS "GT can manage obras" ON public.obras;
CREATE POLICY "GT can manage obras" ON public.obras
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- medicoes
DROP POLICY IF EXISTS "GT can manage medicoes" ON public.medicoes;
CREATE POLICY "GT can manage medicoes" ON public.medicoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- materiais
DROP POLICY IF EXISTS "GT can manage materiais" ON public.materiais;
CREATE POLICY "GT can manage materiais" ON public.materiais
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- despesas
DROP POLICY IF EXISTS "GT can manage despesas" ON public.despesas;
CREATE POLICY "GT can manage despesas" ON public.despesas
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- programacoes
DROP POLICY IF EXISTS "GT can manage programacoes" ON public.programacoes;
CREATE POLICY "GT can manage programacoes" ON public.programacoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- boletins_medicao
DROP POLICY IF EXISTS "GT can manage boletins" ON public.boletins_medicao;
CREATE POLICY "GT can manage boletins" ON public.boletins_medicao
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- retencoes
DROP POLICY IF EXISTS "GT can manage retencoes" ON public.retencoes;
CREATE POLICY "GT can manage retencoes" ON public.retencoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- epis
DROP POLICY IF EXISTS "GT can manage epis" ON public.epis;
CREATE POLICY "GT can manage epis" ON public.epis
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- horas_extras
DROP POLICY IF EXISTS "GT can manage horas_extras" ON public.horas_extras;
CREATE POLICY "GT can manage horas_extras" ON public.horas_extras
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- relatorios_diarios
DROP POLICY IF EXISTS "GT can manage relatorios_diarios" ON public.relatorios_diarios;
CREATE POLICY "GT can manage relatorios_diarios" ON public.relatorios_diarios
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- equipamentos
DROP POLICY IF EXISTS "GT can manage equipamentos" ON public.equipamentos;
CREATE POLICY "GT can manage equipamentos" ON public.equipamentos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- alteracoes_escopo
DROP POLICY IF EXISTS "GT can manage alteracoes_escopo" ON public.alteracoes_escopo;
CREATE POLICY "GT can manage alteracoes_escopo" ON public.alteracoes_escopo
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- valores_unitarios
DROP POLICY IF EXISTS "GT can manage valores_unitarios" ON public.valores_unitarios;
CREATE POLICY "GT can manage valores_unitarios" ON public.valores_unitarios
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- modelos_contrato
DROP POLICY IF EXISTS "GT can manage modelos_contrato" ON public.modelos_contrato;
CREATE POLICY "GT can manage modelos_contrato" ON public.modelos_contrato
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- obra_checklist
DROP POLICY IF EXISTS "GT can manage obra_checklist" ON public.obra_checklist;
CREATE POLICY "GT can manage obra_checklist" ON public.obra_checklist
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- =========================================================
-- 4. Scope financeira access to colaboradores PII
--    (only collaborators allocated to obras the user is related to)
-- =========================================================
DROP POLICY IF EXISTS "Financeira can view colaboradores" ON public.colaboradores;
CREATE POLICY "Financeira can view scoped colaboradores"
ON public.colaboradores
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'financeira'::app_role)
  AND (
    created_by = auth.uid()
    OR id IN (
      SELECT ca.colaborador_id
      FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
        OR o.responsavel_id = auth.uid()
        OR public.has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
    )
  )
);