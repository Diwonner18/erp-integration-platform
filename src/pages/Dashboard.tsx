
import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentProjects from '../components/Dashboard/RecentProjects';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ClipboardList, 
  FileText, 
  Clock, 
  Wallet, 
  Package,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const getUserTypeLabel = (type: string) => {
    const types = {
      admin: 'Administrador Pai',
      obras: 'Equipe de Obras',
      financeira: 'Equipe Financeira', 
      comercial: 'Equipe Comercial/Propostas',
      cliente: 'Cliente CT Guedes'
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserDescription = (type: string) => {
    const descriptions = {
      admin: 'Acesso total ao sistema - Gestão completa',
      obras: 'Programação e execução - Coordenação de campo',
      financeira: 'Medições e pagamentos - Controle financeiro', 
      comercial: 'Propostas e contratos - Gestão comercial',
      cliente: 'Acompanhamento de obras - Visualização restrita'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  const getQuickActions = () => {
    if (!user) return [];
    const actions = [];

    if (user.type === 'admin') {
      actions.push(
        { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', description: 'Criar e remover usuários' },
        { icon: Shield, label: 'Definir Permissões', path: '/permissoes', description: 'Controlar acesso por setor' },
        { icon: CheckSquare, label: 'Aprovações Pendentes', path: '/aprovacoes', description: 'Aprovar alterações críticas' },
        { icon: Settings, label: 'Controle de Automação', path: '/automacao', description: 'Liberar ou pausar fluxos' },
        { icon: BarChart3, label: 'Relatórios Gerais', path: '/relatorios', description: 'Todos os indicadores' }
      );
    }

    if (user.type === 'obras' || user.type === 'admin') {
      actions.push(
        { icon: Calendar, label: 'Confirmar Agendamentos', path: '/agendamentos', description: 'Validar programação de obras' },
        { icon: ClipboardList, label: 'Inserir Medições', path: '/medicoes', description: 'Alimentar andamento da obra' },
        { icon: FileText, label: 'Sugerir Alterações', path: '/alteracoes-escopo', description: 'Propor mudanças no escopo' }
      );
    }

    if (user.type === 'financeira' || user.type === 'admin') {
      actions.push(
        { icon: Wallet, label: 'Boletins de Medição', path: '/boletins-medicao', description: 'Lançar medições para faturamento' },
        { icon: BarChart3, label: 'Relatórios Financeiros', path: '/relatorios-financeiros', description: 'Acompanhar receitas e retenções' },
        { icon: FileText, label: 'Exportar Planilhas', path: '/exportar-dados', description: 'Gerar dados para NF' }
      );
    }

    if (user.type === 'comercial' || user.type === 'admin') {
      actions.push(
        { icon: FileText, label: 'Criar Propostas', path: '/propostas', description: 'Elaborar contratos e orçamentos' },
        { icon: Package, label: 'Gerenciar Valores', path: '/valores-unitarios', description: 'Cadastrar preços por cliente' },
        { icon: CheckSquare, label: 'Aceites Digitais', path: '/aceites', description: 'Controlar aprovações de cliente' }
      );
    }

    if (user.type === 'cliente') {
      actions.push(
        { icon: Calendar, label: 'Solicitar Agendamento', path: '/solicitar-agendamento', description: 'Programar nova obra' },
        { icon: ClipboardList, label: 'Acompanhar Obra', path: '/minhas-obras', description: 'Ver status e medições' },
        { icon: FileText, label: 'Minhas Propostas', path: '/minhas-propostas', description: 'Revisar e aceitar contratos' }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  const getStatsForUser = () => {
    if (!user) return [];

    const baseStats = [
      { title: 'Obras Ativas', value: 0, icon: Calendar, change: 'Sem dados', changeType: 'neutral' as const }
    ];

    switch (user.type) {
      case 'admin':
        return [
          ...baseStats,
          { title: 'Usuários no Sistema', value: 0, icon: Users, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Aprovações Pendentes', value: 0, icon: CheckSquare, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Receita Total', value: 'R$ 0', icon: Wallet, change: 'Sem dados', changeType: 'neutral' as const }
        ];
      case 'obras':
        return [
          ...baseStats,
          { title: 'Agendamentos Hoje', value: 0, icon: Calendar, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Medições Pendentes', value: 0, icon: ClipboardList, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Alterações Sugeridas', value: 0, icon: FileText, change: 'Sem dados', changeType: 'neutral' as const }
        ];
      case 'financeira':
        return [
          ...baseStats,
          { title: 'Medições do Mês', value: 'R$ 0', icon: ClipboardList, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Valores em Atraso', value: 'R$ 0', icon: Wallet, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Retenções', value: 'R$ 0', icon: BarChart3, change: 'Sem dados', changeType: 'neutral' as const }
        ];
      case 'comercial':
        return [
          ...baseStats,
          { title: 'Propostas Pendentes', value: 0, icon: FileText, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Aceites este Mês', value: 0, icon: CheckSquare, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Contratos Ativos', value: 0, icon: Package, change: 'Sem dados', changeType: 'neutral' as const }
        ];
      case 'cliente':
        return [
          { title: 'Minhas Obras', value: 0, icon: Calendar, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Próximos Agendamentos', value: 0, icon: ClipboardList, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Propostas Abertas', value: 0, icon: FileText, change: 'Sem dados', changeType: 'neutral' as const },
          { title: 'Valor Investido', value: 'R$ 0', icon: Wallet, change: 'Sem dados', changeType: 'neutral' as const }
        ];
      default:
        return baseStats;
    }
  };

  const userStats = getStatsForUser();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">{getUserTypeLabel(user?.type || '')}</h1>
          <p className="text-blue-100 mt-1">{getUserDescription(user?.type || '')}</p>
          <div className="mt-4 text-sm text-blue-200">
            Bem-vindo, {user?.name}!
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} change={stat.change} changeType={stat.changeType} />
          ))}
        </div>

        {quickActions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Ações Rápidas - {getUserTypeLabel(user?.type || '')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-start p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group text-left"
                >
                  <div className="flex items-center mb-2">
                    <action.icon className="w-6 h-6 mr-3 text-slate-400 group-hover:text-blue-500" />
                    <span className="font-medium text-slate-700 group-hover:text-blue-600">{action.label}</span>
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-slate-600">{action.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentProjects />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Resumo {user?.type === 'cliente' ? 'Pessoal' : 'Mensal'}
              </h3>
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sem dados disponíveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
