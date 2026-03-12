
-- 1. Add gerenciador_tecnico to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gerenciador_tecnico';
