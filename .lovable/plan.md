

# Fix 404 on "Criar primeira medição" and "Registrar despesa" buttons

## Problem
The empty state buttons in `RelatoriosFinanceiros.tsx` (and `ExportarDados.tsx`) navigate to wrong paths:
- "Criar primeira medição" → `/obras/medicoes` (wrong) — correct route is `/medicoes`
- "Registrar despesa" → `/financeiro/despesas` (wrong) — correct route is `/lancamento-despesas`

## Fix
Update the `navigate()` calls in both files:

| File | Line | Current | Correct |
|---|---|---|---|
| `RelatoriosFinanceiros.tsx` | 118 | `/obras/medicoes` | `/medicoes` |
| `RelatoriosFinanceiros.tsx` | 121 | `/financeiro/despesas` | `/lancamento-despesas` |
| `ExportarDados.tsx` | 146 | `/obras/medicoes` | `/medicoes` |
| `ExportarDados.tsx` | 149 | `/financeiro/despesas` | `/lancamento-despesas` |

