import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AccessGuard from '@/components/shared/AccessGuard';
import { useCheckRecordAccess } from '@/hooks/useSupabaseData';

interface EditEquipamentoModalProps {
  open: boolean;
  onClose: () => void;
  equipamento: any;
  onSave: (equipamento: any) => void;
}

const EditEquipamentoModal = ({ open, onClose, equipamento, onSave }: EditEquipamentoModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    status: 'disponivel'
  });

  const { data: hasAccess, isLoading: accessLoading } = useCheckRecordAccess(
    'equipamentos',
    equipamento?.id,
    'edit'
  );

  useEffect(() => {
    if (equipamento) {
      setFormData({
        nome: equipamento.nome || '',
        categoria: equipamento.categoria || '',
        marca: equipamento.marca || '',
        modelo: equipamento.modelo || '',
        numeroSerie: equipamento.numeroSerie || '',
        status: equipamento.status || 'disponivel'
      });
    }
  }, [equipamento]);

  const handleSave = () => {
    if (!formData.nome.trim()) {
      return;
    }

    const updatedEquipamento = {
      ...equipamento,
      ...formData
    };

    onSave(updatedEquipamento);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Equipamento</DialogTitle>
        </DialogHeader>
        
        <AccessGuard
          hasAccess={hasAccess}
          isLoading={accessLoading}
          tabela="equipamentos"
          registroId={equipamento?.id || ''}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Nome do equipamento"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                placeholder="Categoria"
              />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                value={formData.marca}
                onChange={(e) => setFormData({...formData, marca: e.target.value})}
                placeholder="Marca do equipamento"
              />
            </div>

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input
                value={formData.modelo}
                onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                placeholder="Modelo"
              />
            </div>

            <div className="space-y-2">
              <Label>Número de Série</Label>
              <Input
                value={formData.numeroSerie}
                onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})}
                placeholder="Número de série"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </AccessGuard>
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipamentoModal;
