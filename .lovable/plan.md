

# Product Tour com Pop-up de Boas-Vindas

## Resumo

Ao fazer login pela primeira vez, o usuario vera um dialog de boas-vindas personalizado por tipo (ex: "Bem-vindo, Joao! Voce e Administrador do sistema CT Guedes") com duas opcoes: **"Fazer o Tour"** ou **"Pular"**. Se aceitar, inicia um tour step-by-step guiado com spotlight nos elementos da interface. A flag de primeiro acesso fica salva no `localStorage` por user ID.

## Arquivos a criar

### 1. `src/components/Tour/WelcomeModal.tsx`
- Dialog usando o componente `Dialog` existente
- Exibe nome do usuario, tipo/funcao com descricao amigavel
- Icone de graduacao/mapa
- Dois botoes: "Iniciar Tour" (primary) e "Agora nao" (outline)
- Ao clicar "Iniciar Tour", fecha o modal e dispara o tour

### 2. `src/components/Tour/ProductTour.tsx`
- Componente overlay com spotlight (box-shadow inset no elemento alvo)
- Tooltip posicionado dinamicamente via `getBoundingClientRect()`
- Navegacao: Anterior / Proximo / Pular (X)
- Indicador de progresso (step 2 de 7)
- Transicao suave entre steps

### 3. `src/components/Tour/TourTooltip.tsx`
- Tooltip estilizado com titulo, descricao, botoes e barra de progresso
- Posicionamento automatico (top/bottom/left/right) baseado no espaco disponivel

### 4. `src/components/Tour/tourSteps.ts`
- Steps definidos por user type com: `selector` (CSS), `title`, `description`, `position`
- **Admin (8 steps):** sidebar, dashboard stats, gerenciar usuarios, permissoes, aprovacoes, programacao, relatorios, configuracoes
- **Obras (6 steps):** sidebar, programacao, medicoes, materiais, alteracoes escopo, relatorio diario
- **Financeira (5 steps):** sidebar, boletins, controle financeiro, retencoes, fechamento
- **Comercial (5 steps):** sidebar, propostas, valores unitarios, aceites, modelos contrato
- **Cliente (4 steps):** sidebar, minhas obras, solicitar agendamento, minhas propostas

### 5. `src/hooks/useTour.ts`
- Estado: `currentStep`, `isActive`, `showWelcome`
- `localStorage` key: `tour_completed_${userId}`
- Funcoes: `startTour()`, `nextStep()`, `prevStep()`, `skipTour()`, `resetTour()`
- Verifica no mount se e primeiro acesso → seta `showWelcome = true`

## Arquivos a modificar

### 6. `src/pages/Dashboard.tsx`
- Importar `WelcomeModal` e `ProductTour`
- Usar `useTour` hook
- Renderizar `WelcomeModal` (controlado pelo hook) e `ProductTour` quando ativo

### 7. `src/components/Layout/Header.tsx`
- Adicionar botao com icone `HelpCircle` ao lado do sino de notificacoes
- Ao clicar, reinicia o tour (`resetTour()` do hook via contexto ou callback)

## Fluxo

```text
Login → Dashboard monta → useTour verifica localStorage
  ↓
Primeiro acesso? → WelcomeModal aparece
  ↓
"Iniciar Tour" → Tour step-by-step com spotlight
  ↓
Ultimo step ou "Pular" → Salva flag no localStorage
```

## Detalhes tecnicos

- Sem bibliotecas externas - React puro + CSS
- Overlay via React Portal (`createPortal`) com `position: fixed` e `z-index: 9999`
- Spotlight via `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)` no elemento alvo
- `ResizeObserver` + `scroll` listener para reposicionar tooltip
- Cores CT Guedes (primary do Tailwind) nos botoes e destaques

