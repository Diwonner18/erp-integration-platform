# 🔎 AUDITORIA TÉCNICA COMPLETA — CT Guedes

Diagnóstico baseado em inspeção real do banco (`information_schema`, `pg_policy`), do código (`src/hooks/useSupabaseData.ts`, `src/App.tsx`, páginas Cliente) e do linter Supabase. **Não é especulação — são achados verificáveis.**

---

## 1. ESTRUTURA DE DADOS

### ✅ O que está correto
- Hierarquia conceitual `Cliente → Obra → Medição → Boletim` existe (colunas `cliente_id`, `obra_id`, `medicao_id`).
- Tabelas estão razoavelmente normalizadas (sem campos compostos óbvios).
- Uso de `enums` (`app_role`, `obra_status`, `medicao_status`, `despesa_categoria`) padroniza valores.

### 🚨 CRÍTICO — **Banco SEM foreign keys**
A consulta `information_schema.table_constraints WHERE constraint_type='FOREIGN KEY'` retornou **vazio**. Nenhuma tabela em `public` declara FK formal. Implicações:
- Pode-se inserir `obra.cliente_id` apontando para um UUID inexistente — sem erro.
- Não há `ON DELETE CASCADE`/`SET NULL`; deletar um cliente deixa órfãos silenciosos em obras, propostas, medições, boletins, agendamentos, despesas, EPIs, etc.
- Hoje há **6 obras sem `proposta_id`** e **5 propostas sem `obra_id`** — é só inconsistência ou dado sujo? Sem FK não dá nem para investigar.
- `materiais.obra_id`, `programacoes.obra_id`, `medicoes.obra_id`, `boletins_medicao.medicao_id`, `colaborador_alocacoes.colaborador_id`, etc. — **todos sem FK**.

### 🟠 MÉDIO — **"Contrato" não existe como entidade**
A pergunta da auditoria menciona `Cliente → Obra → Contrato → Módulos`, mas no banco **não há tabela `contratos`**. O que existe:
- `propostas` (com `condicoes_pagamento`, `prazo_execucao`, `valor`).
- `modelos_contrato` (template apenas — não é o contrato firmado).
- `aceites_digitais` (assinatura da proposta).
- `obras.valor_contrato` (campo solto em `obras`).

→ Hoje, "contrato" = proposta aprovada + aceite + obra criada. Funciona, mas **não há registro único e versionado do contrato vigente**, nem histórico de aditivos formal (alterações de escopo são separadas).

### 🟠 MÉDIO — Duplicação de dados de valor
- `propostas.valor` ↔ `obras.valor_contrato` ↔ `medicoes.valor`/`valor_bruto` ↔ `boletins_medicao.valor`. Não há trigger de sincronização nem regra clara de "fonte da verdade". Risco de divergência.
- `obras.endereco` (texto livre) duplica o endereço do cliente em vez de referenciar.
- `colaboradores` tem CEP/cidade/UF/etc. duplicado de outras fontes.

### 🟠 MÉDIO — Tabela `epis` legada vs `epi_movimentacoes` nova
Coexistem `epis` (entrega antiga) e `epi_movimentacoes` + view `epi_saldos` (estoque novo). A página `EPIs.tsx` ainda usa `useEPIs` (tabela antiga), enquanto `EstoqueEPI.tsx` usa a nova. **Dois sistemas paralelos para a mesma coisa.**

---

## 2. INTEGRAÇÃO ENTRE MÓDULOS

| Fluxo | Status | Observação |
|---|---|---|
| Obra → Programação | ✅ | `programacoes.obra_id` + JOIN funciona |
| Obra → Medição → Boletim | ✅ | Encadeamento correto |
| Obra → Financeiro (despesas) | ✅ | `despesas.obra_id` |
| Obra → Horas Extras | 🟠 | `horas_extras` usa `funcionario` como **texto livre**, não FK para `colaboradores`. Trigger HE (`gerar_he_do_rdo`) faz lookup de nome — quebra se colaborador for renomeado. |
| Cliente filtra dados | ✅ | Hooks `*Cliente` + RLS + view `agendamentos_cliente` |
| Alteração de escopo → Medição/Financeiro | 🚨 | **Não há propagação automática.** `alteracoes_escopo.impacto_valor` e `impacto_prazo` ficam isolados; aprovar não atualiza `obras.valor_contrato` nem cria medição/proposta complementar. Decisão manual. |
| Proposta aprovada → Obra | 🟠 | `propostas.obra_id` existe mas é preenchido manualmente. Não há trigger "ao aprovar proposta, criar obra". |

