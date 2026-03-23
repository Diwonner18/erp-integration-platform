

# Correção do erro 404 em /colaboradores

## Diagnóstico

A rota `/colaboradores` **existe corretamente** no `App.tsx` (linha 262), o import do `ColaboradoresPage` está correto (linha 65), e o arquivo `src/pages/Colaboradores/ColaboradoresPage.tsx` existe. O link no Sidebar também aponta para `/colaboradores`.

O erro 404 é provavelmente causado por **cache do build/HMR** que não atualizou após as últimas alterações. Como não há nenhum bug no código, a solução é forçar uma rebuild.

## Plano

1. **Forçar rebuild** adicionando um comentário inofensivo no `App.tsx` para invalidar o cache do Vite e garantir que a rota seja reconhecida.

Isso deve resolver o 404 sem nenhuma mudança funcional.

