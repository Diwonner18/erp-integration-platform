

# Lote 5 - Dashboards Financeiros, Contratos com Alertas, Inventario Unificado e Fechamento Mensal

## Escopo

Quatro etapas restantes do roadmap:

- **Etapa 7 - Dashboards Financeiros**: Graficos Recharts com dados reais do Supabase
- **Etapa 8 - Contratos com Alertas**: Alertas de vencimento de propostas/contratos
- **Etapa 9 - Materiais/Equipamentos Unificados**: Resumo de inventario com totais (ja existe a tela funcional, falta dashboard de resumo)
- **Etapa 11 - Fechamento Mensal**: Gerar documentos reais a partir dos dados do Supabase

## Plano de Implementacao

### 1. Etapa 7 - Dashboards Financeiros

**Arquivo:** `src/pages/Financeiro/ControleFinanceiro.tsx`

Adicionar graficos Recharts abaixo dos cards existentes:
- **Receita vs Despesa por mes**: BarChart agrupado usando dados de `boletins_medicao` (receita) e `despesas` (despesas), agrupados por mes
- **Fluxo de Caixa Acumulado**: AreaChart mostrando saldo acumulado ao longo do tempo

Tambem atualizar `src/pages/Comercial/RelatoriosComerciais.tsx`:
- Substituir valores estaticos (0) por dados reais de `usePropostas`
- Adicionar BarChart de propostas por mes via Recharts

E no `src/pages/Dashboard.tsx`:
- Substituir o placeholder "Resumo Mensal" por um mini BarChart com receita vs despesa dos ultimos 3 meses

### 2. Etapa 8 - Contratos com Alertas

Nao existe tabela de contratos separada. Usar `propostas.data_validade` como proxy:
- Adicionar secao de alertas no Dashboard para propostas com validade proxima (< 30 dias)
- Adicionar badge de "Vencendo" nas propostas com validade proxima em `Propostas.tsx`
- Nao requer migration -- dados ja existem na tabela `propostas`

### 3. Etapa 9 - Inventario Unificado (Dashboard)

**Arquivo:** `src/pages/Obras/MateriaisEquipamentos.tsx`

A tela ja e funcional com CRUD completo. Adicionar:
- Cards de resumo no topo: total materiais, total equipamentos, valor total em estoque, itens pendentes
- Dados vindos dos hooks `useMateriais` e `useEquipamentos` ja existentes

### 4. Etapa 11 - Fechamento Mensal

**Arquivo:** `src/pages/Financeiro/FechamentoMensal.tsx`

Substituir dados mock por dados reais:
- Buscar medicoes, despesas, horas extras e boletins do periodo selecionado
- Gerar PDF/Excel reais usando `exportUtils.ts` ao clicar em cada documento
- O botao "Gerar Documentos" filtra os dados pelo mes/ano selecionado
- "Criar Backup Completo" gera todos os exports de uma vez

### 5. Atualizacao do plan.md

Marcar todas as etapas como concluidas e mover Lote 5 para a secao de concluidos.

## Arquivos Modificados

| Arquivo | Mudanca |
|---|---|
| `ControleFinanceiro.tsx` | Graficos Recharts (BarChart + AreaChart) com dados reais |
| `RelatoriosComerciais.tsx` | Dados reais de propostas + BarChart mensal |
| `Dashboard.tsx` | Mini grafico no Resumo Mensal + alertas de vencimento |
| `MateriaisEquipamentos.tsx` | Cards de resumo de inventario |
| `FechamentoMensal.tsx` | Export real via exportUtils com dados filtrados por periodo |
| `Propostas.tsx` | Badge "Vencendo" em propostas proximas do vencimento |
| `.lovable/plan.md` | Marcar Lote 5 como concluido |

## Sem Migrations

Nenhuma mudanca de schema necessaria. Todos os dados ja existem nas tabelas atuais. Recharts ja esta instalado como dependencia.

