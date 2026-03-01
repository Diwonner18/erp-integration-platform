

# Plano: Remover Todos os Dados Mock e Manter Funcionalidades

## Escopo

Remover dados mock de ~35 arquivos, substituindo por arrays vazios ou estados zerados. Todas as funcionalidades de criacao, edicao e exclusao continuam funcionando -- o usuario comeca com o sistema "limpo" e popula conforme usa.

---

## Categorias de Alteracao

### 1. Paginas com useState com dados mock -> useState([])

Estes arquivos tem `useState([...dados...])` que serao trocados por `useState([])`:

| Arquivo | Estado mock |
|---------|-------------|
| `Admin/Aprovacoes.tsx` | `pendingApprovals` |
| `Admin/Automacao.tsx` | `automations` |
| `Admin/GerenciarUsuarios.tsx` | `usuarios` |
| `Admin/Permissoes.tsx` | `permissions` (manter estrutura de roles, zerar customizacoes) |
| `Comercial/Propostas.tsx` | `propostas` |
| `Comercial/AceitesDigitais.tsx` | `aceites` |
| `Comercial/ModelosContrato.tsx` | `modelos` |
| `Comercial/ValoresUnitarios.tsx` | `valores` |
| `Obras/Medicoes.tsx` | `medicoes` |
| `Obras/HorasExtras.tsx` | `registros` |
| `Obras/EPIs.tsx` | `registrosEPI` |
| `Obras/AlteracoesEscopo.tsx` | `alteracoes` |
| `Obras/Materiais.tsx` | `materiais` |
| `Obras/MateriaisEquipamentos.tsx` | `materiais` + `equipamentos` |
| `Obras/EquipeAtiva.tsx` | `alocacoesDiarias` |
| `Programacao.tsx` | `programacoes` |
| `Cliente/MinhasPropostas.tsx` | `propostas` |
| `Financeiro/LancamentoDespesas.tsx` | `despesas` |
| `Cliente/MeusRelatorios.tsx` | `reembolsos` (remover mock inicial) |
| `Obras/RelatorioDiarioObra.tsx` | `relatorios` |

### 2. Paginas com const arrays inline (nao reativas) -> arrays vazios ou remocao

| Arquivo | Dados mock |
|---------|-------------|
| `Obras/ObrasEmAndamento.tsx` | `obrasEmAndamento` (const) + `obras` (filtro) |
| `Obras/ObrasAgendadas.tsx` | `obrasAgendadas` (const) |
| `Obras/ObrasConcluidas.tsx` | `obrasConcluidas` + `obras` |
| `Obras/CentralAlertas.tsx` | `alertas` (const) |
| `Financeiro/ControleFinanceiro.tsx` | `contasReceber` + `contasPagar` |
| `Financeiro/ControleRetencoes.tsx` | array inline no JSX |
| `Financeiro/RelatoriosFinanceiros.tsx` | arrays inline no JSX |
| `Financeiro/ExportarDados.tsx` | arrays inline no JSX |
| `Financeiro/BoletinsMedicao.tsx` | `boletins` (const) |
| `Cliente/MeusPagamentos.tsx` | array inline no JSX |
| `Cliente/MinhasObras.tsx` | `obras` (const) |
| `Shared/Relatorios.tsx` | `allData` (useMemo) |
| `Comercial/RelatoriosComerciais.tsx` | hardcoded numbers |

### 3. Componentes com dados mock

| Arquivo | Dados mock |
|---------|-------------|
| `Dashboard/RecentProjects.tsx` | `recentProjects` |
| `Dashboard/ProgramacaoSection.tsx` | `programacao` |

### 4. Dashboard.tsx - Stats hardcoded

Substituir todos os numeros hardcoded (12, 24, 5, R$ 285.400, etc.) por `0` e textos como "Sem dados" nos paineis laterais de Aprovacoes Criticas e Minhas Obras.

### 5. Listas de obras/funcionarios usadas como opcoes em selects/filtros

Arquivos como `Medicoes.tsx`, `EquipeAtiva.tsx`, `EPIs.tsx`, `Programacao.tsx`, `NovaMedicaoModal.tsx`, `SugestaoEscopoModal.tsx`, `RelatorioDiarioObra.tsx` tem `const obras = [...]` usados como opcoes de select.

**Estrategia**: Converter para `useState([])` -- os selects ficarao vazios ate o usuario criar obras. Isso e consistente com "sem dados mock".

---

## Empty States

Para cada pagina que ficara vazia, garantir que exista uma mensagem tipo:

```
<div className="text-center py-12 text-slate-500">
  <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
  <p className="font-medium">Nenhum registro encontrado</p>
  <p className="text-sm">Use o botao acima para criar o primeiro</p>
</div>
```

Paginas que ja tem empty state: `Aprovacoes.tsx`, `MeusRelatorios.tsx` (reembolsos).  
Paginas que precisam de empty state: maioria das listagens acima.

---

## Arquivos a Modificar (total ~35)

**Admin (4):** Aprovacoes, Automacao, GerenciarUsuarios, Permissoes  
**Comercial (5):** Propostas, AceitesDigitais, ModelosContrato, ValoresUnitarios, RelatoriosComerciais  
**Financeiro (6):** ControleFinanceiro, ControleRetencoes, RelatoriosFinanceiros, ExportarDados, BoletinsMedicao, LancamentoDespesas  
**Obras (10):** Medicoes, HorasExtras, EPIs, AlteracoesEscopo, Materiais, MateriaisEquipamentos, EquipeAtiva, ObrasEmAndamento, ObrasAgendadas, ObrasConcluidas, CentralAlertas, RelatorioDiarioObra, RelatoriosObra  
**Cliente (4):** MinhasPropostas, MinhasObras, MeusPagamentos, MeusRelatorios  
**Dashboard (3):** Dashboard.tsx, RecentProjects.tsx, ProgramacaoSection.tsx  
**Shared (1):** Relatorios.tsx  
**Programacao (1):** Programacao.tsx  

---

## O Que NAO Muda

- Nenhum componente UI (botoes, modais, formularios)
- Nenhuma rota
- Nenhuma logica de CRUD (adicionar, editar, excluir)
- AuthContext (login/cadastro continua funcionando)
- Listas estaticas de configuracao (meses, tipos de pagamento, condicoes climaticas, etc.)
- Estrutura de componentes e imports

---

## Ordem de Implementacao

1. Criar empty states reutilizavel (ou inline por pagina)
2. Limpar paginas Admin (4 arquivos)
3. Limpar paginas Comercial (5 arquivos)
4. Limpar paginas Financeiro (6 arquivos)
5. Limpar paginas Obras (12 arquivos)
6. Limpar paginas Cliente (4 arquivos)
7. Limpar Dashboard + componentes (3 arquivos)
8. Limpar Shared/Relatorios + Programacao (2 arquivos)

