import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCheckRecordAccess } from '@/hooks/useSupabaseData';
import AccessGuard from '@/components/shared/AccessGuard';

interface Material {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  valorUnitario: string;
  estoque: string;
  created_by?: string;
}

interface EditMaterialModalProps {
  open: boolean;
  onClose: () => void;
  material: Material | null;
  onSave: (material: Material) => void;
}

const EditMaterialModal = ({ open, onClose, material, onSave }: EditMaterialModalProps) => {
  const [formData, setFormData] = useState({
    nome: '', categoria: '', quantidade: '', unidade: '', valorUnitario: '', estoque: ''
  });
  const [loading, setLoading] = useState(false);

  const materialId = material?.id?.toString() || '';
  const { data: hasEditAccess, isLoading: checkingAccess } = useCheckRecordAccess('materiais', materialId, 'edit');

  useEffect(() => {
    if (material) {
      setFormData({
        nome: material.nome || '',
        categoria: material.categoria || '',
        quantidade: material.quantidade ? material.quantidade.toString() : '',
        unidade: material.unidade || '',
        valorUnitario: material.valorUnitario ? material.valorUnitario.replace('R$ ', '') : '',
        estoque: material.estoque || ''
      });
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;
    setLoading(true);
    const updatedMaterial = {
      ...material,
      nome: formData.nome, categoria: formData.categoria,
      quantidade: parseInt(formData.quantidade), unidade: formData.unidade,
      valorUnitario: `R$ ${formData.valorUnitario}`, estoque: formData.estoque
    };
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(updatedMaterial);
    setLoading(false);
    onClose();
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
            <div>
              <Label>Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fios e Cabos">Fios e Cabos</SelectItem>
                  <SelectItem value="Disjuntores">Disjuntores</SelectItem>
                  <SelectItem value="Tomadas e Interruptores">Tomadas e Interruptores</SelectItem>
                  <SelectItem value="Eletrodutos">Eletrodutos</SelectItem>
                  <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Valor Unitário</Label>
              <Input value={formData.valorUnitario} onChange={(e) => setFormData({...formData, valorUnitario: e.target.value})} placeholder="0,00" required />
            </div>
            <div>
              <Label>Status do Estoque</Label>
              <Select value={formData.estoque} onValueChange={(value) => setFormData({...formData, estoque: value})}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adequado">Adequado</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </AccessGuard>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaterialModal;
