
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  ClipboardList, 
  FileText, 
  BarChart3, 
  Clock, 
  Wallet, 
  Package,
  CheckSquare,
  Home,
  Users,
  Settings,
  Shield,
  Clipboard,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/', show: true }
    ];

    // Administrador Pai - Acesso completo
    if (user.type === 'admin') {
      return [
        ...baseItems,
        { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', show: hasPermission('canManageUsers') },
        { icon: Shield, label: 'Permissões', path: '/permissoes', show: hasPermission('canManageUsers') },
        { icon: CheckSquare, label: 'Aprovações', path: '/aprovacoes', show: hasPermission('canApproveChanges') },
        { icon: Settings, label: 'Automação', path: '/automacao', show: hasPermission('canManageAutomation') },
        { icon: Calendar, label: 'Agendamentos', path: '/agendamentos', show: true },
        { icon: FileText, label: 'Propostas', path: '/propostas', show: true },
        { icon: ClipboardList, label: 'Medições', path: '/medicoes', show: true },
        { icon: BarChart3, label: 'Relatórios', path: '/relatorios', show: hasPermission('canViewAllReports') },
        { icon: Clock, label: 'Horas Extras', path: '/horas-extras', show: true },
        { icon: Wallet, label: 'Financeiro', path: '/financeiro', show: hasPermission('canAccessFinancialData') },
        { icon: Package, label: 'Materiais e Equipamentos', path: '/materiais-equipamentos', show: true },
        { icon: Shield, label: 'EPIs', path: '/epis', show: true },
        { icon: Clipboard, label: 'Relatório Diário de Obra', path: '/relatorio-diario-obra', show: true },
      ];
    }

    // Equipe de Obras
    if (user.type === 'obras') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'Agendamentos', path: '/agendamentos', show: hasPermission('canConfirmSchedules') },
        { icon: ClipboardList, label: 'Medições', path: '/medicoes', show: hasPermission('canInsertMeasurements') },
        { icon: FileText, label: 'Alterações de Escopo', path: '/alteracoes-escopo', show: hasPermission('canSuggestScopeChanges') },
        { icon: Package, label: 'Materiais e Equipamentos', path: '/materiais-equipamentos', show: true },
        { icon: Shield, label: 'EPIs', path: '/epis', show: true },
        { icon: Clock, label: 'Horas Extras', path: '/horas-extras', show: true },
        { icon: Clipboard, label: 'Relatório Diário de Obra', path: '/relatorio-diario-obra', show: true },
        { icon: BarChart3, label: 'Relatórios de Obra', path: '/relatorios-obra', show: true },
      ];
    }

    // Equipe Financeira
    if (user.type === 'financeira') {
      return [
        ...baseItems,
        { icon: ClipboardList, label: 'Boletins de Medição', path: '/boletins-medicao', show: hasPermission('canIssueMeasurementBulletins') },
        { icon: Wallet, label: 'Controle Financeiro', path: '/financeiro', show: hasPermission('canAccessFinancialData') },
        { icon: BarChart3, label: 'Relatórios Financeiros', path: '/relatorios-financeiros', show: hasPermission('canExportReports') },
        { icon: FileText, label: 'Exportar Dados', path: '/exportar-dados', show: hasPermission('canExportReports') },
        { icon: Clock, label: 'Controle de Retenções', path: '/retencoes', show: hasPermission('canAccessFinancialData') },
        { icon: FileText, label: 'Fechamento Mensal', path: '/fechamento-mensal', show: hasPermission('canAccessFinancialData') },
        { icon: Wallet, label: 'Lançamento de Despesas', path: '/lancamento-despesas', show: hasPermission('canAccessFinancialData') },
      ];
    }

    // Equipe Comercial
    if (user.type === 'comercial') {
      return [
        ...baseItems,
        { icon: FileText, label: 'Propostas', path: '/propostas', show: hasPermission('canCreateProposals') },
        { icon: Package, label: 'Valores Unitários', path: '/valores-unitarios', show: hasPermission('canManageUnitValues') },
        { icon: CheckSquare, label: 'Aceites Digitais', path: '/aceites', show: hasPermission('canManageContracts') },
        { icon: ClipboardList, label: 'Modelos de Contrato', path: '/modelos-contrato', show: hasPermission('canManageContracts') },
        { icon: BarChart3, label: 'Relatórios Comerciais', path: '/relatorios-comerciais', show: true },
      ];
    }

    // Cliente CT Guedes
    if (user.type === 'cliente') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'Solicitar Agendamento', path: '/solicitar-agendamento', show: hasPermission('canScheduleWorks') },
        { icon: ClipboardList, label: 'Minhas Obras', path: '/minhas-obras', show: hasPermission('canViewOwnData') },
        { icon: FileText, label: 'Minhas Propostas', path: '/minhas-propostas', show: hasPermission('canViewOwnData') },
        { icon: BarChart3, label: 'Meus Relatórios', path: '/meus-relatorios', show: hasPermission('canViewOwnData') },
        { icon: Wallet, label: 'Meus Pagamentos', path: '/meus-pagamentos', show: hasPermission('canViewOwnData') },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems().filter(item => item.show);

  const getUserTypeColor = (type: string) => {
    const colors = {
      admin: 'text-red-400',
      obras: 'text-orange-400',
      financeira: 'text-green-400',
      comercial: 'text-blue-400',
      cliente: 'text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'text-blue-400';
  };

  const getUserTypeLabel = (type: string) => {
    const types = {
      admin: 'Admin Master',
      obras: 'Obras',
      financeira: 'Financeiro',
      comercial: 'Comercial',
      cliente: 'Cliente'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 shadow-xl flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-title font-bold text-sidebar-primary">CT Guedes</h1>
        <p className="text-sm font-body text-sidebar-foreground/70 mt-1">Sistema de Obras</p>
        
        {/* Caixa "Logado como" com design melhorado */}
        <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: '#d6d9c9' }}>
          <p className="text-xs font-body text-sidebar-foreground/70 mb-2">Logado como:</p>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <User className="w-5 h-5 text-sidebar-foreground/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-bold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs font-body italic mt-1 truncate" style={{ color: '#89846b' }}>
                {getUserTypeLabel(user.type)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-body font-medium transition-colors hover:bg-sidebar-accent ${
                  isActive ? 'bg-sidebar-primary border-r-4 border-sidebar-ring text-sidebar-primary-foreground' : 'text-sidebar-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

    </div>
  );
};

export default Sidebar;
