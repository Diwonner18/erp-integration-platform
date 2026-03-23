-- Create permissoes_perfil table
CREATE TABLE public.permissoes_perfil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil text NOT NULL,
  modulo text NOT NULL,
  pesquisar boolean NOT NULL DEFAULT true,
  incluir_editar boolean NOT NULL DEFAULT false,
  excluir boolean NOT NULL DEFAULT false,
  acesso_modulo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(perfil, modulo)
);

-- Enable RLS
ALTER TABLE public.permissoes_perfil ENABLE ROW LEVEL SECURITY;

-- RLS: only admin and GT can read/write
CREATE POLICY "Admins full access permissoes_perfil"
  ON public.permissoes_perfil FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "GT full access permissoes_perfil"
  ON public.permissoes_perfil FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gerenciador_tecnico'::app_role))
  WITH CHECK (has_role(auth.uid(), 'gerenciador_tecnico'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_permissoes_perfil_updated_at
  BEFORE UPDATE ON public.permissoes_perfil
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default permissions for each profile x module
INSERT INTO public.permissoes_perfil (perfil, modulo, pesquisar, incluir_editar, excluir, acesso_modulo) VALUES
  ('obras', 'propostas', true, false, false, true),
  ('obras', 'medicoes', true, true, false, true),
  ('obras', 'colaboradores', true, true, true, true),
  ('obras', 'epis', true, true, true, true),
  ('obras', 'horas_extras', true, true, true, true),
  ('obras', 'materiais', true, true, true, true),
  ('obras', 'equipamentos', true, true, true, true),
  ('obras', 'programacoes', true, true, false, true),
  ('obras', 'despesas', true, true, false, true),
  ('obras', 'boletins', true, false, false, true),
  ('obras', 'relatorios_diarios', true, true, true, true),
  ('obras', 'alteracoes_escopo', true, true, false, true),
  ('financeira', 'propostas', true, false, false, true),
  ('financeira', 'medicoes', true, false, false, true),
  ('financeira', 'colaboradores', true, false, false, true),
  ('financeira', 'epis', false, false, false, false),
  ('financeira', 'horas_extras', true, false, false, true),
  ('financeira', 'materiais', true, false, false, true),
  ('financeira', 'equipamentos', false, false, false, false),
  ('financeira', 'programacoes', false, false, false, false),
  ('financeira', 'despesas', true, true, true, true),
  ('financeira', 'boletins', true, true, true, true),
  ('financeira', 'relatorios_diarios', false, false, false, false),
  ('financeira', 'alteracoes_escopo', true, false, false, true),
  ('comercial', 'propostas', true, true, true, true),
  ('comercial', 'medicoes', true, false, false, true),
  ('comercial', 'colaboradores', false, false, false, false),
  ('comercial', 'epis', false, false, false, false),
  ('comercial', 'horas_extras', false, false, false, false),
  ('comercial', 'materiais', false, false, false, false),
  ('comercial', 'equipamentos', false, false, false, false),
  ('comercial', 'programacoes', false, false, false, false),
  ('comercial', 'despesas', false, false, false, false),
  ('comercial', 'boletins', false, false, false, false),
  ('comercial', 'relatorios_diarios', false, false, false, false),
  ('comercial', 'alteracoes_escopo', true, false, false, true),
  ('cliente', 'propostas', true, false, false, true),
  ('cliente', 'medicoes', true, false, false, true),
  ('cliente', 'colaboradores', false, false, false, false),
  ('cliente', 'epis', false, false, false, false),
  ('cliente', 'horas_extras', false, false, false, false),
  ('cliente', 'materiais', false, false, false, false),
  ('cliente', 'equipamentos', false, false, false, false),
  ('cliente', 'programacoes', true, false, false, true),
  ('cliente', 'despesas', false, false, false, false),
  ('cliente', 'boletins', false, false, false, false),
  ('cliente', 'relatorios_diarios', false, false, false, false),
  ('cliente', 'alteracoes_escopo', false, false, false, false);