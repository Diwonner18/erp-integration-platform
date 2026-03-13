

# Auditoria de Seguranca - Resultado Final

## Pontos Seguros Confirmados

| Area | Status |
|---|---|
| RLS em todas as 26 tabelas | Todas habilitadas com politicas por role |
| Roles via tabela separada (`user_roles`) | Funcoes SECURITY DEFINER (`has_role`, `get_user_role`) |
| Frontend sem inserts diretos em `user_roles` | Delegado ao trigger `handle_new_user` e RPC `self_assign_area` |
| Validacao Zod em mutations individuais e bulk import | `validateInput()` + schemas no FileImportModal |
| Limite de arquivo 10MB no import | Validado antes do parse |
| Admin/GT hardcoded no DB | `assign_internal_role()` e `self_assign_area()` validam emails especificos |
| Auditoria SECURITY DEFINER | `insert_audit_log()` captura uid do token |
| Troca de senha com re-auth | `changePassword()` exige senha atual |
| Edge Function `manage-user` com `getClaims()` | JWT verificado corretamente |
| Edge Function `purge-expired-logs` com 403 | Bloqueia chamadas nao autorizadas |
| Expurgo LGPD automatico | 5 anos de retencao |
| Politicas RESTRICTIVE em UPDATE/DELETE | `created_by = auth.uid()` ou `has_record_access()` em todas as tabelas operacionais |
| PII de clientes escopada | `obras` e `financeira` so veem clientes vinculados as suas obras |
| INSERT restrito em `user_roles` | GT bloqueado de inserir role `admin` |

---

## Vulnerabilidade Encontrada

### ALTA - GT pode escalar para admin via UPDATE na tabela `user_roles`

**Fonte**: Security scan automatizado (finding `PRIVILEGE_ESCALATION`)

A politica PERMISSIVE `Gerenciador tecnico can manage roles` concede ALL (incluindo UPDATE) na tabela `user_roles`. As duas politicas RESTRICTIVE existentes (`Block direct role inserts` e `GT cannot assign admin role`) sao scoped apenas para INSERT. Isso significa que o GT pode fazer:

```sql
UPDATE user_roles SET role = 'admin' WHERE user_id = '<qualquer_id>'
```

**Risco**: Escalacao de privilegios. O GT pode se tornar admin ou promover qualquer usuario via API REST direta do Supabase (sem passar pela Edge Function).

**Solucao**: Adicionar uma politica RESTRICTIVE para UPDATE que espelha a restricao de INSERT:

```sql
CREATE POLICY "GT cannot update to admin role"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role != 'admin'::app_role
);
```

---

### MEDIA - Leaked Password Protection desabilitada

**Fonte**: Security scan (finding `SUPA_auth_leaked_password_protection`)

Senhas comprometidas em vazamentos publicos nao sao bloqueadas durante registro/troca.

**Solucao**: Habilitar manualmente no Supabase Dashboard: Authentication > Providers > Email > Leaked Password Protection.

---

## Resumo

| Severidade | Qtd | Itens |
|---|---|---|
| CRITICA | 0 | - |
| ALTA | 1 | GT pode escalar para admin via UPDATE em `user_roles` |
| MEDIA | 1 | Leaked Password Protection desabilitada |
| BAIXA | 0 | - |

## Plano de Correcao

1. **Criar migration SQL** com politica RESTRICTIVE para UPDATE em `user_roles` que bloqueia `role = 'admin'` para nao-admins
2. **Acao manual do usuario**: Habilitar Leaked Password Protection no Supabase Dashboard

### Arquivos a modificar
| Arquivo | Acao |
|---|---|
| Migration SQL (nova) | Criar politica RESTRICTIVE UPDATE em `user_roles` |

