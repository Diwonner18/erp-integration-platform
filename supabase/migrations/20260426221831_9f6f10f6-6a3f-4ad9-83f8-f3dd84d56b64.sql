-- Hardening de segurança: defesa em profundidade
-- Garante que validações Zod do front também são impostas no banco

-- 1. despesas: valor sempre positivo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'despesas_valor_positivo'
  ) THEN
    ALTER TABLE public.despesas
      ADD CONSTRAINT despesas_valor_positivo CHECK (valor > 0);
  END IF;
END$$;

-- 2. epi_movimentacoes: quantidade > 0 e tipo controlado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'epi_mov_quantidade_positiva'
  ) THEN
    ALTER TABLE public.epi_movimentacoes
      ADD CONSTRAINT epi_mov_quantidade_positiva CHECK (quantidade > 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'epi_mov_tipo_valido'
  ) THEN
    ALTER TABLE public.epi_movimentacoes
      ADD CONSTRAINT epi_mov_tipo_valido CHECK (tipo_movimentacao IN ('entrada','saida'));
  END IF;
END$$;

-- 3. agendamentos: status controlado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_status_valido'
  ) THEN
    ALTER TABLE public.agendamentos
      ADD CONSTRAINT agendamentos_status_valido
        CHECK (status IN ('pendente','confirmado','reagendado','cancelado','concluido'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agendamentos_prioridade_valida'
  ) THEN
    ALTER TABLE public.agendamentos
      ADD CONSTRAINT agendamentos_prioridade_valida
        CHECK (prioridade IN ('baixa','normal','alta','emergencia'));
  END IF;
END$$;