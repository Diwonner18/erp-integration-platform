

## Plano: Corrigir V7 e V8 (independentes do backend)

### V8 — Fallback de tipo de usuario muito permissivo
**Arquivo**: `src/contexts/AuthContext.tsx`, linha 73

Alterar o fallback de `return 'admin'` para `return 'obras'` na funcao `determineUserType`. Emails `@ctguedes.com.br` que nao correspondam a nenhum prefixo conhecido receberao o tipo `obras` em vez de `admin`.

### V7 — Formulario de perfil sem validacao nem persistencia
**Arquivo**: `src/pages/Configuracoes.tsx`

1. **Validacao com Zod** no `handleProfileUpdate`: nome min 2 caracteres, email valido. Exibir erros via `toast.error`.

2. **Persistencia**: ao salvar, atualizar o usuario em `ct-guedes-users` e `ct-guedes-user` no localStorage, e atualizar o estado do AuthContext (necessario expor uma funcao `updateProfile` no AuthContext).

3. **Verificacao de unicidade de email**: antes de salvar, verificar se o novo email ja pertence a outro usuario.

4. **Validacao da senha atual** no `handlePasswordChange`: buscar o usuario em `ct-guedes-users` e comparar `passwordData.currentPassword` com a senha armazenada. Rejeitar se nao corresponder.

5. **Persistir nova senha**: atualizar a senha no array `ct-guedes-users` no localStorage.

### Alteracoes no AuthContext
- Adicionar funcao `updateProfile(name, email)` que atualiza localStorage e estado.
- Adicionar funcao `changePassword(currentPassword, newPassword)` que valida a senha atual e persiste a nova.

### Arquivos afetados
- `src/contexts/AuthContext.tsx` — fallback V8 + novas funcoes `updateProfile` e `changePassword`
- `src/pages/Configuracoes.tsx` — validacao Zod, chamadas as novas funcoes, feedback de erro

