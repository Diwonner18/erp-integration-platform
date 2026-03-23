

# Extensao do Enforcement de Permissoes para Todos os Perfis

## Problema

O enforcement atual so cobre 6 paginas (EPIs, Horas Extras, Materiais, Medicoes, Colaboradores, Propostas). As paginas do Financeiro e Comercial nao tem:
- Prop `modulo` no ProtectedRoute (bloqueio por URL)
- Hook `useUserModulePermissions` (controle de botoes)
- Modulos correspondentes no seed da tabela `permissoes_perfil`

## O que falta

### 1. Migration: Adicionar modulos faltantes ao seed

Inserir na `permissoes_perfil` os modulos que faltam para cada perfil:

Modulos novos: `valores_unitarios`, `aceites`, `modelos_contrato`, `relatorios_comerciais`, `financeiro`, `retencoes`, `fechamento_mensal`, `exportar_dados`, `relatorios_financeiros`, `relatorios_obra`, `relatorios_diarios` (para obras)

Seed com permissoes padrao coerentes (ex: comercial tem acesso total a valores_unitarios/aceites/modelos_contrato, financeira tem acesso total a boletins/retencoes/fechamento, etc).

### 2. App.tsx: Adicionar `modulo` nas rotas faltantes

Rotas que precisam do prop `modulo` no ProtectedRoute:
- `/valores-unitarios` -> `modulo="valores_unitarios"`
- `/aceites` -> `modulo="aceites"`
- `/modelos-contrato` -> `modulo="modelos_contrato"`
- `/relatorios-comerciais` -> `modulo="relatorios_comerciais"`
- `/boletins-medicao` -> `modulo="boletins"`
- `/financeiro` -> `modulo="financeiro"`
- `/relatorios-financeiros` -> `modulo="relatorios_financeiros"`
- `/exportar-dados` -> `modulo="exportar_dados"`
- `/retencoes` -> `modulo="retencoes"`
- `/fechamento-mensal` -> `modulo="fechamento_mensal"`
- `/lancamento-despesas` -> `modulo="despesas"`
- `/alteracoes-escopo` -> `modulo="alteracoes_escopo"`
- `/relatorio-diario-obra` -> `modulo="relatorios_diarios"`
- `/relatorios-obra` -> `modulo="relatorios_obra"`

### 3. Paginas Financeiro: Adicionar `useUserModulePermissions`

Paginas a atualizar (esconder botoes Novo/Editar/Excluir conforme permissoes):
- `BoletinsMedicao.tsx` -> `useUserModulePermissions('boletins')`
- `LancamentoDespesas.tsx` -> `useUserModulePermissions('despesas')`
- `ControleRetencoes.tsx` -> `useUserModulePermissions('retencoes')`
- `FechamentoMensal.tsx` -> `useUserModulePermissions('fechamento_mensal')`

### 4. Paginas Comercial: Adicionar `useUserModulePermissions`

- `ValoresUnitarios.tsx` -> `useUserModulePermissions('valores_unitarios')`
- `ModelosContrato.tsx` -> `useUserModulePermissions('modelos_contrato')`

### 5. Paginas Obras faltantes: Adicionar `useUserModulePermissions`

- `AlteracoesEscopo.tsx` -> `useUserModulePermissions('alteracoes_escopo')`
- `RelatorioDiarioObra.tsx` -> `useUserModulePermissions('relatorios_diarios')`

### 6. Atualizar `MODULO_LABELS` na pagina Permissoes

Adicionar os novos modulos ao mapa de labels para que aparecam na UI de configuracao do admin.

### 7. Atualizar `PATH_TO_MODULE` no Sidebar

Verificar que todos os novos modulos estao no mapeamento (a maioria ja esta, confirmar os faltantes).

---

## Arquivos

| Tipo | Arquivo |
|---|---|
| Migration | 1 SQL (insert novos modulos no seed) |
| Alteracao | `src/App.tsx` (adicionar `modulo` em ~14 rotas) |
| Alteracao | `src/pages/Financeiro/BoletinsMedicao.tsx` |
| Alteracao | `src/pages/Financeiro/LancamentoDespesas.tsx` |
| Alteracao | `src/pages/Financeiro/ControleRetencoes.tsx` |
| Alteracao | `src/pages/Financeiro/FechamentoMensal.tsx` |
| Alteracao | `src/pages/Comercial/ValoresUnitarios.tsx` |
| Alteracao | `src/pages/Comercial/ModelosContrato.tsx` |
| Alteracao | `src/pages/Obras/AlteracoesEscopo.tsx` |
| Alteracao | `src/pages/Obras/RelatorioDiarioObra.tsx` |
| Alteracao | `src/pages/Admin/Permissoes.tsx` (MODULO_LABELS) |
| Alteracao | `src/components/Layout/Sidebar.tsx` (PATH_TO_MODULE) |

