import React, { useMemo, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Boxes, Plus, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTiposEpi } from '@/hooks/useLookupTables';
import { useColaboradores } from '@/hooks/useColaboradoresData';
import { useObras } from '@/hooks/useSupabaseData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const EstoqueEPI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: tiposEpi = [] } = useTiposEpi();
  const { data: colaboradores = [] } = useColaboradores();
  const { data: obras = [] } = useObras();

  const [showModal, setShowModal] = useState(false);
  const [tipoMov, setTipoMov] = useState<'entrada' | 'saida'>('entrada');
  const [form, setForm] = useState({
    tipo_epi: '',
    quantidade: '1',
    colaborador_id: '',
    obra_id: '',
    fornecedor: '',
    valor_unitario: '0',
    certificado_aprovacao: '',
    validade: '',
    observacoes: '',
  });

  const { data: saldos = [], isLoading: loadingSaldos } = useQuery({
    queryKey: ['epi_saldos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('epi_saldos' as any)
        .select('*')
        .order('tipo_epi');
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: movimentacoes = [], isLoading: loadingMov } = useQuery({
    queryKey: ['epi_movimentacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('epi_movimentacoes' as any)
        .select('*')
        .order('data_movimentacao', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as any[];
    },
  });

  const colabMap = useMemo(() => new Map((colaboradores || []).map((c: any) => [c.id, c.nome])), [colaboradores]);
  const obraMap = useMemo(() => new Map((obras || []).map((o: any) => [o.id, o.nome])), [obras]);

  const totalItensEstoque = saldos.reduce((acc, s) => acc + (Number(s.saldo_atual) || 0), 0);
  const tiposComEstoqueBaixo = saldos.filter((s) => Number(s.saldo_atual) <= 5).length;

  const createMov = useMutation({
    mutationFn: async () => {
      if (!form.tipo_epi) throw new Error('Selecione o tipo de EPI');
      const qty = parseInt(form.quantidade);
      if (!qty || qty <= 0) throw new Error('Quantidade inválida');

      const payload: any = {
        tipo_movimentacao: tipoMov,
        tipo_epi: form.tipo_epi,
        quantidade: qty,
        observacoes: form.observacoes || null,
      };
      if (tipoMov === 'entrada') {
        payload.fornecedor = form.fornecedor || null;
        payload.valor_unitario = parseFloat(form.valor_unitario) || 0;
        payload.certificado_aprovacao = form.certificado_aprovacao || null;
        payload.validade = form.validade || null;
      } else {
        if (!form.colaborador_id) throw new Error('Selecione o colaborador que recebeu');
        payload.colaborador_id = form.colaborador_id;
        payload.obra_id = form.obra_id || null;
      }

      const { error } = await supabase.from('epi_movimentacoes' as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epi_saldos'] });
      queryClient.invalidateQueries({ queryKey: ['epi_movimentacoes'] });
      toast({ title: 'Movimentação registrada', description: `${tipoMov === 'entrada' ? 'Entrada' : 'Saída'} salva no estoque.` });
      setShowModal(false);
      setForm({
        tipo_epi: '', quantidade: '1', colaborador_id: '', obra_id: '',
        fornecedor: '', valor_unitario: '0', certificado_aprovacao: '',
        validade: '', observacoes: '',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const openModal = (tipo: 'entrada' | 'saida') => {
    setTipoMov(tipo);
    setShowModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Boxes className="w-6 h-6 text-primary" /> Estoque de EPIs
            </h1>
            <p className="text-muted-foreground mt-1">Controle de entradas, saídas e saldo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openModal('saida')}>
              <ArrowUpFromLine className="w-4 h-4 mr-2" /> Registrar Saída
            </Button>
            <Button onClick={() => openModal('entrada')}>
              <ArrowDownToLine className="w-4 h-4 mr-2" /> Registrar Entrada
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Itens em estoque</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{totalItensEstoque}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tipos cadastrados</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{saldos.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1">Estoque baixo {tiposComEstoqueBaixo > 0 && <AlertTriangle className="w-4 h-4 text-destructive" />}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{tiposComEstoqueBaixo}</div><p className="text-xs text-muted-foreground">tipos ≤ 5 unidades</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="saldos">
          <TabsList>
            <TabsTrigger value="saldos">Saldo por tipo</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="saldos">
            <Card>
              <CardContent className="pt-6">
                {loadingSaldos ? <Skeleton className="h-32 w-full" /> : saldos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Boxes className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma movimentação registrada ainda</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de EPI</TableHead>
                        <TableHead className="text-right">Entradas</TableHead>
                        <TableHead className="text-right">Saídas</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Última movimentação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saldos.map((s) => {
                        const saldo = Number(s.saldo_atual);
                        return (
                          <TableRow key={s.tipo_epi}>
                            <TableCell className="font-medium">{s.tipo_epi}</TableCell>
                            <TableCell className="text-right">{s.total_entradas}</TableCell>
                            <TableCell className="text-right">{s.total_saidas}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={saldo <= 0 ? 'destructive' : saldo <= 5 ? 'outline' : 'default'}>
                                {saldo}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {s.ultima_movimentacao ? new Date(s.ultima_movimentacao).toLocaleDateString('pt-BR') : '-'}
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

          <TabsContent value="movimentacoes">
            <Card>
              <CardContent className="pt-6">
                {loadingMov ? <Skeleton className="h-32 w-full" /> : movimentacoes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>EPI</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead>Origem / Destino</TableHead>
                        <TableHead>Obra</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell>{new Date(m.data_movimentacao).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant={m.tipo_movimentacao === 'entrada' ? 'default' : 'secondary'}>
                              {m.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{m.tipo_epi}</TableCell>
                          <TableCell className="text-right">{m.quantidade}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {m.tipo_movimentacao === 'entrada'
                              ? (m.fornecedor || '-')
                              : (colabMap.get(m.colaborador_id) || '-')}
                            {m.tipo_movimentacao === 'entrada' && m.valor_unitario > 0 && (
                              <span className="ml-2 text-xs">({formatCurrency(Number(m.valor_unitario))})</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {m.obra_id ? (obraMap.get(m.obra_id) || '-') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {tipoMov === 'entrada'
                  ? <><ArrowDownToLine className="w-5 h-5 text-primary" />Registrar Entrada de EPI</>
                  : <><ArrowUpFromLine className="w-5 h-5 text-primary" />Registrar Saída de EPI</>}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMov.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de EPI *</Label>
                <Select value={form.tipo_epi} onValueChange={(v) => setForm((p) => ({ ...p, tipo_epi: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tiposEpi.map((t: any) => (
                      <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input type="number" min="1" value={form.quantidade} onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))} />
              </div>

              {tipoMov === 'entrada' ? (
                <>
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Input value={form.fornecedor} onChange={(e) => setForm((p) => ({ ...p, fornecedor: e.target.value }))} placeholder="Nome do fornecedor" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Valor unitário (R$)</Label>
                      <Input type="number" step="0.01" min="0" value={form.valor_unitario} onChange={(e) => setForm((p) => ({ ...p, valor_unitario: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <Input type="date" value={form.validade} onChange={(e) => setForm((p) => ({ ...p, validade: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Certificado de Aprovação (CA)</Label>
                    <Input value={form.certificado_aprovacao} onChange={(e) => setForm((p) => ({ ...p, certificado_aprovacao: e.target.value }))} placeholder="Nº do CA" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Colaborador que recebeu *</Label>
                    <Select value={form.colaborador_id} onValueChange={(v) => setForm((p) => ({ ...p, colaborador_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
                      <SelectContent>
                        {colaboradores.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Obra (opcional)</Label>
                    <Select value={form.obra_id} onValueChange={(v) => setForm((p) => ({ ...p, obra_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                      <SelectContent>
                        {obras.map((o: any) => (
                          <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} rows={2} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMov.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createMov.isPending ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default EstoqueEPI;
