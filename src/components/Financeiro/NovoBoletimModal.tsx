
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateBoletim, useObras } from '@/hooks/useSupabaseData';

interface NovoBoletimModalProps {
  open: boolean;
  onClose: () => void;
}

const NovoBoletimModal = ({ open, onClose }: NovoBoletimModalProps) => {
  const { toast } = useToast();
  const createBoletim = useCreateBoletim();
  const { data: obras = [] } = useObras();
  const [formData, setFormData] = useState({
    numero: '',
    obra_id: '',
    valor: '',
    data_emissao: '',
    observacoes: '',
  });

  const resetForm = () => {
    setFormData({ numero: '', obra_id: '', valor: '', data_emissao: '', observacoes: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.obra_id) {
      toast({ title: "Erro", description: "Selecione uma obra.", variant: "destructive" });
      return;
    }

    try {
      await createBoletim.mutateAsync({
        numero: formData.numero || null,
        obra_id: formData.obra_id,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        data_emissao: formData.data_emissao || null,
        observacoes: formData.observacoes || null,
      });
      
      toast({
        title: "Boletim criado",
        description: "Novo boletim de medição foi criado com sucesso.",
      });
      
      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o boletim.",
        variant: "destructive"
      });
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
            />
          </div>

          <div>
            <Label>Obra</Label>
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
          
          <div>
            <Label htmlFor="data_emissao">Data de Emissão</Label>
            <Input
              id="data_emissao"
              type="date"
              value={formData.data_emissao}
              onChange={(e) => setFormData({...formData, data_emissao: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBoletim.isPending}>
              {createBoletim.isPending ? 'Salvando...' : 'Criar Boletim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoBoletimModal;
