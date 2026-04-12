ALTER TABLE public.acessos_compartilhados
  ADD CONSTRAINT nivel_acesso_valid
  CHECK (nivel_acesso IN ('view', 'edit', 'all'));