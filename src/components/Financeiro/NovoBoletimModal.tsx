
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';

interface NovoBoletimModalProps {
  open: boolean;
  onClose: () => void;
}

const NovoBoletimModal = ({ open, onClose }: NovoBoletimModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    periodo: '',
    valor: '',
    numero: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Boletim criado",
        description: "Novo boletim de medição foi criado com sucesso.",
      });
      
      onClose();
      setFormData({
        cliente: '',
        periodo: '',
        valor: '',
        numero: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o boletim.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Boletim de Medição</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="numero">Número do Boletim</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData({...formData, numero: e.target.value})}
              placeholder="BM-005"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={formData.cliente}
              onChange={(e) => setFormData({...formData, cliente: e.target.value})}
              placeholder="Nome do cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="periodo">Período</Label>
            <Input
              id="periodo"
              value={formData.periodo}
              onChange={(e) => setFormData({...formData, periodo: e.target.value})}
              placeholder="Jan/2024"
              required
            />
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
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar Boletim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoBoletimModal;
