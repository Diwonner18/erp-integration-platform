import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModelosContrato, useCreateModeloContrato, useUpdateModeloContrato } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';

const ModelosContrato = () => {
  const { incluir_editar } = useUserModulePermissions('modelos_contrato');
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<any>(null);
  const [formData, setFormData] = useState({ titulo: '', tipo: '', conteudo: '' });

  const { data: modelos = [], isLoading } = useModelosContrato();
  const createModelo = useCreateModeloContrato();
  const updateModelo = useUpdateModeloContrato();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedModelo) {
        await updateModelo.mutateAsync({ id: selectedModelo.id, titulo: formData.titulo, tipo: formData.tipo, conteudo: formData.conteudo });
        toast({ title: 'Modelo atualizado' });
        setShowEditModal(false);
      } else {
        await createModelo.mutateAsync({ titulo: formData.titulo, tipo: formData.tipo, conteudo: formData.conteudo });
        toast({ title: 'Modelo adicionado' });
        setShowAddModal(false);
      }
      setSelectedModelo(null);
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSave} className="space-y-4">
      <div><label className="block text-sm font-medium mb-2">Nome</label><Input value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} required /></div>
      <div><label className="block text-sm font-medium mb-2">Tipo</label>
        <select className="w-full p-3 border rounded-md" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} required>
          <option value="">Selecione</option><option value="Contrato">Contrato</option><option value="Aditivo">Aditivo</option><option value="Termo">Termo</option>
        </select>
      </div>
      <div><label className="block text-sm font-medium mb-2">Conteúdo</label><textarea className="w-full p-3 border rounded-md" rows={3} value={formData.conteudo} onChange={(e) => setFormData({...formData, conteudo: e.target.value})} /></div>
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancelar</Button><Button type="submit">Salvar</Button></div>
    </form>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div><h1 className="text-3xl font-bold text-foreground">Modelos de Contrato</h1><p className="text-muted-foreground mt-1">Gerenciar templates</p></div>
          {incluir_editar && <Button data-tour="page-new-btn" onClick={() => { setFormData({ titulo: '', tipo: '', conteudo: '' }); setSelectedModelo(null); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Novo Modelo</Button>}
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : modelos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum modelo cadastrado</p></div>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {modelos.map((modelo) => (
              <Card key={modelo.id}><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{modelo.titulo}</h3>
                      <p className="text-sm text-muted-foreground">Tipo: {modelo.tipo || '-'}</p>
                      <p className="text-xs text-muted-foreground">Atualizado: {new Date(modelo.updated_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  {incluir_editar && <Button variant="outline" size="sm" onClick={() => { setSelectedModelo(modelo); setFormData({ titulo: modelo.titulo, tipo: modelo.tipo || '', conteudo: modelo.conteudo || '' }); setShowEditModal(true); }}><Edit className="w-4 h-4" /></Button>}
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}><DialogContent><DialogHeader><DialogTitle>Novo Modelo</DialogTitle></DialogHeader><FormContent /></DialogContent></Dialog>
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}><DialogContent><DialogHeader><DialogTitle>Editar Modelo</DialogTitle></DialogHeader><FormContent /></DialogContent></Dialog>
      </div>
    </MainLayout>
  );
};

export default ModelosContrato;
