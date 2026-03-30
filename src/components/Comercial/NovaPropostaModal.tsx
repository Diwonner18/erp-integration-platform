
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateProposta, useClientes, useObras } from '@/hooks/useSupabaseData';

interface NovaPropostaModalProps {
  open: boolean;
  onClose: () => void;
}

const NovaPropostaModal = ({ open, onClose }: NovaPropostaModalProps) => {
  const { toast } = useToast();
  const createProposta = useCreateProposta();
  const { data: clientes = [] } = useClientes();
  const { data: obras = [] } = useObras();
  const [formData, setFormData] = useState({
    titulo: '',
    cliente_id: '',
    obra_id: '',
    valor: '',
    descricao: '',
    prazo_execucao: '',
    condicoes_pagamento: '',
    data_validade: '',
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      cliente_id: '',
      obra_id: '',
      valor: '',
      descricao: '',
      prazo_execucao: '',
      condicoes_pagamento: '',
      data_validade: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProposta.mutateAsync({
        titulo: formData.titulo,
        cliente_id: formData.cliente_id || null,
        obra_id: formData.obra_id || null,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        descricao: formData.descricao || null,
        prazo_execucao: formData.prazo_execucao || null,
        condicoes_pagamento: formData.condicoes_pagamento || null,
        data_validade: formData.data_validade || null,
      });

      toast({
        title: "Proposta criada",
        description: "Nova proposta foi criada com sucesso.",
      });

      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a proposta.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da Proposta</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Título da proposta"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Obra (opcional)</Label>
              <Select value={formData.obra_id} onValueChange={(value) => setFormData({...formData, obra_id: value})}>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData({...formData, data_validade: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição do Serviço</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva o serviço a ser realizado..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prazo_execucao">Prazo de Execução</Label>
              <Input
                id="prazo_execucao"
                value={formData.prazo_execucao}
                onChange={(e) => setFormData({...formData, prazo_execucao: e.target.value})}
                placeholder="Ex: 30 dias"
              />
            </div>
            <div>
              <Label htmlFor="condicoes_pagamento">Condições de Pagamento</Label>
              <Input
                id="condicoes_pagamento"
                value={formData.condicoes_pagamento}
                onChange={(e) => setFormData({...formData, condicoes_pagamento: e.target.value})}
                placeholder="Ex: 30/60/90 dias"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProposta.isPending}>
              {createProposta.isPending ? 'Salvando...' : 'Criar Proposta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaPropostaModal;
