
-- V1: Create self_assign_area function for employee self-onboarding
CREATE OR REPLACE FUNCTION public.self_assign_area(_area app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid;
  _email text;
  _existing_role app_role;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  -- Get user email
  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  -- Must be @ctguedes.com.br
  IF _email IS NULL OR _email NOT LIKE '%@ctguedes.com.br' THEN
    RAISE EXCEPTION 'Apenas funcionários @ctguedes.com.br podem selecionar área.';
  END IF;

  -- Only allow obras, financeira, comercial
  IF _area NOT IN ('obras', 'financeira', 'comercial') THEN
    RAISE EXCEPTION 'Área inválida. Apenas obras, financeira ou comercial são permitidas.';
  END IF;

  -- Check user doesn't already have a role
  SELECT role INTO _existing_role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
  IF _existing_role IS NOT NULL THEN
    RAISE EXCEPTION 'Você já possui uma área atribuída: %', _existing_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _area);
END;
$$;

-- V3: Add RESTRICTIVE DELETE policies to limit deletion to own records or admin
-- For operational tables with created_by column

-- alteracoes_escopo: restrict DELETE for obras to own records
CREATE POLICY "Restrict delete alteracoes to creator"
ON public.alteracoes_escopo AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- boletins_medicao
CREATE POLICY "Restrict delete boletins to creator"
ON public.boletins_medicao AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- despesas
CREATE POLICY "Restrict delete despesas to creator"
ON public.despesas AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- epis
CREATE POLICY "Restrict delete epis to creator"
ON public.epis AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- equipamentos
CREATE POLICY "Restrict delete equipamentos to creator"
ON public.equipamentos AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- horas_extras
CREATE POLICY "Restrict delete horas_extras to creator"
ON public.horas_extras AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- materiais
CREATE POLICY "Restrict delete materiais to creator"
ON public.materiais AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- medicoes
CREATE POLICY "Restrict delete medicoes to creator"
ON public.medicoes AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- obra_checklist
CREATE POLICY "Restrict delete checklist to creator"
ON public.obra_checklist AS RESTRICTIVE
FOR DELETE TO authenticated
USING (concluido_por = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- programacoes
CREATE POLICY "Restrict delete programacoes to creator"
ON public.programacoes AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- relatorios_diarios
CREATE POLICY "Restrict delete relatorios to creator"
ON public.relatorios_diarios AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- retencoes
CREATE POLICY "Restrict delete retencoes to creator"
ON public.retencoes AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- propostas
CREATE POLICY "Restrict delete propostas to creator"
ON public.propostas AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- modelos_contrato
CREATE POLICY "Restrict delete modelos to creator"
ON public.modelos_contrato AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- valores_unitarios
CREATE POLICY "Restrict delete valores to creator"
ON public.valores_unitarios AS RESTRICTIVE
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