---

## 3. CONTROLE DE ACESSO

### ✅ Bem feito
- Roles em tabela separada (`user_roles` + enum `app_role`) — segue best practice.
- `has_role()` e `get_obra_ids_for_cliente()` como `SECURITY DEFINER` evitam recursão.
- `assign_internal_role` valida e-mails autorizados para `admin`/`gerenciador_tecnico`.
- `self_assign_area` permite só `obras/financeira/comercial`.
- Cliente com defesa em profundidade: hooks `*Cliente` + RLS + trigger `auto_link_cliente_user`.

### 🚨 CRÍTICO — Cliente perde acesso porque **`clientes.user_id` está NULL em 100% dos registros (5 de 5)**
O trigger `auto_link_cliente_user` depende de `contato_email = auth.users.email`, mas nenhum cliente atual tem o link feito. Isto significa:
- `useObrasCliente`, `usePropostasCliente`, `useBoletinsCliente`, `useMedicoesCliente` retornam **vazio** para qualquer cliente que loge hoje.
- RLS `Clientes view own obras` (`cliente_id IN get_cliente_ids_for_user(auth.uid())`) não retorna nada.

→ O fluxo de cadastro de cliente provavelmente **não está pedindo `contato_email`** ou está cadastrando antes de o cliente criar conta. Precisa-se de migração para popular `user_id` retroativo + UI que garanta o e-mail.

### 🟠 MÉDIO — `notificacoes` sem política INSERT explícita
Notificações são lidas/atualizadas pelo dono, mas a inserção depende de admin/GT ou edge function. Se houver inserção via cliente Supabase no front, pode falhar silenciosamente.

### 🟠 MÉDIO — `acessos_compartilhados` permite escalada se mal usado
Política `Admins full access acessos` é OK, mas qualquer admin pode conceder `nivel_acesso='all'` a qualquer registro/usuário. Falta log obrigatório (já existe `insert_audit_log` mas não é trigger automático aqui).

### 🟢 BAIXO — Leaked Password Protection desligado
Linter Supabase reporta. Habilitar em Auth → Policies (manual no dashboard).

---

## 4. MÓDULO CLIENTE

### ✅
- Hooks scoped corretos (`useObrasCliente` usa `clientes!inner` + filtro `clientes.user_id`).
- `useMedicoesCliente` filtra `status='aprovada'`.
- `usePropostasCliente` filtra `status != 'rascunho'`.
- View `agendamentos_cliente` esconde `observacoes_internas`.

### 🚨 Mas — vide item 3 — **na prática cliente não vê nada** porque `clientes.user_id` está vazio.

---

## 5. MÓDULOS OPERACIONAIS

### Programação
- ✅ Sem duplicação aparente; JOIN com obras.
- 🟠 `equipe` é JSONB livre — equipe não é validada contra `colaboradores`. Pode-se digitar nome inexistente.

### Medições
- ✅ Fluxo `em_elaboracao → aprovada` existe (enum `medicao_status`).
- ✅ Cálculo IGP-M documentado, exportação PDF/Excel via `exportUtils.ts`.
- 🟠 Cliente só vê `aprovada`, mas **não há trigger que impeça emitir boletim de medição não aprovada**. Hoje é regra de UI apenas.

### Horas Extras
- 🚨 `horas_extras.funcionario` é **TEXT** (nome), não FK para `colaboradores`. Trigger `gerar_he_do_rdo` faz `SELECT nome FROM colaboradores WHERE id = _colab_id` e grava o nome. Renomear o colaborador quebra rastreabilidade histórica.
- 🟠 `categoria` é TEXT ('A'/'B'/'C') livre — deveria ser enum ou FK para `categorias_hora_extra`.
- ✅ Cálculo automático via trigger funciona.

### EPI
- 🚨 **Dois sistemas vivos em paralelo:** `epis` (entregas) + `epi_movimentacoes`/`epi_saldos` (estoque). A página `EPIs.tsx` ainda escreve no antigo. Decisão: migrar `epis` para `epi_movimentacoes` (saídas) ou manter como tabela de "entregas formais"? Hoje é incoerente.
- 🟠 `tipos_epi` (11 registros) não é referenciada por FK em `epi_movimentacoes.tipo_epi` (também TEXT livre).

