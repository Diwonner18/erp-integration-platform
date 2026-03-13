

# Mover banner de impersonação para baixo e adicionar scroll

## Arquivo: `src/components/Layout/MainLayout.tsx`

1. **Banner → parte inferior**: Mudar de `fixed top-0` para `fixed bottom-0` — aplica-se a todos os roles (Obras, Financeiro, Comercial, Cliente)
2. **Scroll no conteúdo**: `<main>` recebe `overflow-y-auto` com `h-[calc(100vh-4rem)]`
3. **Padding inferior**: Quando banner ativo, adicionar `pb-12` ao main para conteúdo não ficar escondido
4. **Remover `mt-7`** do main (não precisa mais empurrar conteúdo para baixo)
5. **Wrapper**: Trocar `min-h-screen` por `h-screen overflow-hidden`

