import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import FileImportButton from '@/components/shared/FileImportButton';
import AdicionarMaterialModal from '@/components/Obras/AdicionarMaterialModal';
import EditMaterialModal from '@/components/Obras/EditMaterialModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { useMateriais, useDeleteMaterial, useUpdateMaterial } from '@/hooks/useSupabaseData';

const Materiais = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: materiais = [], isLoading } = useMateriais();
  const deleteMaterial = useDeleteMaterial();
  const updateMaterial = useUpdateMaterial();

  const filteredMateriais = materiais.filter(material => 
    material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditarMaterial = (material: any) => {
    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  const handleExcluirMaterial = (material: any) => {
    setSelectedMaterial(material);
    setShowConfirmModal(true);
  };

  const confirmExcluirMaterial = async () => {
    if (!selectedMaterial) return;
    
    try {
      await deleteMaterial.mutateAsync(selectedMaterial.id);
      toast({
        title: 'Material excluído',
        description: `${selectedMaterial.nome} foi removido`,
        variant: 'destructive',
      });
      setShowConfirmModal(false);
      setSelectedMaterial(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveMaterial = async (updatedMaterial: any) => {
    try {
      await updateMaterial.mutateAsync({
        id: updatedMaterial.id,
        nome: updatedMaterial.nome,
        quantidade: updatedMaterial.quantidade,
        unidade: updatedMaterial.unidade,
        valor_unitario: updatedMaterial.valor_unitario,
        fornecedor: updatedMaterial.fornecedor,
        status: updatedMaterial.status,
      });
      toast({
        title: 'Material atualizado',
        description: `${updatedMaterial.nome} foi atualizado com sucesso`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'entregue') return 'default';
    if (status === 'pendente') return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = (status: string | null) => {
    if (status === 'entregue') return 'Entregue';
    if (status === 'pendente') return 'Pendente';
    return status || 'Pendente';
  };

  if (isLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Materiais</h1>
            <p className="text-muted-foreground mt-1">Gestão de estoque e materiais</p>
          </div>
          <div className="flex gap-2">
            <FileImportButton targetType="materiais" />
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Material
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar materiais..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                      <p className="text-sm text-muted-foreground">{material.fornecedor || 'Sem fornecedor'}</p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {material.quantidade} {material.unidade} | R$ {Number(material.valor_unitario || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusBadge(material.status)}>
                      {getStatusLabel(material.status)}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditarMaterial(material)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleExcluirMaterial(material)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <AdicionarMaterialModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <EditMaterialModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMaterial(null);
          }}
          material={selectedMaterial}
          onSave={handleSaveMaterial}
        />

        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedMaterial(null);
          }}
          onConfirm={confirmExcluirMaterial}
          title="Excluir Material"
          description={`Tem certeza que deseja excluir "${selectedMaterial?.nome}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          type="danger"
          loading={deleteMaterial.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default Materiais;
