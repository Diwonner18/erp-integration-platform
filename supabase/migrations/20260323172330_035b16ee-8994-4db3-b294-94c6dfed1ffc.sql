-- Add colaborador_id to epis table
ALTER TABLE public.epis ADD COLUMN IF NOT EXISTS colaborador_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL;

-- Add categoria and tipo_hora_extra to horas_extras table
ALTER TABLE public.horas_extras ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'A';
ALTER TABLE public.horas_extras ADD COLUMN IF NOT EXISTS tipo_hora_extra text DEFAULT 'normal';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_epis_colaborador_id ON public.epis(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_horas_extras_categoria ON public.horas_extras(categoria);
CREATE INDEX IF NOT EXISTS idx_horas_extras_tipo ON public.horas_extras(tipo_hora_extra);