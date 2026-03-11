

## Plano: Mover restricao admin do frontend para o banco de dados

### Problema

A restricao de admin para `carla@ctguedes.com.br` existe apenas no frontend (`AuthContext.tsx` linha 403-412). Qualquer usuario com role `admin` no banco pode bypassar isso via API direta.

### Solucao

1. **SQL Migration**: Alterar a function `assign_internal_role` para impedir que o role `admin` seja atribuido a qualquer email diferente de `carla@ctguedes.com.br`
2. **AuthContext.tsx**: Remover o check hardcoded de email no `hasPermission` -- a restricao agora e enforced no banco

### Detalhes tecnicos

**Migration SQL:**
```sql
-- Atualizar assign_internal_role para bloquear admin para outros emails
CREATE OR REPLACE FUNCTION public.assign_internal_role(...)
  -- Adicionar: IF _role = 'admin' AND _target_email != 'carla@ctguedes.com.br' THEN RAISE EXCEPTION
```

**AuthContext.tsx:**
- Remover linhas 403-412 (o bloco `if (user?.type === 'admin' && user?.email !== 'carla@ctguedes.com.br')`)
- `hasPermission` passa a confiar no role do banco, que ja nao pode ser `admin` para outros usuarios

### Resultado

- Finding `hardcoded_email_admin` resolvido
- Restricao admin enforced no banco via SECURITY DEFINER
- Impossivel atribuir role admin a outro email mesmo via API direta

