import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCheckRecordAccess } from '@/hooks/useSupabaseData';
import AccessGuard from '@/components/shared/AccessGuard';

interface EditProgramacaoModalProps {
  open: boolean;
  onClose: () => void;
  programacao: {
    id: number;
    cliente: string;
    metragem: string;
    endereco: string;
    escopo: string;
    dataInicio: string;
    dataFim: string;
    status: string;
    prioridade: string;
    created_by?: string;
  };
  onSave: (updatedProgramacao: any) => void;
}

const EditProgramacaoModal = ({ open, onClose, programacao, onSave }: EditProgramacaoModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cliente: programacao.cliente,
    metragem: programacao.metragem,
    endereco: programacao.endereco,
    escopo: programacao.escopo,
    dataInicio: programacao.dataInicio,
    dataFim: programacao.dataFim,
    prioridade: programacao.prioridade
  });

  const progId = programacao.id?.toString() || '';
  const { data: hasEditAccess, isLoading: checkingAccess } = useCheckRecordAccess('programacoes', progId, 'edit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProgramacao = { ...programacao, ...formData };
    onSave(updatedProgramacao);
    toast({ title: "Programação atualizada", description: "As alterações foram salvas com sucesso." });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Programação #{programacao.id}</DialogTitle>
        </DialogHeader>

        <AccessGuard
          hasAccess={hasEditAccess}
          isLoading={checkingAccess}
          tabela="programacoes"
          registroId={progId}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Cliente</label>
                <Input value={formData.cliente} onChange={(e) => setFormData({...formData, cliente: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Metragem</label>
                <Input value={formData.metragem} onChange={(e) => setFormData({...formData, metragem: e.target.value})} placeholder="Ex: 120m²" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Endereço Completo</label>
              <Input value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Escopo da Obra</label>
              <textarea className="w-full p-3 border border-border rounded-md focus:ring-2 focus:ring-ring bg-background text-foreground" rows={4} value={formData.escopo} onChange={(e) => setFormData({...formData, escopo: e.target.value})} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data de Início</label>
                <Input type="date" value={formData.dataInicio} onChange={(e) => setFormData({...formData, dataInicio: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data Prevista de Conclusão</label>
                <Input type="date" value={formData.dataFim} onChange={(e) => setFormData({...formData, dataFim: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Prioridade</label>
              <select className="w-full p-3 border border-border rounded-md focus:ring-2 focus:ring-ring bg-background text-foreground" value={formData.prioridade} onChange={(e) => setFormData({...formData, prioridade: e.target.value})} required>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </AccessGuard>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgramacaoModal;
