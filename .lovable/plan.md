

# Corrigir Sidebar e Permissões para Admin (Patricia)

## Problema
Patricia (admin) reportou dois problemas:
1. **Falta seção CLIENTE no sidebar** — O sidebar do admin tem caixinhas para ADMINISTRAÇÃO, COMERCIAL, OBRAS, FINANCEIRO, mas não tem CLIENTE. Ela quer ver as páginas do portal do cliente (Minhas Obras, Minhas Propostas, etc.)
2. **Falta o Agente Temporário para admin** — O botão de impersonação só aparece para `gerenciador_tecnico` e demo (linha 302), não para admin
3. **Permissões bloqueiam escrita durante impersonação** — Mesmo problema do plano anterior: admin/GT/demo perdem permissões de escrita ao impersonar

## Mudanças

### 1. `src/components/Layout/Sidebar.tsx`

**Adicionar seção CLIENTE no `getAdminSections`** (após FINANCEIRO, ~linha 133):
```ts
{
  section: 'CLIENTE',
  items: [
    { icon: Calendar, label: 'Solicitar Programação', path: '/solicitar-agendamento', show: true },
    { icon: ClipboardList, label: 'Minhas Obras', path: '/minhas-obras', show: true },
    { icon: FileText, label: 'Minhas Propostas', path: '/minhas-propostas', show: true },
    { icon: BarChart3, label: 'Meus Relatórios', path: '/meus-relatorios', show: true },
    { icon: Wallet, label: 'Meus Pagamentos', path: '/meus-pagamentos', show: true },
  ],
},
```

**Mostrar Agente Temporário para admin** — Linha 302, mudar de:
```ts
if (user.type !== 'gerenciador_tecnico' && !isDemo) return null;
```
Para:
```ts
if (user.type !== 'gerenciador_tecnico' && user.type !== 'admin' && !isDemo) return null;
```

### 2. `src/contexts/AuthContext.tsx` — `startImpersonation`
Não sobrescrever `permissions` quando user real for admin/GT:
```ts
const startImpersonation = (role: UserType) => {
  if (user?.type !== 'gerenciador_tecnico' && user?.type !== 'admin' && !user?.isDemo) return;
  setImpersonatedRole(role);
  if (user?.type === 'admin' || user?.type === 'gerenciador_tecnico') return;
  setPermissions(getPermissionsByUserType(role));
};
```

### 3. `src/components/Auth/ProtectedRoute.tsx` — Linha 39
Adicionar `realType === 'admin'` ao bypass:
```ts
if (realType === 'gerenciador_tecnico' || realType === 'admin' || user.isDemo) {
  return <>{children}</>;
}
```

### 4. `src/hooks/usePermissoesPerfil.ts`
Em `useUserModulePermissions` e `useAllUserPermissions`, usar `user.type` (real) em vez de `effectiveType` para `isFullAccess`:
```ts
const isFullAccess = user?.type === 'admin' || user?.type === 'gerenciador_tecnico' || user?.isDemo;
```

### 5. `src/hooks/useDemoGuard.ts`
Permitir demo salvar durante impersonação:
```ts
const { user, impersonatedRole } = useAuth();
const isDemoUser = (user?.isDemo ?? false) && !impersonatedRole;
```

## Arquivos editados
- `src/components/Layout/Sidebar.tsx` — Seção CLIENTE + Agente Temporário para admin
- `src/contexts/AuthContext.tsx` — Manter permissões admin durante impersonação
- `src/components/Auth/ProtectedRoute.tsx` — Bypass admin em rotas
- `src/hooks/usePermissoesPerfil.ts` — Full access baseado no role real
- `src/hooks/useDemoGuard.ts` — Demo pode salvar ao impersonar

