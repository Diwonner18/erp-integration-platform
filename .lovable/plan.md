

# Ajuste de UX: Relatórios Financeiros orientados por dados

## Problema
Três páginas financeiras exibem botões de exportação e relatórios mesmo sem dados, criando experiência confusa:
1. **RelatoriosFinanceiros.tsx** — mostra cards com botões PDF/Excel mesmo com 0 registros
2. **FechamentoMensal.tsx** — lista documentos com 0 registros (botões já desabilitados, mas ainda visíveis)
3. **ExportarDados.tsx** — lista 4 relatórios PDF estáticos (Demonstrativo Mensal, Retenções, Inadimplência, Resumo por Cliente) com botões funcionais que só mostram toast fake

## Plano

### 1. `RelatoriosFinanceiros.tsx`
- Verificar se há dados globais (`medicoes.length + despesas.length + retencoes.length === 0`)
- **Sem dados**: mostrar empty state com ícone, mensagem "Nenhum dado disponível para geração de relatório" e links/botões para "Criar primeira medição" (`/obras/medicoes`) e "Registrar despesa" (`/financeiro/despesas`)
- **Com dados**: mostrar apenas os reports que têm `count > 0` (ocultar os com 0 registros em vez de mostrar botões desabilitados)

### 2. `FechamentoMensal.tsx`
- Após filtrar por período, se todos os documentos tiverem `count === 0`: mostrar empty state no card de Documentos com mensagem "Nenhum registro encontrado para o período selecionado"
- Ocultar o botão "Exportar Todos" quando não houver documentos com dados
- Mostrar apenas documentos que têm `count > 0`

### 3. `ExportarDados.tsx`
- Integrar com dados reais: importar `useMedicoes`, `useDespesas`, `useRetencoes`, `useClientes` 
- Seção "Relatórios PDF": gerar dinamicamente com base nos dados existentes — só mostrar "Demonstrativo Mensal" se houver medições/despesas, "Relatório de Retenções" se houver retenções, etc.
- **Sem dados em nenhuma categoria**: mostrar empty state global com orientação para alimentar o sistema
- Seção "Exportação Personalizada": popular selects de período e cliente com dados reais do banco

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/pages/Financeiro/RelatoriosFinanceiros.tsx` | Empty state + ocultar relatórios sem dados |
| `src/pages/Financeiro/FechamentoMensal.tsx` | Empty state por período + ocultar docs vazios |
| `src/pages/Financeiro/ExportarDados.tsx` | Integrar dados reais + relatórios dinâmicos + empty state |

