
-- Fix: Set view to SECURITY INVOKER (applies querying user's RLS, not view creator's)
ALTER VIEW public.agendamentos_cliente SET (security_invoker = on);
