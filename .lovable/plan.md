

# Comparativo: PDFs de Alinhamento vs Sistema Atual

## Resumo

Analisei ambos os PDFs de alinhamento (Modulo Obras e Modulo Cliente) e comparei com o código e banco de dados atuais. Abaixo a análise item por item.

---

## MODULO OBRAS -- O que JA EXISTE no sistema

| Requisito do PDF | Status | Detalhes |
|---|---|---|
| Programacao com lista de Obras | OK | `useProgramacoes` + `useObras` alimentam o dropdown |
| Editar Programacao com M2, Endereco, Escopo, Data Inicio/Fim | OK | `EditProgramacaoModal.tsx` tem todos esses campos |
| Prioridade na Programacao | OK | Campo `prioridade` presente no modal de edicao |
| Nova Medicao com Obra, Numero, Data, Periodo, Metragem, Percentual, Valor Bruto | OK | `NovaMedicaoModal.tsx` + tabela `medicoes` tem todos os campos |
| Correcao IGP-M na medicao (taxa + calculo) | OK | Campos `taxa_igpm` e `correcao_igpm` na tabela + UI com calculo automatico |
| Alteracoes de Escopo (complemento de servico pos-contrato) | OK | Modulo `AlteracoesEscopo.tsx` + tabela `alteracoes_escopo` |
| EPIs -- registro com tipo, colaborador, data entrega, validade, CA | OK | Tabela `epis` + pagina `EPIs.tsx` |
| Horas Extras -- funcionario, categoria (A/B/C), tipo (Normal/Virada/Dobra/Diaria/Continuacao), valor/hora | OK | Tabela `horas_extras` + pagina `HorasExtras.tsx` com todos esses campos |
| Materiais e Equipamentos | OK | Tabelas + paginas existem (PDF diz "nao e prioridade") |

## MODULO OBRAS -- O que esta FALTANDO ou precisa ajuste

| Item do PDF | Situacao | O que fazer |
|---|---|---|
| **Incluir campos na "Nova Programacao"** (M2, endereco, escopo, datas) | FALTANDO | O PDF pergunta se e possivel incluir esses campos ja na criacao (nao so na edicao). Atualmente o form de nova programacao so tem Obra, Data, Responsavel e Descricao. Falta M2, endereco, escopo, datas de inicio/fim |
| **Campo CNO na obra** | FALTANDO | PDF pede "Incluir CNO" vinculado a obra. A tabela `obras` nao tem campo `cno`. O historico de CNO existe em `colaborador_alocacoes` mas nao na obra em si |
| **Dados de contato do responsavel da obra** | FALTANDO | PDF sugere "campo de dados de contato com o responsavel da obra". A tabela `obras` tem `responsavel_id` mas nao tem telefone/email de contato do responsavel no contexto da obra |
| **Vincular CEP ao endereco** (auto-preenchimento) | FALTANDO | PDF pede que ao digitar o CEP, o endereco seja preenchido automaticamente (como ViaCEP). Nao existe essa integracao |
| **Cadastro de itens para "Tipo de EPI"** | FALTANDO | PDF pergunta "onde e feito o cadastro dos itens em lista?". Atualmente o campo `tipo` do EPI e texto livre, nao tem tabela de tipos cadastrados |
| **Cadastro de itens para Categoria e Tipo de Horas Extras** | FALTANDO | PDF pergunta "onde esta o cadastro dos itens?". Os valores estao hardcoded no frontend (A/B/C e Normal/Virada/etc), nao vem de tabela configuravel |
| **Integracao RDO → Horas Extras** | FALTANDO | PDF pergunta se "atraves do diario de obra e possivel controlar as horas por colaborador para entrar automaticamente no modulo de HE". Atualmente RDO e HE sao modulos independentes sem integracao |
| **Relatorio resumo quinzenal de HE** | FALTANDO | PDF pede "relatorio com resumo da quinzena" de horas extras. Nao existe esse relatorio especifico |
| **Medicoes disponiveis ao cliente apos aprovacao** | PARCIAL | Tabela `medicoes` tem politica RLS para clientes (`Clientes view own medicoes`), mas nao ha filtro por status de aprovacao -- cliente ve todas as medicoes, nao so as aprovadas |
| **Inclusao de boletins vinculados a medicao** | OK | Tabela `boletins_medicao` tem campo `medicao_id` |

