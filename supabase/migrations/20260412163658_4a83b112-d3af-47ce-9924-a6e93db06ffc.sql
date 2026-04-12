
-- Drop existing client policy
DROP POLICY IF EXISTS "Clientes view own medicoes" ON public.medicoes;

-- Recreate with approval filter
CREATE POLICY "Clientes view own medicoes"
  ON public.medicoes FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'cliente'::app_role)
    AND obra_id IN (SELECT get_obra_ids_for_cliente(auth.uid()))
    AND status = 'aprovada'
  );
