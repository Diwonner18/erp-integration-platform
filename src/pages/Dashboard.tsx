import React, { useMemo } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentProjects from '../components/Dashboard/RecentProjects';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats, useBoletins, useDespesas, usePropostas } from '@/hooks/useSupabaseData';
import { useTour } from '@/hooks/useTour';
import { getTourSteps } from '@/components/Tour/tourSteps';
import WelcomeModal from '@/components/Tour/WelcomeModal';
import ProductTour from '@/components/Tour/ProductTour';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Calendar, ClipboardList, FileText, Clock, Wallet, Package,
  CheckSquare, BarChart3, Users, Settings, Shield, AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();
  const { data: boletins = [] } = useBoletins();
  const { data: despesas = [] } = useDespesas();
  const { data: propostas = [] } = usePropostas();

  const tour = useTour(user?.id);
  const tourSteps = getTourSteps(user?.type || '');

  // Mini chart data - last 3 months
  const miniChartData = useMemo(() => {
    const months: Record<string, { receita: number; despesa: number }> = {};
    boletins.forEach(b => {
      const key = (b.data_emissao || b.created_at).substring(0, 7);
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
      .slice(-3)
      .map(([m, v]) => ({
        mes: new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        receita: v.receita,
        despesa: v.despesa,
      }));
  }, [boletins, despesas]);

  // Expiring proposals (< 30 days)
  const expiringPropostas = useMemo(() => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return propostas.filter(p => {
      if (!p.data_validade || ['aprovada', 'rejeitada', 'cancelada'].includes(p.status)) return false;
      const exp = new Date(p.data_validade);
      return exp >= now && exp <= in30;
    });
  }, [propostas]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const getUserTypeLabel = (type: string) => {
    const types: Record<string, string> = { admin: 'Administrador Pai', obras: 'Equipe de Obras', financeira: 'Equipe Financeira', comercial: 'Equipe Comercial/Propostas', cliente: 'Cliente CT Guedes' };
    return types[type] || type;
  };

  const getUserDescription = (type: string) => {
    const desc: Record<string, string> = { admin: 'Acesso total ao sistema', obras: 'Programação e execução', financeira: 'Medições e pagamentos', comercial: 'Propostas e contratos', cliente: 'Acompanhamento de obras' };
    return desc[type] || '';
  };

  const getQuickActions = () => {
    if (!user) return [];
    const actions: any[] = [];
    if (user.type === 'admin') {
      actions.push(
        { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', description: 'Criar e remover usuários' },
        { icon: Shield, label: 'Definir Permissões', path: '/permissoes', description: 'Controlar acesso' },
        { icon: CheckSquare, label: 'Aprovações Pendentes', path: '/aprovacoes', description: 'Aprovar alterações' },
        { icon: BarChart3, label: 'Relatórios Gerais', path: '/relatorios', description: 'Todos os indicadores' },
      );
    }
    if (user.type === 'obras' || user.type === 'admin') {
      actions.push(
        { icon: Calendar, label: 'Programação', path: '/programacao', description: 'Validar programação' },
        { icon: ClipboardList, label: 'Medições', path: '/medicoes', description: 'Alimentar andamento' },
        { icon: FileText, label: 'Alterações Escopo', path: '/alteracoes-escopo', description: 'Propor mudanças' },
      );
    }
    if (user.type === 'financeira' || user.type === 'admin') {
      actions.push(
        { icon: Wallet, label: 'Boletins', path: '/boletins-medicao', description: 'Medições para faturamento' },
        { icon: BarChart3, label: 'Financeiro', path: '/controle-financeiro', description: 'Receitas e despesas' },
      );
    }
    if (user.type === 'comercial' || user.type === 'admin') {
      actions.push(
        { icon: FileText, label: 'Propostas', path: '/propostas', description: 'Elaborar contratos' },
        { icon: Package, label: 'Valores Unitários', path: '/valores-unitarios', description: 'Preços por cliente' },
      );
    }
    if (user.type === 'cliente') {
      actions.push(
        { icon: Calendar, label: 'Solicitar Agendamento', path: '/solicitar-agendamento', description: 'Programar obra' },
        { icon: ClipboardList, label: 'Minhas Obras', path: '/minhas-obras', description: 'Ver status' },
        { icon: FileText, label: 'Minhas Propostas', path: '/minhas-propostas', description: 'Revisar contratos' },
      );
    }
    return actions;
  };

  const quickActions = getQuickActions();

  const getStatsForUser = () => {
    if (!user || !stats) return [{ title: 'Obras Ativas', value: 0, icon: Calendar, change: 'Carregando...', changeType: 'neutral' as const }];
    switch (user.type) {
      case 'admin': return [
        { title: 'Obras Ativas', value: stats.obrasAtivas, icon: Calendar, change: `${stats.obrasTotal} total`, changeType: 'neutral' as const },
        { title: 'Aprovações Pendentes', value: stats.aprovacoesPendentes, icon: CheckSquare, change: 'Aguardando', changeType: stats.aprovacoesPendentes > 0 ? 'negative' as const : 'neutral' as const },
        { title: 'Medições Pendentes', value: stats.medicoesPendentes, icon: ClipboardList, change: `${stats.medicoesCount} total`, changeType: 'neutral' as const },
        { title: 'Propostas', value: stats.propostasTotal, icon: FileText, change: `${stats.propostasPendentes} pendentes`, changeType: 'neutral' as const },
      ];
      case 'obras': return [
        { title: 'Obras Ativas', value: stats.obrasAtivas, icon: Calendar, change: `${stats.obrasTotal} total`, changeType: 'neutral' as const },
        { title: 'Medições Pendentes', value: stats.medicoesPendentes, icon: ClipboardList, change: 'Aguardando aprovação', changeType: 'neutral' as const },
        { title: 'Programações', value: stats.programacoesTotal, icon: Calendar, change: 'Agendadas', changeType: 'neutral' as const },
      ];
      case 'financeira': return [
        { title: 'Obras Ativas', value: stats.obrasAtivas, icon: Calendar, change: `${stats.obrasTotal} total`, changeType: 'neutral' as const },
        { title: 'Medições', value: stats.medicoesCount, icon: ClipboardList, change: `${stats.medicoesPendentes} pendentes`, changeType: 'neutral' as const },
      ];
      case 'comercial': return [
        { title: 'Propostas', value: stats.propostasTotal, icon: FileText, change: `${stats.propostasPendentes} pendentes`, changeType: 'neutral' as const },
        { title: 'Obras Ativas', value: stats.obrasAtivas, icon: Calendar, change: '', changeType: 'neutral' as const },
      ];
      case 'cliente': return [
        { title: 'Minhas Obras', value: stats.obrasTotal, icon: Calendar, change: `${stats.obrasAtivas} ativas`, changeType: 'neutral' as const },
        { title: 'Propostas', value: stats.propostasTotal, icon: FileText, change: '', changeType: 'neutral' as const },
      ];
      default: return [{ title: 'Obras', value: stats.obrasTotal, icon: Calendar, change: '', changeType: 'neutral' as const }];
    }
  };

  return (
    <MainLayout onStartTour={tour.resetTour}>
      <div className="space-y-6">
        <div className="bg-sidebar rounded-lg p-6 text-sidebar-foreground">
          <h1 className="text-2xl font-bold font-title">{getUserTypeLabel(user?.type || '')}</h1>
          <p className="text-sidebar-foreground/80 mt-1">{getUserDescription(user?.type || '')}</p>
          <div className="mt-4 text-sm text-sidebar-foreground/70">Bem-vindo, {user?.name}!</div>
        </div>

        <div data-tour="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsForUser().map((stat, i) => <StatsCard key={i} title={stat.title} value={stat.value} icon={stat.icon} change={stat.change} changeType={stat.changeType} />)}
        </div>

        {expiringPropostas.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Propostas com Vencimento Próximo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expiringPropostas.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-accent/50 p-2 rounded" onClick={() => navigate('/propostas')}>
                    <span className="font-medium text-foreground">{p.titulo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatCurrency(p.valor || 0)}</span>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-500 text-xs">
                        Vence {new Date(p.data_validade!).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {quickActions.length > 0 && (
          <div data-tour="quick-actions" className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold font-title text-foreground mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} className="flex flex-col items-start p-4 border border-border rounded-lg hover:border-primary hover:bg-accent/20 transition-colors group text-left">
                  <div className="flex items-center mb-2"><action.icon className="w-6 h-6 mr-3 text-muted-foreground group-hover:text-primary" /><span className="font-medium text-foreground group-hover:text-primary">{action.label}</span></div>
                  <span className="text-sm text-muted-foreground">{action.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><RecentProjects /></div>
          <Card>
            <CardHeader><CardTitle className="text-base">{user?.type === 'cliente' ? 'Resumo Pessoal' : 'Resumo Mensal'}</CardTitle></CardHeader>
            <CardContent>
              {miniChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={miniChartData}>
                    <XAxis dataKey="mes" className="text-xs" />
                    <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} className="text-xs" />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Dados em tempo real do Supabase</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <WelcomeModal open={tour.showWelcome} userName={user?.name || ''} userType={user?.type || ''} onStartTour={() => tour.startTour(tourSteps.length)} onSkip={tour.skipTour} />
      <ProductTour steps={tourSteps} currentStep={tour.currentStep} isActive={tour.isActive} onNext={tour.nextStep} onPrev={tour.prevStep} onSkip={tour.skipTour} />
    </MainLayout>
  );
};

export default Dashboard;
