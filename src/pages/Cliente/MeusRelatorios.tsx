
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, Download, FileText, Calendar, Plus, DollarSign, Building, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Reembolso {
  id: string;
  obraId: string;
  obraNome: string;
  tiposDespesa: string;
  valor: number;
  descricao: string;
  dataLancamento: string;
  status: 'pendente' | 'aprovado' | 'pago';
}

const MeusRelatorios = () => {
  const { toast } = useToast();
  const [showReembolsoModal, setShowReembolsoModal] = useState(false);
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([]);
  
  const [novoReembolso, setNovoReembolso] = useState({
    obraId: '',
    tiposDespesa: '',
    valor: '',
    descricao: ''
  });

  const obras: { id: string; nome: string }[] = [];

  const tiposDespesa = [
    { value: 'material', label: 'Material' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'hospedagem', label: 'Hospedagem' },
    { value: 'outros', label: 'Outros' }
  ];

  const handleSubmitReembolso = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!novoReembolso.obraId) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma obra",
        variant: "destructive"
      });
      return;
    }

    if (!novoReembolso.tiposDespesa) {
      toast({
        title: "Erro de validação", 
        description: "Selecione o tipo de despesa",
        variant: "destructive"
      });
      return;
    }

    if (!novoReembolso.valor || parseFloat(novoReembolso.valor) <= 0) {
      toast({
        title: "Erro de validação",
        description: "Informe um valor válido maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (!novoReembolso.descricao.trim()) {
      toast({
        title: "Erro de validação",
        description: "A descrição é obrigatória",
        variant: "destructive"
      });
      return;
    }

    const obraSelecionada = obras.find(obra => obra.id === novoReembolso.obraId);
    
    const reembolso: Reembolso = {
      id: Date.now().toString(),
      obraId: novoReembolso.obraId,
      obraNome: obraSelecionada?.nome || '',
      tiposDespesa: novoReembolso.tiposDespesa,
      valor: parseFloat(novoReembolso.valor),
      descricao: novoReembolso.descricao.trim(),
      dataLancamento: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'pendente'
    };

    setReembolsos(prev => [...prev, reembolso]);
    setNovoReembolso({ obraId: '', tiposDespesa: '', valor: '', descricao: '' });
    setShowReembolsoModal(false);

    toast({
      title: "Reembolso registrado",
      description: "Seu reembolso foi registrado e será integrado ao controle financeiro",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprovado':
        return 'bg-blue-100 text-blue-800';
      case 'pago':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aprovado':
        return 'Aprovado';
      case 'pago':
        return 'Pago';
      default:
        return status;
    }
  };
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus Relatórios</h1>
          <p className="text-slate-600 mt-1">Acompanhe seus investimentos e histórico</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.200</div>
              <p className="text-xs text-muted-foreground">Este ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Realizadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia Gerada</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 12.800</div>
              <p className="text-xs text-muted-foreground">Em eficiência</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 8.400</div>
              <p className="text-xs text-muted-foreground">Em 15 dias</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Investimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { mes: 'Janeiro 2024', valor: 'R$ 15.800', obras: 2 },
                  { mes: 'Dezembro 2023', valor: 'R$ 8.500', obras: 1 },
                  { mes: 'Novembro 2023', valor: 'R$ 12.300', obras: 2 },
                  { mes: 'Outubro 2023', valor: 'R$ 8.600', obras: 2 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{item.mes}</p>
                      <p className="text-sm text-slate-600">{item.obras} obra(s) realizadas</p>
                    </div>
                    <span className="font-semibold text-slate-900">{item.valor}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Resumo Anual 2024', tipo: 'PDF', data: '2024-01-20' },
                  { nome: 'Histórico de Obras', tipo: 'PDF', data: '2024-01-15' },
                  { nome: 'Análise de Economia', tipo: 'PDF', data: '2024-01-10' },
                  { nome: 'Cronograma de Pagamentos', tipo: 'Excel', data: '2024-01-08' }
                ].map((relatorio, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{relatorio.nome}</p>
                      <p className="text-sm text-slate-600">{relatorio.tipo} • {relatorio.data}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Reembolsos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Lançamento de Reembolsos
              </CardTitle>
              <Button
                onClick={() => setShowReembolsoModal(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Reembolso
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reembolsos.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum reembolso registrado</p>
                <p className="text-sm">Clique em "Novo Reembolso" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reembolsos.map((reembolso) => (
                  <div key={reembolso.id} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{reembolso.obraNome}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reembolso.status)}`}>
                            {getStatusText(reembolso.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {tiposDespesa.find(t => t.value === reembolso.tiposDespesa)?.label}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            R$ {reembolso.valor.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {reembolso.dataLancamento}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mt-2">
                          <strong>Descrição:</strong> {reembolso.descricao}
                        </p>
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
            <CardTitle>Análise de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Gráfico de performance de investimentos será implementado aqui
            </div>
          </CardContent>
        </Card>

        {/* Modal de Novo Reembolso */}
        <Dialog open={showReembolsoModal} onOpenChange={setShowReembolsoModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Novo Reembolso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitReembolso} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Obra *
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={novoReembolso.obraId}
                  onChange={(e) => setNovoReembolso(prev => ({ ...prev, obraId: e.target.value }))}
                  required
                >
                  <option value="">Selecione a obra</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Tipo de Despesa *
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={novoReembolso.tiposDespesa}
                  onChange={(e) => setNovoReembolso(prev => ({ ...prev, tiposDespesa: e.target.value }))}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {tiposDespesa.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Valor (R$) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={novoReembolso.valor}
                  onChange={(e) => setNovoReembolso(prev => ({ ...prev, valor: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Descrição *
                </label>
                <Textarea
                  placeholder="Descreva o motivo do reembolso..."
                  value={novoReembolso.descricao}
                  onChange={(e) => setNovoReembolso(prev => ({ ...prev, descricao: e.target.value }))}
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
                    setNovoReembolso({ obraId: '', tiposDespesa: '', valor: '', descricao: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Registrar Reembolso
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
