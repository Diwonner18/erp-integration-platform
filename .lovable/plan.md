

# Auditoria Completa de Seguranca - CT Guedes

---

## PONTOS SEGUROS (ja implementados corretamente)

1. **RLS abrangente em todas as tabelas** - Cada tabela possui politicas PERMISSIVE por role e RESTRICTIVE para UPDATE/DELETE, garantindo isolamento multi-tenant.

2. **Funcoes SECURITY DEFINER** - `has_role`, `has_record_access`, `get_cliente_ids_for_user`, `get_related_cliente_ids` evitam recursao infinita em RLS e operam com privilegios controlados.

3. **Protecao contra escalacao de privilegios** - Tabela `user_roles` possui politicas RESTRICTIVE que impedem self-escalation e protegem registros de admin.

4. **Roles NAO armazenados em localStorage** - Verificacao feita: nenhum uso de `localStorage` para roles ou permissoes. Tudo vem do banco via `user_roles`.

5. **Validacao de input com Zod** - Todas as mutations principais usam schemas Zod (`validateInput`) antes de INSERT.

6. **Auditoria segura** - `insert_audit_log` e SECURITY DEFINER e captura identidade do JWT, impedindo spoofing de logs pelo frontend.

7. **Edge Functions protegidas** - `manage-user` valida JWT e verifica role antes de agir. `purge-expired-logs` valida service_role key.

8. **Auth Hook com HMAC** - `send-auth-email` verifica assinatura HMAC do payload, impedindo chamadas nao autorizadas.

9. **Brute force login** - Lockout de 30s apos 5 tentativas (client-side). Supabase GoTrue tambem tem rate limiting server-side.

10. **Demo guard** - Usuarios demo sao bloqueados de escrita no frontend via `useDemoGuard`.

11. **Sem `dangerouslySetInnerHTML` com dados de usuario** - Unico uso e no componente `chart.tsx` com dados estaticos de tema.

12. **Sem vazamento de credenciais em logs** - Nenhum `console.log` expoe passwords/tokens.

13. **LGPD** - Expurgo automatico de logs apos 5 anos via `purge-expired-logs` + `pg_cron`.

14. **Isolamento de dados de cliente** - Funcionarios so veem clientes vinculados a suas obras (via `get_related_cliente_ids`).

---

## VULNERABILIDADES ENCONTRADAS

### CRITICA

**V-01: Demo guard e apenas client-side (sem enforcement server-side)**
- Severidade: **CRITICA**
- Local: `useDemoGuard.ts` + banco de dados
- Risco: Usuarios demo (`is_demo = true`) sao bloqueados apenas no frontend via toast. Um usuario demo pode usar o Supabase client JS diretamente (ou qualquer HTTP client) para fazer INSERT/UPDATE/DELETE, pois no banco eles tem role `gerenciador_tecnico` com RLS PERMISSIVE ALL.
- Solucao: Criar politicas RLS RESTRICTIVE que bloqueiem escrita para usuarios com `is_demo = true` na tabela `profiles`. Exemplo:
```sql
CREATE OR REPLACE FUNCTION public.is_demo_user(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT COALESCE((SELECT is_demo FROM profiles WHERE id = _uid), false)
$$;

-- Aplicar em todas as tabelas operacionais:
CREATE POLICY "Block demo writes" ON public.obras
FOR ALL TO authenticated
USING (NOT is_demo_user(auth.uid()))
WITH CHECK (NOT is_demo_user(auth.uid()));
```

---

**V-02: Impersonation nao e validada no backend**
- Severidade: **CRITICA**
- Local: `AuthContext.tsx` linhas 209-224, `ProtectedRoute.tsx` linha 39
- Risco: O `effectiveType` (role impersonado) e usado para determinar permissoes no frontend (Sidebar, botoes), mas o RLS do Supabase usa o role REAL do JWT. Isso significa que um GT impersonando "comercial" ainda tem acesso total no banco. Embora isso seja "by design" para GTs, o risco e que o `effectiveType` e confiado pelo frontend para esconder/mostrar funcionalidades sem enforcement real. Se o objetivo e que impersonation limite acoes, isso nao funciona.
- Solucao: Documentar claramente que impersonation e apenas visual/navegacao. Considerar adicionar um campo `impersonated_as` no JWT custom claims se quiser enforcement real.

---

### ALTA

**V-03: CORS `Access-Control-Allow-Origin: *` em todas as Edge Functions**
- Severidade: **ALTA**
- Local: `manage-user/index.ts`, `send-auth-email/index.ts`, `purge-expired-logs/index.ts`
- Risco: Qualquer dominio pode chamar essas funcoes. Embora a autenticacao JWT proteja contra acesso nao autorizado, um site malicioso poderia tentar requests cross-origin com tokens roubados.
- Solucao: Restringir `Access-Control-Allow-Origin` ao dominio da aplicacao (ex: `https://id-preview--ebb138c7-2044-453f-91f5-f9a40e928226.lovable.app` e o dominio de producao).

---

