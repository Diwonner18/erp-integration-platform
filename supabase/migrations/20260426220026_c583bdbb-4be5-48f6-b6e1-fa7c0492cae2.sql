-- Adicionar coluna para registrar horas trabalhadas por colaborador no dia
ALTER TABLE public.relatorios_diarios
  ADD COLUMN IF NOT EXISTS colaboradores_horas JSONB DEFAULT '[]'::jsonb;

-- Função: gera horas extras automáticas a partir do RDO
CREATE OR REPLACE FUNCTION public.gerar_he_do_rdo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Determinar categoria por dia da semana (0=domingo, 6=sábado)
  _dow := EXTRACT(DOW FROM NEW.data)::int;
  _categoria := CASE
    WHEN _dow = 0 THEN 'C'  -- domingo / feriado
    WHEN _dow = 6 THEN 'B'  -- sábado
    ELSE 'A'                -- dias úteis
  END;

  -- Iterar pelos colaboradores
  FOR _item IN SELECT * FROM jsonb_array_elements(NEW.colaboradores_horas)
  LOOP
    _colab_id := NULLIF(_item->>'colaborador_id','')::uuid;
    _horas := COALESCE((_item->>'horas')::numeric, 0);
    _excedente := _horas - 8;

    IF _colab_id IS NULL OR _excedente <= 0 THEN
      CONTINUE;
    END IF;

    SELECT nome INTO _colab_nome FROM public.colaboradores WHERE id = _colab_id;

    -- Evitar duplicação: já existe HE para este colaborador, obra e data?
    SELECT id INTO _existing_id
    FROM public.horas_extras
    WHERE obra_id = NEW.obra_id
      AND data = NEW.data
      AND funcionario = COALESCE(_colab_nome, _colab_id::text)
      AND created_by = NEW.created_by
    LIMIT 1;

    IF _existing_id IS NOT NULL THEN
      -- Atualiza horas se já existir
      UPDATE public.horas_extras
      SET horas = _excedente, categoria = _categoria, status = 'pendente',
          motivo = 'Gerado automaticamente do RDO ' || NEW.id::text
      WHERE id = _existing_id;
    ELSE
      INSERT INTO public.horas_extras (
        obra_id, funcionario, data, horas, categoria,
        tipo_hora_extra, status, motivo, created_by
      ) VALUES (
        NEW.obra_id,
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
$$;

-- Trigger AFTER INSERT/UPDATE no RDO
DROP TRIGGER IF EXISTS trg_gerar_he_rdo ON public.relatorios_diarios;
CREATE TRIGGER trg_gerar_he_rdo
  AFTER INSERT OR UPDATE OF colaboradores_horas ON public.relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_he_do_rdo();