---

## 6. GARGALOS E RISCOS

| Risco | Severidade | Detalhe |
|---|---|---|
| Sem FKs no schema | 🚨 CRÍTICO | Integridade referencial frágil |
| `clientes.user_id` NULL em 100% | 🚨 CRÍTICO | Cliente não vê dados |
| `funcionario` como TEXT em HE/EPI antigo | 🟠 MÉDIO | Quebra ao renomear |
| Duplicação `valor` (proposta/obra/medição) | 🟠 MÉDIO | Risco de divergência |
| Dois sistemas de EPI | 🟠 MÉDIO | Confusão operacional |
| Alteração de escopo não propaga | 🟠 MÉDIO | Trabalho manual |
| Limit 1000 implícito | 🟢 BAIXO | OK por enquanto, virar problema em escala |
| `useSupabaseData.ts` com 1013 linhas | 🟢 BAIXO | Refatorar para arquivos por entidade |
| Auth: leaked password protection off | 🟢 BAIXO | Habilitar no dashboard |

---

## 7. UX & CONSISTÊNCIA

- ✅ Sidebar boxed para admin/GT, ordenação cliente fixa, design tokens respeitados.
- ✅ Componentes UI (shadcn) reutilizados — sem duplicação significativa.
- 🟠 `EPIs.tsx` (antigo) e `EstoqueEPI.tsx` (novo) coexistem no menu — usuário tem dúvida de qual usar.
- 🟢 ProtectedRoute padroniza guards por `modulo` consistentemente em todas as rotas operacionais.

---

## 8. CLASSIFICAÇÃO FINAL

### 🚨 CRÍTICO — corrigir antes de continuar evoluindo
1. **Adicionar Foreign Keys** em todas as colunas `*_id` (obras, propostas, medicoes, boletins_medicao, programacoes, despesas, materiais, equipamentos, epis, epi_movimentacoes, colaborador_alocacoes, alteracoes_escopo, agendamentos, retencoes, etc.) com política explícita (`ON DELETE RESTRICT` para histórico, `CASCADE` para filhos).
2. **Backfill `clientes.user_id`** + ajustar UI de cadastro para sempre exigir `contato_email` antes de o cliente conseguir logar.
3. **Migrar `horas_extras.funcionario` (TEXT) para `colaborador_id` (UUID FK)**, mantendo `funcionario` como cache opcional.
4. **Decidir destino de `epis` legada**: descontinuar página antiga e roteá-la para o novo módulo de estoque.

### 🟠 MÉDIO — planejar próxima sprint
5. **Criar entidade `contratos`** (ou enriquecer `propostas` com versionamento + status "vigente") para ter fonte única do contrato firmado.
6. **Trigger de propagação de Alteração de Escopo aprovada** → soma em `obras.valor_contrato` + cria medição complementar opcional.
7. **`epi_movimentacoes.tipo_epi` virar FK para `tipos_epi.id`**; `horas_extras.categoria` virar FK para `categorias_hora_extra` (ou enum).
8. **Quebrar `useSupabaseData.ts`** em `hooks/obras.ts`, `hooks/financeiro.ts`, `hooks/cliente.ts`, etc.

### 🟢 BAIXO — melhoria contínua
9. Habilitar **Leaked Password Protection** (manual no dashboard).
10. Validar `equipe` (JSONB) contra `colaboradores` no momento de salvar `programacao`.
11. Adicionar trigger que impeça `boletins_medicao` de ser criado para `medicao.status != 'aprovada'`.

---

## 🎯 RECOMENDAÇÃO

**Pausar entrega de novas features e priorizar os 4 itens CRÍTICOS** (FKs + backfill cliente + colaborador_id em HE + decisão sobre EPIs). Sem isso, a base de dados pode acumular sujeira difícil de limpar e clientes continuarão sem ver nada ao logar.

Após aprovação deste diagnóstico, posso entregar:
- **Migração SQL** adicionando todas as FKs faltantes (com `ON DELETE` apropriado por relação).
- **Migração de backfill** de `clientes.user_id` cruzando com `auth.users` por e-mail.
- **Refatoração** de `horas_extras` para usar `colaborador_id`.
- **Plano de descontinuação** da tabela `epis` antiga (manter dados, migrar UI).

Aprovando, executo na ordem CRÍTICO → MÉDIO.