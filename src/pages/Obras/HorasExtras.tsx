import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Plus, Search, Download, FileSpreadsheet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useHorasExtras, useCreateHorasExtras, useUpdateHorasExtras, useObras } from '@/hooks/useSupabaseData';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport } from '@/lib/exportUtils';
import { Skeleton } from '@/components/ui/skeleton';

const HorasExtrasPage = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<any>(null);
  const [formData, setFormData] = useState({ funcionario: '', horas: '', obra_id: '', motivo: '', valor_hora: '30' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });

  const { data: registros = [], isLoading } = useHorasExtras();
  const { data: obrasData = [] } = useObras();
  const createHE = useCreateHorasExtras();
  const updateHE = useUpdateHorasExtras();

  const obras = obrasData.map(o => ({ id: o.id, nome: o.nome }));
  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
  ];

  const filteredRegistros = useMemo(() => {
    let result = registros;
    if (filters.obra) result = result.filter(r => r.obra_id === filters.obra);
    if (filters.status) result = result.filter(r => r.status === filters.status);
    if (filters.dataInicial && filters.dataFinal) {
      result = result.filter(r => {
        const d = new Date(r.data);
        return d >= filters.dataInicial! && d <= filters.dataFinal!;
      });
    }
    if (searchTerm) {
      result = result.filter(r =>
        r.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.obras?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [registros, filters, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHE.mutateAsync({
        funcionario: formData.funcionario,
        horas: parseFloat(formData.horas),
        obra_id: formData.obra_id,
        motivo: formData.motivo,
        data: new Date().toISOString().split('T')[0],
        valor_hora: 30,
      });
      toast({ title: 'Horas registradas', description: 'Registro criado com sucesso.' });
      setShowAddModal(false);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao registrar.', variant: 'destructive' });
    }
  };

  const confirmAprovar = async () => {
    if (!selectedRegistro) return;
    try {
      await updateHE.mutateAsync({ id: selectedRegistro.id, status: 'aprovada' });
      toast({ title: 'Horas aprovadas', description: `Horas de ${selectedRegistro.funcionario} aprovadas.` });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
    setShowConfirmModal(false);
    setSelectedRegistro(null);
  };

  const formatCurrency = (v: number | null) => v ? `R$ ${v.toFixed(2)}` : 'R$ 0,00';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Horas Extras</h1>
            <p className="text-muted-foreground mt-1">Registrar e acompanhar horas extras</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-2" />Registrar Horas</Button>
        </div>

        <AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar por funcionário ou obra..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">{filteredRegistros.length} de {registros.length} registros</div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filteredRegistros.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRegistros.map((registro) => (
              <Card key={registro.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{registro.funcionario}</h3>
                        <p className="text-sm text-muted-foreground">{registro.obras?.nome || '-'} - {registro.horas}h</p>
                        <p className="text-xs text-muted-foreground">Data: {new Date(registro.data).toLocaleDateString('pt-BR')} | Valor/h: {formatCurrency(registro.valor_hora)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={registro.status === 'aprovada' ? 'default' : 'secondary'}>
                        {registro.status === 'aprovada' ? 'Aprovada' : 'Pendente'}
                      </Badge>
                      {registro.status === 'pendente' && (
                        <Button size="sm" onClick={() => { setSelectedRegistro(registro); setShowConfirmModal(true); }}>Aprovar</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Horas Extras</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div><Label>Funcionário</Label><Input value={formData.funcionario} onChange={(e) => setFormData({...formData, funcionario: e.target.value})} required /></div>
              <div><Label>Horas</Label><Input type="number" value={formData.horas} onChange={(e) => setFormData({...formData, horas: e.target.value})} required /></div>
              <div><Label>Obra</Label>
                <Select value={formData.obra_id} onValueChange={(v) => setFormData({...formData, obra_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{obrasData.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Motivo</Label><Input value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})} /></div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={createHE.isPending}>{createHE.isPending ? 'Salvando...' : 'Registrar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmationModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmAprovar} title="Aprovar Horas Extras" description={`Aprovar horas de ${selectedRegistro?.funcionario}?`} confirmText="Aprovar" type="success" loading={updateHE.isPending} />
      </div>
    </MainLayout>
  );
};

export default HorasExtrasPage;
