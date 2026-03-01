import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Plus, Calendar, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LancamentoDespesas = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    vinculo: '',
    obra: '',
    dataEspecifica: '',
    observacoes: ''
  });

  const [despesas, setDespesas] = useState<any[]>([]);

  const handleAddDespesa = () => {
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      vinculo: '',
      obra: '',
      dataEspecifica: '',
      observacoes: ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.descricao || !formData.valor || !formData.categoria || !formData.vinculo) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (formData.vinculo === 'obra' && !formData.obra) {
      toast({
        title: 'Obra obrigatória',
        description: 'Selecione uma obra para este tipo de vínculo',
        variant: 'destructive',
      });
      return;
    }

    if (formData.vinculo === 'data' && !formData.dataEspecifica) {
      toast({
        title: 'Data obrigatória',
        description: 'Informe a data específica para este tipo de vínculo',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Despesa lançada',
      description: `${formData.descricao} foi registrada com sucesso`,
    });
    setShowModal(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Lançamento de Despesas</h1>
            <p className="text-muted-foreground mt-1">Registrar e controlar despesas operacionais</p>
          </div>
          <Button onClick={handleAddDespesa}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>

        <div className="grid gap-4">
          {despesas.map((despesa) => (
            <Card key={despesa.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{despesa.descricao}</h3>
                      <p className="text-sm text-muted-foreground">
                        {despesa.categoria} - {despesa.valor}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {despesa.vinculo === 'obra' ? (
                          <>
                            <Building className="w-3 h-3" />
                            {despesa.obra}
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3" />
                            {despesa.dataEspecifica}
                          </>
                        )}
                        | Data: {despesa.data}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={despesa.status === 'aprovada' ? 'default' : 'secondary'}>
                      {despesa.status === 'aprovada' ? 'Aprovada' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Despesa</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição da despesa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData({...formData, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="materiais">Materiais</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vínculo *</Label>
                <Select 
                  value={formData.vinculo} 
                  onValueChange={(value) => setFormData({...formData, vinculo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obra">Por Obra</SelectItem>
                    <SelectItem value="data">Por Data Específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.vinculo === 'obra' && (
                <div className="space-y-2">
                  <Label>Obra *</Label>
                  <Select 
                    value={formData.obra} 
                    onValueChange={(value) => setFormData({...formData, obra: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residencial-silva">Residencial Silva</SelectItem>
                      <SelectItem value="comercial-abc">Comercial ABC</SelectItem>
                      <SelectItem value="industrial-mendes">Industrial Mendes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.vinculo === 'data' && (
                <div className="space-y-2">
                  <Label>Data Específica *</Label>
                  <Input
                    type="date"
                    value={formData.dataEspecifica}
                    onChange={(e) => setFormData({...formData, dataEspecifica: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Despesa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default LancamentoDespesas;