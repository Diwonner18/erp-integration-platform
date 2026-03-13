

# Auditoria Completa de Seguranca - Reavaliacao Pos-Hardening

## Pontos Seguros Confirmados

| Area | Status |
|---|---|
| RLS em todas as 26 tabelas | Correto - todas habilitadas com politicas por role |
| Roles via tabela separada (`user_roles`) | Correto - funcoes `has_role()` e `get_user_role()` SECURITY DEFINER |
| Validacao Zod em mutations individuais | Correto - `validateInput()` usado em todos os hooks de criacao |
| Validacao Zod no FileImportModal (bulk) | Correto - validacao por registro antes do insert, com feedback de erros |
| Limite de arquivo 10MB no import | Correto - `MAX_FILE_SIZE_BYTES` validado antes do parse |
| Admin hardcoded no DB | Correto - `assign_internal_role()` e `self_assign_area()` validam emails |
| Auditoria SECURITY DEFINER | Correto - `insert_audit_log()` captura uid do token, nao do frontend |
| Troca de senha com re-auth | Correto - `changePassword()` exige senha atual |
| Frontend sem inserts diretos em `user_roles` | Correto - removidos na correcao anterior, delegados ao trigger `handle_new_user` |
| Edge Function `manage-user` com `getClaims()` | Correto - migrado de `getUser()` |
| Expurgo LGPD automatico | Correto - 5 anos de retencao |
| Politicas RESTRICTIVE em UPDATE/DELETE | Correto - `created_by = auth.uid()` ou `has_record_access()` |

---

## Vulnerabilidades Encontradas

### ALTA - Gerenciador Tecnico pode escalar qualquer usuario para admin via RLS

**Fonte**: Security scan automatizado (finding `PRIVILEGE_ESCALATION`)

A politica RLS `Gerenciador tecnico can manage roles` concede ALL access na tabela `user_roles`, e a politica RESTRICTIVE `Block direct role inserts` permite INSERT para GT. Nao ha restricao sobre qual valor de role pode ser inserido. Um GT pode inserir `{ user_id: qualquer_id, role: 'admin' }` diretamente via API.

A Edge Function `manage-user` bloqueia isso no codigo, mas um GT pode contornar usando a API REST do Supabase diretamente (sem passar pela Edge Function).

**Risco**: Privilege escalation - GT pode se tornar admin ou promover qualquer usuario.

**Solucao**: Adicionar WITH CHECK na politica de INSERT do GT que bloqueia `role = 'admin'`:
```sql
-- Update the RESTRICTIVE insert policy to block admin assignment
DROP POLICY IF EXISTS "Block direct role inserts" ON public.user_roles;
CREATE POLICY "Block direct role inserts"
ON public.user_roles FOR INSERT TO authenticated
AS RESTRICTIVE
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gerenciador_tecnico'::app_role)
  OR (auth.uid() = user_id AND role NOT IN ('admin'::app_role, 'gerenciador_tecnico'::app_role))
);

-- Add separate restrictive policy to prevent GT from assigning admin
CREATE POLICY "GT cannot assign admin role"
ON public.user_roles FOR INSERT TO authenticated
AS RESTRICTIVE
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR role != 'admin'::app_role
);
```

---

### MEDIA - PII de clientes exposta para todos os funcionarios internos

**Fonte**: Security scan automatizado (finding `clientes_pii_overexposure_internal_roles`)

As politicas RLS de `clientes` concedem SELECT irrestrito para roles `obras` e `financeira`. Qualquer funcionario com esses roles pode ver CPF, CNPJ, email e telefone de TODOS os clientes, nao apenas os vinculados as suas obras.

**Risco**: Violacao do principio de minimizacao de dados (LGPD Art. 6, III). Funcionarios acessam dados pessoais sem necessidade operacional.

**Solucao**: Restringir SELECT de `obras` e `financeira` na tabela `clientes` para retornar apenas clientes vinculados a obras que o usuario criou ou tem acesso:
```sql
-- Replace broad SELECT with scoped policy
DROP POLICY "Internal users can view clientes" ON public.clientes;
CREATE POLICY "Internal users can view related clientes" ON public.clientes
FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'obras'::app_role) OR has_role(auth.uid(), 'financeira'::app_role))
  AND id IN (
    SELECT cliente_id FROM obras
    WHERE created_by = auth.uid()
       OR responsavel_id = auth.uid()
       OR has_record_access(auth.uid(), 'obras', id, 'view')
  )
);
```

---

### MEDIA - Leaked Password Protection desabilitada

**Fonte**: Security scan automatizado (finding `SUPA_auth_leaked_password_protection`)

O Supabase Auth tem um recurso que verifica senhas contra bancos de dados de vazamentos conhecidos (HaveIBeenPwned). Esta desabilitado.

**Risco**: Usuarios podem registrar com senhas ja comprometidas em vazamentos publicos.

**Solucao**: Habilitar no Supabase Dashboard: Authentication > Providers > Email > Enable Leaked Password Protection.

---

### BAIXA - `purge-expired-logs` apenas loga warning sem bloquear

O Edge Function `purge-expired-logs` valida `isServiceRole` e `isInternalCall`, mas quando ambos falham, apenas faz `console.warn` e **continua a execucao**. Qualquer pessoa pode chamar a funcao publicamente e triggerar o expurgo.

**Risco**: Baixo - o expurgo apenas deleta registros ja expirados (que deveriam ser deletados de qualquer forma). Mas um atacante poderia forcar a execucao repetida.

**Solucao**: Retornar 403 em vez de continuar:
```typescript
if (!isServiceRole && !isInternalCall) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
```

---

### BAIXA - Lockout de brute force apenas no frontend

O rate limiting de 5 tentativas + 30s no `Login.tsx` usa `useState` - reseta ao recarregar. GoTrue do Supabase tem rate limiting proprio como camada primaria, entao o risco e mitigado.

---

## Resumo

| Severidade | Qtd | Itens |
|---|---|---|
| CRITICA | 0 | - |
| ALTA | 1 | GT pode escalar para admin via RLS direto |
| MEDIA | 2 | PII de clientes exposta; Leaked password protection off |
| BAIXA | 2 | purge-expired-logs nao bloqueia; lockout client-side |

## Acoes Recomendadas

1. **URGENTE**: Corrigir RLS de `user_roles` para impedir GT de atribuir role `admin` via API direta
2. **IMPORTANTE**: Restringir visibilidade de PII de clientes para funcionarios (LGPD)
3. **IMPORTANTE**: Habilitar Leaked Password Protection no Supabase Dashboard
4. **DESEJAVEL**: Fazer `purge-expired-logs` retornar 403 em chamadas nao autorizadas

