import React, { useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { usePropostas } from '@/hooks/useSupabaseData';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RelatoriosComerciais = () => {
  const { data: propostas = [], isLoading } = usePropostas();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = propostas.filter(p => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const aprovadas = propostas.filter(p => p.status === 'aprovada');
    const total = propostas.length;
    const taxa = total > 0 ? Math.round((aprovadas.length / total) * 100) : 0;
    const valorMedio = total > 0 ? propostas.reduce((s, p) => s + (p.valor || 0), 0) / total : 0;
    const contratosAtivos = aprovadas.length;
    return { enviadas: thisMonth.length, taxa, valorMedio, contratosAtivos };
  }, [propostas]);

  const chartData = useMemo(() => {
    const months: Record<string, number> = {};
    propostas.forEach(p => {
      const key = p.created_at.substring(0, 7);
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([m, count]) => ({
        mes: new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        propostas: count,
      }));
  }, [propostas]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (isLoading) return <MainLayout><div className="space-y-6"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div></div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div data-tour="page-header">
          <h1 className="text-3xl font-bold text-primary">Relatórios Comerciais</h1>
          <p className="text-muted-foreground mt-1">Acompanhar performance comercial</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="page-stats">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Propostas Enviadas</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.enviadas}</div><p className="text-xs text-muted-foreground">Este mês</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.taxa}%</div><p className="text-xs text-muted-foreground">{propostas.length} propostas total</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Valor Médio</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(stats.valorMedio)}</div><p className="text-xs text-muted-foreground">Por proposta</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.contratosAtivos}</div><p className="text-xs text-muted-foreground">Propostas aprovadas</p></CardContent></Card>
        </div>

        {chartData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Propostas por Mês</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="propostas" name="Propostas" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatoriosComerciais;
