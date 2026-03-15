

## Trocar Email Admin + Adicionar Segundo Admin

### Mudanças necessárias

**1. Edge Function `manage-user/index.ts`**
- Trocar todas as referências de `carla@ctguedes.com.br` para `carla.todesco@ctguedes.com.br`
- Permitir o role `admin` também para `adm@ctguedes.com.br` (lista de emails admin autorizados em vez de email único)

**2. DB Functions (via migration SQL)**
- Atualizar `handle_new_user()`: trocar `carla@ctguedes.com.br` → `carla.todesco@ctguedes.com.br` e adicionar `adm@ctguedes.com.br` como auto-assign admin
- Atualizar `assign_internal_role()`: permitir admin para ambos os emails

**3. AuthContext.tsx**
- Atualizar comentário (apenas cosmético)

**4. Criar o usuário `adm@ctguedes.com.br`**
- Via migration SQL com service_role: criar auth user + profile + role admin
- Senha: `Demo@2026` (mesma padrão) ou outra a definir
- Nome: "Administrador CTGuedes"

**5. Atualizar email da Carla no auth**
- Se a Carla já existe no banco com `carla@ctguedes.com.br`, será necessário atualizar via admin API (edge function ou SQL)
- Se ainda não existe, apenas mudar as referências basta

### Arquivos modificados
- `supabase/functions/manage-user/index.ts`
- `src/contexts/AuthContext.tsx` (comentário)
- Nova migration SQL (atualizar triggers/functions + criar usuário adm)

