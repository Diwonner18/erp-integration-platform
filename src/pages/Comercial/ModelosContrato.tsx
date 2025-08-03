
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Download, Edit, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ModelosContrato = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: ''
  });

  const [modelos, setModelos] = useState([
    { id: 1, name: 'Contrato Padrão - Residencial', type: 'Contrato', updated: '2024-01-10', description: 'Modelo padrão para obras residenciais' },
    { id: 2, name: 'Contrato Padrão - Comercial', type: 'Contrato', updated: '2024-01-08', description: 'Modelo padrão para obras comerciais' },
    { id: 3, name: 'Aditivo - Alteração de Escopo', type: 'Aditivo', updated: '2024-01-05', description: 'Modelo para alterações de escopo' },
    { id: 4, name: 'Termo de Aceite Digital', type: 'Termo', updated: '2024-01-03', description: 'Termo de aceite para propostas digitais' }
  ]);

  const handleAddModelo = () => {
    setFormData({ name: '', type: '', description: '' });
    setShowAddModal(true);
  };

  const handleEditModelo = (modelo: any) => {
    setSelectedModelo(modelo);
    setFormData({
      name: modelo.name,
      type: modelo.type,
      description: modelo.description
    });
    setShowEditModal(true);
  };

  const handleDownloadModelo = (modelo: any) => {
    toast({
      title: "Download iniciado",
      description: `Download do modelo "${modelo.name}" foi iniciado.`,
    });
  };

  const handleSaveModelo = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModelo) {
      setModelos(prev => prev.map(m => 
        m.id === selectedModelo.id 
          ? { ...m, ...formData, updated: new Date().toISOString().split('T')[0] }
          : m
      ));
      toast({
        title: "Modelo atualizado",
        description: "O modelo foi atualizado com sucesso.",
      });
      setShowEditModal(false);
    } else {
      const novoModelo = {
        id: Date.now(),
        ...formData,
        updated: new Date().toISOString().split('T')[0]
      };
      setModelos(prev => [...prev, novoModelo]);
      toast({
        title: "Modelo adicionado",
        description: "Novo modelo foi adicionado com sucesso.",
      });
      setShowAddModal(false);
    }
    setSelectedModelo(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Modelos de Contrato</h1>
            <p className="text-slate-600 mt-1">Gerenciar templates de contratos e aditivos</p>
          </div>
          <Button onClick={handleAddModelo}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Button>
        </div>

        <div className="grid gap-4">
          {modelos.map((modelo) => (
            <Card key={modelo.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{modelo.name}</h3>
                      <p className="text-sm text-slate-600">Tipo: {modelo.type}</p>
                      <p className="text-xs text-slate-500">Atualizado: {modelo.updated}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadModelo(modelo)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditModelo(modelo)}
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
              <DialogTitle>Adicionar Novo Modelo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveModelo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Modelo
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Contrato Padrão - Industrial"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo
                </label>
                <select
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Contrato">Contrato</option>
                  <option value="Aditivo">Aditivo</option>
                  <option value="Termo">Termo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição
                </label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o propósito do modelo..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Arquivo do Modelo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Clique para fazer upload do arquivo</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </div>
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
              <DialogTitle>Editar Modelo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveModelo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Modelo
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo
                </label>
                <select
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="Contrato">Contrato</option>
                  <option value="Aditivo">Aditivo</option>
                  <option value="Termo">Termo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição
                </label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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

export default ModelosContrato;
