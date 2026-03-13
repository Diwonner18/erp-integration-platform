import React, { useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar } from 'lucide-react';
import { useBoletins, useDespesas } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ControleFinanceiro = () => {
  const { data: boletins = [], isLoading: loadingB } = useBoletins();
  const { data: despesas = [], isLoading: loadingD } = useDespesas();
  const isLoading = loadingB || loadingD;

  const totalReceber = boletins.reduce((acc, b) => acc + (b.valor || 0), 0);
  const totalPagar = despesas.reduce((acc, d) => acc + d.valor, 0);
  const saldoLiquido = totalReceber - totalPagar;

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const monthlyData = useMemo(() => {
    const months: Record<string, { receita: number; despesa: number }> = {};
    boletins.forEach(b => {
      const key = b.data_emissao ? b.data_emissao.substring(0, 7) : b.created_at.substring(0, 7);
      if (!months[key]) months[key] = { receita: 0, despesa: 0 };
      months[key].receita += b.valor || 0;
    });
    despesas.forEach(d => {
      const key = d.data.substring(0, 7);
      if (!months[key]) months[key] = { receita: 0, despesa: 0 };
      months[key].despesa += d.valor;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, vals]) => ({
        mes: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receita: vals.receita,
        despesa: vals.despesa,
      }));
  }, [boletins, despesas]);

  const cashFlowData = useMemo(() => {
    let accumulated = 0;
    return monthlyData.map(d => {
      accumulated += d.receita - d.despesa;
      return { mes: d.mes, saldo: accumulated };
    });
  }, [monthlyData]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header"><h1 className="text-3xl font-bold text-primary">Controle Financeiro</h1><p className="text-muted-foreground mt-1">Gestão financeira geral</p></div>

        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-tour="page-stats">
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Boletins Emitidos</CardTitle><ArrowUpCircle className="h-4 w-4 text-green-600" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</div><p className="text-xs text-muted-foreground">{boletins.length} boletins</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Despesas</CardTitle><ArrowDownCircle className="h-4 w-4 text-red-600" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</div><p className="text-xs text-muted-foreground">{despesas.length} despesas</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Saldo</CardTitle><DollarSign className="h-4 w-4" /></CardHeader>
                <CardContent><div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldoLiquido)}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Boletins Pagos</CardTitle><Calendar className="h-4 w-4" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{boletins.filter(b => b.status === 'pago').length}</div></CardContent></Card>
            </div>

            {monthlyData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Receita vs Despesa</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mes" className="text-xs" />
                        <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} className="text-xs" />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend />
                        <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                        <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Fluxo de Caixa Acumulado</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mes" className="text-xs" />
                        <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} className="text-xs" />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Area type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ControleFinanceiro;
