
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

    // Administrador Pai - Acesso total
    if (user.type === 'admin') {
      actions.push(
        { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', description: 'Criar e remover usuários' },
        { icon: Shield, label: 'Definir Permissões', path: '/permissoes', description: 'Controlar acesso por setor' },
        { icon: CheckSquare, label: 'Aprovações Pendentes', path: '/aprovacoes', description: 'Aprovar alterações críticas' },
        { icon: Settings, label: 'Controle de Automação', path: '/automacao', description: 'Liberar ou pausar fluxos' },
        { icon: BarChart3, label: 'Relatórios Gerais', path: '/relatorios', description: 'Todos os indicadores' }
      );
    }

    // Equipe de Obras
    if (user.type === 'obras' || user.type === 'admin') {
      actions.push(
        { icon: Calendar, label: 'Confirmar Agendamentos', path: '/agendamentos', description: 'Validar programação de obras' },
        { icon: ClipboardList, label: 'Inserir Medições', path: '/medicoes', description: 'Alimentar andamento da obra' },
        { icon: FileText, label: 'Sugerir Alterações', path: '/alteracoes-escopo', description: 'Propor mudanças no escopo' }
      );
    }

    // Equipe Financeira
    if (user.type === 'financeira' || user.type === 'admin') {
      actions.push(
        { icon: Wallet, label: 'Boletins de Medição', path: '/boletins-medicao', description: 'Lançar medições para faturamento' },
        { icon: BarChart3, label: 'Relatórios Financeiros', path: '/relatorios-financeiros', description: 'Acompanhar receitas e retenções' },
        { icon: FileText, label: 'Exportar Planilhas', path: '/exportar-dados', description: 'Gerar dados para NF' }
      );
    }

    // Equipe Comercial
    if (user.type === 'comercial' || user.type === 'admin') {
      actions.push(
        { icon: FileText, label: 'Criar Propostas', path: '/propostas', description: 'Elaborar contratos e orçamentos' },
        { icon: Package, label: 'Gerenciar Valores', path: '/valores-unitarios', description: 'Cadastrar preços por cliente' },
        { icon: CheckSquare, label: 'Aceites Digitais', path: '/aceites', description: 'Controlar aprovações de cliente' }
      );
    }

    // Cliente CT Guedes
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
      {
        title: 'Obras Ativas',
        value: 12,
        icon: Calendar,
        change: '+2 este mês',
        changeType: 'positive' as const
      }
    ];

    switch (user.type) {
      case 'admin':
        return [
          ...baseStats,
          {
            title: 'Usuários no Sistema',
            value: 24,
            icon: Users,
            change: '+3 novos usuários',
            changeType: 'positive' as const
          },
          {
            title: 'Aprovações Pendentes',
            value: 5,
            icon: CheckSquare,
            change: '2 críticas',
            changeType: 'warning' as const
          },
          {
            title: 'Receita Total',
            value: 'R$ 285.400',
            icon: Wallet,
            change: '+22% vs mês anterior',
            changeType: 'positive' as const
          }
        ];
      
      case 'obras':
        return [
          ...baseStats,
          {
            title: 'Agendamentos Hoje',
            value: 8,
            icon: Calendar,
            change: '6 confirmados',
            changeType: 'positive' as const
          },
          {
            title: 'Medições Pendentes',
            value: 15,
            icon: ClipboardList,
            change: 'Para esta semana',
            changeType: 'neutral' as const
          },
          {
            title: 'Alterações Sugeridas',
            value: 3,
            icon: FileText,
            change: 'Aguardando aprovação',
            changeType: 'neutral' as const
          }
        ];
      
      case 'financeira':
        return [
          ...baseStats,
          {
            title: 'Medições do Mês',
            value: 'R$ 85.400',
            icon: ClipboardList,
            change: '+15% vs mês anterior',
            changeType: 'positive' as const
          },
          {
            title: 'Valores em Atraso',
            value: 'R$ 12.300',
            icon: Wallet,
            change: '3 clientes',
            changeType: 'warning' as const
          },
          {
            title: 'Retenções',
            value: 'R$ 8.900',
            icon: BarChart3,
            change: 'A receber',
            changeType: 'neutral' as const
          }
        ];
      
      case 'comercial':
        return [
          ...baseStats,
          {
            title: 'Propostas Pendentes',
            value: 8,
            icon: FileText,
            change: '3 aguardando resposta',
            changeType: 'neutral' as const
          },
          {
            title: 'Aceites este Mês',
            value: 12,
            icon: CheckSquare,
            change: 'R$ 142.000 aprovados',
            changeType: 'positive' as const
          },
          {
            title: 'Contratos Ativos',
            value: 28,
            icon: Package,
            change: '+4 este mês',
            changeType: 'positive' as const
          }
        ];
      
      case 'cliente':
        return [
          {
            title: 'Minhas Obras',
            value: 3,
            icon: Calendar,
            change: '1 em andamento',
            changeType: 'positive' as const
          },
          {
            title: 'Próximos Agendamentos',
            value: 2,
            icon: ClipboardList,
            change: 'Esta semana',
            changeType: 'neutral' as const
          },
          {
            title: 'Propostas Abertas',
            value: 1,
            icon: FileText,
            change: 'Aguardando resposta',
            changeType: 'warning' as const
          },
          {
            title: 'Valor Investido',
            value: 'R$ 45.200',
            icon: Wallet,
            change: 'Este ano',
            changeType: 'neutral' as const
          }
        ];
      
      default:
        return baseStats;
    }
  };

  const userStats = getStatsForUser();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header personalizado por tipo de usuário */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">{getUserTypeLabel(user?.type || '')}</h1>
          <p className="text-blue-100 mt-1">{getUserDescription(user?.type || '')}</p>
          <div className="mt-4 text-sm text-blue-200">
            Bem-vindo, {user?.name}!
          </div>
        </div>

        {/* Stats Grid personalizadas por usuário */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              change={stat.change}
              changeType={stat.changeType}
            />
          ))}
        </div>

        {/* Ações Rápidas baseadas em permissões */}
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
                    <span className="font-medium text-slate-700 group-hover:text-blue-600">
                      {action.label}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-slate-600">
                    {action.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rest of dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentProjects />
          </div>
          
          <div className="space-y-6">
            {/* Seção específica por tipo de usuário */}
            {user?.type === 'admin' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Aprovações Críticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-slate-900">Nova Forma de Pagamento</p>
                      <p className="text-sm text-slate-600">PIX para Cliente ABC - Requer aprovação</p>
                    </div>
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-slate-900">Alteração Contratual</p>
                      <p className="text-sm text-slate-600">Escopo personalizado - Obra Silva</p>
                    </div>
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>
            )}

            {user?.type === 'cliente' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Minhas Obras</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-slate-900">Obra Residencial</p>
                      <p className="text-sm text-slate-600">85% concluída - Em andamento</p>
                    </div>
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-slate-900">Proposta Galpão</p>
                      <p className="text-sm text-slate-600">Aguardando sua aprovação</p>
                    </div>
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats específicas */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Resumo {user?.type === 'cliente' ? 'Pessoal' : 'Mensal'}
              </h3>
              <div className="space-y-4">
                {user?.type === 'financeira' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Valores a Receber</span>
                      <span className="font-semibold text-green-600">R$ 127.300</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Retenções</span>
                      <span className="font-semibold text-yellow-600">R$ 8.900</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Em Atraso</span>
                      <span className="font-semibold text-red-600">R$ 12.300</span>
                    </div>
                  </>
                )}
                
                {user?.type === 'cliente' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Valor Total Investido</span>
                      <span className="font-semibold text-blue-600">R$ 45.200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Próximo Pagamento</span>
                      <span className="font-semibold text-slate-900">R$ 8.400</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Economia Gerada</span>
                      <span className="font-semibold text-green-600">R$ 12.800</span>
                    </div>
                  </>
                )}

                {(user?.type === 'obras' || user?.type === 'admin') && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Obras Concluídas</span>
                      <span className="font-semibold text-green-600">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Em Andamento</span>
                      <span className="font-semibold text-blue-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Agendadas</span>
                      <span className="font-semibold text-slate-900">8</span>
                    </div>
                  </>
                )}

                {user?.type === 'comercial' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Propostas Enviadas</span>
                      <span className="font-semibold text-blue-600">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Taxa de Conversão</span>
                      <span className="font-semibold text-green-600">67%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Valor Médio</span>
                      <span className="font-semibold text-slate-900">R$ 11.850</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
