import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Wrench, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditMaterialModal from '@/components/Obras/EditMaterialModal';
import EditEquipamentoModal from '@/components/Obras/EditEquipamentoModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMateriais, useEquipamentos, useCreateMaterial, useCreateEquipamento, useDeleteMaterial, useDeleteEquipamento, useUpdateMaterial, useUpdateEquipamento, useObras } from '@/hooks/useSupabaseData';

const MateriaisEquipamentos = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<'material' | 'equipamento'>('material');
  const [formData, setFormData] = useState({
    nome: '',
    obraId: '',
    quantidade: '',
    unidade: '',
    valorUnitario: '',
    fornecedor: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditEquipamentoModal, setShowEditEquipamentoModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<string>('');

  const { data: materiais = [], isLoading: loadingMateriais } = useMateriais();
  const { data: equipamentos = [], isLoading: loadingEquipamentos } = useEquipamentos();
  const { data: obrasData = [] } = useObras();
  const createMaterial = useCreateMaterial();
  const createEquipamento = useCreateEquipamento();
  const deleteMaterialMut = useDeleteMaterial();
  const deleteEquipamentoMut = useDeleteEquipamento();
  const updateMaterialMut = useUpdateMaterial();
  const updateEquipamentoMut = useUpdateEquipamento();

  const filteredMateriais = materiais.filter(material => 
    material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEquipamentos = equipamentos.filter(equipamento => 
    equipamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (equipamento.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (type: 'material' | 'equipamento') => {
    setModalType(type);
    setFormData({ nome: '', obraId: '', quantidade: '', unidade: '', valorUnitario: '', fornecedor: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.obraId) {
      toast({ title: 'Erro', description: 'Nome e obra são obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      if (modalType === 'material') {
        await createMaterial.mutateAsync({
          nome: formData.nome,
          obra_id: formData.obraId,
          quantidade: parseFloat(formData.quantidade) || 0,
          unidade: formData.unidade || 'un',
          valor_unitario: parseFloat(formData.valorUnitario) || 0,
          fornecedor: formData.fornecedor || null,
        });
      } else {
        await createEquipamento.mutateAsync({
          nome: formData.nome,
          obra_id: formData.obraId,
          quantidade: parseInt(formData.quantidade) || 1,
          valor_unitario: parseFloat(formData.valorUnitario) || 0,
          fornecedor: formData.fornecedor || null,
        });
      }
      toast({
        title: `${modalType === 'material' ? 'Material' : 'Equipamento'} adicionado`,
        description: `${formData.nome} foi registrado com sucesso`,
      });
      setShowModal(false);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: any, type: string) => {
    setSelectedItem(item);
    if (type === 'Material') setShowEditModal(true);
    else setShowEditEquipamentoModal(true);
  };

  const handleDelete = (item: any, type: string) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (deleteType === 'Material') {
        await deleteMaterialMut.mutateAsync(itemToDelete.id);
      } else {
        await deleteEquipamentoMut.mutateAsync(itemToDelete.id);
      }
      toast({ title: "Item excluído", description: `${itemToDelete.nome} foi removido`, variant: 'destructive' });
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setDeleteType('');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveEdit = async (updatedMaterial: any) => {
    try {
      await updateMaterialMut.mutateAsync({ id: updatedMaterial.id, nome: updatedMaterial.nome, quantidade: updatedMaterial.quantidade, unidade: updatedMaterial.unidade, valor_unitario: updatedMaterial.valor_unitario });
      toast({ title: "Material atualizado", description: `${updatedMaterial.nome} foi atualizado` });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveEditEquipamento = async (updatedEquipamento: any) => {
    try {
      await updateEquipamentoMut.mutateAsync({ id: updatedEquipamento.id, nome: updatedEquipamento.nome, quantidade: updatedEquipamento.quantidade, valor_unitario: updatedEquipamento.valor_unitario });
      toast({ title: "Equipamento atualizado", description: `${updatedEquipamento.nome} foi atualizado` });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  if (loadingMateriais || loadingEquipamentos) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold text-primary">Materiais e Equipamentos</h1>
            <p className="text-muted-foreground mt-1">Controle unificado de recursos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="page-stats">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Materiais</p><p className="text-2xl font-bold text-foreground">{materiais.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Equipamentos</p><p className="text-2xl font-bold text-foreground">{equipamentos.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Valor em Estoque</p><p className="text-2xl font-bold text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(materiais.reduce((s, m) => s + (Number(m.valor_unitario) || 0) * (Number(m.quantidade) || 0), 0) + equipamentos.reduce((s, e) => s + (Number(e.valor_unitario) || 0) * (Number(e.quantidade) || 0), 0))}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Itens Pendentes</p><p className="text-2xl font-bold text-foreground">{materiais.filter(m => m.status === 'pendente').length + equipamentos.filter(e => e.status === 'disponivel').length}</p></CardContent></Card>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <Tabs defaultValue="materiais" className="space-y-4">
          <TabsList>
            <TabsTrigger value="materiais" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Materiais ({materiais.length})
            </TabsTrigger>
            <TabsTrigger value="equipamentos" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Equipamentos ({equipamentos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materiais" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleAddItem('material')}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Material
              </Button>
            </div>
            <div className="grid gap-4">
              {filteredMateriais.map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{material.nome}</h3>
                          <p className="text-sm text-muted-foreground">{(material as any).obras?.nome || 'Sem obra'}</p>
                          <p className="text-xs text-muted-foreground">
                            Qtd: {material.quantidade} {material.unidade} | R$ {Number(material.valor_unitario || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={material.status === 'entregue' ? 'default' : 'secondary'}>
                          {material.status || 'Pendente'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(material, 'Material')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(material, 'Material')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="equipamentos" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleAddItem('equipamento')}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Equipamento
              </Button>
            </div>
            <div className="grid gap-4">
              {filteredEquipamentos.map((equipamento) => (
                <Card key={equipamento.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          equipamento.status === 'manutencao' ? 'bg-destructive/10' : 'bg-primary/10'
                        }`}>
                          <Wrench className={`w-5 h-5 ${
                            equipamento.status === 'manutencao' ? 'text-destructive' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{equipamento.nome}</h3>
                          <p className="text-sm text-muted-foreground">{(equipamento as any).obras?.nome || 'Sem obra'}</p>
                          <p className="text-xs text-muted-foreground">
                            Fornecedor: {equipamento.fornecedor || '—'} | Qtd: {equipamento.quantidade}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          equipamento.status === 'manutencao' ? 'destructive' :
                          equipamento.status === 'em_uso' ? 'secondary' : 'default'
                        }>
                          {equipamento.status === 'manutencao' ? 'Manutenção' :
                           equipamento.status === 'em_uso' ? 'Em Uso' : 'Disponível'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(equipamento, 'Equipamento')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(equipamento, 'Equipamento')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal para adicionar */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar {modalType === 'material' ? 'Material' : 'Equipamento'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder={`Nome do ${modalType}`} />
              </div>
              <div className="space-y-2">
                <Label>Obra *</Label>
                <Select value={formData.obraId} onValueChange={(value) => setFormData({...formData, obraId: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                  <SelectContent>
                    {obrasData.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} placeholder="0" />
                </div>
                {modalType === 'material' && (
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
                      <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade</SelectItem>
                        <SelectItem value="m">Metro</SelectItem>
                        <SelectItem value="kg">Quilograma</SelectItem>
                        <SelectItem value="l">Litro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Valor Unitário (R$)</Label>
                <Input type="number" step="0.01" value={formData.valorUnitario} onChange={(e) => setFormData({...formData, valorUnitario: e.target.value})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={formData.fornecedor} onChange={(e) => setFormData({...formData, fornecedor: e.target.value})} placeholder="Nome do fornecedor" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={createMaterial.isPending || createEquipamento.isPending}>
                {(createMaterial.isPending || createEquipamento.isPending) ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EditMaterialModal open={showEditModal} onClose={() => setShowEditModal(false)} material={selectedItem} onSave={handleSaveEdit} />
        <EditEquipamentoModal open={showEditEquipamentoModal} onClose={() => setShowEditEquipamentoModal(false)} equipamento={selectedItem} onSave={handleSaveEditEquipamento} />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default MateriaisEquipamentos;
