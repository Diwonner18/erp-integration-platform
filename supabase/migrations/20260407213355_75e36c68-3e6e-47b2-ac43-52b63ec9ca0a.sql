-- Revert realtime.messages changes (reserved schema)
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;
ALTER TABLE realtime.messages DISABLE ROW LEVEL SECURITY;

-- Scope banco_horas for obras role
DROP POLICY IF EXISTS "Obras can manage banco_horas" ON public.banco_horas;

CREATE POLICY "Obras can view allocated banco_horas"
ON public.banco_horas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND colaborador_id IN (
    SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
    JOIN public.obras o ON ca.obra_id = o.id
    WHERE o.created_by = auth.uid()
       OR o.responsavel_id = auth.uid()
       OR has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
  )
);

CREATE POLICY "Obras can insert banco_horas"
ON public.banco_horas FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update allocated banco_horas"
ON public.banco_horas FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR colaborador_id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'edit'::text)
    )
  )
)
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- Scope faltas_licencas for obras role
DROP POLICY IF EXISTS "Obras can manage faltas_licencas" ON public.faltas_licencas;

CREATE POLICY "Obras can view allocated faltas_licencas"
ON public.faltas_licencas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND colaborador_id IN (
    SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
    JOIN public.obras o ON ca.obra_id = o.id
    WHERE o.created_by = auth.uid()
       OR o.responsavel_id = auth.uid()
       OR has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
  )
);

CREATE POLICY "Obras can insert faltas_licencas"
ON public.faltas_licencas FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update allocated faltas_licencas"
ON public.faltas_licencas FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR colaborador_id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'edit'::text)
    )
  )
)
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));