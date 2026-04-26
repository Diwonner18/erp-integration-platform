-- Tabela de movimentações de EPI (entradas e saídas)
CREATE TABLE IF NOT EXISTS public.epi_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida')),
  tipo_epi TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  data_movimentacao DATE NOT NULL DEFAULT CURRENT_DATE,
  colaborador_id UUID,
  obra_id UUID,
  fornecedor TEXT,
  valor_unitario NUMERIC DEFAULT 0,
  certificado_aprovacao TEXT,
  validade DATE,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.epi_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access epi_mov"
  ON public.epi_movimentacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "GT full access epi_mov"
  ON public.epi_movimentacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

CREATE POLICY "Obras can manage epi_mov"
  ON public.epi_movimentacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Financeira can view epi_mov"
  ON public.epi_movimentacoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

-- Trigger created_by
CREATE TRIGGER trg_set_created_by_epi_mov
  BEFORE INSERT ON public.epi_movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- View: saldo por tipo
CREATE OR REPLACE VIEW public.epi_saldos
WITH (security_invoker=on) AS
SELECT
  tipo_epi,
  SUM(CASE WHEN tipo_movimentacao = 'entrada' THEN quantidade ELSE 0 END) AS total_entradas,
  SUM(CASE WHEN tipo_movimentacao = 'saida' THEN quantidade ELSE 0 END) AS total_saidas,
  SUM(CASE WHEN tipo_movimentacao = 'entrada' THEN quantidade ELSE -quantidade END) AS saldo_atual,
  MAX(data_movimentacao) AS ultima_movimentacao
FROM public.epi_movimentacoes
GROUP BY tipo_epi;

-- Index para queries por tipo
CREATE INDEX IF NOT EXISTS idx_epi_mov_tipo ON public.epi_movimentacoes(tipo_epi);
CREATE INDEX IF NOT EXISTS idx_epi_mov_data ON public.epi_movimentacoes(data_movimentacao DESC);