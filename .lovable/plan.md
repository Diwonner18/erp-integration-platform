
## Análise da finding

A scanner aponta ausência de policy INSERT em `logs_auditoria`. **Isso é proposital e seguro** — a inserção é feita exclusivamente via a função `insert_audit_log` que é `SECURITY DEFINER` (já confirmado em `db-functions`). Funções `SECURITY DEFINER` executam com privilégios do owner e **bypassam RLS**, então não precisam de policy INSERT.

A finding é um **falso positivo** no contexto desta arquitetura:
- Não existe INSERT direto da aplicação para `logs_auditoria` (verificado: edge functions e código frontend usam apenas a RPC `insert_audit_log`)
- Adicionar uma policy INSERT permissiva enfraqueceria a integridade dos logs (permitiria que o cliente forjasse logs com `user_id`/`acao` arbitrários)
- A memória `mem://security/audit-logging-integrity` documenta exatamente esse padrão como decisão de segurança

## Plano

### Ação única: marcar a finding como ignorada

Usar `security--manage_security_finding` com `operation: ignore` para `logs_auditoria_missing_insert_policy`, scanner `supabase_lov`.

**Justificativa registrada:**
> Inserts em `logs_auditoria` são feitos exclusivamente pela função `public.insert_audit_log` (SECURITY DEFINER), que bypassa RLS por design. Adicionar policy INSERT permissiva permitiria que clients forjassem logs com user_id/ação arbitrários, comprometendo a integridade da auditoria. A ausência de policy INSERT é intencional e correta.

### O que NÃO faremos
- NÃO criar policy INSERT em `logs_auditoria` (enfraqueceria a auditoria)
- NÃO mexer na função `insert_audit_log` (já está correta)
- NÃO mexer nas policies SELECT existentes (admin e GT)
- NÃO tocar na finding `user_roles_gt_self_escalation` (não é o alvo desta mensagem)
