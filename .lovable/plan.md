

# Lote 7b - Relatórios Compartilhados com Dados Reais do Supabase

## Situacao Atual

`src/pages/Shared/Relatorios.tsx` usa `allData = { obras: [], clientes: [], setores: [] }` -- arrays vazios hardcoded. A pagina e admin-only (`/relatorios`). Filtros e UI existem mas nao mostram nada.

## Plano

### Integrar dados reais via hooks existentes

Substituir o `allData` mock pelos hooks ja existentes: `useObras`, `useClientes`, `useMedicoes`, `useDespesas`.

**Dados derivados:**
- **Obras**: `useObras()` com join em `clientes(razao_social)` -- nome, cliente, status, data_inicio, valor_contrato
- **Receita**: somar `valor_contrato` das obras filtradas
- **Clientes unicos**: extrair de obras
- **Performance por setor**: agrupar despesas por categoria (material, mao_de_obra, equipamento, etc.)
- **Crescimento**: comparar obras criadas no periodo vs periodo anterior (se filtro de data ativo)

### Filtros funcionais

- **Obra**: popular select com nomes reais das obras
- **Status**: mapear para status reais do enum (`programacao_pendente`, `em_andamento`, `concluida`, `cancelada`)
- **Periodo**: filtrar por `data_inicio` da obra

### Exportar Dashboard

- Botao "Exportar Dashboard" gera PDF com `exportToPDF` contendo resumo + lista de obras filtradas

### Usar tema consistente

- Trocar `text-slate-900`/`text-slate-600` por `text-foreground`/`text-muted-foreground` (consistencia com resto do sistema)

## Arquivos Modificados

| Arquivo | Mudanca |
|---|---|
| `Relatorios.tsx` | Hooks reais, filtros funcionais, export PDF, tema consistente |

Sem migration necessaria. Sem novos hooks -- reutiliza `useObras`, `useClientes`, `useDespesas` existentes.

