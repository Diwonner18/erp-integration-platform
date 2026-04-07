-- Finding 1: Scope 'obras' role access to colaboradores by obra relationship
DROP POLICY IF EXISTS "Obras can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Obras can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Obras can update own colaboradores" ON public.colaboradores;

CREATE POLICY "Obras can view allocated colaboradores"
ON public.colaboradores FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'view'::text)
    )
  )
);

CREATE POLICY "Obras can insert colaboradores"
ON public.colaboradores FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update allocated colaboradores"
ON public.colaboradores FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    created_by = auth.uid()
    OR id IN (
      SELECT ca.colaborador_id FROM public.colaborador_alocacoes ca
      JOIN public.obras o ON ca.obra_id = o.id
      WHERE o.created_by = auth.uid()
         OR o.responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, o.id, 'edit'::text)
    )
  )
)
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

-- Finding 2: Enable RLS on realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can use realtime"
ON realtime.messages FOR SELECT TO authenticated
USING (true);