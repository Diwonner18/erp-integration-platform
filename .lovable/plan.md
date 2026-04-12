

# Auditoria Completa de Segurança -- CT Guedes

## Resumo Executivo

O sistema CT Guedes possui uma arquitetura de segurança **robusta e bem implementada**. A análise identificou **1 vulnerabilidade média acionável**, **2 itens informativos de baixa severidade**, e confirma que a grande maioria dos controles está corretamente aplicada. Abaixo o relatório detalhado.

---

## PONTOS SEGUROS -- Corretamente Implementados

### 1. Autenticação e Sessão
- Supabase Auth com `onAuthStateChange` configurado **antes** de `getSession()` (padrão correto).
- Re-autenticação obrigatória para alteração de senha (`signInWithPassword` antes de `updateUser`).
- Validação de senha no frontend: 8+ caracteres, maiúscula, número.
- Rate limiting no login: 5 tentativas / lockout de 30 segundos.
- Token JWT com `autoRefreshToken: true` e `persistSession: true`.

### 2. RLS -- Todas as 32 tabelas protegidas
- 100% das tabelas públicas têm `row_level_security = true` (confirmado via query).
- Modelo híbrido PERMISSIVE + RESTRICTIVE corretamente aplicado em tabelas operacionais (obras, materiais, equipamentos, etc.).
- Políticas RESTRICTIVE impedem DELETE/UPDATE por usuários que não são o `created_by` ou não possuem `acessos_compartilhados`.

### 3. Proteção contra Escalação de Privilégios (user_roles)
- 10 políticas RLS na tabela `user_roles` com defesa em profundidade:
  - `Prevent self-role assignment/modification/deletion` -- bloqueia auto-escalação.
  - `Only admins can insert/update privileged roles` -- bloqueia GT de atribuir admin/GT.
  - `GT cannot assign/delete admin role` -- camada extra de proteção.
  - `Block direct role inserts` -- restringe INSERT a admin/GT.
- Edge Function `manage-user` replica essas validações server-side com allowlists de e-mail hardcoded.

### 4. Validação de Dados
- Zod schemas aplicados em **todas** as mutations de INSERT (14 schemas cobrindo obras, propostas, medições, materiais, EPIs, despesas, etc.).
- Constraint `nivel_acesso_valid` no banco garante valores `'view'|'edit'|'all'` na tabela `acessos_compartilhados`.

### 5. Auditoria e LGPD
- Função `insert_audit_log` (SECURITY DEFINER) captura identidade do usuário da sessão, impedindo spoofing.
- Expurgo automático via `purge-expired-logs` com retenção de 5 anos.
- Tabela `logs_auditoria` sem INSERT/UPDATE/DELETE para usuários regulares (somente via RPC).

### 6. Edge Functions
- `purge-expired-logs`: protegida por validação de `service_role_key`.
- `send-auth-email`: HMAC verification via `x-supabase-webhook-signature`.
- `manage-user`: validação JWT + verificação de role admin/GT antes de qualquer operação.

### 7. Isolamento de Dados do Cliente (LGPD)
- Funções SECURITY DEFINER (`get_cliente_ids_for_user`, `get_related_cliente_ids`, `get_obra_ids_for_cliente`) quebram recursão RLS sem expor dados.
- Clientes só veem seus próprios dados em todas as tabelas relevantes.

### 8. Proteção de Rotas
- `ProtectedRoute` valida `allowedUserTypes` + `modulo` via `permissoes_perfil`.
- Admin e GT bypass são baseados no role **real** (não impersonado).
- Impersonação não altera permissões reais de admin/GT.

---

## VULNERABILIDADES ENCONTRADAS

### V1. GT pode enumerar todos os roles do sistema (Severidade: MÉDIA)

**Finding existente:** `user_roles_enumeration`

**Situação atual:** A política `"Gerenciador tecnico can manage roles"` é um ALL permissivo que concede SELECT em **todas** as linhas de `user_roles`. Usuários regulares só veem seu próprio role via `"Users can view own roles"`.

**Risco real:** Um GT comprometido pode mapear a estrutura completa de roles do sistema (quem é admin, quem é financeira, etc.), facilitando engenharia social ou ataques direcionados.

