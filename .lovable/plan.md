

# Auditoria Completa de Segurança -- CT Guedes (Atualização)

## Resumo Executivo

Após a implementação das 3 correções da auditoria anterior (split da política GT, validação Zod em UPDATEs, documentação de Edge Functions), o sistema foi re-escaneado. **Nenhuma vulnerabilidade nova foi encontrada.** Os 4 findings do scan automático foram resolvidos:

- 2 confirmados como duplicatas/falsos positivos de findings anteriores (já ignorados)
- 1 já ignorado anteriormente (Leaked Password Protection -- requer Supabase Pro)
- 1 confirmado como seguro por design (audit logs)

---

## Status dos Findings do Scan

### 1. Leaked Password Protection Disabled (WARN)
**Status:** Ignorado (mantido)
**Motivo:** Requer plano Supabase Pro. Mitigado por validação de senha no frontend (8+ chars, maiúscula, número) e rate limiting (5 tentativas / 30s lockout).

### 2. Audit logs insertion concern (WARN)
**Status:** Seguro por design -- nenhuma ação necessária
**Análise:** A tabela `logs_auditoria` tem RLS ativado com **apenas políticas SELECT** (admin e GT). Isso significa que INSERT/UPDATE/DELETE estão **bloqueados** para todos os usuários autenticados. Os registros são escritos exclusivamente pela função `insert_audit_log` (SECURITY DEFINER), que bypassa RLS de forma controlada e captura a identidade do usuário da sessão autenticada, impedindo spoofing.

### 3. Realtime channel subscription (ERROR)
**Status:** Ignorado (duplicata)
**Análise:** Finding já analisado anteriormente. O Supabase filtra eventos server-side com base no RLS da tabela fonte (`notificacoes` tem `user_id = auth.uid()`). O schema `realtime` é reservado.

### 4. GT privilege escalation via user_roles (WARN)
**Status:** Corrigido + Ignorado (falso positivo)
**Análise:** A política ALL do GT foi substituída por 4 políticas granulares na última correção. As políticas RESTRICTIVE (`Only admins can insert privileged roles`, `Only admins can update to privileged roles`, `Prevent self-role assignment/modification/deletion`, `GT cannot assign/delete admin role`) confirmam que todas as vias de escalação estão bloqueadas.

---

## Checklist de Segurança Atualizado

| Categoria | Status |
|---|---|
| RLS em todas as tabelas | OK -- 32/32 |
| Proteção contra IDOR | OK |
| Validação de input (INSERT) | OK -- Zod em 14 schemas |
| Validação de input (UPDATE) | OK -- Zod parcial em 12 schemas (corrigido) |
| Proteção contra XSS | OK |
| CSRF | OK -- Bearer tokens |
| SQL Injection | OK -- parameterized queries |
| Escalação de privilégios | OK -- 14 políticas em user_roles (corrigido) |
| Auditoria LGPD | OK -- SECURITY DEFINER + expurgo 5 anos |
| Edge Functions | OK -- JWT/HMAC/service_role + documentação (corrigido) |
| Tokens/secrets no client | OK -- apenas anon key |
| Rate limiting | OK -- 5 tentativas / 30s |
| Logs de auditoria protegidos | OK -- apenas SELECT para admin/GT |

---

## Conclusao

O sistema CT Guedes está **seguro dentro do escopo analisado**. Todas as vulnerabilidades identificadas nas auditorias anteriores foram corrigidas. O scan automático não encontrou novas vulnerabilidades acionáveis. Os findings restantes são falsos positivos, duplicatas, ou limitações de plano que já possuem mitigações adequadas.

A única recomendação pendente é ativar **Leaked Password Protection** quando o projeto migrar para o plano Supabase Pro.

