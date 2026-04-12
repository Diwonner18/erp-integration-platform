

# Verificacao Cruzada: PDFs de Alinhamento vs Implementacao Atual

## PDF 1: MODULO OBRAS - Alinhamento 2

| # | Requisito do PDF | Status | Detalhe |
|---|---|---|---|
| 1 | **Programacao: campos M2, Endereco, Escopo, Datas na edicao** | FEITO | Formulario EditProgramacaoModal ja tem esses campos |
| 2 | **Incluir CNO na obra** | PARCIAL | Campo `cno` existe no DB, mas nao ha UI de criacao/edicao de obra expondo esse campo |
| 3 | **Contato do responsavel da obra** | PARCIAL | Campos `responsavel_telefone` e `responsavel_email` existem no DB, mas sem UI |
| 4 | **Vincular CEP ao endereco (auto-preenchimento)** | PARCIAL | Hook `useCepLookup` criado e integrado em `NovoColaboradorModal`. Falta em: SolicitarAgendamento, formularios de obra |
| 5 | **Medicoes: campos m2, percentual, valor bruto, IGP-M** | FEITO | NovaMedicaoModal ja tem todos esses campos |
| 6 | **Medicoes disponiveis ao cliente apos aprovacao** | FEITO | RLS de `medicoes` filtra por `status = 'aprovada'` para cliente |
| 7 | **Alteracoes de Escopo (complemento de servico)** | FEITO | Modulo completo implementado |
| 8 | **Materiais e Equipamentos - nao e prioridade** | N/A | PDF diz "sera verificado depois" |
| 9 | **EPIs: cadastro dos tipos em lista (nao texto livre)** | FEITO | Tabela `tipos_epi` criada, `EPIs.tsx` usa Select dinamico |
| 10 | **Horas Extras: cadastro de Categoria e Tipo** | FEITO | Tabelas `categorias_hora_extra` e `tipos_hora_extra` criadas, `HorasExtras.tsx` usa Select dinamico |
| 11 | **HE: controle via diario de obra automatico** | PENDENTE | RDO nao gera registros de HE automaticamente |
| 12 | **HE: relatorio quinzenal** | PENDENTE | Nao existe filtro/relatorio por quinzena |

## PDF 2: MODULO CLIENTE - Alinhamento 2

| # | Requisito do PDF | Status | Detalhe |
|---|---|---|---|
| 1 | **Fluxo de liberacao de acesso ao cliente (convite/link)** | PENDENTE | Nao ha fluxo de convite implementado |
| 2 | **Solicitar Agendamento: campos Nome, telefone, email** | FEITO | Formulario ja tem esses campos |
| 3 | **Endereco: incluir CEP com auto-preenchimento** | PENDENTE | SolicitarAgendamento tem campo endereco unico, sem campo CEP separado nem integracao ViaCEP |
| 4 | **Direcionamento da solicitacao (email/alertas)** | PARCIAL | Salva no DB e aparece na lista, mas nao envia email/notificacao ao admin |
| 5 | **Minhas Obras/Propostas/Pagamentos: filtrar por cliente** | FEITO | RLS garante que cliente ve apenas seus dados |
| 6 | **Dados precisam ser aprovados pela CT Guedes antes de o cliente visualizar** | FEITO | Medicoes filtradas por status aprovada; propostas e obras vinculadas ao cliente |
| 7 | **"Meus Relatorios" deve ser o ultimo da lista no menu** | FEITO (parcial) | Na funcao `getFlatMenuByRole` para cliente (linha 200-208), "Meus Relatorios" JA esta por ultimo. Porem no array `menuSections` do admin (linha 140), esta antes de "Meus Pagamentos" |

---

## Itens Pendentes para Implementar

### Media Prioridade
1. **UI de CNO e Contato do Responsavel na obra** - Criar/localizar formulario de criacao/edicao de obra e expor os campos `cno`, `responsavel_telefone`, `responsavel_email`
2. **ViaCEP em SolicitarAgendamento** - Adicionar campo CEP separado, integrar `useCepLookup`, auto-preencher logradouro/bairro/cidade/UF
3. **Corrigir ordem "Meus Relatorios" no menu admin/cliente** - No array `menuSections` (linha 134-142), mover "Meus Relatorios" para ultimo

### Baixa Prioridade
4. **Relatorio quinzenal de HE** - Adicionar filtro por quinzena (1-15 / 16-fim) com agrupamento por colaborador e exportacao PDF/XLS
5. **Integracao RDO -> Horas Extras** - Ao registrar presenca no RDO com saida apos limite, gerar registro de HE automaticamente
6. **Notificacao de agendamento** - Quando cliente cria agendamento, notificar admin/obras (insert em `notificacoes` ou envio de email)
7. **Fluxo de convite/onboarding do cliente** - Vincular `user_id` ao registro `clientes`, envio de convite via Supabase Auth
8. **Tela admin para gerenciar tabelas de apoio** - CRUD de tipos_epi, categorias_hora_extra, tipos_hora_extra

## Plano de Implementacao

### Passo 1: Corrigir ordem do menu cliente (Sidebar.tsx)
- Mover "Meus Relatorios" para depois de "Meus Pagamentos" no array `menuSections` (linhas 137-142)

### Passo 2: ViaCEP em SolicitarAgendamento
- Adicionar campo CEP separado no formulario
- Integrar `useCepLookup` para auto-preencher logradouro, bairro, cidade, UF
- Manter campo endereco completo composto pelos campos separados

### Passo 3: UI de CNO e Contato na obra
- Localizar/criar formulario de criacao e edicao de obra
- Adicionar campos CNO, Telefone do Responsavel, Email do Responsavel
- Exibir CNO nos cards/detalhes de obra

### Passo 4: Relatorio quinzenal de HE
- Adicionar aba ou botao em HorasExtras.tsx
- Filtro por quinzena (1-15 ou 16-fim do mes)
- Agrupamento por colaborador com totais
- Exportacao PDF/XLS usando `exportUtils`

### Passo 5: Tela admin de tabelas de apoio
- Nova pagina `Admin/TabelasApoio.tsx` com CRUD para tipos_epi, categorias/tipos HE
- Rota no App.tsx, link no Sidebar

### Passo 6: Integracao RDO -> HE (se desejado)
- No RelatorioDiarioObra, ao salvar presenca com horario de saida apos 17h (seg-qui) ou 16h (sex), inserir registro em `horas_extras`

### Passo 7: Notificacao de agendamento + Fluxo de convite cliente
- Insert em `notificacoes` ao criar agendamento
- Fluxo de convite via Supabase Auth invite no cadastro de cliente

**Total estimado: ~10 arquivos modificados, 0 migrations adicionais**

