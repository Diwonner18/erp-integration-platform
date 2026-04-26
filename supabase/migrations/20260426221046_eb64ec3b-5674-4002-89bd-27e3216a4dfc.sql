-- 1. EPI movimentações: FKs faltantes
ALTER TABLE public.epi_movimentacoes
  ADD CONSTRAINT epi_movimentacoes_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE SET NULL,
  ADD CONSTRAINT epi_movimentacoes_colaborador_id_fkey FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_epi_mov_obra_id ON public.epi_movimentacoes(obra_id);
CREATE INDEX IF NOT EXISTS idx_epi_mov_colab_id ON public.epi_movimentacoes(colaborador_id);

-- 2. Horas Extras: nova coluna colaborador_id + FK
ALTER TABLE public.horas_extras
  ADD COLUMN IF NOT EXISTS colaborador_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_horas_extras_colab_id ON public.horas_extras(colaborador_id);

-- 3. Backfill clientes.user_id por email (idempotente — só preenche onde estiver NULL)
UPDATE public.clientes c
SET user_id = u.id
FROM auth.users u
WHERE c.user_id IS NULL
  AND c.contato_email IS NOT NULL
  AND LOWER(u.email) = LOWER(c.contato_email);

-- Índice já útil mesmo sem matches no momento
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

-- 4. Atualizar trigger HE para usar colaborador_id (FK)
CREATE OR REPLACE FUNCTION public.gerar_he_do_rdo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _item jsonb;
  _colab_id uuid;
  _colab_nome text;
  _horas numeric;
  _excedente numeric;
  _categoria text;
  _dow integer;
  _existing_id uuid;
BEGIN
  IF NEW.colaboradores_horas IS NULL OR jsonb_array_length(NEW.colaboradores_horas) = 0 THEN
    RETURN NEW;
  END IF;

  _dow := EXTRACT(DOW FROM NEW.data)::int;
  _categoria := CASE
    WHEN _dow = 0 THEN 'C'
    WHEN _dow = 6 THEN 'B'
    ELSE 'A'
  END;

  FOR _item IN SELECT * FROM jsonb_array_elements(NEW.colaboradores_horas)
  LOOP
    _colab_id := NULLIF(_item->>'colaborador_id','')::uuid;
    _horas := COALESCE((_item->>'horas')::numeric, 0);
    _excedente := _horas - 8;

    IF _colab_id IS NULL OR _excedente <= 0 THEN
      CONTINUE;
    END IF;

    SELECT nome INTO _colab_nome FROM public.colaboradores WHERE id = _colab_id;

    -- Procurar por colaborador_id (FK), não mais por nome (text)
    SELECT id INTO _existing_id
    FROM public.horas_extras
    WHERE obra_id = NEW.obra_id
      AND data = NEW.data
      AND colaborador_id = _colab_id
      AND created_by = NEW.created_by
    LIMIT 1;

    IF _existing_id IS NOT NULL THEN
      UPDATE public.horas_extras
      SET horas = _excedente, categoria = _categoria, status = 'pendente',
          funcionario = COALESCE(_colab_nome, _colab_id::text),
          motivo = 'Gerado automaticamente do RDO ' || NEW.id::text
      WHERE id = _existing_id;
    ELSE
      INSERT INTO public.horas_extras (
        obra_id, colaborador_id, funcionario, data, horas, categoria,
        tipo_hora_extra, status, motivo, created_by
      ) VALUES (
        NEW.obra_id,
        _colab_id,
        COALESCE(_colab_nome, _colab_id::text),
        NEW.data,
        _excedente,
        _categoria,
        'normal',
        'pendente',
        'Gerado automaticamente do RDO ' || NEW.id::text,
        NEW.created_by
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 5. Comentário descontinuando epis
COMMENT ON TABLE public.epis IS 'DESCONTINUADA: usar epi_movimentacoes + view epi_saldos. Mantida apenas para histórico.';