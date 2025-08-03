import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Wrench, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditMaterialModal from '@/components/Obras/EditMaterialModal';
import EditEquipamentoModal from '@/components/Obras/EditEquipamentoModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const MateriaisEquipamentos = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<'material' | 'equipamento'>('material');
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    quantidade: '',
    unidade: '',
    valorUnitario: '',
    marca: '',
    modelo: '',
    numeroSerie: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditEquipamentoModal, setShowEditEquipamentoModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<string>('');

  const [materiais, setMateriais] = useState([
    {
      id: 1,
      nome: 'Cabo Flexível 2,5mm',
      categoria: 'Fios e Cabos',
      quantidade: 50,
      unidade: 'M',
      valorUnitario: 'R$ 4,50',
      estoque: 'adequado'
    },
    {
      id: 2,
      nome: 'Disjuntor Bipolar 25A',
      categoria: 'Disjuntores',
      quantidade: 12,
      unidade: 'UN',
      valorUnitario: 'R$ 35,00',
      estoque: 'baixo'
    },
    {
      id: 3,
      nome: 'Tomada 2P+T 10A',
      categoria: 'Tomadas e Interruptores',
      quantidade: 30,
      unidade: 'UN',
      valorUnitario: 'R$ 8,90',
     estoque: 'adequado'
    }
  ]);

  const [equipamentos, setEquipamentos] = useState([
    {
      id: 1,
      nome: 'Multímetro Digital',
      categoria: 'Instrumentos de Medição',
      marca: 'Fluke',
      modelo: '87V',
      numeroSerie: 'FL123456',
      status: 'disponivel'
    },
    {
      id: 2,
      nome: 'Furadeira de Impacto',
      categoria: 'Ferramentas Elétricas',
      marca: 'Bosch',
      modelo: 'GSB 13 RE',
      numeroSerie: 'BS789012',
      status: 'em_uso'
    },
    {
      id: 3,
      nome: 'Alicate Amperímetro',
      categoria: 'Instrumentos de Medição',
      marca: 'Hikari',
      modelo: 'HA-3300',
      numeroSerie: 'HK345678',
      status: 'manutencao'
    }
  ]);

  const filteredMateriais = materiais.filter(material => 
    material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEquipamentos = equipamentos.filter(equipamento => 
    equipamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipamento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (type: 'material' | 'equipamento') => {
    setModalType(type);
    setFormData({
      nome: '',
      categoria: '',
      quantidade: '',
      unidade: '',
      valorUnitario: '',
      marca: '',
      modelo: '',
      numeroSerie: ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    toast({
      title: `${modalType === 'material' ? 'Material' : 'Equipamento'} adicionado`,
      description: `${formData.nome} foi registrado com sucesso`,
    });
    setShowModal(false);
  };

  const handleEdit = (item: any, type: string) => {
    if (type === 'Material') {
      setSelectedItem(item);
      setShowEditModal(true);
    } else {
      setSelectedItem(item);
      setShowEditEquipamentoModal(true);
    }
  };

  const handleDelete = (item: any, type: string) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && deleteType) {
      if (deleteType === 'Material') {
        setMateriais(prev => prev.filter(material => material.id !== itemToDelete.id));
      } else {
        setEquipamentos(prev => prev.filter(equipamento => equipamento.id !== itemToDelete.id));
      }
      
      toast({
        title: "Item excluído com sucesso",
        description: `${itemToDelete.nome} foi removido da lista`,
        variant: 'destructive',
      });
      
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const handleSaveEdit = (updatedMaterial: any) => {
    setMateriais(prev => prev.map(material => 
      material.id === updatedMaterial.id ? updatedMaterial : material
    ));
    
    toast({
      title: "Material atualizado",
      description: `${updatedMaterial.nome} foi atualizado com sucesso`,
    });
  };

  const handleSaveEditEquipamento = (updatedEquipamento: any) => {
    setEquipamentos(prev => prev.map(equipamento => 
      equipamento.id === updatedEquipamento.id ? updatedEquipamento : equipamento
    ));
    
    toast({
      title: "Equipamento atualizado",
      description: `${updatedEquipamento.nome} foi atualizado com sucesso`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Materiais e Equipamentos</h1>
            <p className="text-muted-foreground mt-1">Controle unificado de recursos</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="materiais" className="space-y-4">
          <TabsList>
            <TabsTrigger value="materiais" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Materiais
            </TabsTrigger>
            <TabsTrigger value="equipamentos" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Equipamentos
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          material.estoque === 'critico' ? 'bg-destructive/10' :
                          material.estoque === 'baixo' ? 'bg-secondary' : 'bg-primary/10'
                        }`}>
                          <Package className={`w-5 h-5 ${
                            material.estoque === 'critico' ? 'text-destructive' :
                            material.estoque === 'baixo' ? 'text-muted-foreground' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{material.nome}</h3>
                          <p className="text-sm text-muted-foreground">{material.categoria}</p>
                          <p className="text-xs text-muted-foreground">
                            Qtd: {material.quantidade} {material.unidade} | {material.valorUnitario}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          material.estoque === 'critico' ? 'destructive' :
                          material.estoque === 'baixo' ? 'secondary' : 'default'
                        }>
                          {material.estoque === 'critico' ? 'Crítico' :
                           material.estoque === 'baixo' ? 'Baixo' : 'Adequado'}
                        </Badge>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(material, 'Material')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(material, 'Material')}
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
                          equipamento.status === 'manutencao' ? 'bg-destructive/10' :
                          equipamento.status === 'em_uso' ? 'bg-secondary' : 'bg-primary/10'
                        }`}>
                          <Wrench className={`w-5 h-5 ${
                            equipamento.status === 'manutencao' ? 'text-destructive' :
                            equipamento.status === 'em_uso' ? 'text-muted-foreground' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{equipamento.nome}</h3>
                          <p className="text-sm text-muted-foreground">{equipamento.categoria}</p>
                          <p className="text-xs text-muted-foreground">
                            {equipamento.marca} {equipamento.modelo} | N/S: {equipamento.numeroSerie}
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(equipamento, 'Equipamento')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(equipamento, 'Equipamento')}
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
          </TabsContent>
        </Tabs>

        {/* Modal para adicionar material/equipamento */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Adicionar {modalType === 'material' ? 'Material' : 'Equipamento'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder={`Nome do ${modalType}`}
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

              {modalType === 'material' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={formData.quantidade}
                        onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UN">Unidade</SelectItem>
                          <SelectItem value="M">Metro</SelectItem>
                          <SelectItem value="KG">Quilograma</SelectItem>
                          <SelectItem value="L">Litro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valorUnitario}
                      onChange={(e) => setFormData({...formData, valorUnitario: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Material */}
        <EditMaterialModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          material={selectedItem}
          onSave={handleSaveEdit}
        />

        {/* Modal de Edição de Equipamento */}
        <EditEquipamentoModal
          open={showEditEquipamentoModal}
          onClose={() => setShowEditEquipamentoModal(false)}
          equipamento={selectedItem}
          onSave={handleSaveEditEquipamento}
        />

        {/* Modal de Confirmação de Exclusão */}
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