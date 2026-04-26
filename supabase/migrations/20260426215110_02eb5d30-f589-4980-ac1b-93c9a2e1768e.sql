CREATE POLICY "Clientes can insert own reembolsos"
ON public.despesas FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'cliente'::app_role)
  AND categoria = 'reembolso_cliente'::despesa_categoria
  AND created_by = auth.uid()
  AND obra_id IN (SELECT public.get_obra_ids_for_cliente(auth.uid()))
);

CREATE POLICY "Clientes can view own reembolsos"
ON public.despesas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'cliente'::app_role)
  AND categoria = 'reembolso_cliente'::despesa_categoria
  AND created_by = auth.uid()
  AND obra_id IN (SELECT public.get_obra_ids_for_cliente(auth.uid()))
);