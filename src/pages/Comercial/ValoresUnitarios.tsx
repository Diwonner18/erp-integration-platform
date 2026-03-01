
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ValoresUnitarios = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    service: '',
    client: '',
    value: ''
  });

  const [valores, setValores] = useState<any[]>([]);

  const handleAddValor = () => {
    setFormData({ service: '', client: '', value: '' });
    setShowAddModal(true);
  };

  const handleEditValor = (item: any) => {
    setSelectedItem(item);
    setFormData({
      service: item.service,
      client: item.client,
      value: item.value
    });
    setShowEditModal(true);
  };

  const handleSaveValor = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      setValores(prev => prev.map(v => 
        v.id === selectedItem.id 
          ? { ...v, ...formData }
          : v
      ));
      toast({
        title: "Valor atualizado",
        description: "O valor unitário foi atualizado com sucesso.",
      });
      setShowEditModal(false);
    } else {
      const newValor = {
        id: Date.now(),
        ...formData
      };
      setValores(prev => [...prev, newValor]);
      toast({
        title: "Valor adicionado",
        description: "Novo valor unitário foi adicionado com sucesso.",
      });
      setShowAddModal(false);
    }
    setSelectedItem(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Valores Unitários</h1>
            <p className="text-slate-600 mt-1">Gerenciar preços por cliente e serviço</p>
          </div>
          <Button onClick={handleAddValor}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Valor
          </Button>
        </div>

        <div className="grid gap-4">
          {valores.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.service}</h3>
                      <p className="text-sm text-slate-600">Cliente: {item.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-green-600">{item.value}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditValor(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Valor Unitário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveValor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Serviço
                </label>
                <Input
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  placeholder="Ex: Instalação Elétrica"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente
                </label>
                <Input
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  placeholder="Ex: ABC Construções"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor
                </label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="Ex: R$ 85/m²"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Valor Unitário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveValor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Serviço
                </label>
                <Input
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente
                </label>
                <Input
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor
                </label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ValoresUnitarios;
