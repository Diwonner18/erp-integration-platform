import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUpdateMaterial, useCheckRecordAccess } from '@/hooks/useSupabaseData';
import AccessGuard from '@/components/shared/AccessGuard';

interface EditMaterialModalProps {
  open: boolean;
  onClose: () => void;
  material: any | null;
  onSave?: (material: any) => void;
}

const EditMaterialModal = ({ open, onClose, material, onSave }: EditMaterialModalProps) => {
  const { toast } = useToast();
  const updateMaterial = useUpdateMaterial();
  const [formData, setFormData] = useState({
    nome: '', quantidade: '', unidade: '', valorUnitario: '', fornecedor: '', status: ''
  });

  const materialId = material?.id?.toString() || '';
  const { data: hasEditAccess, isLoading: checkingAccess } = useCheckRecordAccess('materiais', materialId, 'edit');

  useEffect(() => {
    if (material) {
      setFormData({
        nome: material.nome || '',
        quantidade: material.quantidade ? String(material.quantidade) : '',
        unidade: material.unidade || '',
        valorUnitario: material.valor_unitario ? String(material.valor_unitario) : '',
        fornecedor: material.fornecedor || '',
        status: material.status || 'pendente',
      });
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;

    try {
      const qty = parseFloat(formData.quantidade) || 0;
      const unitVal = parseFloat(formData.valorUnitario) || 0;

      await updateMaterial.mutateAsync({
        id: material.id,
        nome: formData.nome,
        quantidade: qty,
        unidade: formData.unidade,
        valor_unitario: unitVal,
        valor_total: qty * unitVal,
        fornecedor: formData.fornecedor || null,
        status: formData.status,
      });

      toast({
        title: 'Material atualizado',
        description: `${formData.nome} foi atualizado com sucesso`,
      });

      onSave?.(material);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o material.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>

        <AccessGuard
          hasAccess={hasEditAccess}
          isLoading={checkingAccess}
          tabela="materiais"
          registroId={materialId}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome do Material</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Nome do material" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantidade</Label>
                <Input type="number" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} placeholder="Qtd" required />
              </div>
              <div>
                <Label>Unidade</Label>
                <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
                  <SelectTrigger><SelectValue placeholder="Un." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">UN</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="CX">CX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Valor Unitário (R$)</Label>
              <Input type="number" step="0.01" value={formData.valorUnitario} onChange={(e) => setFormData({...formData, valorUnitario: e.target.value})} placeholder="0,00" required />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input value={formData.fornecedor} onChange={(e) => setFormData({...formData, fornecedor: e.target.value})} placeholder="Fornecedor" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={updateMaterial.isPending}>Cancelar</Button>
              <Button type="submit" disabled={updateMaterial.isPending}>{updateMaterial.isPending ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </AccessGuard>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaterialModal;
