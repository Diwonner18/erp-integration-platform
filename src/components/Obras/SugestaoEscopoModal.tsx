
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

const sugestaoSchema = z.object({
  obra: z.string().min(1, 'Selecione uma obra'),
  tipo: z.enum(['adicao', 'remocao', 'modificacao']),
  titulo: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  justificativa: z.string().min(10, 'Justificativa é obrigatória'),
  impactoValor: z.number().optional(),
  impactoPrazo: z.number().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']),
});

type SugestaoFormData = z.infer<typeof sugestaoSchema>;

interface SugestaoEscopoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SugestaoEscopoModal = ({ isOpen, onClose }: SugestaoEscopoModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const obras: string[] = [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SugestaoFormData>({
    resolver: zodResolver(sugestaoSchema),
    defaultValues: {
      prioridade: 'media',
    }
  });

  const onSubmit = async (data: SugestaoFormData) => {
    setIsLoading(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Sugestão enviada',
        description: `Sua sugestão "${data.titulo}" foi enviada para análise`,
      });
      
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar a sugestão',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Sugestão de Alteração</DialogTitle>
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
              <Label htmlFor="tipo">Tipo de Alteração</Label>
              <Select onValueChange={(value) => setValue('tipo', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adicao">Adição</SelectItem>
                  <SelectItem value="remocao">Remoção</SelectItem>
                  <SelectItem value="modificacao">Modificação</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select onValueChange={(value) => setValue('prioridade', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
              {errors.prioridade && (
                <p className="text-sm text-red-600">{errors.prioridade.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Sugestão</Label>
            <Input
              id="titulo"
              {...register('titulo')}
              placeholder="Ex: Adicionar tomadas extras na sala"
            />
            {errors.titulo && (
              <p className="text-sm text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição Detalhada</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descreva detalhadamente a alteração proposta..."
              rows={4}
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa</Label>
            <Textarea
              id="justificativa"
              {...register('justificativa')}
              placeholder="Por que esta alteração é necessária?"
              rows={3}
            />
            {errors.justificativa && (
              <p className="text-sm text-red-600">{errors.justificativa.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="impactoValor">Impacto no Valor (R$)</Label>
              <Input
                id="impactoValor"
                type="number"
                step="0.01"
                {...register('impactoValor', { valueAsNumber: true })}
                placeholder="0.00 (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impactoPrazo">Impacto no Prazo (dias)</Label>
              <Input
                id="impactoPrazo"
                type="number"
                {...register('impactoPrazo', { valueAsNumber: true })}
                placeholder="0 (opcional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SugestaoEscopoModal;
