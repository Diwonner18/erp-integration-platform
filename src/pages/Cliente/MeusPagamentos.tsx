
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, AlertCircle, CheckCircle, Download } from 'lucide-react';

const MeusPagamentos = () => {
  const [pagamentos] = useState<any[]>([]);

  const totalPago = pagamentos.filter(p => p.status === 'pago').reduce((acc, p) => acc + (p.valorNum || 0), 0);
  const totalPendente = pagamentos.filter(p => p.status === 'pendente').reduce((acc, p) => acc + (p.valorNum || 0), 0);
  const faturasPagas = pagamentos.filter(p => p.status === 'pago').length;

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
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
              </div>
              <p className="text-xs text-muted-foreground">Este ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
              </div>
              <p className="text-xs text-muted-foreground">{pagamentos.filter(p => p.status === 'pendente').length} faturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturas Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faturasPagas}</div>
              <p className="text-xs text-muted-foreground">Este ano</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {pagamentos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhum pagamento registrado</p>
                <p className="text-sm">Seus pagamentos aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pagamentos.map((item, index) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MeusPagamentos;
