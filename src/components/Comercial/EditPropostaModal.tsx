
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUpdateProposta } from '@/hooks/useSupabaseData';
import { getSafeErrorMessage } from '@/lib/errorMessages';

interface EditPropostaModalProps {
  open: boolean;
  onClose: () => void;
  proposta: any | null;
  onSave?: () => void;
}

const EditPropostaModal = ({ open, onClose, proposta, onSave }: EditPropostaModalProps) => {
  const { toast } = useToast();
  const updateProposta = useUpdateProposta();
  const [formData, setFormData] = useState({
    titulo: '',
    valor: '',
    status: '',
    descricao: '',
    prazo_execucao: '',
    condicoes_pagamento: '',
  });

  useEffect(() => {
    if (proposta) {
      setFormData({
        titulo: proposta.titulo || '',
        valor: proposta.valor ? String(proposta.valor) : '',
        status: proposta.status || '',
        descricao: proposta.descricao || '',
        prazo_execucao: proposta.prazo_execucao || '',
        condicoes_pagamento: proposta.condicoes_pagamento || '',
      });
    }
  }, [proposta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposta) return;

    try {
      await updateProposta.mutateAsync({
        id: proposta.id,
        titulo: formData.titulo,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        status: formData.status as any,
        descricao: formData.descricao || null,
        prazo_execucao: formData.prazo_execucao || null,
        condicoes_pagamento: formData.condicoes_pagamento || null,
      });

      toast({
        title: "Proposta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      onSave?.();
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: getSafeErrorMessage(error, "Não foi possível atualizar a proposta."),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Proposta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Título da proposta"
              required
            />
          </div>

          <div>
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descrição da proposta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prazo de Execução</Label>
              <Input
                value={formData.prazo_execucao}
                onChange={(e) => setFormData({...formData, prazo_execucao: e.target.value})}
                placeholder="Ex: 30 dias"
              />
            </div>
            <div>
              <Label>Cond. Pagamento</Label>
              <Input
                value={formData.condicoes_pagamento}
                onChange={(e) => setFormData({...formData, condicoes_pagamento: e.target.value})}
                placeholder="Ex: 30/60/90"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateProposta.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProposta.isPending}>
              {updateProposta.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPropostaModal;
