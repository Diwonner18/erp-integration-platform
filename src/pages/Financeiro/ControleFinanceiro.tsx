import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar } from 'lucide-react';
import { useBoletins, useDespesas } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';

const ControleFinanceiro = () => {
  const { data: boletins = [], isLoading: loadingB } = useBoletins();
  const { data: despesas = [], isLoading: loadingD } = useDespesas();
  const isLoading = loadingB || loadingD;

  const totalReceber = boletins.reduce((acc, b) => acc + (b.valor || 0), 0);
  const totalPagar = despesas.reduce((acc, d) => acc + d.valor, 0);
  const saldoLiquido = totalReceber - totalPagar;

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold text-primary">Controle Financeiro</h1><p className="text-muted-foreground mt-1">Gestão financeira geral</p></div>

        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div> : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Boletins Emitidos</CardTitle><ArrowUpCircle className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</div><p className="text-xs text-muted-foreground">{boletins.length} boletins</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Despesas</CardTitle><ArrowDownCircle className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</div><p className="text-xs text-muted-foreground">{despesas.length} despesas</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Saldo</CardTitle><DollarSign className="h-4 w-4" /></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldoLiquido)}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Boletins Pagos</CardTitle><Calendar className="h-4 w-4" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{boletins.filter(b => b.status === 'pago').length}</div></CardContent></Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ControleFinanceiro;
