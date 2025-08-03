
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EditAgendamentoModalProps {
  open: boolean;
  onClose: () => void;
  agendamento: {
    id: number;
    cliente: string;
    metragem: string;
    endereco: string;
    escopo: string;
    dataInicio: string;
    dataFim: string;
    status: string;
    prioridade: string;
  };
  onSave: (updatedAgendamento: any) => void;
}

const EditAgendamentoModal = ({ open, onClose, agendamento, onSave }: EditAgendamentoModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cliente: agendamento.cliente,
    metragem: agendamento.metragem,
    endereco: agendamento.endereco,
    escopo: agendamento.escopo,
    dataInicio: agendamento.dataInicio,
    dataFim: agendamento.dataFim,
    prioridade: agendamento.prioridade
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAgendamento = { ...agendamento, ...formData };
    onSave(updatedAgendamento);
    toast({
      title: "Agendamento atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agendamento #{agendamento.id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cliente
              </label>
              <Input 
                value={formData.cliente}
                onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Metragem
              </label>
              <Input 
                value={formData.metragem}
                onChange={(e) => setFormData({...formData, metragem: e.target.value})}
                placeholder="Ex: 120m²"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Endereço Completo
            </label>
            <Input 
              value={formData.endereco}
              onChange={(e) => setFormData({...formData, endereco: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Escopo da Obra
            </label>
            <textarea 
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={formData.escopo}
              onChange={(e) => setFormData({...formData, escopo: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Início
              </label>
              <Input 
                type="date" 
                value={formData.dataInicio}
                onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data Prevista de Conclusão
              </label>
              <Input 
                type="date" 
                value={formData.dataFim}
                onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prioridade
            </label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.prioridade}
              onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
              required
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgendamentoModal;