---

## MODULO CLIENTE -- O que JA EXISTE

| Requisito do PDF | Status | Detalhes |
|---|---|---|
| Solicitar Agendamento | OK | `SolicitarAgendamento.tsx` com formulario Zod |
| Minhas Obras | OK | `MinhasObras.tsx` com cards e detalhes |
| Minhas Propostas | OK | `MinhasPropostas.tsx` |
| Meus Pagamentos | OK | `MeusPagamentos.tsx` |
| Meus Relatorios | OK | `MeusRelatorios.tsx` |

## MODULO CLIENTE -- O que esta FALTANDO ou precisa ajuste

| Item do PDF | Situacao | O que fazer |
|---|---|---|
| **Campos Nome, Telefone, Email no Solicitar Agendamento** | FALTANDO | PDF pede que o cliente preencha Nome, contato telefonico e email. O form atual so tem Tipo de Servico, Data, Horario, Endereco, Descricao e Prioridade |
| **Orientacao "Endereco completo incluindo CEP"** | FALTANDO | PDF pede que o placeholder/label do campo endereco diga "Endereco completo da obra incluindo o CEP". Atualmente o label e generico |
| **Direcionamento da solicitacao (email/alerta)** | FALTANDO | PDF pergunta "como sera o direcionamento?". Atualmente o submit e simulado (`await new Promise`), nao grava no banco nem envia notificacao |
| **Separacao de dados por cliente** | OK | RLS garante que clientes so veem seus proprios dados (obras, propostas, pagamentos) via `get_cliente_ids_for_user` |
| **Aprovacao CT Guedes antes de liberar ao cliente** | PARCIAL | O PDF pede que dados so aparecam apos aprovacao pela CT Guedes. Para propostas e medicoes, nao ha filtro de status na query do cliente |
| **"Meus Relatorios" deve ser o ultimo item do menu** | FALTANDO | Atualmente a ordem no Sidebar e: Minhas Obras, Minhas Propostas, **Meus Relatorios**, Meus Pagamentos. O PDF pede que Meus Relatorios seja o **ultimo** (apos Meus Pagamentos) |
| **Liberacao de acesso ao cliente (link de convite?)** | INDEFINIDO | PDF pergunta "em que momento sera liberado o acesso ao cliente?". O sistema usa Supabase Auth mas o fluxo de convite/onboarding do cliente nao esta claro |

---

## RESUMO DE ACOES NECESSARIAS (por prioridade)

### Alta Prioridade (funcionalidade core faltante)
1. **Solicitar Agendamento**: adicionar campos Nome, Telefone, Email; gravar no banco; enviar notificacao
2. **Nova Programacao**: adicionar campos M2, endereco, escopo, datas de inicio/fim no formulario de criacao
3. **Filtro de aprovacao para dados do cliente**: medicoes e propostas so visiveis ao cliente apos aprovacao

### Media Prioridade (usabilidade e configuracao)
4. **Reordenar menu cliente**: mover "Meus Relatorios" para ultimo
5. **Campo CNO na tabela obras** (migration + UI)
6. **Auto-preenchimento de endereco via CEP** (integracao ViaCEP)
7. **Tabela de tipos de EPI** cadastraveis (em vez de texto livre)
8. **Tabela de categorias/tipos de Horas Extras** cadastraveis

### Baixa Prioridade (integracao e relatorios)
9. **Integracao RDO → Horas Extras automatica**
10. **Relatorio quinzenal de HE**
11. **Contato do responsavel na obra**
12. **Fluxo de convite/onboarding do cliente**

---

Posso implementar qualquer um desses itens. Qual quer priorizar?

