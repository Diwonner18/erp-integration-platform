import React, { useState } from 'react';
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
import { ArrowLeft, Calendar, DollarSign, Building, FileText, Clock, CheckCircle, AlertCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DetalhesRetencao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [observacoes, setObservacoes] = useState('');
  
  // Modal states
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Follow-up form state
  const [followUpDate, setFollowUpDate] = useState<Date>();
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpType, setFollowUpType] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  
  // Payment form state
  const [paymentType, setPaymentType] = useState('');
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [paymentDescription, setPaymentDescription] = useState('');

  // Mock data - em produção viria de uma API baseada no ID
  const retencao = {
    id: id,
    cliente: 'ABC Construções',
    valor: 'R$ 3.200',
    tipo: 'INSS',
    vencimento: '15/02/2024',
    status: 'pendente',
    dias: 12,
    projeto: 'Reforma Comercial Centro',
    numeroNota: 'NF-001234',
    dataEmissao: '10/01/2024',
    percentual: '11%',
    valorBruto: 'R$ 29.090,91'
  };

  const historico = [
    {
      data: '10/01/2024',
      acao: 'Retenção criada',
      usuario: 'Sistema',
      detalhes: 'Retenção gerada automaticamente na emissão da NF'
    },
    {
      data: '12/01/2024',
      acao: 'Status atualizado',
      usuario: 'Carla Admin',
      detalhes: 'Status alterado para Pendente'
    },
    {
      data: '20/01/2024',
      acao: 'Observação adicionada',
      usuario: 'João Financeiro',
      detalhes: 'Cliente informado sobre vencimento'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'liberado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'atrasado':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'liberado':
        return 'bg-green-100 text-green-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleSalvarObservacoes = () => {
    // Implementar salvamento das observações
    console.log('Salvando observações:', observacoes);
    toast.success('Observações salvas com sucesso!');
  };

  const handleAgendarFollowUp = () => {
    if (!followUpDate || !followUpTime || !followUpType) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Implementar agendamento do follow-up
    console.log('Agendando follow-up:', {
      date: followUpDate,
      time: followUpTime,
      type: followUpType,
      notes: followUpNotes
    });
    
    toast.success('Follow-up agendado com sucesso!');
    setIsFollowUpModalOpen(false);
    
    // Reset form
    setFollowUpDate(undefined);
    setFollowUpTime('');
    setFollowUpType('');
    setFollowUpNotes('');
  };

  const handleRegistrarPagamento = () => {
    if (!paymentType || !paymentValue || !paymentDate) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Implementar registro do pagamento
    console.log('Registrando pagamento:', {
      type: paymentType,
      value: paymentValue,
      date: paymentDate,
      description: paymentDescription
    });
    
    toast.success('Pagamento registrado com sucesso!');
    setIsPaymentModalOpen(false);
    
    // Reset form
    setPaymentType('');
    setPaymentValue('');
    setPaymentDate(undefined);
    setPaymentDescription('');
  };

  const handleGerarRelatorio = () => {
    // Implementar geração do relatório
    console.log('Gerando relatório para retenção:', id);
    toast.success('Relatório gerado com sucesso!');
    
    // Simular download do relatório
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#'; // Em produção, seria a URL do PDF gerado
      link.download = `relatorio-retencao-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/retencoes')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detalhes da Retenção</h1>
            <p className="text-slate-600 mt-1">Acompanhamento e gestão da retenção</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Informações da Retenção</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Cliente</label>
                    <p className="text-lg font-semibold text-slate-900">{retencao.cliente}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Projeto</label>
                    <p className="text-slate-900">{retencao.projeto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tipo de Retenção</label>
                    <p className="text-slate-900">{retencao.tipo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Percentual</label>
                    <p className="text-slate-900">{retencao.percentual}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Valor Bruto</label>
                    <p className="text-slate-900">{retencao.valorBruto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Valor Retido</label>
                    <p className="text-xl font-bold text-primary">{retencao.valor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Data de Vencimento</label>
                    <p className="text-slate-900">{retencao.vencimento}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Número da Nota</label>
                    <p className="text-slate-900">{retencao.numeroNota}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de movimentações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Histórico de Movimentações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historico.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{item.acao}</h4>
                          <span className="text-sm text-slate-500">{item.data}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{item.detalhes}</p>
                        <p className="text-xs text-slate-500 mt-1">Por: {item.usuario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel lateral */}
          <div className="space-y-6">
            {/* Status atual */}
            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(retencao.status)}
                  <div>
                    <Badge className={getStatusColor(retencao.status)}>
                      {retencao.status === 'liberado' ? 'Liberado' :
                       retencao.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                    </Badge>
                    {retencao.dias !== null && retencao.status !== 'liberado' && (
                      <p className={`text-sm mt-1 ${retencao.dias < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {retencao.dias < 0 ? `${Math.abs(retencao.dias)} dias em atraso` : `${retencao.dias} dias para vencimento`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Adicione observações sobre esta retenção..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={6}
                />
                <Button onClick={handleSalvarObservacoes} className="w-full">
                  Salvar Observações
                </Button>
              </CardContent>
            </Card>

            {/* Ações rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isFollowUpModalOpen} onOpenChange={setIsFollowUpModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Follow-up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Agendar Follow-up</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="followup-date">Data *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !followUpDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {followUpDate ? format(followUpDate, "PPP") : <span>Selecionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={followUpDate}
                              onSelect={setFollowUpDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="followup-time">Horário *</Label>
                        <Input
                          id="followup-time"
                          type="time"
                          value={followUpTime}
                          onChange={(e) => setFollowUpTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="followup-type">Tipo de Contato *</Label>
                        <Select value={followUpType} onValueChange={setFollowUpType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="telefone">Telefone</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="followup-notes">Observações</Label>
                        <Textarea
                          id="followup-notes"
                          placeholder="Adicione observações sobre o follow-up..."
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsFollowUpModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAgendarFollowUp}>
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Registrar Pagamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Registrar Pagamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment-type">Tipo de Pagamento *</Label>
                        <Select value={paymentType} onValueChange={setPaymentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="liberacao">Liberação de Retenção</SelectItem>
                            <SelectItem value="parcial">Pagamento Parcial</SelectItem>
                            <SelectItem value="total">Pagamento Total</SelectItem>
                            <SelectItem value="multa">Pagamento de Multa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-value">Valor *</Label>
                        <Input
                          id="payment-value"
                          placeholder="R$ 0,00"
                          value={paymentValue}
                          onChange={(e) => setPaymentValue(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-date">Data do Pagamento *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !paymentDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {paymentDate ? format(paymentDate, "PPP") : <span>Selecionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={paymentDate}
                              onSelect={setPaymentDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-description">Descrição</Label>
                        <Textarea
                          id="payment-description"
                          placeholder="Adicione uma descrição do pagamento..."
                          value={paymentDescription}
                          onChange={(e) => setPaymentDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleRegistrarPagamento}>
                          Registrar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full" onClick={handleGerarRelatorio}>
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DetalhesRetencao;