**V-04: `permissoes_perfil` sem politica SELECT para usuarios operacionais**
- Severidade: **ALTA**
- Local: Tabela `permissoes_perfil` - apenas admin e GT tem acesso (RLS)
- Risco: Os hooks `useUserModulePermissions` e `useAllUserPermissions` fazem SELECT na tabela `permissoes_perfil` para usuarios com perfil `obras`, `financeira`, `comercial`. Como a tabela so tem RLS para admin/GT, esses SELECTs **falham silenciosamente** (retornam array vazio), fazendo o frontend assumir permissoes default (`acesso_modulo: true`, `incluir_editar: false`). Isso significa que o enforcement de permissoes para usuarios operacionais pode nao funcionar corretamente.
- Solucao: Adicionar politica SELECT para authenticated:
```sql
CREATE POLICY "Users can read own profile permissions"
ON permissoes_perfil FOR SELECT TO authenticated
USING (true);
```
Ou, mais restritivo, usando `get_user_role`:
```sql
USING (perfil = get_user_role(auth.uid())::text)
```

---

**V-05: Tabela `aprovacoes` - politica INSERT e RESTRICTIVE sem PERMISSIVE correspondente**
- Severidade: **ALTA**
- Local: RLS da tabela `aprovacoes`
- Risco: A politica "Users can create aprovacoes" e RESTRICTIVE (`Permissive: No`), mas nao ha uma politica PERMISSIVE de INSERT para usuarios comuns. Em PostgreSQL, RESTRICTIVE funciona como filtro adicional sobre PERMISSIVE. Se nao ha PERMISSIVE INSERT, nenhum usuario (exceto admin) consegue inserir aprovacoes.
- Solucao: Alterar para PERMISSIVE ou adicionar uma politica PERMISSIVE de INSERT para authenticated.

---

### MEDIA

**V-06: Lockout de brute force e apenas client-side**
- Severidade: **MEDIA**
- Local: `Login.tsx` linhas 14-16, 41-45, 62-68
- Risco: O lockout de 5 tentativas/30s usa estado React (`useState`). Um refresh da pagina reseta o contador. Um atacante pode automatizar requests diretamente ao Supabase Auth sem passar pelo frontend.
- Mitigacao existente: Supabase GoTrue tem rate limiting nativo (configurable). Verificar que esta habilitado no `config.toml`.
- Solucao: Confirmar rate limiting no Supabase Dashboard e adicionar fail2ban ou similar se necessario.

---

**V-07: `useCreateValorUnitario` sem validacao Zod**
- Severidade: **MEDIA**
- Local: `useSupabaseData.ts` linha 636
- Risco: Diferente de todas as outras mutations que usam `validateInput(schema, data)`, `useCreateValorUnitario` insere direto sem validacao. Input malicioso pode passar.
- Solucao: Criar `valorUnitarioInsertSchema` em `validationSchemas.ts` e aplicar.

---

**V-08: `useCreateModeloContrato` sem validacao Zod**
- Severidade: **MEDIA**
- Local: `useSupabaseData.ts` linha 660
- Risco: Mesmo que V-07.
- Solucao: Criar schema e aplicar `validateInput`.

---

**V-09: `useCreateAceiteDigital` gera assinatura digital fraca**
- Severidade: **MEDIA**
- Local: `useSupabaseData.ts` linha 748
- Risco: `assinatura_digital: aceite_digital_${Date.now()}` nao e uma assinatura digital real. E um timestamp previsivel que pode ser forjado. Nao ha captura de IP, user-agent, ou assinatura criptografica.
- Solucao: Gerar hash criptografico no backend (Edge Function) incluindo user_id, proposta_id, timestamp, IP e user-agent.

---

**V-10: `profiles` - RLS permite UPDATE irrestrito por admins**
- Severidade: **MEDIA** (risco de overwrite de dados de outros usuarios)
- Local: Nao visivel nas policies fornecidas, mas o `updateProfile` em AuthContext faz `.eq('id', user.id)` que e seguro. Verificar se ha politica UPDATE restrita.
- Solucao: Confirmar que profiles tem politica UPDATE `USING (id = auth.uid())` para usuarios comuns.

---

### BAIXA

**V-11: Rotas sem prop `modulo` no ProtectedRoute**
- Severidade: **BAIXA**
- Local: `App.tsx` - rotas como `/obras-concluidas`, `/obras-em-andamento`, `/obras-agendadas`, `/equipe-ativa`, `/central-alertas`, `/materiais`
- Risco: Essas rotas so checam `allowedUserTypes` mas nao verificam `permissoes_perfil.acesso_modulo`. Se o admin desativar o modulo para um perfil, o usuario ainda acessa via URL direta.
- Solucao: Adicionar prop `modulo` correspondente a cada rota.

---

**V-12: `useRetencaoFollowups` e `useRetencaoPagamentos` usam `as any` para tabelas**
- Severidade: **BAIXA**
- Local: `useSupabaseData.ts` linhas 163, 175, 198, 209
- Risco: O cast `as any` bypassa type safety. Se as tabelas nao existem no schema, erros silenciosos podem ocorrer.
- Solucao: Regenerar types do Supabase e remover casts.

---

## RESUMO

| Severidade | Qtd | IDs |
|---|---|---|
| Critica | 2 | V-01, V-02 |
| Alta | 3 | V-03, V-04, V-05 |
| Media | 5 | V-06, V-07, V-08, V-09, V-10 |
| Baixa | 2 | V-11, V-12 |

**Prioridade de correcao recomendada:**
1. V-01 (demo guard server-side) - exploitavel imediatamente
2. V-04 (permissoes_perfil RLS SELECT) - quebra silenciosamente o sistema de permissoes
3. V-05 (aprovacoes INSERT policy) - bloqueia funcionalidade
4. V-03 (CORS) - reducao de superficie de ataque
5. V-07/V-08 (validacao faltante) - rapido de corrigir

