-- Replace broad "Obras can manage colaboradores" with scoped policies
DROP POLICY IF EXISTS "Obras can manage colaboradores" ON public.colaboradores;

CREATE POLICY "Obras can view colaboradores"
ON public.colaboradores
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can insert colaboradores"
ON public.colaboradores
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update own colaboradores"
ON public.colaboradores
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'obras'::app_role))
WITH CHECK (has_role(auth.uid(), 'obras'::app_role));