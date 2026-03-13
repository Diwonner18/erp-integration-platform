import { TourStep } from './tourSteps';

export const getPageTourSteps = (pathname: string): TourStep[] => {
  const stepsMap: Record<string, TourStep[]> = {
    '/programacao': [
      { selector: '[data-tour="page-header"]', title: 'Programação de Obras', description: 'Aqui você gerencia toda a programação e execução das obras. Crie, edite e confirme programações.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Nova Programação', description: 'Clique aqui para criar uma nova programação, selecionando obra, data e responsável.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros Avançados', description: 'Filtre por obra, período e status para encontrar programações rapidamente.', position: 'bottom' },
      { selector: '[data-tour="page-search"]', title: 'Busca Rápida', description: 'Pesquise por descrição, responsável ou nome da obra.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Programações', description: 'Visualize todas as programações. Confirme, edite ou veja detalhes de cada uma.', position: 'top' },
    ],
    '/medicoes': [
      { selector: '[data-tour="page-header"]', title: 'Medições', description: 'Controle todas as medições das obras. Aprove, rejeite e exporte dados.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Nova Medição', description: 'Crie uma nova medição para registrar o avanço da obra.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros', description: 'Filtre medições por obra, período e status.', position: 'bottom' },
      { selector: '[data-tour="page-export"]', title: 'Exportar Dados', description: 'Exporte medições em PDF ou Excel para relatórios e auditoria.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Medições', description: 'Visualize, aprove ou rejeite medições. Clique no olho para ver detalhes.', position: 'top' },
    ],
    '/alteracoes-escopo': [
      { selector: '[data-tour="page-header"]', title: 'Alterações de Escopo', description: 'Gerencie sugestões e aprovações de mudanças no escopo das obras.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Nova Sugestão', description: 'Sugira uma alteração de escopo para uma obra.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros', description: 'Filtre por obra, período e status da alteração.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Alterações', description: 'Aprove ou rejeite alterações pendentes diretamente na lista.', position: 'top' },
    ],
    '/materiais-equipamentos': [
      { selector: '[data-tour="page-header"]', title: 'Materiais e Equipamentos', description: 'Controle unificado de todos os recursos das obras.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Resumo', description: 'Veja totais de materiais, equipamentos, valor em estoque e itens pendentes.', position: 'bottom' },
      { selector: '[data-tour="page-search"]', title: 'Busca', description: 'Busque materiais ou equipamentos por nome ou fornecedor.', position: 'bottom' },
      { selector: '[data-tour="page-tabs"]', title: 'Abas', description: 'Alterne entre Materiais e Equipamentos para gerenciar cada tipo.', position: 'bottom' },
    ],
    '/materiais': [
      { selector: '[data-tour="page-header"]', title: 'Controle de Materiais', description: 'Gerencie o estoque e os materiais de todas as obras.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Adicionar Material', description: 'Cadastre novos materiais vinculados a uma obra.', position: 'bottom' },
      { selector: '[data-tour="page-search"]', title: 'Busca', description: 'Encontre materiais por nome ou fornecedor.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Materiais', description: 'Edite, exclua ou acompanhe o status de cada material.', position: 'top' },
    ],
    '/epis': [
      { selector: '[data-tour="page-header"]', title: 'Controle de EPIs', description: 'Registro e acompanhamento de Equipamentos de Proteção Individual.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Registrar EPI', description: 'Registre a entrega de EPIs para os colaboradores.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Indicadores', description: 'Veja totais, vencidos, próximos do vencimento e colaboradores atendidos.', position: 'bottom' },
      { selector: '[data-tour="page-tabs"]', title: 'Abas', description: 'Alterne entre Registros e Relatórios para análise detalhada.', position: 'bottom' },
    ],
    '/horas-extras': [
      { selector: '[data-tour="page-header"]', title: 'Horas Extras', description: 'Registre e acompanhe horas extras dos funcionários.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Registrar Horas', description: 'Lance novas horas extras para um funcionário.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros', description: 'Filtre por obra, período e status de aprovação.', position: 'bottom' },
      { selector: '[data-tour="page-export"]', title: 'Exportar', description: 'Exporte os dados em PDF ou Excel.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Registros', description: 'Visualize e aprove horas extras pendentes.', position: 'top' },
    ],
    '/relatorio-diario-obra': [
      { selector: '[data-tour="page-header"]', title: 'Relatório Diário', description: 'Registro operacional e circunstancial das obras no dia a dia.', position: 'bottom' },
      { selector: '[data-tour="page-tabs"]', title: 'Abas', description: 'Alterne entre criar novo registro e visualizar relatórios anteriores.', position: 'bottom' },
    ],
    '/obras-em-andamento': [
      { selector: '[data-tour="page-header"]', title: 'Obras em Andamento', description: 'Acompanhe o progresso de todas as obras ativas.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Obras', description: 'Veja escopo, data prevista e progresso de cada obra. Acesse observações por fase.', position: 'top' },
    ],
    '/obras-concluidas': [
      { selector: '[data-tour="page-header"]', title: 'Obras Concluídas', description: 'Histórico completo de obras finalizadas.', position: 'bottom' },
      { selector: '[data-tour="page-search"]', title: 'Busca', description: 'Busque por nome, cliente ou endereço.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Tabela', description: 'Consulte dados de início e conclusão de cada obra.', position: 'top' },
    ],
    '/obras-agendadas': [
      { selector: '[data-tour="page-header"]', title: 'Obras Agendadas', description: 'Próximas obras programadas para execução.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista', description: 'Veja local, data e escopo das próximas obras.', position: 'top' },
    ],
    '/equipe-ativa': [
      { selector: '[data-tour="page-header"]', title: 'Equipe Ativa', description: 'Veja os funcionários envolvidos nas obras atuais.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Nova Alocação', description: 'Aloque funcionários para obras específicas.', position: 'bottom' },
      { selector: '[data-tour="page-search"]', title: 'Busca', description: 'Busque membros por nome ou email.', position: 'bottom' },
    ],
    '/central-alertas': [
      { selector: '[data-tour="page-header"]', title: 'Central de Alertas', description: 'Avisos automáticos e notificações do sistema sobre atrasos, produtividade e mais.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Resumo de Alertas', description: 'Veja a quantidade de alertas por prioridade: críticos, médios e baixos.', position: 'bottom' },
    ],
    '/relatorios-obra': [
      { selector: '[data-tour="page-header"]', title: 'Relatórios de Obra', description: 'Indicadores gerais das obras: concluídas, em andamento, agendadas e equipe.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Cards de Indicadores', description: 'Clique em cada card para navegar à página correspondente.', position: 'bottom' },
    ],
    '/boletins-medicao': [
      { selector: '[data-tour="page-header"]', title: 'Boletins de Medição', description: 'Emita boletins para faturamento das obras.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Novo Boletim', description: 'Crie um novo boletim vinculado a uma medição.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros', description: 'Filtre por obra, status e período de emissão.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Boletins', description: 'Acompanhe o status de cada boletim: rascunho, emitido, aprovado ou pago.', position: 'top' },
    ],
    '/financeiro': [
      { selector: '[data-tour="page-header"]', title: 'Controle Financeiro', description: 'Visão geral de receitas, despesas e fluxo de caixa.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Indicadores', description: 'Acompanhe boletins emitidos, despesas, saldo e pagamentos.', position: 'bottom' },
    ],
    '/lancamento-despesas': [
      { selector: '[data-tour="page-header"]', title: 'Lançamento de Despesas', description: 'Registre despesas operacionais por obra e categoria.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Nova Despesa', description: 'Lance uma nova despesa com valor, categoria e obra.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Despesas', description: 'Visualize todas as despesas registradas.', position: 'top' },
    ],
    '/retencoes': [
      { selector: '[data-tour="page-header"]', title: 'Controle de Retenções', description: 'Acompanhe valores retidos por impostos e contribuições.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Resumo', description: 'Veja o total retido e quantidade de retenções.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Retenções', description: 'Clique em uma retenção para ver detalhes e follow-ups.', position: 'top' },
    ],
    '/fechamento-mensal': [
      { selector: '[data-tour="page-header"]', title: 'Fechamento Mensal', description: 'Gere e exporte documentos financeiros por data.', position: 'bottom' },
      { selector: '[data-tour="page-calendar"]', title: 'Calendário', description: 'Selecione uma data para ver os documentos disponíveis.', position: 'right' },
    ],
    '/relatorios-financeiros': [
      { selector: '[data-tour="page-header"]', title: 'Relatórios Financeiros', description: 'Exporte dados de medições, despesas e retenções em PDF ou Excel.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Resumo Financeiro', description: 'Veja receita aprovada, despesas e retenções totais.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Relatórios Disponíveis', description: 'Escolha qual relatório exportar em PDF ou Excel.', position: 'top' },
    ],
    '/exportar-dados': [
      { selector: '[data-tour="page-header"]', title: 'Exportar Dados', description: 'Gere planilhas e relatórios para NF e auditoria.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Opções de Exportação', description: 'Exporte planilhas para NF, relatórios PDF e exportações personalizadas.', position: 'top' },
    ],
    '/propostas': [
      { selector: '[data-tour="page-header"]', title: 'Propostas', description: 'Gerencie propostas e contratos com clientes.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Nova Proposta', description: 'Crie uma nova proposta comercial.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros', description: 'Filtre por obra, status e período.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Propostas', description: 'Visualize, edite, aprove ou rejeite propostas.', position: 'top' },
    ],
    '/valores-unitarios': [
      { selector: '[data-tour="page-header"]', title: 'Valores Unitários', description: 'Gerencie a tabela de preços por serviço.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Novo Valor', description: 'Cadastre um novo preço unitário por serviço.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Valores', description: 'Edite preços existentes clicando no ícone de edição.', position: 'top' },
    ],
    '/aceites': [
      { selector: '[data-tour="page-header"]', title: 'Aceites Digitais', description: 'Controle as aprovações de propostas pelos clientes.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Aceites', description: 'Veja quais propostas foram aceitas digitalmente.', position: 'top' },
    ],
    '/modelos-contrato': [
      { selector: '[data-tour="page-header"]', title: 'Modelos de Contrato', description: 'Gerencie templates de contratos, aditivos e termos.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Novo Modelo', description: 'Crie um novo template de contrato.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Modelos', description: 'Edite modelos existentes para reutilização.', position: 'top' },
    ],
    '/relatorios-comerciais': [
      { selector: '[data-tour="page-header"]', title: 'Relatórios Comerciais', description: 'Acompanhe a performance comercial com indicadores e gráficos.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Indicadores', description: 'Propostas enviadas, taxa de conversão, valor médio e contratos ativos.', position: 'bottom' },
    ],
    '/usuarios': [
      { selector: '[data-tour="page-header"]', title: 'Gerenciar Usuários', description: 'Controle total sobre os usuários do sistema.', position: 'bottom' },
      { selector: '[data-tour="page-new-btn"]', title: 'Novo Usuário', description: 'Crie um novo usuário e defina seu tipo de acesso.', position: 'bottom' },
      { selector: '[data-tour="page-search"]', title: 'Busca e Filtro', description: 'Busque por nome ou email e filtre por tipo de usuário.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Usuários', description: 'Edite usuários existentes clicando no ícone de edição.', position: 'top' },
    ],
    '/permissoes': [
      { selector: '[data-tour="page-header"]', title: 'Permissões', description: 'Configure permissões de acesso por tipo de usuário.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Grupos de Permissões', description: 'Ative ou desative permissões para cada grupo. As alterações são salvas automaticamente.', position: 'top' },
    ],
    '/aprovacoes': [
      { selector: '[data-tour="page-header"]', title: 'Aprovações Pendentes', description: 'Revise e processe itens aguardando sua aprovação.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Fila de Aprovações', description: 'Aprove ou rejeite solicitações. Para acessos, escolha o nível de permissão.', position: 'top' },
    ],
    '/automacao': [
      { selector: '[data-tour="page-header"]', title: 'Automação', description: 'Gerencie fluxos automáticos do sistema.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Automações', description: 'Ative, pause ou configure cada automação individualmente.', position: 'top' },
    ],
    '/minhas-obras': [
      { selector: '[data-tour="page-header"]', title: 'Minhas Obras', description: 'Acompanhe o status e progresso de todas as suas obras.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Obras', description: 'Veja detalhes, progresso e valores de cada obra. Clique para mais informações.', position: 'top' },
    ],
    '/solicitar-agendamento': [
      { selector: '[data-tour="page-header"]', title: 'Solicitar Agendamento', description: 'Programe uma nova obra ou manutenção.', position: 'bottom' },
      { selector: '[data-tour="page-form"]', title: 'Formulário', description: 'Preencha os dados do serviço desejado: tipo, data, endereço e descrição.', position: 'right' },
    ],
    '/minhas-propostas': [
      { selector: '[data-tour="page-header"]', title: 'Minhas Propostas', description: 'Revise e aceite propostas enviadas pela CT Guedes.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Lista de Propostas', description: 'Veja detalhes e aceite propostas pendentes com assinatura digital.', position: 'top' },
    ],
    '/meus-relatorios': [
      { selector: '[data-tour="page-header"]', title: 'Meus Relatórios', description: 'Acompanhe investimentos, histórico e lance reembolsos.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Indicadores', description: 'Investimento total, obras realizadas, economia e próximo pagamento.', position: 'bottom' },
    ],
    '/meus-pagamentos': [
      { selector: '[data-tour="page-header"]', title: 'Meus Pagamentos', description: 'Acompanhe seus pagamentos e boletins.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Resumo', description: 'Veja total pago, pendente e quantidade de boletins.', position: 'bottom' },
      { selector: '[data-tour="page-list"]', title: 'Histórico', description: 'Consulte todos os pagamentos com status atualizado.', position: 'top' },
    ],
    '/configuracoes': [
      { selector: '[data-tour="page-header"]', title: 'Configurações', description: 'Gerencie suas preferências e configurações da conta.', position: 'bottom' },
      { selector: '[data-tour="page-tabs"]', title: 'Seções', description: 'Navegue entre Perfil, Segurança, Notificações e Preferências.', position: 'bottom' },
    ],
    '/relatorios': [
      { selector: '[data-tour="page-header"]', title: 'Relatórios Gerais', description: 'Visão completa de todos os indicadores do sistema.', position: 'bottom' },
      { selector: '[data-tour="page-filters"]', title: 'Filtros', description: 'Filtre por obra, período e status para refinar os dados.', position: 'bottom' },
      { selector: '[data-tour="page-stats"]', title: 'Indicadores', description: 'Receita, obras ativas, clientes e cobertura do filtro.', position: 'bottom' },
    ],
  };

  return stepsMap[pathname] || [];
};
