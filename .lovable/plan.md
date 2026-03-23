

# Etapa 3: Permissoes por Perfil de Usuario

Reescrever completamente a pagina de Permissoes conforme pedido da Carla Todesco: organizar por **perfil de usuario** (nao por departamento), com controle granular de acoes por modulo.

---

## 1. Banco de Dados (1 migration)

### Tabela `permissoes_perfil`
```text
id, perfil (text: 'obras', 'financeira', 'comercial', 'cliente'),
modulo (text: 'propostas', 'medicoes', 'colaboradores', 'epis', 'horas_extras', 'materiais', 'despesas', 'boletins', etc),
pesquisar (boolean default true),
incluir_editar (boolean default false),
excluir (boolean default false),
acesso_modulo (boolean default true),
created_at, updated_at
```

RLS: apenas admin e GT podem ler/escrever.

Seed inicial com permissoes padrao para cada perfil x modulo.

---

## 2. Frontend (`src/pages/Admin/Permissoes.tsx`) - Reescrita total

Layout inspirado no Obra Prima (imagens que as clientes enviaram):

- **Tabs ou cards** por perfil: Obras, Financeiro, Comercial, Cliente
- Para cada perfil, uma **tabela/grid** com:
  - Linhas = modulos do sistema (Propostas, Medicoes, Colaboradores, EPIs, Horas Extras, Materiais, Despesas, Boletins, etc)
  - Colunas = acoes: Pesquisar | Incluir/Editar | Excluir | Acesso ao Modulo
  - Cada celula = checkbox/switch
- Botao Salvar que persiste no Supabase
- Auto-save apos alteracoes

---

## 3. Hooks

- `usePermissoesPerfil(perfil)` - busca permissoes de um perfil
- `useAllPermissoesPerfil()` - busca todas
- `useUpsertPermissoesPerfil()` - upsert (insert on conflict update)

---

## 4. Integracao com AccessGuard (futuro)

A tabela fica pronta para ser consumida pelo `AccessGuard.tsx` e pelo `ProtectedRoute.tsx` para enforcement real. Nesta etapa apenas criamos a UI de configuracao + persistencia.

---

## Arquivos

| Tipo | Arquivo |
|---|---|
| Migration | 1 SQL (tabela + seed + RLS) |
| Reescrita | `src/pages/Admin/Permissoes.tsx` |
| Novo hook | Em `useSupabaseData.ts` ou arquivo dedicado |
| Update | `src/integrations/supabase/types.ts` |

