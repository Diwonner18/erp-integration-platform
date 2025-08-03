
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const medicaoSchema = z.object({
  obra: z.string().min(1, 'Selecione uma obra'),
  periodo: z.string().min(1, 'Período é obrigatório'),
  percentual: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  desconto: z.number().min(0, 'Desconto deve ser positivo').optional(),
  correcaoMonetaria: z.number().min(0, 'Correção monetária deve ser positiva').optional(),
  taxaMobilizacao: z.number().min(0, 'Taxa de mobilização deve ser positiva').optional(),
  observacaoMobilizacao: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['pendente', 'aprovada', 'rejeitada']),
}).refine((data) => {
  // Se taxa de mobilização for maior que 0, observação é obrigatória
  if (data.taxaMobilizacao && data.taxaMobilizacao > 0 && !data.observacaoMobilizacao?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Observação é obrigatória quando taxa de mobilização for aplicada",
  path: ["observacaoMobilizacao"]
});

type MedicaoFormData = z.infer<typeof medicaoSchema>;

interface NovaMedicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NovaMedicaoModal = ({ isOpen, onClose }: NovaMedicaoModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const obras = [
    'Obra Residencial Silva',
    'Complexo Comercial ABC',
    'Reforma Escritório Costa',
    'Instalação Industrial Mendes'
  ];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<MedicaoFormData>({
    resolver: zodResolver(medicaoSchema),
    defaultValues: {
      status: 'pendente',
      percentual: 0,
      valor: 0,
      desconto: 0,
      correcaoMonetaria: 0,
      taxaMobilizacao: 0,
    }
  });

  const onSubmit = async (data: MedicaoFormData) => {
    setIsLoading(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Medição criada',
        description: `Nova medição para ${data.obra} foi registrada com sucesso`,
      });
      
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar a medição',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Medição</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obra">Obra</Label>
            <Select onValueChange={(value) => setValue('obra', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map((obra) => (
                  <SelectItem key={obra} value={obra}>
                    {obra}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.obra && (
              <p className="text-sm text-red-600">{errors.obra.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Input
                id="periodo"
                {...register('periodo')}
                placeholder="Jan/2024"
              />
              {errors.periodo && (
                <p className="text-sm text-red-600">{errors.periodo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual">Percentual (%)</Label>
              <Input
                id="percentual"
                type="number"
                {...register('percentual', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="100"
              />
              {errors.percentual && (
                <p className="text-sm text-red-600">{errors.percentual.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              {...register('valor', { valueAsNumber: true })}
              placeholder="0.00"
              min="0"
            />
            {errors.valor && (
              <p className="text-sm text-red-600">{errors.valor.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto (R$)</Label>
              <Input
                id="desconto"
                type="number"
                step="0.01"
                {...register('desconto', { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
              />
              {errors.desconto && (
                <p className="text-sm text-red-600">{errors.desconto.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="correcaoMonetaria">Correção Monetária IGP-M (R$)</Label>
              <Input
                id="correcaoMonetaria"
                type="number"
                step="0.01"
                {...register('correcaoMonetaria', { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
              />
              {errors.correcaoMonetaria && (
                <p className="text-sm text-red-600">{errors.correcaoMonetaria.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxaMobilizacao">Taxa de Mobilização (R$)</Label>
            <Input
              id="taxaMobilizacao"
              type="number"
              step="0.01"
              {...register('taxaMobilizacao', { valueAsNumber: true })}
              placeholder="0.00"
              min="0"
            />
            {errors.taxaMobilizacao && (
              <p className="text-sm text-red-600">{errors.taxaMobilizacao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacaoMobilizacao">Observação da Taxa de Mobilização</Label>
            <Textarea
              id="observacaoMobilizacao"
              {...register('observacaoMobilizacao')}
              placeholder="Justificativa para aplicação da taxa de mobilização..."
              rows={3}
            />
            {errors.observacaoMobilizacao && (
              <p className="text-sm text-red-600">{errors.observacaoMobilizacao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Detalhes sobre a medição..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Criar Medição'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaMedicaoModal;
