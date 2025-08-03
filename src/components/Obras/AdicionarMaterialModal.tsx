
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

const materialSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unidade: z.string().min(1, 'Selecione a unidade'),
  valorUnitario: z.number().min(0, 'Valor deve ser positivo'),
  fornecedor: z.string().optional(),
  observacoes: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface AdicionarMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdicionarMaterialModal = ({ isOpen, onClose }: AdicionarMaterialModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const categorias = [
    'Fios e Cabos',
    'Disjuntores',
    'Tomadas e Interruptores',
    'Eletrodutos',
    'Conectores',
    'Iluminação',
    'Quadros Elétricos',
    'Outros'
  ];

  const unidades = ['UN', 'M', 'KG', 'CX', 'PC', 'RL'];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      quantidade: 1,
      valorUnitario: 0,
    }
  });

  const onSubmit = async (data: MaterialFormData) => {
    setIsLoading(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Material adicionado',
        description: `${data.nome} foi adicionado ao estoque com sucesso`,
      });
      
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao adicionar o material',
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
          <DialogTitle>Adicionar Material</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Material</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Cabo flexível 2,5mm"
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select onValueChange={(value) => setValue('categoria', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-sm text-red-600">{errors.categoria.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                {...register('quantidade', { valueAsNumber: true })}
                placeholder="1"
                min="1"
              />
              {errors.quantidade && (
                <p className="text-sm text-red-600">{errors.quantidade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select onValueChange={(value) => setValue('unidade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="UN" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unidade && (
                <p className="text-sm text-red-600">{errors.unidade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorUnitario">Valor Unit. (R$)</Label>
              <Input
                id="valorUnitario"
                type="number"
                step="0.01"
                {...register('valorUnitario', { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
              />
              {errors.valorUnitario && (
                <p className="text-sm text-red-600">{errors.valorUnitario.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Input
              id="fornecedor"
              {...register('fornecedor')}
              placeholder="Nome do fornecedor (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarMaterialModal;
