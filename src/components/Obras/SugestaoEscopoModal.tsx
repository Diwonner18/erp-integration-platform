
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
import { useCreateAlteracaoEscopo, useObras } from '@/hooks/useSupabaseData';

const sugestaoSchema = z.object({
  obra_id: z.string().min(1, 'Selecione uma obra'),
  descricao: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
  justificativa: z.string().min(10, 'Justificativa é obrigatória'),
  impactoValor: z.number().optional(),
  impactoPrazo: z.number().optional(),
});

type SugestaoFormData = z.infer<typeof sugestaoSchema>;

interface SugestaoEscopoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SugestaoEscopoModal = ({ isOpen, onClose }: SugestaoEscopoModalProps) => {
  const { toast } = useToast();
  const createAlteracao = useCreateAlteracaoEscopo();
  const { data: obras = [] } = useObras();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SugestaoFormData>({
    resolver: zodResolver(sugestaoSchema),
  });

  const onSubmit = async (data: SugestaoFormData) => {
    try {
      await createAlteracao.mutateAsync({
        obra_id: data.obra_id,
        descricao: data.descricao,
        justificativa: data.justificativa || null,
        impacto_valor: data.impactoValor || 0,
        impacto_prazo: data.impactoPrazo || 0,
      });
      
      toast({
        title: 'Sugestão enviada',
        description: 'Sua sugestão foi enviada para análise',
      });
      
      reset();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao enviar a sugestão',
        variant: 'destructive',
      });
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
            <Label>Obra</Label>
            <Select onValueChange={(value) => setValue('obra_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.obra_id && (
              <p className="text-sm text-destructive">{errors.obra_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da Alteração</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descreva detalhadamente a alteração proposta..."
              rows={4}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
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
              <p className="text-sm text-destructive">{errors.justificativa.message}</p>
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
            <Button type="submit" disabled={createAlteracao.isPending}>
              {createAlteracao.isPending ? 'Enviando...' : 'Enviar Sugestão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SugestaoEscopoModal;
