
-- 1. Add CNO and contact fields to obras
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS cno text,
  ADD COLUMN IF NOT EXISTS responsavel_telefone text,
  ADD COLUMN IF NOT EXISTS responsavel_email text;

-- 2. Create tipos_epi lookup table
CREATE TABLE public.tipos_epi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tipos_epi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access tipos_epi" ON public.tipos_epi FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "GT full access tipos_epi" ON public.tipos_epi FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

CREATE POLICY "Internal users can view tipos_epi" ON public.tipos_epi FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role) OR has_role(auth.uid(), 'comercial'::app_role));

-- Seed tipos_epi
INSERT INTO public.tipos_epi (nome) VALUES
  ('Capacete'), ('Luva'), ('Óculos de proteção'), ('Bota de segurança'),
  ('Protetor auricular'), ('Cinto de segurança'), ('Máscara respiratória'),
  ('Avental'), ('Mangote'), ('Perneira'), ('Colete refletivo');

-- 3. Create categorias_hora_extra lookup table
CREATE TABLE public.categorias_hora_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias_hora_extra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access categorias_he" ON public.categorias_hora_extra FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "GT full access categorias_he" ON public.categorias_hora_extra FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

CREATE POLICY "Internal users can view categorias_he" ON public.categorias_hora_extra FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role) OR has_role(auth.uid(), 'comercial'::app_role));

-- Seed categorias
INSERT INTO public.categorias_hora_extra (nome) VALUES ('A'), ('B'), ('C');

-- 4. Create tipos_hora_extra lookup table
CREATE TABLE public.tipos_hora_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tipos_hora_extra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access tipos_he" ON public.tipos_hora_extra FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "GT full access tipos_he" ON public.tipos_hora_extra FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

CREATE POLICY "Internal users can view tipos_he" ON public.tipos_hora_extra FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role) OR has_role(auth.uid(), 'comercial'::app_role));

-- Seed tipos
INSERT INTO public.tipos_hora_extra (nome) VALUES
  ('Normal'), ('Virada'), ('Dobra'), ('Diária'), ('Continuação');
