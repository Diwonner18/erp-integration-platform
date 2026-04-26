-- Auto-link clientes.user_id by matching contato_email with auth.users.email
CREATE OR REPLACE FUNCTION public.auto_link_cliente_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.contato_email IS NOT NULL THEN
    SELECT u.id INTO NEW.user_id
    FROM auth.users u
    WHERE LOWER(u.email) = LOWER(NEW.contato_email)
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_link_cliente_user ON public.clientes;
CREATE TRIGGER trg_auto_link_cliente_user
  BEFORE INSERT OR UPDATE OF contato_email, user_id ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_cliente_user();