

# Fix: Mover banner de impersonação para parte inferior

## Situação
O código em `MainLayout.tsx` já tem `fixed bottom-0`, mas o banner ainda aparece no topo na preview. Isso pode ser um problema de cache/hot-reload. Vou reforçar o posicionamento e garantir que funcione.

## Mudanças em `src/components/Layout/MainLayout.tsx`

1. **Reforçar posicionamento inferior** do banner com estilos inline (`style={{ bottom: 0, top: 'auto' }}`) para garantir que não haja conflito com CSS utilitário
2. **Reduzir z-index** para `z-40` para não competir com modais
3. **Manter `pb-14`** no main quando banner ativo para evitar conteúdo escondido

Caso a mudança anterior tenha sido aplicada mas não compilada, esta nova escrita forçará o rebuild.

