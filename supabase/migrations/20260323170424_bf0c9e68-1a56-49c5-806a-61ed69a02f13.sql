-- Tabela principal de colaboradores
CREATE TABLE public.colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text,
  rg text,
  data_nascimento date,
  telefone text,
  celular text,
  email text,
  cep text,
  logradouro text,
  numero text,
  bairro text,
  complemento text,
  uf text,
  cidade text,
  data_admissao date,
  cargo text,
  funcao text,
  tipo_contrato text DEFAULT 'clt',
  salario_base numeric DEFAULT 0,
  pis_pasep text,
  status text NOT NULL DEFAULT 'ativo',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_colaboradores_updated_at BEFORE UPDATE ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_colaboradores_created_by BEFORE INSERT ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION set_created_by();

-- RLS colaboradores
CREATE POLICY "Admins full access colaboradores" ON public.colaboradores FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "GT full access colaboradores" ON public.colaboradores FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role)) WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Obras can manage colaboradores" ON public.colaboradores FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role)) WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
CREATE POLICY "Financeira can view colaboradores" ON public.colaboradores FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

-- Tabela de benefícios
CREATE TABLE public.colaborador_beneficios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'outro',
  valor numeric DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Admins full access colab_beneficios" ON public.colaborador_beneficios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "GT full access colab_beneficios" ON public.colaborador_beneficios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role)) WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Obras can manage colab_beneficios" ON public.colaborador_beneficios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role)) WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
CREATE POLICY "Financeira can view colab_beneficios" ON public.colaborador_beneficios FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

-- Tabela de alocações
CREATE TABLE public.colaborador_alocacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  data_inicio date,
  data_fim date,
  funcao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Admins full access colab_alocacoes" ON public.colaborador_alocacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "GT full access colab_alocacoes" ON public.colaborador_alocacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role)) WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Obras can manage colab_alocacoes" ON public.colaborador_alocacoes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role)) WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
CREATE POLICY "Financeira can view colab_alocacoes" ON public.colaborador_alocacoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

-- Tabela banco de horas
CREATE TABLE public.banco_horas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'credito',
  horas numeric NOT NULL DEFAULT 0,
  motivo text,
  data date NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_banco_horas_created_by BEFORE INSERT ON public.banco_horas FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE POLICY "Admins full access banco_horas" ON public.banco_horas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "GT full access banco_horas" ON public.banco_horas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role)) WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Obras can manage banco_horas" ON public.banco_horas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role)) WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
CREATE POLICY "Financeira can view banco_horas" ON public.banco_horas FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));

-- Tabela faltas e licenças
CREATE TABLE public.faltas_licencas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'falta_justificada',
  data_inicio date NOT NULL,
  data_fim date,
  remunerada boolean DEFAULT true,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_faltas_licencas_created_by BEFORE INSERT ON public.faltas_licencas FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE POLICY "Admins full access faltas_licencas" ON public.faltas_licencas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "GT full access faltas_licencas" ON public.faltas_licencas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role)) WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));
CREATE POLICY "Obras can manage faltas_licencas" ON public.faltas_licencas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role)) WITH CHECK (has_role(auth.uid(), 'obras'::app_role));
CREATE POLICY "Financeira can view faltas_licencas" ON public.faltas_licencas FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeira'::app_role));