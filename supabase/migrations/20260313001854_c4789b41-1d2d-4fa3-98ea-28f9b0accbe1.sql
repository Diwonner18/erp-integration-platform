-- MEDIA: Restrict clientes PII visibility for obras/financeira to related obras only (LGPD)
DROP POLICY IF EXISTS "Internal users can view clientes" ON public.clientes;
CREATE POLICY "Internal users can view related clientes" ON public.clientes
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role))
    AND id IN (
      SELECT cliente_id FROM obras
      WHERE created_by = auth.uid()
         OR responsavel_id = auth.uid()
         OR has_record_access(auth.uid(), 'obras'::text, id, 'view'::text)
    )
  );