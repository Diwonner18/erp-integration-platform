import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, FileText, Filter, Pencil, Trash2, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { useEPIs, useObras, useCreateEPI, useUpdateEPI, useDeleteEPI } from '@/hooks/useSupabaseData';
import FileImportButton from '@/components/shared/FileImportButton';

const tiposEPI = [
  'Capacete de Segurança',
  'Luvas de Proteção',
  'Óculos de Proteção',
  'Botas de Segurança',
  'Máscara/Respirador',
  'Cinto de Segurança',
  'Colete Refletivo',
  'Protetor Auricular'
];

const getValidityStatus = (validade: string | null) => {
  if (!validade) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(validade);
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Vencido', variant: 'destructive' as const, days: diffDays };
  if (diffDays <= 30) return { label: `Vence em ${diffDays}d`, variant: 'outline' as const, days: diffDays, warning: true };
  return { label: 'Válido', variant: 'secondary' as const, days: diffDays };
};

const EPIs = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroObra, setFiltroObra] = useState('');
  const [formData, setFormData] = useState({
    tipoEPI: '',
    colaborador: '',
    obra: '',
    dataEntrega: '',
    quantidade: '1',
    certificadoAprovacao: '',
    validade: '',
  });

  const { data: epis = [], isLoading: loadingEPIs } = useEPIs();
  const { data: obrasData = [], isLoading: loadingObras } = useObras();
  const createEPI = useCreateEPI();
  const updateEPI = useUpdateEPI();
  const deleteEPI = useDeleteEPI();

  const resetForm = () => setFormData({ tipoEPI: '', colaborador: '', obra: '', dataEntrega: '', quantidade: '1', certificadoAprovacao: '', validade: '' });

  const handleNovoRegistro = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (registro: any) => {
    setFormData({
      tipoEPI: registro.tipo || '',
      colaborador: registro.funcionario || '',
      obra: registro.obra_id || '',
      dataEntrega: registro.data_entrega || '',
      quantidade: String(registro.quantidade || 1),
      certificadoAprovacao: registro.certificado_aprovacao || '',
      validade: registro.validade || '',
    });
    setEditingId(registro.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipoEPI || !formData.colaborador || !formData.obra || !formData.dataEntrega) {
      toast({ title: "Erro de validação", description: "Todos os campos obrigatórios devem ser preenchidos.", variant: "destructive" });
      return;
    }

    const payload = {
      tipo: formData.tipoEPI,
      funcionario: formData.colaborador,
      obra_id: formData.obra,
      data_entrega: formData.dataEntrega,
      quantidade: parseInt(formData.quantidade) || 1,
      certificado_aprovacao: formData.certificadoAprovacao || null,
      validade: formData.validade || null,
    };

    try {
      if (editingId) {
        await updateEPI.mutateAsync({ id: editingId, ...payload });
        toast({ title: "EPI atualizado", description: "Registro atualizado com sucesso." });
      } else {
        await createEPI.mutateAsync(payload);
        toast({ title: "EPI registrado", description: "Registro criado com sucesso." });
      }
      setShowModal(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEPI.mutateAsync(deleteId);
      toast({ title: "EPI excluído", description: "Registro removido com sucesso." });
      setDeleteId(null);
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const filteredRegistros = epis.filter(registro => {
    const matchesSearch = !searchTerm ||
      registro.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.funcionario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registro as any).obras?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = !filtroObra || filtroObra === 'all' || registro.obra_id === filtroObra;
    return matchesSearch && matchesObra;
  });

  const stats = useMemo(() => {
    const total = epis.length;
    const vencidos = epis.filter(e => { const s = getValidityStatus(e.validade); return s && s.days < 0; }).length;
    const vencendo = epis.filter(e => { const s = getValidityStatus(e.validade); return s && s.days >= 0 && s.days <= 30; }).length;
    const colaboradores = new Set(epis.map(e => e.funcionario).filter(Boolean)).size;
    return { total, vencidos, vencendo, colaboradores };
  }, [epis]);

  const reportByType = useMemo(() => {
    const map: Record<string, number> = {};
    epis.forEach(e => { map[e.tipo] = (map[e.tipo] || 0) + (e.quantidade || 1); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [epis]);

  const isSaving = createEPI.isPending || updateEPI.isPending;

  if (loadingEPIs || loadingObras) {
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
        <div className="flex items-center justify-between" data-tour="page-header">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de EPIs</h1>
            <p className="text-muted-foreground mt-1">Registro e acompanhamento de Equipamentos de Proteção Individual</p>
          </div>
          <div className="flex gap-2">
            <FileImportButton targetType="epis" />
            <Button onClick={handleNovoRegistro} data-tour="page-new-btn">
              <Plus className="w-4 h-4 mr-2" />
              Registrar EPI
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="page-stats">
          <Card><CardContent className="p-4 text-center"><Shield className="w-5 h-5 mx-auto mb-1 text-primary" /><div className="text-2xl font-bold text-foreground">{stats.total}</div><div className="text-xs text-muted-foreground">Total de EPIs</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><AlertTriangle className="w-5 h-5 mx-auto mb-1 text-destructive" /><div className="text-2xl font-bold text-destructive">{stats.vencidos}</div><div className="text-xs text-muted-foreground">Vencidos</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><AlertTriangle className="w-5 h-5 mx-auto mb-1 text-yellow-500" /><div className="text-2xl font-bold text-foreground">{stats.vencendo}</div><div className="text-xs text-muted-foreground">Vencendo (30 dias)</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Users className="w-5 h-5 mx-auto mb-1 text-primary" /><div className="text-2xl font-bold text-foreground">{stats.colaboradores}</div><div className="text-xs text-muted-foreground">Colaboradores</div></CardContent></Card>
        </div>

        <Tabs defaultValue="registros" className="space-y-4" data-tour="page-tabs">
          <TabsList>
            <TabsTrigger value="registros">Registros</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" />Filtros</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Busca Geral</Label>
                    <Input placeholder="EPI, colaborador ou obra" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div>
                    <Label>Obra</Label>
                    <Select value={filtroObra} onValueChange={setFiltroObra}>
                      <SelectTrigger><SelectValue placeholder="Todas as obras" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as obras</SelectItem>
                        {obrasData.map((obra) => (<SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end"><div className="text-sm text-muted-foreground">{filteredRegistros.length} registros encontrados</div></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Registros de EPIs</CardTitle></CardHeader>
              <CardContent>
                {filteredRegistros.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhum EPI registrado ainda.</p>
                    <Button onClick={handleNovoRegistro}><Plus className="w-4 h-4 mr-2" />Registrar primeiro EPI</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de EPI</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Obra</TableHead>
                        <TableHead>Data Entrega</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistros.map((registro) => {
                        const validity = getValidityStatus(registro.validade);
                        return (
                          <TableRow key={registro.id}>
                            <TableCell className="font-medium">{registro.tipo}</TableCell>
                            <TableCell>{registro.funcionario || '—'}</TableCell>
                            <TableCell>{(registro as any).obras?.nome || '—'}</TableCell>
                            <TableCell>{registro.data_entrega ? new Date(registro.data_entrega).toLocaleDateString('pt-BR') : '—'}</TableCell>
                            <TableCell>{registro.quantidade}</TableCell>
                            <TableCell>
                              {registro.validade ? (
                                <div className="flex items-center gap-2">
                                  <span>{new Date(registro.validade).toLocaleDateString('pt-BR')}</span>
                                  {validity && (
                                    <Badge variant={validity.variant} className={validity.warning ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' : ''}>
                                      {validity.label}
                                    </Badge>
                                  )}
                                </div>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(registro)}><Pencil className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(registro.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Distribuição por Tipo</CardTitle></CardHeader>
                <CardContent>
                  {reportByType.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                  ) : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Tipo de EPI</TableHead><TableHead className="text-right">Quantidade</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {reportByType.map(([tipo, qtd]) => (
                          <TableRow key={tipo}><TableCell className="font-medium">{tipo}</TableCell><TableCell className="text-right">{qtd}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Por Obra</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Obra</TableHead><TableHead className="text-right">Total EPIs</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {obrasData.map((obra) => {
                        const count = epis.filter(r => r.obra_id === obra.id).length;
                        if (count === 0) return null;
                        return (<TableRow key={obra.id}><TableCell className="font-medium">{obra.nome}</TableCell><TableCell className="text-right">{count}</TableCell></TableRow>);
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Criar/Editar */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingId ? 'Editar EPI' : 'Registrar EPI'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de EPI *</Label>
                  <Select value={formData.tipoEPI} onValueChange={(v) => setFormData({ ...formData, tipoEPI: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>{tiposEPI.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Colaborador *</Label>
                  <Input value={formData.colaborador} onChange={(e) => setFormData({ ...formData, colaborador: e.target.value })} placeholder="Nome do colaborador" />
                </div>
                <div>
                  <Label>Obra *</Label>
                  <Select value={formData.obra} onValueChange={(v) => setFormData({ ...formData, obra: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                    <SelectContent>{obrasData.map((o) => (<SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Entrega *</Label>
                  <Input type="date" value={formData.dataEntrega} onChange={(e) => setFormData({ ...formData, dataEntrega: e.target.value })} required />
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" value={formData.quantidade} onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })} min="1" />
                </div>
                <div>
                  <Label>Validade</Label>
                  <Input type="date" value={formData.validade} onChange={(e) => setFormData({ ...formData, validade: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Certificado de Aprovação (CA)</Label>
                  <Input value={formData.certificadoAprovacao} onChange={(e) => setFormData({ ...formData, certificadoAprovacao: e.target.value })} placeholder="Número do CA" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Registrar EPI'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmação de exclusão */}
        <ConfirmationModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Excluir EPI"
          description="Tem certeza que deseja excluir este registro de EPI? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          type="danger"
          loading={deleteEPI.isPending}
        />
      </div>
    </MainLayout>
  );
};

export default EPIs;
