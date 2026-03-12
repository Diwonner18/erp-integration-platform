
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import logotipo from '@/assets/logotipo.png';
import { toast } from 'sonner';
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
  User,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, hasPermission, logout } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/', show: true }
    ];

    if (user.type === 'admin') {
      return [
        ...baseItems,
        { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', show: hasPermission('canManageUsers') },
        { icon: Shield, label: 'Permissões', path: '/permissoes', show: hasPermission('canManageUsers') },
        { icon: CheckSquare, label: 'Aprovações', path: '/aprovacoes', show: hasPermission('canApproveChanges') },
        { icon: Settings, label: 'Automação', path: '/automacao', show: hasPermission('canManageAutomation') },
        { icon: Calendar, label: 'Programação', path: '/programacao', show: true },
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

    if (user.type === 'obras') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'Programação', path: '/programacao', show: hasPermission('canConfirmSchedules') },
        { icon: ClipboardList, label: 'Medições', path: '/medicoes', show: hasPermission('canInsertMeasurements') },
        { icon: FileText, label: 'Alterações de Escopo', path: '/alteracoes-escopo', show: hasPermission('canSuggestScopeChanges') },
        { icon: Package, label: 'Materiais e Equipamentos', path: '/materiais-equipamentos', show: true },
        { icon: Shield, label: 'EPIs', path: '/epis', show: true },
        { icon: Clock, label: 'Horas Extras', path: '/horas-extras', show: true },
        { icon: Clipboard, label: 'Relatório Diário de Obra', path: '/relatorio-diario-obra', show: true },
        { icon: BarChart3, label: 'Relatórios de Obra', path: '/relatorios-obra', show: true },
      ];
    }

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

    if (user.type === 'cliente') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'Solicitar Programação', path: '/solicitar-agendamento', show: hasPermission('canScheduleWorks') },
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

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
        {/* Drawer */}
        <div className={`w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 shadow-xl flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <img src={logotipo} alt="CT Guedes" className="h-10 brightness-0 invert" />
              <Button variant="ghost" size="sm" onClick={onClose} className="text-sidebar-foreground hover:bg-sidebar-accent">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm font-body text-sidebar-foreground/70 mt-1">Sistema de Obras</p>
            
            <div className="mt-4 rounded-xl p-5" style={{ backgroundColor: '#89846b' }}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-body font-bold text-white truncate">{user.name}</p>
                  <p className={`text-sm font-body italic mt-1 truncate ${getUserTypeColor(user.type)}`}>
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
                  onClick={handleNavClick}
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

          {/* Bottom actions */}
          <div className="border-t border-sidebar-border p-4 space-y-1">
            <NavLink
              to="/configuracoes"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-body font-medium rounded-md transition-colors hover:bg-sidebar-accent ${
                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground'
                }`
              }
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-body font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 shadow-xl flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <img src={logotipo} alt="CT Guedes" className="h-10 brightness-0 invert" />
        <p className="text-sm font-body text-sidebar-foreground/70 mt-1">Sistema de Obras</p>
        
        <div className="mt-4 rounded-xl p-5" style={{ backgroundColor: '#89846b' }}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-body font-bold text-white truncate">{user.name}</p>
              <p className={`text-sm font-body italic mt-1 truncate ${getUserTypeColor(user.type)}`}>
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

      {/* Bottom actions */}
      <div className="border-t border-sidebar-border p-4 space-y-1">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm font-body font-medium rounded-md transition-colors hover:bg-sidebar-accent ${
              isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground'
            }`
          }
        >
          <Settings className="w-4 h-4 mr-3" />
          Configurações
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-body font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
