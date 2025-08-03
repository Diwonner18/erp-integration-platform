
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface NovaPropostaModalProps {
  open: boolean;
  onClose: () => void;
}

const NovaPropostaModal = ({ open, onClose }: NovaPropostaModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    valor: '',
    descricao: '',
    prazo: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Proposta criada",
        description: "Nova proposta foi criada com sucesso.",
      });
      
      onClose();
      setFormData({
        cliente: '',
        valor: '',
        descricao: '',
        prazo: '',
        observacoes: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a proposta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={formData.cliente} onValueChange={(value) => setFormData({...formData, cliente: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abc">ABC Construções</SelectItem>
                  <SelectItem value="silva">Silva Engenharia</SelectItem>
                  <SelectItem value="costa">Costa & Filhos</SelectItem>
                  <SelectItem value="mendes">Mendes Construtora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="0,00"
                required
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
              required
            />
          </div>
          
          <div>
            <Label htmlFor="prazo">Prazo de Execução (dias)</Label>
            <Input
              id="prazo"
              type="number"
              value={formData.prazo}
              onChange={(e) => setFormData({...formData, prazo: e.target.value})}
              placeholder="30"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar Proposta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaPropostaModal;
