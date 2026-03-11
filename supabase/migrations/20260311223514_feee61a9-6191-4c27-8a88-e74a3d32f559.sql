
-- Table was already created by failed migration, drop and recreate
DROP TABLE IF EXISTS public.acessos_compartilhados;

CREATE TABLE public.acessos_compartilhados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tabela text NOT NULL,
  registro_id uuid NOT NULL,
  nivel_acesso text NOT NULL DEFAULT 'view' CHECK (nivel_acesso IN ('view', 'edit', 'all')),
  concedido_por uuid REFERENCES auth.users(id),
  aprovacao_id uuid REFERENCES aprovacoes(id),
  expira_em timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.acessos_compartilhados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins select acessos" ON public.acessos_compartilhados AS RESTRICTIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert acessos" ON public.acessos_compartilhados AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update acessos" ON public.acessos_compartilhados AS RESTRICTIVE FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete acessos" ON public.acessos_compartilhados AS RESTRICTIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users view own acessos" ON public.acessos_compartilhados AS RESTRICTIVE FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 2. Create has_record_access SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.has_record_access(
  _user_id uuid, _tabela text, _registro_id uuid, _nivel text
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. RESTRICTIVE UPDATE policies on 15 tables
CREATE POLICY "Restrict update obras to creator or shared" ON public.obras AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'obras', id, 'edit'));
CREATE POLICY "Restrict update materiais to creator or shared" ON public.materiais AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'materiais', id, 'edit'));
CREATE POLICY "Restrict update equipamentos to creator or shared" ON public.equipamentos AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'equipamentos', id, 'edit'));
CREATE POLICY "Restrict update medicoes to creator or shared" ON public.medicoes AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'medicoes', id, 'edit'));
CREATE POLICY "Restrict update programacoes to creator or shared" ON public.programacoes AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'programacoes', id, 'edit'));
CREATE POLICY "Restrict update epis to creator or shared" ON public.epis AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'epis', id, 'edit'));
CREATE POLICY "Restrict update horas_extras to creator or shared" ON public.horas_extras AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'horas_extras', id, 'edit'));
CREATE POLICY "Restrict update despesas to creator or shared" ON public.despesas AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'despesas', id, 'edit'));
CREATE POLICY "Restrict update relatorios_diarios to creator or shared" ON public.relatorios_diarios AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'relatorios_diarios', id, 'edit'));
CREATE POLICY "Restrict update alteracoes_escopo to creator or shared" ON public.alteracoes_escopo AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'alteracoes_escopo', id, 'edit'));
CREATE POLICY "Restrict update boletins_medicao to creator or shared" ON public.boletins_medicao AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'boletins_medicao', id, 'edit'));
CREATE POLICY "Restrict update retencoes to creator or shared" ON public.retencoes AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'retencoes', id, 'edit'));
CREATE POLICY "Restrict update modelos_contrato to creator or shared" ON public.modelos_contrato AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'modelos_contrato', id, 'edit'));
CREATE POLICY "Restrict update valores_unitarios to creator or shared" ON public.valores_unitarios AS RESTRICTIVE FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'valores_unitarios', id, 'edit'));
CREATE POLICY "Restrict update obra_checklist to creator or shared" ON public.obra_checklist AS RESTRICTIVE FOR UPDATE TO authenticated USING (concluido_por = auth.uid() OR has_record_access(auth.uid(), 'obra_checklist', id, 'edit'));

-- 4. Update DELETE policies to use has_record_access
DROP POLICY IF EXISTS "Restrict delete materiais to creator" ON public.materiais;
CREATE POLICY "Restrict delete materiais to creator or shared" ON public.materiais AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'materiais', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete equipamentos to creator" ON public.equipamentos;
CREATE POLICY "Restrict delete equipamentos to creator or shared" ON public.equipamentos AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'equipamentos', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete medicoes to creator" ON public.medicoes;
CREATE POLICY "Restrict delete medicoes to creator or shared" ON public.medicoes AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'medicoes', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete programacoes to creator" ON public.programacoes;
CREATE POLICY "Restrict delete programacoes to creator or shared" ON public.programacoes AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'programacoes', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete epis to creator" ON public.epis;
CREATE POLICY "Restrict delete epis to creator or shared" ON public.epis AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'epis', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete horas_extras to creator" ON public.horas_extras;
CREATE POLICY "Restrict delete horas_extras to creator or shared" ON public.horas_extras AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'horas_extras', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete despesas to creator" ON public.despesas;
CREATE POLICY "Restrict delete despesas to creator or shared" ON public.despesas AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'despesas', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete relatorios to creator" ON public.relatorios_diarios;
CREATE POLICY "Restrict delete relatorios to creator or shared" ON public.relatorios_diarios AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'relatorios_diarios', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete alteracoes to creator" ON public.alteracoes_escopo;
CREATE POLICY "Restrict delete alteracoes to creator or shared" ON public.alteracoes_escopo AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'alteracoes_escopo', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete boletins to creator" ON public.boletins_medicao;
CREATE POLICY "Restrict delete boletins to creator or shared" ON public.boletins_medicao AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'boletins_medicao', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete retencoes to creator" ON public.retencoes;
CREATE POLICY "Restrict delete retencoes to creator or shared" ON public.retencoes AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'retencoes', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete modelos to creator" ON public.modelos_contrato;
CREATE POLICY "Restrict delete modelos to creator or shared" ON public.modelos_contrato AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'modelos_contrato', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete valores to creator" ON public.valores_unitarios;
CREATE POLICY "Restrict delete valores to creator or shared" ON public.valores_unitarios AS RESTRICTIVE FOR DELETE TO authenticated USING (created_by = auth.uid() OR has_record_access(auth.uid(), 'valores_unitarios', id, 'delete'));

DROP POLICY IF EXISTS "Restrict delete checklist to creator" ON public.obra_checklist;
CREATE POLICY "Restrict delete checklist to creator or shared" ON public.obra_checklist AS RESTRICTIVE FOR DELETE TO authenticated USING (concluido_por = auth.uid() OR has_record_access(auth.uid(), 'obra_checklist', id, 'delete'));

-- 5. Allow authenticated users to INSERT aprovacoes (for access requests)
CREATE POLICY "Users can create aprovacoes" ON public.aprovacoes AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (solicitante_id = auth.uid());