**Solução proposta:**
1. Substituir a política ALL do GT por políticas separadas por operação (SELECT restrito, INSERT com WITH CHECK, UPDATE com WITH CHECK, DELETE com USING).
2. O SELECT do GT pode ser mantido amplo (GT precisa gerenciar usuários), mas a separação permite auditoria mais granular e facilita futuras restrições.

**Recomendação:** Embora o GT seja um role confiável (e-mails em allowlist), a separação da política ALL em políticas por operação é uma boa prática de defesa em profundidade. Severidade média porque o impacto é limitado ao reconhecimento (não permite escalação).

---

### V2. Edge Functions com `verify_jwt = false` (Severidade: BAIXA)

**Situação:** As 3 edge functions (`manage-user`, `purge-expired-logs`, `send-auth-email`) têm `verify_jwt = false` no `config.toml`.

**Análise:**
- `manage-user`: **Compensa** internamente verificando JWT via `getClaims()` e checando roles. Sem risco real.
- `purge-expired-logs`: **Compensa** verificando `service_role_key`. Sem risco real.
- `send-auth-email`: **Compensa** com HMAC verification. Chamada pelo Auth Hook do Supabase que não envia JWT.

**Risco real:** Mínimo. Todas as functions implementam autenticação/autorização própria. O `verify_jwt = false` é necessário para seus respectivos fluxos.

**Recomendação:** Nenhuma ação necessária. Documentar que a decisão é intencional.

---

### V3. Ausência de validação Zod em mutations de UPDATE (Severidade: BAIXA)

**Situação:** O `validateInput` com Zod é aplicado consistentemente em todas as mutations de **INSERT**, mas as mutations de **UPDATE** (`useUpdateObra`, `useUpdateMedicao`, `useUpdateProposta`, etc.) **não** validam os dados com Zod antes de enviar ao Supabase.

**Risco real:** Baixo. O RLS protege contra escritas não autorizadas, e o TypeScript garante tipos em tempo de compilação. Porém, um atacante manipulando a requisição diretamente poderia enviar valores fora do range esperado (ex: `progresso: 999`).

**Solução proposta:** Criar schemas de validação parcial (`.partial()`) para as mutations de UPDATE e aplicar `validateInput` antes da chamada ao Supabase.

---

## CHECKLIST DE SEGURANÇA

| Categoria | Status |
|---|---|
| RLS em todas as tabelas | OK -- 32/32 |
| Proteção contra IDOR | OK -- RLS + `created_by` + `acessos_compartilhados` |
| Validação de input (INSERT) | OK -- Zod em 14 schemas |
| Validação de input (UPDATE) | PARCIAL -- sem Zod |
| Proteção contra XSS | OK -- React escapa por padrão, sem `dangerouslySetInnerHTML` |
| CSRF | OK -- Supabase usa Bearer tokens (não cookies) |
| SQL Injection | OK -- Supabase SDK usa parameterized queries |
| Escalação de privilégios | OK -- 10 políticas RESTRICTIVE em `user_roles` |
| Proteção de dados sensíveis | OK -- RLS scoping por role |
| Auditoria LGPD | OK -- `insert_audit_log` SECURITY DEFINER |
| Expurgo de dados | OK -- 5 anos com purge automático |
| Edge Functions protegidas | OK -- JWT/HMAC/service_role |
| Tokens/secrets no client | OK -- apenas anon key (público por design) |
| Impersonação segura | OK -- permissões reais preservadas |
| Rate limiting no login | OK -- 5 tentativas / 30s lockout |

---

## AÇÕES RECOMENDADAS (por prioridade)

1. **Média** -- Separar a política ALL do GT em `user_roles` em políticas por operação (SELECT, INSERT, UPDATE, DELETE individuais). Migration SQL simples.
2. **Baixa** -- Adicionar validação Zod `.partial()` nas mutations de UPDATE para consistência de defesa em profundidade.
3. **Info** -- Documentar a decisão de `verify_jwt = false` nas edge functions.

---

## CONCLUSÃO

O sistema CT Guedes apresenta uma postura de segurança **acima da média** para aplicações Lovable + Supabase. Os controles críticos (RLS, escalação de privilégios, auditoria, validação de input) estão corretamente implementados. A única vulnerabilidade acionável (V1) é de severidade média e não permite escalação de privilégios -- apenas reconhecimento por um role já privilegiado. As demais são melhorias de defesa em profundidade.

