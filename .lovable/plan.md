

## Modo de Demonstração Temporário

### Objetivo
Criar 3 usuários demo (aline, clara, agostinho) com acesso a TODAS as áreas do sistema, mas bloqueados de realizar ações destrutivas (criar, editar, deletar dados).

### Abordagem

Reaproveitar o mecanismo de impersonação já existente para o `gerenciador_tecnico`. Os usuários demo terão role `gerenciador_tecnico` (que já possui SELECT em todas as tabelas via RLS) e terão `is_demo = true` no perfil. No frontend, bloquearemos todas as mutações para demo users.

### Mudanças

**1. Banco de Dados**
- Adicionar coluna `is_demo` (boolean, default false) na tabela `profiles`
- Criar 3 usuários via Edge Function `manage-user` com role `gerenciador_tecnico`:
  - `aline.guedes@ctguedes.com.br` - Aline Guedes
  - `clara.todescog@ctguedes.com.br` - Clara Todesco
  - `agostinho@ctguedes.com.br` - Agostinho
- Senha padrão: `Demo@2026`
- Atualizar `is_demo = true` nos perfis criados
- Temporariamente ajustar a Edge Function `manage-user` para permitir o role `gerenciador_tecnico` para esses 3 e-mails (ou inserir diretamente via SQL com service_role)

**2. Frontend - AuthContext**
- Adicionar campo `isDemo` ao tipo `User`
- Carregar `is_demo` do perfil no `loadUserData`
- Exportar `isDemo` no contexto

**3. Frontend - Bloqueio de Mutações**
- Criar hook `useDemoGuard()` que retorna `{ isDemoUser, guardAction }` 
- `guardAction(fn)` verifica se é demo user: se sim, mostra toast "Modo demonstração - ação bloqueada" e retorna; caso contrário, executa `fn()`
- Aplicar nos botões de criar/editar/deletar nos módulos principais (modais de criação, botões de exclusão)

**4. Frontend - Sidebar**
- Demo users com `is_demo = true` veem o painel de troca de área (impersonação) igual ao GT, para navegar entre obras/financeiro/comercial/cliente
- Adicionar banner "MODO DEMO" no topo do sidebar

**5. Frontend - ProtectedRoute**
- Demo users (`is_demo`) passam por todas as rotas (como GT)

**6. Segurança (RLS)**
- Não é necessário alterar RLS: o role `gerenciador_tecnico` já tem apenas SELECT na maioria das tabelas, sem INSERT/UPDATE/DELETE nas tabelas operacionais. A proteção de escrita já existe nas policies.

### Criação dos Usuários

Como a Edge Function restringe GT a `diwonner13@gmail.com`, vou criar os usuários via SQL direto (usando service_role que bypassa RLS):
1. Criar auth users com `auth.admin.createUser`
2. Inserir roles como `gerenciador_tecnico` 
3. Marcar `is_demo = true`

Alternativa: modificar temporariamente a Edge Function para aceitar esses 3 e-mails como GT. Essa é a opção mais limpa pois mantém o fluxo padrão.

### Script de Limpeza

Para remover tudo depois:
```sql
-- Deletar roles e profiles dos demo users
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM profiles WHERE is_demo = true);
DELETE FROM profiles WHERE is_demo = true;
-- Deletar auth users via admin API (Edge Function ou dashboard)
-- Remover coluna is_demo
ALTER TABLE profiles DROP COLUMN IF EXISTS is_demo;
```

### Arquivos Modificados
- `supabase/functions/manage-user/index.ts` - permitir GT temporário para 3 emails
- `src/contexts/AuthContext.tsx` - adicionar `isDemo`, carregar do perfil
- `src/components/Auth/ProtectedRoute.tsx` - permitir demo users em todas as rotas
- `src/components/Layout/Sidebar.tsx` - banner demo + impersonação para demo users
- `src/hooks/useDemoGuard.ts` - novo hook para bloquear mutações
- Modais de criação/edição/exclusão - aplicar `guardAction`
- Migration SQL - adicionar `is_demo` column + criar usuários

