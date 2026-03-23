

# Proxima Etapa: Refinamento do RDO e Exportacao de Relatorios

## Contexto

Todas as etapas de permissoes estao concluidas. Os dois itens pendentes do feedback das clientes sao:

1. **Refinamento visual do RDO** — destacar nao conformidades com cores/badges de alerta
2. **Correcao da exportacao XLS/PDF** na Central de Relatorios

---

## 1. RDO: Destacar nao conformidades

No `RelatorioDiarioObra.tsx`, na aba de visualizacao dos relatorios ja registrados:

- Adicionar badge vermelha "Nao Conforme" quando o campo `nao_conformidades` estiver preenchido
- Highlight visual (borda vermelha ou fundo vermelho claro) nos cards de relatorios com nao conformidades
- Filtro rapido para mostrar apenas relatorios com nao conformidades
- Na listagem em tabela, coluna "Status" com indicador visual (verde = conforme, vermelho = nao conforme)

**Arquivo**: `src/pages/Obras/RelatorioDiarioObra.tsx`

---

## 2. Central de Relatorios: Exportacao XLS/PDF

No `Relatorios.tsx` atual:

- Verificar se `exportToPDF` e `exportToExcel` funcionam corretamente com os dados filtrados
- Adicionar botao de exportacao XLS (atualmente so tem PDF)
- Garantir que os filtros (obra, status, periodo) sao aplicados antes da exportacao
- Tratar caso de dados vazios (mostrar toast de aviso)

**Arquivos**: `src/pages/Shared/Relatorios.tsx`, `src/lib/exportUtils.ts`

---

## Resumo

| Tipo | Arquivo |
|---|---|
| Alteracao | `src/pages/Obras/RelatorioDiarioObra.tsx` (destaque nao conformidades) |
| Alteracao | `src/pages/Shared/Relatorios.tsx` (exportacao XLS + PDF) |
| Alteracao | `src/lib/exportUtils.ts` (funcao exportToExcel se nao existir) |

