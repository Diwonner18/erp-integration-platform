

# Tours Independentes por Página (mantendo Dashboard como está)

O tour do Dashboard permanece intacto. Cada página ganha seu próprio tour independente, ativado pelo botão "?" no Header.

## Abordagem

Cada página que tiver tour disponível vai usar o mesmo `useTour` + `ProductTour` internamente (igual ao Dashboard). O Header passa `onStartTour` do MainLayout, que por sua vez repassa para a página ativa. Como cada página é independente, a solução mais simples é: cada página importa `useTour`, `ProductTour`, e define seus steps localmente.

Porém, como são ~25 páginas, para evitar repetir imports em todas, vamos criar um **hook wrapper** (`usePageTour`) e um **componente wrapper** (`PageTourProvider`) que cada página usa com uma linha. Os steps ficam centralizados em `pageTourSteps.ts`.

## Arquivos

### 1. Novo: `src/components/Tour/pageTourSteps.ts`
Exporta `getPageTourSteps(pathname: string): TourStep[]` com 3-6 steps por rota. Rotas cobertas (~25):

**Obras:** `/programacao`, `/medicoes`, `/alteracoes-escopo`, `/materiais-equipamentos`, `/materiais`, `/epis`, `/horas-extras`, `/relatorio-diario-obra`, `/obras-em-andamento`, `/obras-concluidas`, `/obras-agendadas`, `/equipe-ativa`, `/central-alertas`, `/relatorios-obra`

**Financeiro:** `/boletins-medicao`, `/financeiro`, `/lancamento-despesas`, `/retencoes`, `/fechamento-mensal`, `/relatorios-financeiros`, `/exportar-dados`

**Comercial:** `/propostas`, `/valores-unitarios`, `/aceites`, `/modelos-contrato`, `/relatorios-comerciais`

**Admin:** `/usuarios`, `/permissoes`, `/aprovacoes`, `/automacao`

**Cliente:** `/minhas-obras`, `/solicitar-agendamento`, `/minhas-propostas`, `/meus-relatorios`, `/meus-pagamentos`

**Geral:** `/configuracoes`, `/relatorios`

### 2. Novo: `src/hooks/usePageTour.ts`
Hook que combina `useLocation()` + `useTour` + busca steps de `getPageTourSteps`. Retorna `{ tourProps, startTour }` — tudo que a página precisa para renderizar o `ProductTour`.

### 3. Novo: `src/components/Tour/PageTourWrapper.tsx`
Componente simples que recebe `usePageTour` e renderiza `<ProductTour>` automaticamente. Cada página adiciona `<PageTourWrapper />` ao seu JSX.

### 4. Modificar: `src/components/Layout/MainLayout.tsx`
- Integrar `usePageTour` para que o botão "?" do Header chame `startTour` da página atual
- Usar `useLocation` para detectar rota e buscar steps correspondentes
- Renderizar `<ProductTour>` no nível do layout (assim as páginas não precisam adicionar nada)
- Manter a prop `onStartTour` do Dashboard funcionando (rota `/` usa o tour existente do Dashboard)

### 5. Sem mudanças no Dashboard
O `Dashboard.tsx` continua com `useTour`, `WelcomeModal` e `ProductTour` como está. Na rota `/`, o Header chama o `resetTour` do Dashboard.

### 6. Adicionar `data-tour` em ~25 páginas
Cada página recebe 3-6 atributos `data-tour` nos elementos-chave. Padrão por página:
- `data-tour="page-header"` — título/descrição
- `data-tour="page-filters"` — filtros avançados
- `data-tour="page-search"` — barra de busca
- `data-tour="page-new-btn"` — botão de criar (Nova Medição, Novo Boletim, etc.)
- `data-tour="page-list"` — lista/tabela/grid principal
- `data-tour="page-export"` — botões de exportação
- `data-tour="page-actions"` — ações de aprovação/rejeição

### Fluxo
1. Dashboard: primeiro login → WelcomeModal + tour (como hoje)
2. Qualquer outra página: usuário clica "?" → `MainLayout` detecta rota, busca steps, inicia `ProductTour`
3. Se a página não tem steps definidos, o botão "?" não faz nada (ou mostra toast "Tour não disponível")

## Estimativa
- 3 arquivos novos (`pageTourSteps.ts`, `usePageTour.ts`, `PageTourWrapper.tsx`)
- 1 modificado (`MainLayout.tsx`)
- ~25 páginas: adição de atributos `data-tour` (mudanças pequenas, 3-6 linhas por página)
- Dashboard: sem alterações

