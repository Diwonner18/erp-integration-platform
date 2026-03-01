

## Plano: Corrigir 404 em "Confirmar Agendamentos"

### Problema

No `Dashboard.tsx`, a acao rapida "Confirmar Agendamentos" navega para `/agendamentos`, mas essa rota nao existe no `App.tsx`. A rota correta para programacao/agendamentos e `/programacao`.

### Correcao

**1 arquivo: `src/pages/Dashboard.tsx`**

Alterar o `path` de `/agendamentos` para `/programacao` na acao rapida "Confirmar Agendamentos" (dentro de `getQuickActions`, bloco `obras`).

