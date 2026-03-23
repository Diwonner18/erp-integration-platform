
-- V-01: Server-side demo guard
-- Function to check if user is demo
CREATE OR REPLACE FUNCTION public.is_demo_user(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_demo FROM profiles WHERE id = _uid), false)
$$;

-- Apply RESTRICTIVE policies blocking INSERT/UPDATE/DELETE for demo users on all operational tables
DO $block$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'obras','propostas','medicoes','materiais','equipamentos','programacoes',
    'epis','despesas','boletins_medicao','horas_extras','alteracoes_escopo',
    'colaboradores','colaborador_alocacoes','colaborador_beneficios',
    'banco_horas','faltas_licencas','clientes','modelos_contrato',
    'valores_unitarios','aceites_digitais','notificacoes','obra_checklist',
    'retencoes','retencao_followups','retencao_pagamentos',
    'relatorios_diarios','aprovacoes','acessos_compartilhados'
  ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "Block demo user writes" ON public.%I
       FOR ALL TO authenticated
       USING (NOT is_demo_user(auth.uid()))
       WITH CHECK (NOT is_demo_user(auth.uid()))',
      tbl
    );
  END LOOP;
END;
$block$;

-- V-04: Allow operational users to read their own profile permissions
CREATE POLICY "Users can read own profile permissions"
ON public.permissoes_perfil
FOR SELECT TO authenticated
USING (perfil = get_user_role(auth.uid())::text);

-- V-05: Fix aprovacoes INSERT - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can create aprovacoes" ON public.aprovacoes;
CREATE POLICY "Users can create aprovacoes"
ON public.aprovacoes
FOR INSERT TO authenticated
WITH CHECK (solicitante_id = auth.uid());
