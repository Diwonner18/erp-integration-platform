
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ConfirmationModal from '@/components/ui/confirmation-modal';

const HorasExtras = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [formData, setFormData] = useState({
    funcionario: '',
    horas: '',
    obra: '',
    observacoes: '',
    vinculo: '',
    dataEspecifica: '',
    tipoHora: ''
  });

  const [registros, setRegistros] = useState([
    { id: 1, funcionario: 'João Silva', horas: '4h', valor: 'R$ 120', obra: 'Residencial - ABC', status: 'aprovada', date: '2024-01-15', tipoHora: 'dobra' },
    { id: 2, funcionario: 'Pedro Santos', horas: '2h', valor: 'R$ 60', obra: 'Comercial - Silva', status: 'pendente', date: '2024-01-14', tipoHora: 'continuacao' },
    { id: 3, funcionario: 'Carlos Lima', horas: '6h', valor: 'R$ 180', obra: 'Industrial - Costa', status: 'aprovada', date: '2024-01-12', tipoHora: 'diaria' }
  ]);

  const tiposHora = {
    diaria: { valor: 25, descricao: 'Jornada normal de trabalho (8 horas)' },
    dobra: { valor: 50, descricao: 'Jornada dupla ou hora extra (acima de 8 horas)' },
    continuacao: { valor: 37.5, descricao: 'Continuação de plantão ou extensão da jornada' }
  };

  const handleAddHorasExtras = () => {
    setFormData({ funcionario: '', horas: '', obra: '', observacoes: '', vinculo: '', dataEspecifica: '', tipoHora: '' });
    setShowAddModal(true);
  };

  const handleAprovarHoras = (registro: any) => {
    setSelectedRegistro(registro);
    setShowConfirmModal(true);
  };

  const confirmAprovarHoras = () => {
    if (selectedRegistro) {
      setRegistros(prev => prev.map(reg => 
        reg.id === selectedRegistro.id 
          ? { ...reg, status: 'aprovada' }
          : reg
      ));
      toast({
        title: "Horas aprovadas",
        description: `Horas extras de ${selectedRegistro.funcionario} foram aprovadas.`,
      });
    }
    setShowConfirmModal(false);
    setSelectedRegistro(null);
  };

  const handleSaveHorasExtras = (e: React.FormEvent) => {
    e.preventDefault();
    const valorPorHora = tiposHora[formData.tipoHora]?.valor || 30;
    const novoRegistro = {
      id: Date.now(),
      funcionario: formData.funcionario,
      horas: formData.horas,
      valor: `R$ ${parseFloat(formData.horas) * valorPorHora}`,
      obra: formData.obra,
      status: 'pendente',
      date: new Date().toISOString().split('T')[0],
      tipoHora: formData.tipoHora
    };
    
    setRegistros(prev => [...prev, novoRegistro]);
    toast({
      title: "Horas registradas",
      description: "Registro de horas extras criado com sucesso.",
    });
    setShowAddModal(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Controle de Horas Extras</h1>
            <p className="text-slate-600 mt-1">Registrar e acompanhar horas extras</p>
          </div>
          <Button onClick={handleAddHorasExtras}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar Horas
          </Button>
        </div>

        <div className="grid gap-4">
          {registros.map((registro) => (
            <Card key={registro.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{registro.funcionario}</h3>
                      <p className="text-sm text-slate-600">{registro.obra} - {registro.horas}</p>
                      <p className="text-xs text-slate-500">Data: {registro.date} | Valor: {registro.valor}</p>
                      {registro.tipoHora && (
                        <p className="text-xs text-blue-600 font-medium">
                          Tipo: {registro.tipoHora === 'diaria' ? 'Diária' : 
                                 registro.tipoHora === 'dobra' ? 'Dobra' : 'Continuação'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={registro.status === 'aprovada' ? 'default' : 'secondary'}>
                      {registro.status === 'aprovada' ? 'Aprovada' : 'Pendente'}
                    </Badge>
                    {registro.status === 'pendente' && (
                      <Button 
                        size="sm"
                        onClick={() => handleAprovarHoras(registro)}
                      >
                        Aprovar
                      </Button>
                    )}
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
              <DialogTitle>Registrar Horas Extras</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveHorasExtras} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Funcionário
                </label>
                <Input
                  value={formData.funcionario}
                  onChange={(e) => setFormData({...formData, funcionario: e.target.value})}
                  placeholder="Nome do funcionário"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantidade de Horas
                </label>
                <Input
                  type="number"
                  value={formData.horas}
                  onChange={(e) => setFormData({...formData, horas: e.target.value})}
                  placeholder="Ex: 4"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700">
                  Obra
                </Label>
                <Input
                  value={formData.obra}
                  onChange={(e) => setFormData({...formData, obra: e.target.value})}
                  placeholder="Ex: Residencial - ABC"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">
                  Tipo de Hora *
                </Label>
                <Select 
                  value={formData.tipoHora} 
                  onValueChange={(value) => setFormData({...formData, tipoHora: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaria">
                      <div className="flex flex-col">
                        <span>Diária</span>
                        <span className="text-xs text-slate-500">Jornada normal de trabalho (8 horas) - R$ 25/h</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dobra">
                      <div className="flex flex-col">
                        <span>Dobra</span>
                        <span className="text-xs text-slate-500">Jornada dupla ou hora extra (acima de 8 horas) - R$ 50/h</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="continuacao">
                      <div className="flex flex-col">
                        <span>Continuação</span>
                        <span className="text-xs text-slate-500">Continuação de plantão ou extensão da jornada - R$ 37,50/h</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700">
                  Vínculo *
                </Label>
                <Select 
                  value={formData.vinculo} 
                  onValueChange={(value) => setFormData({...formData, vinculo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obra">Por Obra</SelectItem>
                    <SelectItem value="data">Por Data Específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.vinculo === 'data' && (
                <div>
                  <Label className="text-slate-700">
                    Data Específica
                  </Label>
                  <Input
                    type="date"
                    value={formData.dataEspecifica}
                    onChange={(e) => setFormData({...formData, dataEspecifica: e.target.value})}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações
                </label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Descreva o motivo das horas extras..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmAprovarHoras}
          title="Aprovar Horas Extras"
          description={`Tem certeza que deseja aprovar as horas extras de ${selectedRegistro?.funcionario}?`}
          confirmText="Aprovar"
          type="success"
        />
      </div>
    </MainLayout>
  );
};

export default HorasExtras;
