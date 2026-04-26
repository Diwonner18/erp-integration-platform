import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Calendar, Plus, DollarSign, Building, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useObrasCliente } from '@/hooks/useSupabaseData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { reembolsoClienteInsertSchema, validateInput } from '@/lib/validationSchemas';
import { getSafeErrorMessage } from '@/lib/errorMessages';

const TIPOS_DESPESA = [
  { value: 'material', label: 'Material' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'hospedagem', label: 'Hospedagem' },
  { value: 'outros', label: 'Outros' },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const MeusRelatorios = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: obras = [], isLoading: loadingObras } = useObrasCliente();

  const [showReembolsoModal, setShowReembolsoModal] = useState(false);
  const [novoReembolso, setNovoReembolso] = useState({
    obraId: '',
    tipoDespesa: '',
    valor: '',
    descricao: '',
  });

  // Carrega reembolsos reais do cliente
  const { data: reembolsos = [], isLoading: loadingReembolsos } = useQuery({
    queryKey: ['reembolsos_cliente', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('id, descricao, valor, data, obra_id, created_at')
        .eq('categoria', 'reembolso_cliente')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const obrasMap = new Map(obras.map((o: any) => [o.id, o.nome]));

  const obrasConcluidas = obras.filter((o: any) => o.status === 'concluida').length;
  const investimentoTotal = obras.reduce((acc: number, o: any) => acc + (Number(o.valor_contrato) || 0), 0);
  const totalReembolsos = reembolsos.reduce((acc: number, r: any) => acc + (Number(r.valor) || 0), 0);

  const createReembolso = useMutation({
    mutationFn: async (payload: typeof novoReembolso) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      const tipoLabel = TIPOS_DESPESA.find((t) => t.value === payload.tipoDespesa)?.label || 'Outros';
      const valorNum = parseFloat(payload.valor);
      if (!Number.isFinite(valorNum)) throw new Error('Valor inválido');

      const validated = validateInput(reembolsoClienteInsertSchema, {
        categoria: 'reembolso_cliente' as const,
        descricao: `[${tipoLabel}] ${payload.descricao.trim()}`,
        valor: valorNum,
        data: new Date().toISOString().slice(0, 10),
        obra_id: payload.obraId,
        created_by: user.id,
      });

      const { error } = await supabase.from('despesas').insert(validated as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsos_cliente'] });
      toast({
        title: 'Reembolso registrado',
        description: 'Seu pedido de reembolso foi enviado para análise.',
      });
      setShowReembolsoModal(false);
      setNovoReembolso({ obraId: '', tipoDespesa: '', valor: '', descricao: '' });
    },
    onError: (err: unknown) => {
      toast({
        title: 'Erro ao registrar reembolso',
        description: getSafeErrorMessage(err, 'Não foi possível registrar o reembolso. Tente novamente.'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoReembolso.obraId) {
      toast({ title: 'Selecione uma obra', variant: 'destructive' });
      return;
    }
    if (!novoReembolso.tipoDespesa) {
      toast({ title: 'Selecione o tipo de despesa', variant: 'destructive' });
      return;
    }
    if (!novoReembolso.valor || parseFloat(novoReembolso.valor) <= 0) {
      toast({ title: 'Informe um valor válido', variant: 'destructive' });
      return;
    }
    if (!novoReembolso.descricao.trim()) {
      toast({ title: 'A descrição é obrigatória', variant: 'destructive' });
      return;
    }
    createReembolso.mutate(novoReembolso);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-foreground">Meus Relatórios</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus investimentos e reembolsos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="page-stats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(investimentoTotal)}</div>
              <p className="text-xs text-muted-foreground">Soma dos contratos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Realizadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obrasConcluidas}</div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reembolsos</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalReembolsos)}</div>
              <p className="text-xs text-muted-foreground">{reembolsos.length} solicitações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obras.length - obrasConcluidas}</div>
              <p className="text-xs text-muted-foreground">Em andamento ou agendadas</p>
            </CardContent>
          </Card>
        </div>

        <Card data-tour="page-list">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Lançamento de Reembolsos
              </CardTitle>
              <Button
                onClick={() => setShowReembolsoModal(true)}
                size="sm"
                disabled={obras.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Reembolso
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingReembolsos ? (
              <Skeleton className="h-32 w-full" />
            ) : reembolsos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum reembolso registrado</p>
                {obras.length === 0 && (
                  <p className="text-sm mt-2">Você precisa ter uma obra vinculada para solicitar reembolso.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {reembolsos.map((r: any) => (
                  <div key={r.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{obrasMap.get(r.obra_id) || 'Obra'}</h4>
                          <Badge variant="secondary">Pendente</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.descricao}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1" />{formatCurrency(Number(r.valor))}</span>
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="w-5 h-5 mr-2" />Resumo das Obras</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingObras ? (
              <Skeleton className="h-32 w-full" />
            ) : obras.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma obra vinculada à sua conta</p>
              </div>
            ) : (
              <div className="space-y-2">
                {obras.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{o.nome}</p>
                      <p className="text-xs text-muted-foreground">{o.endereco || 'Sem endereço'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatCurrency(Number(o.valor_contrato) || 0)}</p>
                      <Badge variant={o.status === 'concluida' ? 'default' : 'secondary'} className="mt-1">
                        {o.status === 'concluida' ? 'Concluída' : o.status === 'em_andamento' ? 'Em Andamento' : o.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showReembolsoModal} onOpenChange={setShowReembolsoModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Novo Reembolso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Obra *</label>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                  value={novoReembolso.obraId}
                  onChange={(e) => setNovoReembolso((p) => ({ ...p, obraId: e.target.value }))}
                  required
                >
                  <option value="">Selecione a obra</option>
                  {obras.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Tipo de Despesa *</label>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                  value={novoReembolso.tipoDespesa}
                  onChange={(e) => setNovoReembolso((p) => ({ ...p, tipoDespesa: e.target.value }))}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {TIPOS_DESPESA.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Valor (R$) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={novoReembolso.valor}
                  onChange={(e) => setNovoReembolso((p) => ({ ...p, valor: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descrição *</label>
                <Textarea
                  placeholder="Descreva o motivo do reembolso..."
                  value={novoReembolso.descricao}
                  onChange={(e) => setNovoReembolso((p) => ({ ...p, descricao: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReembolsoModal(false);
                    setNovoReembolso({ obraId: '', tipoDespesa: '', valor: '', descricao: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createReembolso.isPending}>
                  <Receipt className="w-4 h-4 mr-2" />
                  {createReembolso.isPending ? 'Enviando...' : 'Registrar Reembolso'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MeusRelatorios;
