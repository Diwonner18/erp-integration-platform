
-- Add observacoes column to retencoes
ALTER TABLE public.retencoes ADD COLUMN IF NOT EXISTS observacoes text;

-- Create retencao_followups table
CREATE TABLE public.retencao_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retencao_id uuid NOT NULL REFERENCES public.retencoes(id) ON DELETE CASCADE,
  data date NOT NULL,
  horario time NOT NULL,
  tipo_contato text NOT NULL,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create retencao_pagamentos table
CREATE TABLE public.retencao_pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retencao_id uuid NOT NULL REFERENCES public.retencoes(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  valor numeric NOT NULL,
  data_pagamento date NOT NULL,
  descricao text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies for retencao_followups
ALTER TABLE public.retencao_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access retencao_followups" ON public.retencao_followups
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can manage retencao_followups" ON public.retencao_followups
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role))
  WITH CHECK (has_role(auth.uid(), 'financeira'::app_role));

-- RLS policies for retencao_pagamentos
ALTER TABLE public.retencao_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access retencao_pagamentos" ON public.retencao_pagamentos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Financeira can manage retencao_pagamentos" ON public.retencao_pagamentos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role))
  WITH CHECK (has_role(auth.uid(), 'financeira'::app_role));

-- Triggers for created_by
CREATE TRIGGER set_created_by_retencao_followups
  BEFORE INSERT ON public.retencao_followups
  FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_created_by_retencao_pagamentos
  BEFORE INSERT ON public.retencao_pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
