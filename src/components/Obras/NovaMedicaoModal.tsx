import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const medicaoSchema = z.object({
  obra: z.string().min(1, 'Selecione uma obra'),
  periodo: z.string().min(1, 'Período é obrigatório'),
  percentual: z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  desconto: z.number().min(0, 'Desconto deve ser positivo').optional(),
  tipoDesconto: z.enum(['fixo', 'percentual']).optional(),
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

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  vinculacao: 'obra' | 'data';
  data?: string;
  tipo: 'fixa' | 'recorrente' | 'pontual';
}

interface NovaMedicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NovaMedicaoModal = ({ isOpen, onClose }: NovaMedicaoModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tipoDesconto, setTipoDesconto] = useState<'fixo' | 'percentual'>('fixo');
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    valor: 0,
    vinculacao: 'obra' as 'obra' | 'data',
    data: '',
    tipo: 'fixa' as 'fixa' | 'recorrente' | 'pontual'
  });

  const obras: string[] = [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<MedicaoFormData>({
    resolver: zodResolver(medicaoSchema),
    defaultValues: {
      status: 'pendente',
      percentual: 0,
      valor: 0,
      desconto: 0,
      tipoDesconto: 'fixo',
      correcaoMonetaria: 0,
      taxaMobilizacao: 0,
    }
  });

  const valorBase = watch('valor') || 0;
  const desconto = watch('desconto') || 0;

  const adicionarDespesa = () => {
    if (!novaDespesa.descricao || novaDespesa.valor <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos da despesa',
        variant: 'destructive',
      });
      return;
    }

    if (novaDespesa.vinculacao === 'data' && !novaDespesa.data) {
      toast({
        title: 'Erro',
        description: 'Selecione uma data para a despesa',
        variant: 'destructive',
      });
      return;
    }

    const despesa: Despesa = {
      id: Date.now().toString(),
      ...novaDespesa
    };

    setDespesas([...despesas, despesa]);
    setNovaDespesa({
      descricao: '',
      valor: 0,
      vinculacao: 'obra',
      data: '',
      tipo: 'fixa'
    });

    toast({
      title: 'Despesa adicionada',
      description: 'A despesa foi vinculada à medição',
    });
  };

  const removerDespesa = (id: string) => {
    setDespesas(despesas.filter(d => d.id !== id));
  };

  const calcularValorFinal = () => {
    const valorDesconto = tipoDesconto === 'percentual' 
      ? valorBase * (desconto / 100) 
      : desconto;
    
    return valorBase - valorDesconto;
  };

  const onSubmit = async (data: MedicaoFormData) => {
    setIsLoading(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const medicaoCompleta = {
        ...data,
        tipoDesconto,
        despesas,
        valorFinal: calcularValorFinal()
      };
      
      
      
      toast({
        title: 'Medição criada',
        description: `Nova medição para ${data.obra} foi registrada com sucesso`,
      });
      
      reset();
      setDespesas([]);
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <Label className="text-base font-semibold">Descontos e Correções</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDesconto">Tipo de Desconto</Label>
                <RadioGroup value={tipoDesconto} onValueChange={(value: 'fixo' | 'percentual') => {
                  setTipoDesconto(value);
                  setValue('tipoDesconto', value);
                }}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixo" id="fixo" />
                    <Label htmlFor="fixo" className="font-normal cursor-pointer">Valor Fixo (R$)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentual" id="percentual" />
                    <Label htmlFor="percentual" className="font-normal cursor-pointer">Percentual (%)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desconto">
                  Desconto {tipoDesconto === 'percentual' ? '(%)' : '(R$)'}
                </Label>
                <Input
                  id="desconto"
                  type="number"
                  step="0.01"
                  {...register('desconto', { valueAsNumber: true })}
                  placeholder="0.00"
                  min="0"
                  max={tipoDesconto === 'percentual' ? 100 : undefined}
                />
                {errors.desconto && (
                  <p className="text-sm text-red-600">{errors.desconto.message}</p>
                )}
              </div>
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
              <p className="text-xs text-slate-500">Valor editável conforme índice IGP-M</p>
              {errors.correcaoMonetaria && (
                <p className="text-sm text-red-600">{errors.correcaoMonetaria.message}</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Valor Base:</span>
                <span className="text-sm font-semibold">R$ {valorBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-medium text-slate-700">Desconto Aplicado:</span>
                <span className="text-sm font-semibold text-red-600">
                  - R$ {(tipoDesconto === 'percentual' ? valorBase * (desconto / 100) : desconto).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-300">
                <span className="text-base font-bold text-slate-900">Valor Final:</span>
                <span className="text-base font-bold text-green-600">
                  R$ {calcularValorFinal().toFixed(2)}
                </span>
              </div>
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

          {/* Seção de Despesas */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Despesas Vinculadas</Label>
              <span className="text-xs text-slate-500">{despesas.length} despesa(s)</span>
            </div>

            {/* Lista de despesas */}
            {despesas.length > 0 && (
              <div className="space-y-2">
                {despesas.map((despesa) => (
                  <Card key={despesa.id} className="bg-white">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{despesa.descricao}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              R$ {despesa.valor.toFixed(2)}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {despesa.tipo === 'fixa' ? 'Fixa' : despesa.tipo === 'recorrente' ? 'Recorrente' : 'Pontual'}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                              {despesa.vinculacao === 'obra' ? 'Obra Inteira' : `Data: ${despesa.data}`}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerDespesa(despesa.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Formulário de nova despesa */}
            <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200">
              <Label className="text-sm font-medium">Adicionar Despesa</Label>
              
              <div className="space-y-2">
                <Input
                  placeholder="Descrição da despesa"
                  value={novaDespesa.descricao}
                  onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={novaDespesa.valor || ''}
                  onChange={(e) => setNovaDespesa({...novaDespesa, valor: parseFloat(e.target.value) || 0})}
                />
                <Select 
                  value={novaDespesa.tipo}
                  onValueChange={(value: 'fixa' | 'recorrente' | 'pontual') => 
                    setNovaDespesa({...novaDespesa, tipo: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixa">Fixa</SelectItem>
                    <SelectItem value="recorrente">Recorrente</SelectItem>
                    <SelectItem value="pontual">Pontual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Vinculação</Label>
                <RadioGroup 
                  value={novaDespesa.vinculacao}
                  onValueChange={(value: 'obra' | 'data') => setNovaDespesa({...novaDespesa, vinculacao: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="obra" id="vinc-obra" />
                    <Label htmlFor="vinc-obra" className="font-normal cursor-pointer">Obra Inteira</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="data" id="vinc-data" />
                    <Label htmlFor="vinc-data" className="font-normal cursor-pointer">Data Específica</Label>
                  </div>
                </RadioGroup>
              </div>

              {novaDespesa.vinculacao === 'data' && (
                <Input
                  type="date"
                  value={novaDespesa.data}
                  onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                />
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarDespesa}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Despesa
              </Button>
            </div>
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
