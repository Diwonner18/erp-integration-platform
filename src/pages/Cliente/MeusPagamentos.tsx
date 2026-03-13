import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useBoletins } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const MeusPagamentos = () => {
  const { data: boletins = [], isLoading } = useBoletins();

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const totalPago = boletins.filter(b => b.status === 'pago').reduce((acc, b) => acc + (b.valor || 0), 0);
  const totalPendente = boletins.filter(b => b.status !== 'pago').reduce((acc, b) => acc + (b.valor || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header"><h1 className="text-3xl font-bold text-foreground">Meus Pagamentos</h1><p className="text-muted-foreground mt-1">Acompanhe seus pagamentos</p></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="page-stats">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pago</CardTitle><CheckCircle className="h-4 w-4" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pendente</CardTitle><AlertCircle className="h-4 w-4" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Boletins</CardTitle><DollarSign className="h-4 w-4" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{boletins.length}</div></CardContent></Card>
        </div>

        <Card data-tour="page-list"><CardHeader><CardTitle>Histórico</CardTitle></CardHeader><CardContent>
          {isLoading ? <Skeleton className="h-48 w-full" /> : boletins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Nenhum pagamento registrado</p></div>
          ) : (
            <div className="space-y-4">
              {boletins.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${b.status === 'pago' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {b.status === 'pago' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div><h4 className="font-semibold">{b.numero || 'Boletim'}</h4><p className="text-sm text-muted-foreground">{b.obras?.nome || '-'}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(b.valor || 0)}</p>
                    <Badge variant={b.status === 'pago' ? 'default' : 'secondary'}>{b.status === 'pago' ? 'Pago' : b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>
    </MainLayout>
  );
};

export default MeusPagamentos;
