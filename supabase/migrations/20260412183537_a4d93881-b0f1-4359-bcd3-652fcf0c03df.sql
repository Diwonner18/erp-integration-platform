
-- V-03: Create a view for clients that excludes observacoes_internas
CREATE VIEW public.agendamentos_cliente AS
SELECT
  id, cliente_id, user_id, nome, tipo_servico, email, telefone,
  descricao, endereco, data_preferida, horario, status, prioridade,
  created_at, updated_at
FROM public.agendamentos;

-- Grant access to the view
GRANT SELECT ON public.agendamentos_cliente TO authenticated;

-- V-04: Tighten colaboradores INSERT policy to set created_by
-- The trigger set_created_by already handles this, but let's ensure the policy enforces it
DROP POLICY IF EXISTS "Obras can insert colaboradores" ON public.colaboradores;
CREATE POLICY "Obras can insert colaboradores"
ON public.colaboradores
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'obras'::app_role)
  AND (created_by IS NULL OR created_by = auth.uid())
);
