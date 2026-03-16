

## Resolver problemas de acesso: criar usuários e adicionar Patricia como admin

### Diagnóstico

Verifiquei o banco de dados e **nenhum dos dois usuários existe**:
- `adm@ctguedes.com.br` -- nunca foi criado
- `patricia.ariki@ctguedes.com.br` -- nunca foi criado

Apenas 4 usuários existem no sistema (diwonner13, aline.guedes, clara.todescog, agostinho). Por isso o login falha com "credenciais inválidas" e o e-mail de recuperação não chega (o Supabase retorna 200 por segurança mas não envia nada se o usuário não existe).

### Plano

**1. Adicionar `patricia.ariki@ctguedes.com.br` na lista de admins autorizados**

Atualizar em 3 lugares:
- **`handle_new_user()`** -- adicionar o e-mail no bloco `IN (...)` que auto-atribui role `admin`
- **`assign_internal_role()`** -- adicionar na lista de e-mails permitidos para role `admin`
- **`manage-user/index.ts`** -- adicionar nos arrays `allowedAdminEmails`

**2. Criar os dois usuários via Edge Function `manage-user`**

Como os usuários não existem, precisamos criá-los. A forma mais segura é usar a edge function `manage-user` que já tem a lógica de criar usuário + atribuir role via `service_role`. Vou invocar a edge function duas vezes (logado como diwonner13 que é GT):
- Criar `adm@ctguedes.com.br` com nome "Administrador CTGuedes", senha `Demo@2026`, role `admin`
- Criar `patricia.ariki@ctguedes.com.br` com nome "Patricia Ariki", senha `Demo@2026`, role `admin`

**Alternativa**: Se preferir não depender de estar logado, posso criar os usuários diretamente via SQL migration usando `supabase.auth.admin.createUser` -- mas isso não é possível em migrations SQL puras. A melhor opção é usar o tool de insert/invoke para chamar a edge function, ou criar via dashboard do Supabase.

**Na prática**: Vou atualizar o código (migration SQL + edge function) para autorizar Patricia, e depois orientar você a criar os usuários pelo painel Admin do app ou pelo dashboard do Supabase.

### Arquivos modificados
- Nova migration SQL (atualizar `handle_new_user` e `assign_internal_role` para incluir `patricia.ariki@ctguedes.com.br`)
- `supabase/functions/manage-user/index.ts` (adicionar Patricia nos arrays de admin)
- `src/contexts/AuthContext.tsx` (atualizar comentário)

### Depois da implementacao
Você precisara criar os usuarios pelo dashboard do Supabase (Authentication > Users > Add User) ou logando como diwonner13@gmail.com e usando o painel de Gerenciar Usuarios:
- `adm@ctguedes.com.br` / `Demo@2026` / role: admin
- `patricia.ariki@ctguedes.com.br` / `Demo@2026` / role: admin

