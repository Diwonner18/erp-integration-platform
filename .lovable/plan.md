

# Auditoria Completa de Seguranca - Resultado Final

## Pontos Seguros Confirmados

| Area | Status |
|---|---|
| RLS em 26 tabelas | Todas habilitadas com politicas por role |
| Funcoes SECURITY DEFINER | `has_role`, `get_user_role`, `has_record_access`, `insert_audit_log`, `get_cliente_ids_for_user`, `get_related_cliente_ids`, `get_obra_ids_for_cliente` |
| Recursao infinita RLS | Corrigida com funcoes SECURITY DEFINER que bypassam RLS |
| PII de clientes escopada (LGPD) | `obras` e `financeira` so veem clientes vinculados as suas obras |
| Escalacao via INSERT em user_roles | Bloqueada por RESTRICTIVE `GT cannot assign admin role` |
| Escalacao via UPDATE em user_roles | Bloqueada por RESTRICTIVE `GT cannot update to admin role` |
| Edge Function manage-user | getClaims() + validacao de email para admin/GT |
| Edge Function purge-expired-logs | Retorna 403 para chamadas nao autorizadas |
| Auditoria SECURITY DEFINER | Captura UID do token, nao do frontend |
| Validacao Zod em todas as mutations | `validateInput()` aplicado em hooks de criacao |
| Validacao Zod no FileImportModal | Validacao por registro + limite 10MB |
| RESTRICTIVE em UPDATE/DELETE operacional | `created_by = auth.uid()` ou `has_record_access()` |
| Frontend sem inserts diretos em user_roles | Delegado a trigger e RPC |
| Troca de senha com re-auth | Exige senha atual antes de alterar |
| Tratamento de erros | Edge Functions retornam mensagens genericas, sem stacktrace |
| logs_auditoria sem INSERT/UPDATE/DELETE direto | Apenas via RPC `insert_audit_log` |

---

## Vulnerabilidade Encontrada

### ALTA - GT pode deletar role admin via API direta

**Fonte**: Security scan (finding `PRIVILEGE_ESCALATION`)

As politicas RESTRICTIVE existentes cobrem apenas INSERT e UPDATE. A politica PERMISSIVE `Gerenciador tecnico can manage roles` concede ALL (incluindo DELETE). Um GT pode executar:

```sql
DELETE FROM user_roles WHERE role = 'admin'
```

Isso remove o acesso do admin (carla@ctguedes.com.br) sem possibilidade de restauracao via API.

**Risco**: Denial of service administrativo. O GT nao se torna admin, mas elimina todos os admins do sistema, tornando-se o usuario de maior privilegio de facto.

**Solucao**: Adicionar politica RESTRICTIVE para DELETE:

```sql
CREATE POLICY "GT cannot delete admin role"
ON public.user_roles AS RESTRICTIVE
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR role != 'admin'::app_role
);
```

---

### MEDIA (Nao aplicavel) - Leaked Password Protection

Recurso exclusivo do plano Pro do Supabase. No plano Free, mitigado parcialmente pela validacao de senha forte no frontend (8+ caracteres, maiuscula, numero).

---

### BAIXA (Stale - Ja corrigida) - PII de clientes overexposure

O scanner ainda reporta este finding como stale (timestamp anterior a correcao). A politica `Internal users can view related clientes` ja usa `get_related_cliente_ids()` confirmado na query direta. Finding pode ser marcado como resolvido.

---

## Resumo

| Severidade | Qtd | Itens |
|---|---|---|
| CRITICA | 0 | - |
| ALTA | 1 | GT pode deletar role admin via DELETE em `user_roles` |
| MEDIA | 0 | Leaked Password Protection (Pro-only, nao aplicavel) |
| BAIXA | 0 | PII finding stale (ja corrigido) |

## Plano de Correcao

1. **Criar migration SQL** com politica RESTRICTIVE DELETE em `user_roles` que bloqueia remocao de registros com `role = 'admin'` por nao-admins
2. **Marcar finding stale** de PII como resolvido

### Arquivo a modificar
| Arquivo | Acao |
|---|---|
| Migration SQL (nova) | `CREATE POLICY "GT cannot delete admin role" ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR role != 'admin'::app_role)` |

