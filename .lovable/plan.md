
## Auditoria Cliente + Correções dos PDFs (Patricia — 12/abr)

### Achados da auditoria (código + RLS no banco)

| # | Tabela / Tela | Problema | Severidade |
|---|---|---|---|
| 1 | `boletins_medicao` em `/meus-pagamentos` | **Sem policy SELECT para clientes**. Cliente acessa via `useBoletins()` sem filtro. RLS bloqueia tudo → tela vazia. Mas se um dia adicionarem policy genérica, vaza tudo. | 🔴 Crítico |
| 2 | `useObras()` em `/minhas-obras` | Hook é compartilhado com perfis internos. Para cliente, depende 100% da RLS `cliente_id IN get_cliente_ids_for_user`. Funciona, mas só se `clientes.user_id` estiver setado. | 🟡 Médio (UX) |
| 3 | `usePropostas()` em `/minhas-propostas` | Mesmo padrão — depende só de RLS. Filtro client-side `status !== 'rascunho'` está ok, mas não há filtro explícito por cliente no código. | 🟡 Médio |
| 4 | `useBoletins()` traz `clientes(razao_social)` no select | Se cliente conseguir SELECT, joins expõem dados de outros clientes via embed. | 🔴 Crítico |
| 5 | `agendamentos` em `/solicitar-agendamento` | Query carrega últimos 10 sem `.eq('user_id', user.id)`. Confia em RLS — que está correta — mas é frágil. | 🟢 Baixo |
| 6 | `MeusRelatorios.tsx` | Página é **100% mock/local** (`useState` em memória, lista de obras hardcoded vazia). Reembolsos não persistem. | 🟡 Médio |
| 7 | Rota `/meus-pagamentos` no App.tsx | Verificar se está protegida com `allowedUserTypes={['cliente']}`. | A confirmar |

### Correções planejadas (em ordem de prioridade)

#### 🔴 BLOCO 1 — Segurança / LGPD (essencial)

**1.1 Migration: adicionar policy SELECT em `boletins_medicao` para clientes**
```sql
CREATE POLICY "Clientes view own boletins"
ON public.boletins_medicao FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'cliente'::app_role)
  AND obra_id IN (SELECT get_obra_ids_for_cliente(auth.uid()))
);
```
Sem essa policy, a tela fica permanentemente vazia para clientes legítimos.

**1.2 Hooks scoped para perfil cliente** (defesa em profundidade — não confiar só na RLS)

Criar variantes filtradas explicitamente em `useSupabaseData.ts`:
- `useObrasCliente()` — `.eq` indireto via join `clientes!inner(user_id)`
- `useBoletinsCliente()` — filtra por `obras.cliente.user_id = auth.uid()`
- `usePropostasCliente()` — filtra por `cliente_id IN clientes.user_id = auth.uid()` + status ≠ 'rascunho'
- `useMedicoesCliente()` — só `status = 'aprovada'`

Trocar nas páginas `MinhasObras`, `MeusPagamentos`, `MinhasPropostas`.

**1.3 Remover joins sensíveis no hook do cliente**
- `useBoletinsCliente()` NÃO traz `clientes(razao_social)` — só `obras(nome)`
- `useMedicoesCliente()` similar

**1.4 Garantir `clientes.user_id` populado**
- Auditar dados existentes via SELECT
- Adicionar trigger ou validação no fluxo de criação de cliente quando há e-mail correspondente em `auth.users`

#### 🟡 BLOCO 2 — UX dos PDFs (Patricia)

**2.1 Sidebar do cliente** — confirmar que "Meus Relatórios" é o último item (já documentado em `mem://ux/sidebar-client-menu-order`, validar `Sidebar.tsx`)

**2.2 `MeusRelatorios.tsx` — converter mock em real**
- Buscar obras via `useObrasCliente()` (preencher dropdown do reembolso)
- Persistir reembolsos como `despesas` ou nova tabela `reembolsos_cliente` (decidir)
- Estatísticas (Investimento Total, Obras Realizadas) calculadas a partir de obras reais

**2.3 Rótulos de endereço com CEP** (PDF Cliente #5)
- Em `MinhasObras` e `ObraDetailModal`, mostrar endereço com CEP visível
- Já implementado em `SolicitarAgendamento` ✅

**2.4 `SolicitarAgendamento`** já cobre CEP + ViaCEP + nome/tel/email ✅ — sem mudança

#### 🟢 BLOCO 3 — Programação (Módulo Obras PDF)

**3.1 Criação inline de obra dentro de "Nova Programação"**
- Reusar `useCepLookup` no formulário
- Campos: nome obra, M², endereço completo, contato (nome/tel/email)
- Sem isso, GT precisa abrir 2 telas

#### 🔵 BLOCO 4 — Lookups EPI/HE (verificação)

**4.1** Conferir `TabelasApoio.tsx` — listar quais lookups existem
**4.2** Garantir CRUD para "Categoria HE" (`categorias_hora_extra` já existe) e "Tipo EPI"

#### 🟣 BLOCO 5 — Decisões de escopo (perguntar antes)

**5.1** Estoque de EPI (entrada/saída/saldo) — feature nova significativa
**5.2** HE automática a partir do RDO — exige campos novos no RDO

### O que NÃO faremos nesta entrega
- Estoque de EPI (5.1) e HE-via-RDO (5.2) — apenas levanto se quer escopo
- Mudanças em RLS de `obras`/`programacoes`/`medicoes`/`propostas` (já estão corretas)
- Mexer em fluxo de admin/GT (Opção D já implementada)

### Ordem de execução sugerida
1. **Migration** policy `boletins_medicao` cliente (BLOCO 1.1) — sozinha
2. **Hooks scoped + troca nas 3 páginas cliente** (BLOCO 1.2 + 1.3)
3. **Auditoria dados** `clientes.user_id` (BLOCO 1.4) — query + relatório
4. **`MeusRelatorios` real** (BLOCO 2.2)
5. **Endereço com CEP** em telas de obra (BLOCO 2.3)
6. **Criação inline em Nova Programação** (BLOCO 3.1)
7. **Verificação lookups** (BLOCO 4)

### Resultado
- Cliente vê **somente** seus próprios dados em todas as 4 telas (Obras, Pagamentos, Propostas, Relatórios)
- Defesa em profundidade: RLS no banco + filtros explícitos no hook
- "Meus Relatórios" funcional (não mais mock)
- Programação enriquecida com criação inline de obra
- Trilha de auditoria mantida; nenhuma regressão para perfis internos

### Perguntas de escopo (responder no fim)
1. Reembolsos do cliente entram em `despesas` (categoria nova) ou tabela própria?
2. Estoque de EPI vai entrar nesta sprint ou fica para depois?
3. HE automática via RDO vai entrar nesta sprint ou fica para depois?
