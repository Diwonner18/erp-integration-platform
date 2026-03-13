

# Fechamento Mensal: Substituir seletores Mês/Ano por DatePicker

## Problema
Os seletores de mês e ano estão limitados a uma lista fixa de anos (2023-2026). O usuário quer filtrar por data específica (dia) usando um calendário.

## Solução

Substituir os dois `Select` (mês e ano) por um **DatePicker** com calendário inline. O usuário seleciona uma data e os documentos são filtrados pelo dia exato selecionado.

### Mudanças em `src/pages/Financeiro/FechamentoMensal.tsx`

1. **Remover** imports de `Select` e a lista de `months`/`years`
2. **Adicionar** imports de `Calendar`, `Popover`, `format` do date-fns e `ptBR` locale
3. **Substituir** estados `selectedMonth`/`selectedYear` por um único `selectedDate: Date | undefined`
4. **Substituir** o card de Período: em vez de dois selects, exibir um **calendário inline** (Calendar component direto no card, sem popover, para melhor UX)
5. **Atualizar filtro**: em vez de `startsWith(prefix)` com `YYYY-MM`, comparar com `format(selectedDate, 'yyyy-MM-dd')` — filtrando pelo dia exato
6. **Atualizar títulos dos exports**: usar `format(selectedDate, "dd/MM/yyyy", { locale: ptBR })` no título dos documentos
7. **Atualizar empty states**: mostrar a data formatada na mensagem de "nenhum registro encontrado"

### UI do Card Período
- Calendário exibido diretamente no card (sem popover), ocupando a coluna lateral
- Data selecionada exibida acima do calendário em formato legível

