-- Drop overly permissive policies
DROP POLICY IF EXISTS "Comercial can view agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Obras can view and update agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Obras can update agendamentos status" ON public.agendamentos;

-- Comercial: scoped SELECT
CREATE POLICY "Comercial can view scoped agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'comercial'::app_role)
  AND (
    cliente_id IS NULL
    OR cliente_id IN (SELECT get_related_cliente_ids(auth.uid()))
  )
);

-- Obras: scoped SELECT
CREATE POLICY "Obras can view scoped agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    cliente_id IS NULL
    OR cliente_id IN (SELECT get_related_cliente_ids(auth.uid()))
  )
);

-- Obras: scoped UPDATE
CREATE POLICY "Obras can update scoped agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    cliente_id IS NULL
    OR cliente_id IN (SELECT get_related_cliente_ids(auth.uid()))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'obras'::app_role)
  AND (
    cliente_id IS NULL
    OR cliente_id IN (SELECT get_related_cliente_ids(auth.uid()))
  )
);