
-- Create agendamentos table
CREATE TABLE public.agendamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  nome text NOT NULL,
  telefone text,
  email text,
  tipo_servico text NOT NULL,
  data_preferida date NOT NULL,
  horario text NOT NULL,
  endereco text NOT NULL,
  descricao text NOT NULL,
  prioridade text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pendente',
  observacoes_internas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies
CREATE POLICY "Admins full access agendamentos"
  ON public.agendamentos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "GT can view agendamentos"
  ON public.agendamentos FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

CREATE POLICY "Obras can view and update agendamentos"
  ON public.agendamentos FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Obras can update agendamentos status"
  ON public.agendamentos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role))
  WITH CHECK (has_role(auth.uid(), 'obras'::app_role));

CREATE POLICY "Comercial can view agendamentos"
  ON public.agendamentos FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));

CREATE POLICY "Clientes can create own agendamentos"
  ON public.agendamentos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clientes can view own agendamentos"
  ON public.agendamentos FOR SELECT TO authenticated
  USING (user_id = auth.uid());
