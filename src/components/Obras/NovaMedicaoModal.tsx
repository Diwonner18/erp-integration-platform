import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useObras, useCreateMedicao, useProgramacoes } from '@/hooks/useSupabaseData';

const medicaoSchema = z.object({
  obra_id: z.string().min(1, 'Selecione uma obra'),
  numero: z.string().optional(),
  periodo_inicio: z.string().optional(),
  periodo_fim: z.string().optional(),
  data_medicao: z.string().optional(),
  percentual: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
  valor_bruto: z.number().min(0, 'Valor deve ser positivo'),
  metragem: z.number().min(0).optional(),
  taxa_igpm: z.number().min(0).optional(),
  observacoes: z.string().optional(),
  descricao: z.string().optional(),
});

type MedicaoFormData = z.infer<typeof medicaoSchema>;

interface NovaMedicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NovaMedicaoModal = ({ isOpen, onClose }: NovaMedicaoModalProps) => {
  const { toast } = useToast();
  const { data: obrasData = [] } = useObras();
  const { data: programacoes = [] } = useProgramacoes();
  const createMedicao = useCreateMedicao();
  const [selectedProgramacoes, setSelectedProgramacoes] = useState<string[]>([]);
  const [selectedObraId, setSelectedObraId] = useState('');

  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors }
  } = useForm<MedicaoFormData>({
    resolver: zodResolver(medicaoSchema),
    defaultValues: { percentual: 0, valor_bruto: 0, metragem: 0, taxa_igpm: 0 }
  });

  const valorBruto = watch('valor_bruto') || 0;
  const taxaIgpm = watch('taxa_igpm') || 0;

  // Auto-calculate correction and final value
  const correcaoIgpm = valorBruto * (taxaIgpm / 100);
  const valorFinal = valorBruto + correcaoIgpm;

  // Filter programações by selected obra
  const obraProgramacoes = programacoes.filter(
    p => p.obra_id === selectedObraId && p.status === 'executada'
  );

  // Auto-calculate valor from selected programações (sum of servicos_executados)
  useEffect(() => {
    if (selectedProgramacoes.length > 0 && selectedObraId) {
      const obra = obrasData.find(o => o.id === selectedObraId);
      if (obra && obra.valor_contrato) {
        // Calculate proportional value based on number of programações
        const totalExecutadas = obraProgramacoes.length;
        if (totalExecutadas > 0) {
          const proporcao = selectedProgramacoes.length / Math.max(totalExecutadas, selectedProgramacoes.length);
          const valorCalculado = (obra.valor_contrato || 0) * proporcao;
          setValue('valor_bruto', Math.round(valorCalculado * 100) / 100);
        }
      }
    }
  }, [selectedProgramacoes, selectedObraId]);

  const toggleProgramacao = (id: string) => {
    setSelectedProgramacoes(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: MedicaoFormData) => {
    try {
      await createMedicao.mutateAsync({
        obra_id: data.obra_id,
        numero: data.numero || null,
        periodo_inicio: data.periodo_inicio || null,
        periodo_fim: data.periodo_fim || null,
        data_medicao: data.data_medicao || null,
        percentual: data.percentual,
        valor_bruto: data.valor_bruto,
        valor: valorFinal,
        taxa_igpm: data.taxa_igpm || 0,
        correcao_igpm: correcaoIgpm,
        metragem: data.metragem || 0,
        observacoes: data.observacoes || null,
        descricao: data.descricao || null,
        programacoes_ids: selectedProgramacoes.length > 0 ? selectedProgramacoes : null,
        status: 'em_elaboracao',
      });
      toast({ title: 'Medição criada', description: 'Nova medição registrada com sucesso.' });
      reset();
      setSelectedProgramacoes([]);
      setSelectedObraId('');
      onClose();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar medição.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Medição</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Obra */}
          <div className="space-y-2">
            <Label>Obra</Label>
            <Select onValueChange={(v) => { setValue('obra_id', v); setSelectedObraId(v); setSelectedProgramacoes([]); }}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {obrasData.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.obra_id && <p className="text-sm text-destructive">{errors.obra_id.message}</p>}
          </div>

          {/* Número e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input {...register('numero')} placeholder="MED-001" />
            </div>
            <div className="space-y-2">
              <Label>Data da Medição</Label>
              <Input type="date" {...register('data_medicao')} />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Período Início</Label>
              <Input type="date" {...register('periodo_inicio')} />
            </div>
            <div className="space-y-2">
              <Label>Período Fim</Label>
              <Input type="date" {...register('periodo_fim')} />
            </div>
          </div>

          {/* Programações vinculadas */}
          {selectedObraId && obraProgramacoes.length > 0 && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <Label className="text-base font-semibold">Programações Executadas</Label>
              <p className="text-xs text-muted-foreground">Selecione programações para vincular à medição</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {obraProgramacoes.map(prog => (
                  <div key={prog.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={prog.id}
                      checked={selectedProgramacoes.includes(prog.id)}
                      onCheckedChange={() => toggleProgramacao(prog.id)}
                    />
                    <label htmlFor={prog.id} className="text-sm cursor-pointer">
                      {new Date(prog.data_programada).toLocaleDateString('pt-BR')} — {prog.descricao || prog.tipo}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Percentual e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Percentual Executado (%)</Label>
              <Input type="number" {...register('percentual', { valueAsNumber: true })} min="0" max="100" />
              {errors.percentual && <p className="text-sm text-destructive">{errors.percentual.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Valor Bruto (R$)</Label>
              <Input type="number" step="0.01" {...register('valor_bruto', { valueAsNumber: true })} min="0" />
              {errors.valor_bruto && <p className="text-sm text-destructive">{errors.valor_bruto.message}</p>}
            </div>
          </div>

          {/* IGP-M */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-semibold">Correção Monetária (IGP-M)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taxa IGP-M (%)</Label>
                <Input type="number" step="0.01" {...register('taxa_igpm', { valueAsNumber: true })} min="0" />
              </div>
              <div className="space-y-2">
                <Label>Correção Calculada</Label>
                <Input value={`R$ ${correcaoIgpm.toFixed(2)}`} disabled className="bg-muted" />
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor Bruto:</span>
                <span className="font-medium">R$ {valorBruto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Correção IGP-M:</span>
                <span className="font-medium text-green-600">+ R$ {correcaoIgpm.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
                <span>Valor Final:</span>
                <span className="text-primary">R$ {valorFinal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Descrição e Observações */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input {...register('descricao')} placeholder="Descrição da medição" />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea {...register('observacoes')} placeholder="Observações adicionais..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createMedicao.isPending}>
              {createMedicao.isPending ? 'Salvando...' : 'Criar Medição'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaMedicaoModal;
