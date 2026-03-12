export interface TourStep {
  selector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const getTourSteps = (userType: string): TourStep[] => {
  const commonStart: TourStep[] = [
    {
      selector: '[data-tour="sidebar"]',
      title: 'Menu de Navegação',
      description: 'Use o menu lateral para acessar todas as funcionalidades do sistema. Ele está organizado por módulos.',
      position: 'right',
    },
    {
      selector: '[data-tour="dashboard-stats"]',
      title: 'Painel de Indicadores',
      description: 'Aqui você acompanha os principais números em tempo real: obras, medições, propostas e mais.',
      position: 'bottom',
    },
  ];

  const commonEnd: TourStep[] = [
    {
      selector: '[data-tour="notifications"]',
      title: 'Notificações',
      description: 'Fique por dentro de tudo! Alertas de aprovações, mudanças e atualizações aparecem aqui.',
      position: 'bottom',
    },
  ];

  const stepsByType: Record<string, TourStep[]> = {
    admin: [
      ...commonStart,
      {
        selector: '[data-tour="quick-actions"]',
        title: 'Ações Rápidas',
        description: 'Atalhos para as tarefas mais importantes. Como Admin, você tem acesso a gerenciamento de usuários, permissões e aprovações.',
        position: 'top',
      },
      {
        selector: '[data-tour="sidebar-usuarios"]',
        title: 'Gerenciar Usuários',
        description: 'Crie, edite e remova usuários do sistema. Defina o tipo de acesso de cada membro da equipe.',
        position: 'right',
      },
      {
        selector: '[data-tour="sidebar-permissoes"]',
        title: 'Permissões',
        description: 'Controle granular de acesso. Defina o que cada tipo de usuário pode ver e fazer no sistema.',
        position: 'right',
      },
      {
        selector: '[data-tour="sidebar-aprovacoes"]',
        title: 'Aprovações',
        description: 'Revise e aprove alterações de escopo, medições e outras solicitações da equipe.',
        position: 'right',
      },
      ...commonEnd,
    ],
    obras: [
      ...commonStart,
      {
        selector: '[data-tour="quick-actions"]',
        title: 'Ações Rápidas',
        description: 'Acesse rapidamente Programação, Medições e Alterações de Escopo — as principais ferramentas do dia a dia.',
        position: 'top',
      },
      {
        selector: '[data-tour="sidebar-programacao"]',
        title: 'Programação',
        description: 'Valide e acompanhe a programação de obras. Visualize as atividades agendadas para cada dia.',
        position: 'right',
      },
      {
        selector: '[data-tour="sidebar-medicoes"]',
        title: 'Medições',
        description: 'Registre o andamento das obras. Alimente percentuais de conclusão e observações de cada fase.',
        position: 'right',
      },
      ...commonEnd,
    ],
    financeira: [
      ...commonStart,
      {
        selector: '[data-tour="quick-actions"]',
        title: 'Ações Rápidas',
        description: 'Acesse Boletins de Medição e Controle Financeiro com um clique.',
        position: 'top',
      },
      {
        selector: '[data-tour="sidebar-boletins"]',
        title: 'Boletins de Medição',
        description: 'Gere e gerencie boletins para faturamento. Acompanhe o status de cada medição.',
        position: 'right',
      },
      {
        selector: '[data-tour="sidebar-financeiro"]',
        title: 'Controle Financeiro',
        description: 'Visão completa de receitas, despesas e fluxo de caixa por obra.',
        position: 'right',
      },
      ...commonEnd,
    ],
    comercial: [
      ...commonStart,
      {
        selector: '[data-tour="quick-actions"]',
        title: 'Ações Rápidas',
        description: 'Crie propostas e gerencie valores unitários diretamente daqui.',
        position: 'top',
      },
      {
        selector: '[data-tour="sidebar-propostas"]',
        title: 'Propostas',
        description: 'Elabore, edite e acompanhe propostas comerciais. Gerencie todo o ciclo de aprovação.',
        position: 'right',
      },
      {
        selector: '[data-tour="sidebar-valores"]',
        title: 'Valores Unitários',
        description: 'Cadastre e atualize a tabela de preços por serviço e por cliente.',
        position: 'right',
      },
      ...commonEnd,
    ],
    cliente: [
      ...commonStart,
      {
        selector: '[data-tour="quick-actions"]',
        title: 'Ações Rápidas',
        description: 'Solicite agendamentos, acompanhe suas obras e revise propostas rapidamente.',
        position: 'top',
      },
      {
        selector: '[data-tour="sidebar-minhas-obras"]',
        title: 'Minhas Obras',
        description: 'Acompanhe o status e progresso de todas as suas obras em tempo real.',
        position: 'right',
      },
      {
        selector: '[data-tour="sidebar-agendamento"]',
        title: 'Solicitar Agendamento',
        description: 'Solicite visitas ou programações de obra diretamente pelo sistema.',
        position: 'right',
      },
      ...commonEnd,
    ],
  };

  return stepsByType[userType] || commonStart;
};

export const getUserTypeWelcome = (type: string) => {
  const welcomes: Record<string, { role: string; description: string }> = {
    admin: {
      role: 'Administrador',
      description: 'Você tem acesso total ao sistema. Gerencie usuários, permissões, aprovações e acompanhe todos os indicadores.',
    },
    obras: {
      role: 'Equipe de Obras',
      description: 'Gerencie programações, medições, materiais e o dia a dia das obras com eficiência.',
    },
    financeira: {
      role: 'Equipe Financeira',
      description: 'Controle boletins de medição, fluxo financeiro, retenções e fechamentos mensais.',
    },
    comercial: {
      role: 'Equipe Comercial',
      description: 'Elabore propostas, gerencie valores unitários e acompanhe aceites digitais.',
    },
    cliente: {
      role: 'Cliente CT Guedes',
      description: 'Acompanhe suas obras, solicite agendamentos e revise propostas e pagamentos.',
    },
  };
  return welcomes[type] || { role: type, description: 'Bem-vindo ao sistema CT Guedes.' };
};
