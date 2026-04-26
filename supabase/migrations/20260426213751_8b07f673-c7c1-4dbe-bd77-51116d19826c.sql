CREATE POLICY "Clientes view own boletins"
ON public.boletins_medicao
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'cliente'::app_role)
  AND obra_id IN (SELECT public.get_obra_ids_for_cliente(auth.uid()))
);