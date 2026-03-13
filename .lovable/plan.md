
Objetivo: corrigir o corte de botões/conteúdo e garantir rolagem vertical consistente em todas as telas autenticadas, com banner de impersonação sem atrapalhar.

Plano de implementação

1) Ajustar a área rolável principal no `MainLayout`
- Arquivo: `src/components/Layout/MainLayout.tsx`
- Problema atual encontrado: o `<main>` está com `h-[calc(100vh)]` + `pt-16`, enquanto header e banner são `fixed`, o que pode deixar parte útil da tela “fora” sem disparar scroll no momento certo.
- Mudança:
  - Remover a dependência de `pt-16` para compensar header.
  - Usar `mt-16` e altura real disponível:
    - sem impersonação: `h-[calc(100vh-4rem)]`
    - com impersonação: `h-[calc(100vh-4rem-2.5rem)]` (ou manter `h-[calc(100vh-4rem)]` + `pb-14`, escolhendo uma estratégia única e consistente)
  - Manter `overflow-y-auto` e adicionar `overflow-x-hidden`.

2) Garantir scrollbar sempre previsível
- No `<main>`, trocar para `overflow-y-scroll` (em vez de `auto`) para deixar a barra sempre presente quando o SO permitir.
- Adicionar `scrollbar-gutter: stable` via `style` no `<main>` para evitar “pulo” de layout e deixar a área de rolagem mais clara.

3) Consolidar banner de impersonação sem interferir no conteúdo
- Manter o banner fixo embaixo (`fixed bottom-0 left-0 right-0`) para todos os perfis (obras, financeira, comercial, cliente), já que todos passam pelo mesmo `impersonatedRole`.
- Garantir que o espaço do banner seja descontado da altura do `<main>` (ou padding inferior equivalente), para que botões finais nunca fiquem atrás da barra.

4) Verificação rápida nas páginas com filtros/botões
- Validar em páginas que usam `AdvancedFilters` (ex.: Medições, Programação, Boletins), pois foram as telas afetadas.
- Confirmar:
  - rolagem para cima/baixo com mouse e touchpad,
  - botões superiores/inferiores acessíveis,
  - sem corte com banner ativo.

Detalhes técnicos (resumo)
- Arquivo principal: `MainLayout.tsx`.
- Ajustes-chave: cálculo correto de altura útil, rolagem vertical do `<main>`, e reserva explícita de espaço para o banner inferior.
- Escopo: correção global de layout (não pontual por página), já que todas as telas autenticadas passam pelo `MainLayout`.
