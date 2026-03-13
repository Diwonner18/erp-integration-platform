-- =============================================
-- Fix infinite recursion in RLS policies
-- between clientes and obras tables
-- =============================================

-- 1. Create SECURITY DEFINER functions to break recursion

CREATE OR REPLACE FUNCTION public.get_cliente_ids_for_user(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clientes WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_related_cliente_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT o.cliente_id 
  FROM public.obras o
  WHERE o.cliente_id IS NOT NULL
    AND (
      o.created_by = _user_id 
      OR o.responsavel_id = _user_id
      OR has_record_access(_user_id, 'obras'::text, o.id, 'view'::text)
    );
$$;

CREATE OR REPLACE FUNCTION public.get_obra_ids_for_cliente(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id
  FROM public.obras o
  JOIN public.clientes c ON o.cliente_id = c.id
  WHERE c.user_id = _user_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_cliente_ids_for_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cliente_ids_for_user TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_related_cliente_ids FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_related_cliente_ids TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_obra_ids_for_cliente FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_obra_ids_for_cliente TO authenticated;

-- 2. Fix OBRAS - Clientes view own obras
DROP POLICY IF EXISTS "Clientes view own obras" ON public.obras;
CREATE POLICY "Clientes view own obras"
ON public.obras FOR SELECT TO authenticated
USING (cliente_id IN (SELECT get_cliente_ids_for_user(auth.uid())));

-- 3. Fix CLIENTES - Internal users can view related clientes
DROP POLICY IF EXISTS "Internal users can view related clientes" ON public.clientes;
CREATE POLICY "Internal users can view related clientes"
ON public.clientes FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role))
  AND id IN (SELECT get_related_cliente_ids(auth.uid()))
);

-- 4. Fix MEDICOES - Clientes view own medicoes
DROP POLICY IF EXISTS "Clientes view own medicoes" ON public.medicoes;
CREATE POLICY "Clientes view own medicoes"
ON public.medicoes FOR SELECT TO authenticated
USING (obra_id IN (SELECT get_obra_ids_for_cliente(auth.uid())));

-- 5. Fix PROGRAMACOES - Clientes view own programacoes
DROP POLICY IF EXISTS "Clientes view own programacoes" ON public.programacoes;
CREATE POLICY "Clientes view own programacoes"
ON public.programacoes FOR SELECT TO authenticated
USING (obra_id IN (SELECT get_obra_ids_for_cliente(auth.uid())));

-- 6. Fix PROPOSTAS - Clientes view own propostas
DROP POLICY IF EXISTS "Clientes view own propostas" ON public.propostas;
CREATE POLICY "Clientes view own propostas"
ON public.propostas FOR SELECT TO authenticated
USING (cliente_id IN (SELECT get_cliente_ids_for_user(auth.uid())));

-- 7. Fix ACEITES_DIGITAIS
DROP POLICY IF EXISTS "Clientes view own aceites" ON public.aceites_digitais;
CREATE POLICY "Clientes view own aceites"
ON public.aceites_digitais FOR SELECT TO authenticated
USING (cliente_id IN (SELECT get_cliente_ids_for_user(auth.uid())));

DROP POLICY IF EXISTS "Clientes can insert own aceite" ON public.aceites_digitais;
CREATE POLICY "Clientes can insert own aceite"
ON public.aceites_digitais FOR INSERT TO authenticated
WITH CHECK (cliente_id IN (SELECT get_cliente_ids_for_user(auth.uid())));