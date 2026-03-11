

## Plano: Corrigir RLS Policy Always True em `logs_auditoria`

### Problema

A policy `System can insert logs` na tabela `logs_auditoria` usa `WITH CHECK (true)`, permitindo que qualquer usuario autenticado insira registros com valores fabricados (email, nome, IP, dados arbitrarios). Isso compromete a integridade do log de auditoria.

### Solucao

**SQL Migration:**

1. Dropar a policy `System can insert logs`
2. Criar function SECURITY DEFINER `insert_audit_log()` que:
   - Recebe apenas os campos de negocio (acao, descricao, tabela, registro_id, entidade, dados_anteriores, dados_novos, modulo)
   - Preenche automaticamente `user_id`, `usuario_email`, `usuario_nome` a partir de `auth.uid()` + tabela `profiles`
   - Preenche `created_at` com `now()`
   - Impede que o chamador injete valores falsos nos campos de identidade
3. Nao criar nenhuma nova policy de INSERT (apenas a function pode inserir, via SECURITY DEFINER)

**Codigo (opcional):**
- Criar um hook `useAuditLog()` em `useSupabaseData.ts` que chama `supabase.rpc('insert_audit_log', {...})` para uso futuro nas paginas

### Resultado

- Finding `SUPA_rls_policy_always_true` resolvido
- Finding `logs_auditoria_unrestricted_insert` resolvido
- Logs de auditoria com integridade garantida pelo backend

