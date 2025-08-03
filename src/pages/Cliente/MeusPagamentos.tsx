
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, AlertCircle, CheckCircle, Download } from 'lucide-react';

const MeusPagamentos = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus Pagamentos</h1>
          <p className="text-slate-600 mt-1">Acompanhe seus pagamentos e faturamento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 36.800</div>
              <p className="text-xs text-muted-foreground">Este ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 8.400</div>
              <p className="text-xs text-muted-foreground">Em 15 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R$ 8.400</div>
              <p className="text-xs text-muted-foreground">1 fatura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturas Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Este ano</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  fatura: 'NF-2024-001',
                  servico: 'Sistema de Automação',
                  valor: 'R$ 8.500',
                  vencimento: '2024-02-05',
                  pagamento: null,
                  status: 'pendente'
                },
                {
                  fatura: 'NF-2024-002',
                  servico: 'Instalação Elétrica - Etapa 2',
                  valor: 'R$ 6.800',
                  vencimento: '2024-01-20',
                  pagamento: '2024-01-18',
                  status: 'pago'
                },
                {
                  fatura: 'NF-2023-025',
                  servico: 'Instalação Elétrica - Etapa 1',
                  valor: 'R$ 9.000',
                  vencimento: '2023-12-15',
                  pagamento: '2023-12-12',
                  status: 'pago'
                },
                {
                  fatura: 'NF-2023-018',
                  servico: 'Manutenção Preventiva',
                  valor: 'R$ 1.200',
                  vencimento: '2023-11-10',
                  pagamento: '2023-11-08',
                  status: 'pago'
                },
                {
                  fatura: 'NF-2023-012',
                  servico: 'Projeto Elétrico',
                  valor: 'R$ 2.800',
                  vencimento: '2023-10-20',
                  pagamento: '2023-10-15',
                  status: 'pago'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'pago' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {item.status === 'pago' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.fatura}</h4>
                      <p className="text-sm text-slate-600">{item.servico}</p>
                      <p className="text-xs text-slate-500">
                        Vencimento: {item.vencimento}
                        {item.pagamento && (
                          <span className="ml-2 text-green-600">
                            • Pago em: {item.pagamento}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{item.valor}</p>
                      <Badge variant={item.status === 'pago' ? 'default' : 'secondary'}>
                        {item.status === 'pago' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MeusPagamentos;
