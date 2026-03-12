
-- V5: Add RESTRICTIVE DELETE policies for obras and clientes
CREATE POLICY "Restrict delete obras to creator or admin"
ON public.obras
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  (created_by = auth.uid()) OR has_record_access(auth.uid(), 'obras'::text, id, 'delete'::text)
);

CREATE POLICY "Restrict delete clientes to creator or admin"
ON public.clientes
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  (created_by = auth.uid()) OR has_record_access(auth.uid(), 'clientes'::text, id, 'delete'::text)
);
