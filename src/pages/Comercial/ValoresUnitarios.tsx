import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useValoresUnitarios, useCreateValorUnitario, useUpdateValorUnitario } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';

const ValoresUnitarios = () => {
  const { incluir_editar } = useUserModulePermissions('valores_unitarios');
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({ servico: '', unidade: '', valor: '' });

  const { data: valores = [], isLoading } = useValoresUnitarios();
  const createValor = useCreateValorUnitario();
  const updateValor = useUpdateValorUnitario();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await updateValor.mutateAsync({ id: selectedItem.id, servico: formData.servico, unidade: formData.unidade, valor: parseFloat(formData.valor) });
        toast({ title: 'Valor atualizado' });
        setShowEditModal(false);
      } else {
        await createValor.mutateAsync({ servico: formData.servico, unidade: formData.unidade, valor: parseFloat(formData.valor) });
        toast({ title: 'Valor adicionado' });
        setShowAddModal(false);
      }
      setSelectedItem(null);
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const FormContent = () => (
    <form onSubmit={handleSave} className="space-y-4">
      <div><label className="block text-sm font-medium mb-2">Serviço</label><Input value={formData.servico} onChange={(e) => setFormData({...formData, servico: e.target.value})} required /></div>
      <div><label className="block text-sm font-medium mb-2">Unidade</label><Input value={formData.unidade} onChange={(e) => setFormData({...formData, unidade: e.target.value})} placeholder="m², un, h" /></div>
      <div><label className="block text-sm font-medium mb-2">Valor</label><Input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} required /></div>
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancelar</Button><Button type="submit">Salvar</Button></div>
    </form>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div><h1 className="text-3xl font-bold text-foreground">Valores Unitários</h1><p className="text-muted-foreground mt-1">Gerenciar preços por serviço</p></div>
          <Button data-tour="page-new-btn" onClick={() => { setFormData({ servico: '', unidade: '', valor: '' }); setSelectedItem(null); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Novo Valor</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : valores.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum valor unitário cadastrado</p></div>
        ) : (
          <div className="grid gap-4" data-tour="page-list">
            {valores.map((item) => (
              <Card key={item.id}><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.servico}</h3>
                      <p className="text-sm text-muted-foreground">{item.clientes?.razao_social || 'Geral'} | {item.unidade || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-primary">{formatCurrency(item.valor)}</span>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setFormData({ servico: item.servico, unidade: item.unidade || '', valor: String(item.valor) }); setShowEditModal(true); }}><Edit className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}><DialogContent><DialogHeader><DialogTitle>Novo Valor Unitário</DialogTitle></DialogHeader><FormContent /></DialogContent></Dialog>
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}><DialogContent><DialogHeader><DialogTitle>Editar Valor Unitário</DialogTitle></DialogHeader><FormContent /></DialogContent></Dialog>
      </div>
    </MainLayout>
  );
};

export default ValoresUnitarios;
