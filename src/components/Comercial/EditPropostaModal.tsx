import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Proposta {
  id: number;
  obraId: string;
  client: string;
  value: string;
  status: string;
  date: string;
}

interface EditPropostaModalProps {
  open: boolean;
  onClose: () => void;
  proposta: Proposta | null;
  onSave: (proposta: Proposta) => void;
}

const EditPropostaModal = ({ open, onClose, proposta, onSave }: EditPropostaModalProps) => {
  const [formData, setFormData] = useState({
    client: '',
    value: '',
    status: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proposta) {
      setFormData({
        client: proposta.client,
        value: proposta.value.replace('R$ ', ''),
        status: proposta.status,
        observacoes: ''
      });
    }
  }, [proposta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposta) return;

    setLoading(true);
    
    const updatedProposta = {
      ...proposta,
      client: formData.client,
      value: `R$ ${formData.value}`,
      status: formData.status
    };

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave(updatedProposta);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Proposta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <Input
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div>
            <Label>Valor da Proposta</Label>
            <Input
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações sobre as alterações..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPropostaModal;