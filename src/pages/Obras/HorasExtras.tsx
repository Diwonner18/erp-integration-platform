import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Plus, Search, Download, FileSpreadsheet, CalendarDays } from 'lucide-react';
import FileImportButton from '@/components/shared/FileImportButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { AdvancedFilters, FilterValues } from '@/components/ui/advanced-filters';
import { useHorasExtras, useCreateHorasExtras, useUpdateHorasExtras, useObras } from '@/hooks/useSupabaseData';
import { useColaboradores } from '@/hooks/useColaboradoresData';
import { exportToPDF, exportToExcel, formatCurrencyExport, formatDateExport } from '@/lib/exportUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserModulePermissions } from '@/hooks/usePermissoesPerfil';
import { useCategoriasHoraExtra, useTiposHoraExtra } from '@/hooks/useLookupTables';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const HorasExtrasPage = () => {
  const { toast } = useToast();
  const perms = useUserModulePermissions('horas_extras');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<any>(null);
  const [formData, setFormData] = useState({ funcionario: '', horas: '', obra_id: '', motivo: '', valor_hora: '30', categoria: 'A', tipo_hora_extra: 'normal' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    obra: '',
    dataInicial: null,
    dataFinal: null,
    status: ''
  });
  const [activeTab, setActiveTab] = useState('registros');
  const [quinzenaMes, setQuinzenaMes] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [quinzena, setQuinzena] = useState<'1' | '2'>('1');

  const { data: registros = [], isLoading } = useHorasExtras();
  const { data: obrasData = [] } = useObras();
  const { data: colaboradores = [] } = useColaboradores();
  const { data: categoriasHE = [] } = useCategoriasHoraExtra();
  const { data: tiposHE = [] } = useTiposHoraExtra();
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

  // Biweekly report data
  const quinzenalData = useMemo(() => {
    const [year, month] = quinzenaMes.split('-').map(Number);
    const startDay = quinzena === '1' ? 1 : 16;
    const lastDay = quinzena === '1' ? 15 : new Date(year, month, 0).getDate();
    const start = new Date(year, month - 1, startDay);
    const end = new Date(year, month - 1, lastDay, 23, 59, 59);

    const filtered = registros.filter(r => {
      const d = new Date(r.data);
      return d >= start && d <= end;
    });

    // Group by funcionario
    const grouped: Record<string, { funcionario: string; totalHoras: number; totalValor: number; registros: typeof filtered }> = {};
    filtered.forEach(r => {
      if (!grouped[r.funcionario]) {
        grouped[r.funcionario] = { funcionario: r.funcionario, totalHoras: 0, totalValor: 0, registros: [] };
      }
      grouped[r.funcionario].totalHoras += r.horas || 0;
      grouped[r.funcionario].totalValor += (r.horas || 0) * (r.valor_hora || 0);
      grouped[r.funcionario].registros.push(r);
    });

    return {
      items: Object.values(grouped).sort((a, b) => a.funcionario.localeCompare(b.funcionario)),
      totalHoras: filtered.reduce((s, r) => s + (r.horas || 0), 0),
      totalValor: filtered.reduce((s, r) => s + ((r.horas || 0) * (r.valor_hora || 0)), 0),
      periodo: `${startDay.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')} a ${lastDay.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
    };
  }, [registros, quinzenaMes, quinzena]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHE.mutateAsync({
        funcionario: formData.funcionario,
        horas: parseFloat(formData.horas),
        obra_id: formData.obra_id,
        motivo: formData.motivo,
        data: new Date().toISOString().split('T')[0],
        valor_hora: parseFloat(formData.valor_hora) || 30,
        categoria: formData.categoria,
        tipo_hora_extra: formData.tipo_hora_extra,
      } as any);
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

  const exportQuinzenal = (type: 'pdf' | 'excel') => {
    const columns = [
      { header: 'Funcionário', key: 'funcionario' },
      { header: 'Total Horas', key: 'totalHoras' },
      { header: 'Total Valor', key: 'totalValor', format: formatCurrencyExport },
    ];
    const data = quinzenalData.items;
    const title = `Relatório Quinzenal HE - ${quinzenalData.periodo}`;
    const filename = `he_quinzenal_${quinzenaMes}_q${quinzena}`;
    if (type === 'pdf') {
      exportToPDF({ title, columns, data, filename });
    } else {
      exportToExcel({ title, columns, data, filename });
    }
    toast({ title: `${type === 'pdf' ? 'PDF' : 'Excel'} exportado` });
  };

  const exportColumns = [
    { header: 'Funcionário', key: 'funcionario' },
    { header: 'Obra', key: 'obra_nome' },
    { header: 'Data', key: 'data', format: formatDateExport },
    { header: 'Horas', key: 'horas' },
    { header: 'Valor/h', key: 'valor_hora', format: formatCurrencyExport },
    { header: 'Total', key: 'total', format: formatCurrencyExport },
    { header: 'Status', key: 'status' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Horas Extras</h1>
            <p className="text-muted-foreground mt-1">Registrar e acompanhar horas extras</p>
          </div>
          <div className="flex gap-2 flex-wrap" data-tour="page-export">
            <FileImportButton targetType="horas_extras" />
            <Button variant="outline" size="sm" onClick={() => {
              const data = filteredRegistros.map(r => ({ ...r, obra_nome: r.obras?.nome || '-', total: (r.horas || 0) * (r.valor_hora || 0) }));
              exportToPDF({ title: 'Relatório de Horas Extras', columns: exportColumns, data, filename: `horas_extras_${new Date().toISOString().split('T')[0]}` });
              toast({ title: 'PDF exportado' });
            }}><Download className="w-4 h-4 mr-2" />PDF</Button>
            <Button variant="outline" size="sm" onClick={() => {
              const data = filteredRegistros.map(r => ({ ...r, obra_nome: r.obras?.nome || '-', total: (r.horas || 0) * (r.valor_hora || 0) }));
              exportToExcel({ title: 'Horas Extras', columns: exportColumns, data, filename: `horas_extras_${new Date().toISOString().split('T')[0]}` });
              toast({ title: 'Excel exportado' });
            }}><FileSpreadsheet className="w-4 h-4 mr-2" />Excel</Button>
            {perms.incluir_editar && <Button onClick={() => setShowAddModal(true)} data-tour="page-new-btn"><Plus className="w-4 h-4 mr-2" />Registrar Horas</Button>}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="registros"><Clock className="w-4 h-4 mr-1" />Registros</TabsTrigger>
            <TabsTrigger value="quinzenal"><CalendarDays className="w-4 h-4 mr-1" />Relatório Quinzenal</TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-4 mt-4">
            <div data-tour="page-filters"><AdvancedFilters onFiltersChange={setFilters} obras={obras} statusOptions={statusOptions} /></div>

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
              <div className="grid gap-4" data-tour="page-list">
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
                            <p className="text-sm text-muted-foreground">
                              {registro.obras?.nome || '-'} - {registro.horas}h
                              {(registro as any).categoria && <span className="ml-2">Cat. {(registro as any).categoria}</span>}
                              {(registro as any).tipo_hora_extra && (registro as any).tipo_hora_extra !== 'normal' && (
                                <span className="ml-2 capitalize">({(registro as any).tipo_hora_extra})</span>
                              )}
                            </p>
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
          </TabsContent>

          <TabsContent value="quinzenal" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-end gap-4 mb-6">
                  <div>
                    <Label>Mês/Ano</Label>
                    <Input type="month" value={quinzenaMes} onChange={(e) => setQuinzenaMes(e.target.value)} className="w-48" />
                  </div>
                  <div>
                    <Label>Quinzena</Label>
                    <Select value={quinzena} onValueChange={(v) => setQuinzena(v as '1' | '2')}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1ª Quinzena (1-15)</SelectItem>
                        <SelectItem value="2">2ª Quinzena (16-fim)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportQuinzenal('pdf')}><Download className="w-4 h-4 mr-1" />PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => exportQuinzenal('excel')}><FileSpreadsheet className="w-4 h-4 mr-1" />Excel</Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">Período: {quinzenalData.periodo}</div>

                {quinzenalData.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum registro nesta quinzena</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead className="text-right">Total Horas</TableHead>
                        <TableHead className="text-right">Total Valor</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quinzenalData.items.map((item) => (
                        <TableRow key={item.funcionario}>
                          <TableCell className="font-medium">{item.funcionario}</TableCell>
                          <TableCell className="text-right">{item.totalHoras}h</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalValor)}</TableCell>
                          <TableCell className="text-right">{item.registros.length}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold border-t-2">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">{quinzenalData.totalHoras}h</TableCell>
                        <TableCell className="text-right">{formatCurrency(quinzenalData.totalValor)}</TableCell>
                        <TableCell className="text-right">{quinzenalData.items.reduce((s, i) => s + i.registros.length, 0)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Horas Extras</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div><Label>Funcionário</Label>
                <Select value={formData.funcionario} onValueChange={(v) => setFormData({...formData, funcionario: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
                  <SelectContent>{(colaboradores as any[]).map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(v) => setFormData({...formData, categoria: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categoriasHE.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tipo</Label>
                  <Select value={formData.tipo_hora_extra} onValueChange={(v) => setFormData({...formData, tipo_hora_extra: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tiposHE.map(t => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Horas</Label><Input type="number" value={formData.horas} onChange={(e) => setFormData({...formData, horas: e.target.value})} required /></div>
              <div><Label>Obra</Label>
                <Select value={formData.obra_id} onValueChange={(v) => setFormData({...formData, obra_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{obrasData.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Motivo</Label><Input value={formData.motivo} onChange={(e) => setFormData({...formData, motivo: e.target.value})} /></div>
              <div><Label>Valor por Hora (R$)</Label><Input type="number" step="0.01" value={formData.valor_hora} onChange={(e) => setFormData({...formData, valor_hora: e.target.value})} placeholder="30.00" /></div>
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
