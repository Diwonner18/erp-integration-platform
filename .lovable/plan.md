

# Etapa 4: Enforcement Real das Permissoes via `permissoes_perfil`

Integrar a tabela `permissoes_perfil` (ja criada e populada) com o frontend para que as configuracoes feitas pelo admin na pagina de Permissoes realmente controlem o que cada perfil pode ver e fazer.

---

## Arquitetura

```text
permissoes_perfil (DB)
        |
  useUserModulePermissions(modulo) -- hook que busca permissoes do perfil do user logado
        |
  Sidebar.tsx         -- esconde itens de menu se acesso_modulo = false
  Pages (EPIs, etc.)  -- esconde botoes Novo/Editar/Excluir conforme pesquisar/incluir_editar/excluir
```

---

## 1. Novo hook: `useUserModulePermissions`

Em `src/hooks/usePermissoesPerfil.ts`, adicionar:

- `useUserModulePermissions(modulo: string)` -- retorna `{ acesso_modulo, pesquisar, incluir_editar, excluir, isLoading }` para o perfil do usuario logado (usa `effectiveType` do AuthContext)
- `useAllUserPermissions()` -- retorna todas as permissoes do perfil do usuario (para o Sidebar filtrar modulos)

Admin e GT sempre retornam tudo `true` (bypass).

---

## 2. Sidebar: filtrar por `acesso_modulo`

Atualizar `Sidebar.tsx` para consumir `useAllUserPermissions()` e esconder itens de menu cujo modulo tenha `acesso_modulo = false`.

Mapeamento modulo -> path:
- `propostas` -> `/propostas`
- `medicoes` -> `/medicoes`
- `colaboradores` -> `/colaboradores`
- `epis` -> `/epis`
- `horas_extras` -> `/horas-extras`
- `materiais` -> `/materiais-equipamentos`
- `programacoes` -> `/programacao`
- `despesas` -> `/despesas`
- `boletins` -> `/boletins`
- etc.

---

## 3. Paginas operacionais: esconder botoes

Nas paginas principais (EPIs, HorasExtras, Materiais, Medicoes, Colaboradores, etc.):
- Usar `useUserModulePermissions('epis')` (por exemplo)
- Se `incluir_editar = false`, esconder botao "Novo" e desabilitar edicao
- Se `excluir = false`, esconder botao de exclusao
- Se `pesquisar = false`, esconder campo de busca (raro, mas previsto)

Paginas a atualizar (6 principais):
- `EPIs.tsx`
- `HorasExtras.tsx`
- `Materiais.tsx` / `MateriaisEquipamentos.tsx`
- `Medicoes.tsx`
- `ColaboradoresPage.tsx`
- `Propostas.tsx`

---

## 4. ProtectedRoute: bloquear acesso direto por URL

Atualizar `ProtectedRoute.tsx` para, alem de checar `allowedUserTypes`, tambem verificar `acesso_modulo` na tabela `permissoes_perfil`. Se o admin desativou o acesso ao modulo para aquele perfil, redirecionar para pagina de acesso negado.

---

## Arquivos

| Tipo | Arquivo |
|---|---|
| Alteracao | `src/hooks/usePermissoesPerfil.ts` (novos hooks) |
| Alteracao | `src/components/Layout/Sidebar.tsx` (filtro por acesso_modulo) |
| Alteracao | `src/components/Auth/ProtectedRoute.tsx` (check modulo) |
| Alteracao | 6 paginas operacionais (botoes condicionais) |

Nenhuma migration necessaria -- a tabela e os dados ja existem.

