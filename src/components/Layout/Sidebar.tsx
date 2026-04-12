
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, UserType } from '@/contexts/AuthContext';
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
  ArrowLeft,
  HardHat,
  DollarSign,
  Briefcase,
  UserCheck,
  Ruler,
  UserCog
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useAllUserPermissions } from '@/hooks/usePermissoesPerfil';

// Map paths to module names in permissoes_perfil
const PATH_TO_MODULE: Record<string, string> = {
  '/propostas': 'propostas',
  '/medicoes': 'medicoes',
  '/colaboradores': 'colaboradores',
  '/epis': 'epis',
  '/horas-extras': 'horas_extras',
  '/materiais-equipamentos': 'materiais',
  '/programacao': 'programacoes',
  '/lancamento-despesas': 'despesas',
  '/boletins-medicao': 'boletins',
  '/alteracoes-escopo': 'alteracoes_escopo',
  '/relatorio-diario-obra': 'relatorios_diarios',
  '/relatorios-obra': 'relatorios_obra',
  '/valores-unitarios': 'valores_unitarios',
  '/aceites': 'aceites',
  '/modelos-contrato': 'modelos_contrato',
  '/relatorios-comerciais': 'relatorios_comerciais',
  '/financeiro': 'financeiro',
  '/retencoes': 'retencoes',
  '/fechamento-mensal': 'fechamento_mensal',
  '/exportar-dados': 'exportar_dados',
  '/relatorios-financeiros': 'relatorios_financeiros',
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  show: boolean;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const IMPERSONATION_ROLES: { role: UserType; label: string; icon: React.ElementType; colorClass: string }[] = [
  { role: 'obras', label: 'Obras', icon: HardHat, colorClass: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' },
  { role: 'financeira', label: 'Financeiro', icon: DollarSign, colorClass: 'bg-green-500/20 text-green-400 hover:bg-green-500/30' },
  { role: 'comercial', label: 'Comercial', icon: Briefcase, colorClass: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' },
  { role: 'cliente', label: 'Cliente', icon: UserCheck, colorClass: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' },
];

const getAdminSections = (hasPermission: (p: string) => boolean): MenuSection[] => [
  {
    section: 'ADMINISTRAÇÃO',
    items: [
      { icon: Home, label: 'Dashboard', path: '/', show: true },
      { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', show: hasPermission('canManageUsers') },
      { icon: Shield, label: 'Permissões', path: '/permissoes', show: hasPermission('canManageUsers') },
      { icon: CheckSquare, label: 'Aprovações', path: '/aprovacoes', show: hasPermission('canApproveChanges') },
      { icon: Settings, label: 'Automação', path: '/automacao', show: hasPermission('canManageAutomation') },
      { icon: BarChart3, label: 'Relatórios Gerais', path: '/relatorios', show: hasPermission('canViewAllReports') },
    ],
  },
  {
    section: 'COMERCIAL',
    items: [
      { icon: FileText, label: 'Propostas', path: '/propostas', show: true },
      { icon: Package, label: 'Valores Unitários', path: '/valores-unitarios', show: true },
      { icon: CheckSquare, label: 'Aceites Digitais', path: '/aceites', show: true },
      { icon: ClipboardList, label: 'Modelos de Contrato', path: '/modelos-contrato', show: true },
      { icon: BarChart3, label: 'Relatórios Comerciais', path: '/relatorios-comerciais', show: true },
    ],
  },
  {
    section: 'OBRAS',
    items: [
      { icon: Calendar, label: 'Programação', path: '/programacao', show: true },
      { icon: Ruler, label: 'Medições', path: '/medicoes', show: true },
      { icon: FileText, label: 'Alterações de Escopo', path: '/alteracoes-escopo', show: true },
      { icon: Package, label: 'Materiais e Equipamentos', path: '/materiais-equipamentos', show: true },
      { icon: Shield, label: 'EPIs', path: '/epis', show: true },
      { icon: Clock, label: 'Horas Extras', path: '/horas-extras', show: true },
      { icon: Clipboard, label: 'Relatório Diário de Obra', path: '/relatorio-diario-obra', show: true },
      { icon: BarChart3, label: 'Relatórios de Obra', path: '/relatorios-obra', show: true },
      { icon: UserCog, label: 'Colaboradores', path: '/colaboradores', show: true },
    ],
  },
  {
    section: 'FINANCEIRO',
    items: [
      { icon: Wallet, label: 'Controle Financeiro', path: '/financeiro', show: true },
      { icon: ClipboardList, label: 'Boletins de Medição', path: '/boletins-medicao', show: true },
      { icon: Wallet, label: 'Lançamento de Despesas', path: '/lancamento-despesas', show: true },
      { icon: Clock, label: 'Controle de Retenções', path: '/retencoes', show: true },
      { icon: FileText, label: 'Fechamento Mensal', path: '/fechamento-mensal', show: true },
      { icon: FileText, label: 'Exportar Dados', path: '/exportar-dados', show: true },
      { icon: BarChart3, label: 'Relatórios Financeiros', path: '/relatorios-financeiros', show: true },
    ],
  },
  {
    section: 'CLIENTE',
    items: [
      { icon: Calendar, label: 'Solicitar Programação', path: '/solicitar-agendamento', show: true },
      { icon: ClipboardList, label: 'Minhas Obras', path: '/minhas-obras', show: true },
      { icon: FileText, label: 'Minhas Propostas', path: '/minhas-propostas', show: true },
      { icon: BarChart3, label: 'Meus Relatórios', path: '/meus-relatorios', show: true },
      { icon: Wallet, label: 'Meus Pagamentos', path: '/meus-pagamentos', show: true },
    ],
  },
];

const getGerenciadorSections = (): MenuSection[] => [
  {
    section: 'ADMINISTRAÇÃO',
    items: [
      { icon: Home, label: 'Dashboard', path: '/', show: true },
      { icon: Users, label: 'Gerenciar Usuários', path: '/usuarios', show: true },
      { icon: Shield, label: 'Permissões', path: '/permissoes', show: true },
      { icon: CheckSquare, label: 'Aprovações', path: '/aprovacoes', show: true },
      { icon: Settings, label: 'Automação', path: '/automacao', show: true },
      { icon: BarChart3, label: 'Relatórios Gerais', path: '/relatorios', show: true },
    ],
  },
];

const getFlatMenuByRole = (role: UserType, hasPermission: (p: string) => boolean): MenuItem[] => {
  if (role === 'obras') {
    return [
      { icon: Home, label: 'Dashboard', path: '/', show: true },
      { icon: Calendar, label: 'Programação', path: '/programacao', show: true },
      { icon: Ruler, label: 'Medições', path: '/medicoes', show: true },
      { icon: FileText, label: 'Alterações de Escopo', path: '/alteracoes-escopo', show: true },
      { icon: Package, label: 'Materiais e Equipamentos', path: '/materiais-equipamentos', show: true },
      { icon: Shield, label: 'EPIs', path: '/epis', show: true },
      { icon: Clock, label: 'Horas Extras', path: '/horas-extras', show: true },
      { icon: Clipboard, label: 'Relatório Diário de Obra', path: '/relatorio-diario-obra', show: true },
      { icon: BarChart3, label: 'Relatórios de Obra', path: '/relatorios-obra', show: true },
      { icon: UserCog, label: 'Colaboradores', path: '/colaboradores', show: true },
    ];
  }

  if (role === 'financeira') {
    return [
      { icon: Home, label: 'Dashboard', path: '/', show: true },
      { icon: ClipboardList, label: 'Boletins de Medição', path: '/boletins-medicao', show: true },
      { icon: Wallet, label: 'Controle Financeiro', path: '/financeiro', show: true },
      { icon: BarChart3, label: 'Relatórios Financeiros', path: '/relatorios-financeiros', show: true },
      { icon: FileText, label: 'Exportar Dados', path: '/exportar-dados', show: true },
      { icon: Clock, label: 'Controle de Retenções', path: '/retencoes', show: true },
      { icon: FileText, label: 'Fechamento Mensal', path: '/fechamento-mensal', show: true },
      { icon: Wallet, label: 'Lançamento de Despesas', path: '/lancamento-despesas', show: true },
    ];
  }

  if (role === 'comercial') {
    return [
      { icon: Home, label: 'Dashboard', path: '/', show: true },
      { icon: FileText, label: 'Propostas', path: '/propostas', show: true },
      { icon: Package, label: 'Valores Unitários', path: '/valores-unitarios', show: true },
      { icon: CheckSquare, label: 'Aceites Digitais', path: '/aceites', show: true },
      { icon: ClipboardList, label: 'Modelos de Contrato', path: '/modelos-contrato', show: true },
      { icon: BarChart3, label: 'Relatórios Comerciais', path: '/relatorios-comerciais', show: true },
    ];
  }

  if (role === 'cliente') {
    return [
      { icon: Home, label: 'Dashboard', path: '/', show: true },
      { icon: Calendar, label: 'Solicitar Programação', path: '/solicitar-agendamento', show: true },
      { icon: ClipboardList, label: 'Minhas Obras', path: '/minhas-obras', show: true },
      { icon: FileText, label: 'Minhas Propostas', path: '/minhas-propostas', show: true },
      { icon: Wallet, label: 'Meus Pagamentos', path: '/meus-pagamentos', show: true },
      { icon: BarChart3, label: 'Meus Relatórios', path: '/meus-relatorios', show: true },
    ];
  }

  return [{ icon: Home, label: 'Dashboard', path: '/', show: true }];
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, hasPermission, logout, impersonatedRole, effectiveType, startImpersonation, stopImpersonation } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { hasModuleAccess } = useAllUserPermissions();

  if (!user) return null;

  const isDemo = user.isDemo ?? false;

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  const handleStartImpersonation = (role: UserType) => {
    startImpersonation(role);
    navigate('/');
    if (isMobile && onClose) onClose();
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
    navigate('/');
    if (isMobile && onClose) onClose();
  };

  const isGerenciadorBase = (user.type === 'gerenciador_tecnico' || isDemo) && !impersonatedRole;
  const isAdminBase = user.type === 'admin' && !impersonatedRole;

  // Determine if we use sectioned or flat menu
  const useSections = isAdminBase || isGerenciadorBase;

  const getSections = (): MenuSection[] => {
    if (isAdminBase) return getAdminSections(hasPermission);
    if (isGerenciadorBase) return getGerenciadorSections();
    return [];
  };

  const getFlatItems = (): MenuItem[] => {
    if (impersonatedRole) return getFlatMenuByRole(impersonatedRole, hasPermission);
    return getFlatMenuByRole(user.type, hasPermission);
  };

  const getTourId = (path: string): string | null => {
    const map: Record<string, string> = {
      '/usuarios': 'sidebar-usuarios',
      '/permissoes': 'sidebar-permissoes',
      '/aprovacoes': 'sidebar-aprovacoes',
      '/programacao': 'sidebar-programacao',
      '/medicoes': 'sidebar-medicoes',
      '/boletins-medicao': 'sidebar-boletins',
      '/financeiro': 'sidebar-financeiro',
      '/propostas': 'sidebar-propostas',
      '/valores-unitarios': 'sidebar-valores',
      '/minhas-obras': 'sidebar-minhas-obras',
      '/solicitar-agendamento': 'sidebar-agendamento',
    };
    return map[path] || null;
  };

  const getUserTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      admin: 'text-red-400',
      gerenciador_tecnico: 'text-cyan-400',
      obras: 'text-orange-400',
      financeira: 'text-green-400',
      comercial: 'text-blue-400',
      cliente: 'text-purple-400'
    };
    return colors[type] || 'text-blue-400';
  };

  const getUserTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      admin: 'Admin Master',
      gerenciador_tecnico: 'Gerenciador Técnico',
      obras: 'Obras',
      financeira: 'Financeiro',
      comercial: 'Comercial',
      cliente: 'Cliente'
    };
    return types[type] || type;
  };

  const displayType = impersonatedRole
    ? `${getUserTypeLabel(impersonatedRole)} (Agente)`
    : getUserTypeLabel(user.type);

  const displayTypeColor = impersonatedRole
    ? getUserTypeColor(impersonatedRole)
    : getUserTypeColor(user.type);

  const renderAgentSection = () => {
    if (user.type !== 'gerenciador_tecnico' && user.type !== 'admin' && !isDemo) return null;

    if (impersonatedRole) {
      return (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <button
            onClick={handleStopImpersonation}
            className="flex items-center w-full px-3 py-2.5 text-sm font-body font-medium rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Gerenciador
          </button>
        </div>
      );
    }

    return (
      <div className="px-4 py-3 border-b border-sidebar-border">
        <p className="text-xs font-body font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-1">
          Agente Temporário
        </p>
        <div className="grid grid-cols-2 gap-2">
          {IMPERSONATION_ROLES.map(({ role, label, icon: Icon, colorClass }) => (
            <button
              key={role}
              onClick={() => handleStartImpersonation(role)}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-body font-medium rounded-lg transition-colors ${colorClass}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderNavLink = (item: MenuItem) => {
    const tourId = getTourId(item.path);
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={handleNavClick}
        {...(tourId ? { 'data-tour': tourId } : {})}
        className={({ isActive }) =>
          `flex items-center px-6 py-2.5 text-sm font-body font-medium transition-colors hover:bg-sidebar-accent ${
            isActive ? 'bg-sidebar-primary border-r-4 border-sidebar-ring text-sidebar-primary-foreground' : 'text-sidebar-foreground'
          }`
        }
      >
        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
        {item.label}
      </NavLink>
    );
  };

  const renderSectionedNav = () => {
    const sections = getSections();
    return (
      <nav className="mt-2 pb-4">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter(i => {
            if (!i.show) return false;
            const modulo = PATH_TO_MODULE[i.path];
            if (modulo && !hasModuleAccess(modulo)) return false;
            return true;
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.section} className={idx > 0 ? 'mt-2' : ''}>
              <div className="px-6 py-2">
                <p className="text-[10px] font-body font-bold text-sidebar-foreground/40 uppercase tracking-[0.15em]">
                  {section.section}
                </p>
              </div>
              <div className="mx-3 rounded-lg bg-sidebar-accent/30 py-1">
                {visibleItems.map(renderNavLink)}
              </div>
            </div>
          );
        })}
      </nav>
    );
  };

  const renderFlatNav = () => {
    const items = getFlatItems().filter(i => {
      if (!i.show) return false;
      const modulo = PATH_TO_MODULE[i.path];
      if (modulo && !hasModuleAccess(modulo)) return false;
      return true;
    });
    return (
      <nav className="mt-4">
        {items.map(renderNavLink)}
      </nav>
    );
  };

  const sidebarContent = (
    <>
      {isDemo && (
        <div className="bg-amber-500 text-white text-center py-1.5 text-xs font-body font-bold uppercase tracking-wider">
          🔒 Modo Demonstração
        </div>
      )}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <img src={logotipo} alt="CT Guedes" className="h-10 brightness-0 invert" />
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        <p className="text-sm font-body text-sidebar-foreground/70 mt-1">Sistema de Obras</p>
        
        <div className="mt-4 rounded-xl p-5" style={{ backgroundColor: '#89846b' }}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-body font-bold text-white truncate">{user.name}</p>
              <p className={`text-sm font-body italic mt-1 truncate ${displayTypeColor}`}>
                {displayType}
              </p>
            </div>
          </div>
        </div>
      </div>

      {renderAgentSection()}
      
      <ScrollArea className="flex-1">
        {useSections ? renderSectionedNav() : renderFlatNav()}
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
    </>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
        <div className={`w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 shadow-xl flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div data-tour="sidebar" className="w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 shadow-xl flex flex-col">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
