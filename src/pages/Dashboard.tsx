import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentProjects from '../components/Dashboard/RecentProjects';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useSupabaseData';
import { useTour } from '@/hooks/useTour';
import { getTourSteps } from '@/components/Tour/tourSteps';
import WelcomeModal from '@/components/Tour/WelcomeModal';
import ProductTour from '@/components/Tour/ProductTour';
import { 
  Calendar, ClipboardList, FileText, Clock, Wallet, Package,
  CheckSquare, BarChart3, Users, Settings, Shield
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();

  const tour = useTour(user?.id);
  const tourSteps = getTourSteps(user?.type || '');

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
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold font-title text-foreground mb-4">{user?.type === 'cliente' ? 'Resumo Pessoal' : 'Resumo Mensal'}</h3>
            <div className="text-center py-8 text-muted-foreground"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Dados em tempo real do Supabase</p></div>
          </div>
        </div>
      </div>

      <WelcomeModal
        open={tour.showWelcome}
        userName={user?.name || ''}
        userType={user?.type || ''}
        onStartTour={() => tour.startTour(tourSteps.length)}
        onSkip={tour.skipTour}
      />

      <ProductTour
        steps={tourSteps}
        currentStep={tour.currentStep}
        isActive={tour.isActive}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />
    </MainLayout>
  );
};

export default Dashboard;
