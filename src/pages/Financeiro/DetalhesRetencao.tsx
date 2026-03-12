import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, DollarSign, Building, FileText, Clock, CheckCircle, AlertCircle, CalendarIcon, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useRetencao, useRetencaoFollowups, useRetencaoPagamentos,
  useUpdateRetencao, useCreateRetencaoFollowup, useCreateRetencaoPagamento,
} from '@/hooks/useSupabaseData';

const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const DetalhesRetencao = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: retencao, isLoading } = useRetencao(id);
  const { data: followups = [] } = useRetencaoFollowups(id);
  const { data: pagamentos = [] } = useRetencaoPagamentos(id);

  const updateRetencao = useUpdateRetencao();
  const createFollowup = useCreateRetencaoFollowup();
  const createPagamento = useCreateRetencaoPagamento();

  const [observacoes, setObservacoes] = useState('');
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Follow-up form
  const [followUpDate, setFollowUpDate] = useState<Date>();
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpType, setFollowUpType] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Payment form
  const [paymentType, setPaymentType] = useState('');
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [paymentDescription, setPaymentDescription] = useState('');

  useEffect(() => {
    if (retencao && (retencao as any).observacoes) {
      setObservacoes((retencao as any).observacoes);
    }
  }, [retencao]);

  // Build timeline from followups + pagamentos
  const historico = useMemo(() => {
    const items: { data: string; acao: string; detalhes: string; tipo: 'followup' | 'pagamento' }[] = [];
    followups.forEach((f: any) => {
      items.push({
        data: f.data,
        acao: `Follow-up (${f.tipo_contato})`,
        detalhes: `${f.horario}${f.observacoes ? ' - ' + f.observacoes : ''}`,
        tipo: 'followup',
      });
    });
    pagamentos.forEach((p: any) => {
      items.push({
        data: p.data_pagamento,
        acao: `Pagamento - ${p.tipo}`,
        detalhes: `${formatCurrency(p.valor)}${p.descricao ? ' - ' + p.descricao : ''}`,
        tipo: 'pagamento',
      });
    });
    return items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [followups, pagamentos]);

  const handleSalvarObservacoes = () => {
    if (!id) return;
    updateRetencao.mutate({ id, observacoes }, {
      onSuccess: () => toast.success('Observações salvas com sucesso!'),
      onError: () => toast.error('Erro ao salvar observações'),
    });
  };

  const handleAgendarFollowUp = () => {
    if (!followUpDate || !followUpTime || !followUpType || !id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    createFollowup.mutate({
      retencao_id: id,
      data: format(followUpDate, 'yyyy-MM-dd'),
      horario: followUpTime,
      tipo_contato: followUpType,
      observacoes: followUpNotes || undefined,
    }, {
      onSuccess: () => {
        toast.success('Follow-up agendado com sucesso!');
        setIsFollowUpModalOpen(false);
        setFollowUpDate(undefined);
        setFollowUpTime('');
        setFollowUpType('');
        setFollowUpNotes('');
      },
      onError: () => toast.error('Erro ao agendar follow-up'),
    });
  };

  const handleRegistrarPagamento = () => {
    if (!paymentType || !paymentValue || !paymentDate || !id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const valor = parseFloat(paymentValue.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(valor)) { toast.error('Valor inválido'); return; }

    createPagamento.mutate({
      retencao_id: id,
      tipo: paymentType,
      valor,
      data_pagamento: format(paymentDate, 'yyyy-MM-dd'),
      descricao: paymentDescription || undefined,
    }, {
      onSuccess: () => {
        toast.success('Pagamento registrado com sucesso!');
        setIsPaymentModalOpen(false);
        setPaymentType('');
        setPaymentValue('');
        setPaymentDate(undefined);
        setPaymentDescription('');
      },
      onError: () => toast.error('Erro ao registrar pagamento'),
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>
            <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-48 w-full" /></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!retencao) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Retenção não encontrada</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/retencoes')}>Voltar</Button>
        </div>
      </MainLayout>
    );
  }

  const obraNome = (retencao as any).obras?.nome || 'Obra';
  const clienteNome = (retencao as any).obras?.clientes?.razao_social || '—';
  const statusRetencao = retencao.status || 'pendente';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/retencoes')} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" /><span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Detalhes da Retenção</h1>
            <p className="text-muted-foreground mt-1">Acompanhamento e gestão da retenção</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Retenção */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Building className="w-5 h-5" /><span>Informações da Retenção</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-muted-foreground">Cliente</label><p className="text-lg font-semibold text-foreground">{clienteNome}</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Obra</label><p className="text-foreground">{obraNome}</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Tipo de Retenção</label><p className="text-foreground uppercase">{retencao.tipo}</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Percentual</label><p className="text-foreground">{retencao.percentual}%</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Base de Cálculo</label><p className="text-foreground">{formatCurrency(retencao.base_calculo || 0)}</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Valor Retido</label><p className="text-xl font-bold text-primary">{formatCurrency(retencao.valor || 0)}</p></div>
                  <div><label className="text-sm font-medium text-muted-foreground">Mês Referência</label><p className="text-foreground">{retencao.mes_referencia ? format(new Date(retencao.mes_referencia), 'MM/yyyy') : '—'}</p></div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="w-5 h-5" /><span>Histórico de Movimentações</span></CardTitle>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhuma movimentação registrada</p>
                ) : (
                  <div className="space-y-4">
                    {historico.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className={cn("w-2 h-2 rounded-full mt-2", item.tipo === 'pagamento' ? 'bg-green-500' : 'bg-primary')} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{item.acao}</h4>
                            <span className="text-sm text-muted-foreground">{format(new Date(item.data), 'dd/MM/yyyy')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.detalhes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Painel lateral */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader><CardTitle>Status Atual</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  {statusRetencao === 'liberado' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                   statusRetencao === 'atrasado' ? <AlertCircle className="w-5 h-5 text-destructive" /> :
                   <Clock className="w-5 h-5 text-yellow-600" />}
                  <Badge variant={statusRetencao === 'liberado' ? 'default' : 'secondary'}>
                    {statusRetencao === 'liberado' ? 'Liberado' : statusRetencao === 'atrasado' ? 'Atrasado' : 'Pendente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Adicione observações sobre esta retenção..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={6} />
                <Button onClick={handleSalvarObservacoes} className="w-full" disabled={updateRetencao.isPending}>
                  {updateRetencao.isPending ? 'Salvando...' : 'Salvar Observações'}
                </Button>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader><CardTitle>Ações</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {/* Follow-up Modal */}
                <Dialog open={isFollowUpModalOpen} onOpenChange={setIsFollowUpModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full"><Calendar className="w-4 h-4 mr-2" />Agendar Follow-up</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Agendar Follow-up</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Data *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !followUpDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {followUpDate ? format(followUpDate, "PPP") : <span>Selecionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent mode="single" selected={followUpDate} onSelect={setFollowUpDate} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Horário *</Label>
                        <Input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Contato *</Label>
                        <Select value={followUpType} onValueChange={setFollowUpType}>
                          <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="telefone">Telefone</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea placeholder="Observações do follow-up..." value={followUpNotes} onChange={(e) => setFollowUpNotes(e.target.value)} rows={3} />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsFollowUpModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAgendarFollowUp} disabled={createFollowup.isPending}>
                          {createFollowup.isPending ? 'Agendando...' : 'Agendar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Payment Modal */}
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full"><DollarSign className="w-4 h-4 mr-2" />Registrar Pagamento</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tipo de Pagamento *</Label>
                        <Select value={paymentType} onValueChange={setPaymentType}>
                          <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="liberacao">Liberação de Retenção</SelectItem>
                            <SelectItem value="parcial">Pagamento Parcial</SelectItem>
                            <SelectItem value="total">Pagamento Total</SelectItem>
                            <SelectItem value="multa">Pagamento de Multa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Valor *</Label>
                        <Input placeholder="R$ 0,00" value={paymentValue} onChange={(e) => setPaymentValue(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Data do Pagamento *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {paymentDate ? format(paymentDate, "PPP") : <span>Selecionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea placeholder="Descrição do pagamento..." value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} rows={3} />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRegistrarPagamento} disabled={createPagamento.isPending}>
                          {createPagamento.isPending ? 'Registrando...' : 'Registrar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesRetencao;
