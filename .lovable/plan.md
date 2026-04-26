# 🔒 Plano de Hardening de Segurança (OWASP ASVS / Top 10)

> Apenas correções de segurança. Nenhuma nova rota, regra de negócio ou mudança visual. Tudo cirúrgico, retro-compatível e com `validateInput` já existente como base.

---

## 1. Sanitização de mensagens de erro expostas ao usuário (A05/A09)

**Problema:** `error.message` do Supabase é repassado direto em toasts (vaza nomes de tabelas, colunas, constraints, hints internos).

**Ação:** criar utilitário `src/lib/errorMessages.ts` com `getSafeErrorMessage(err, fallback)`:
- mantém mensagens vindas de `Error` lançadas manualmente no app (já são amigáveis: "Selecione o colaborador", etc.)
- substitui qualquer erro contendo `duplicate key`, `violates`, `permission denied`, `relation`, `column` por mensagens genéricas
- nunca retorna stack trace

**Arquivos a atualizar (apenas a string do `description` do toast — zero mudança de fluxo):**
- `src/pages/Cliente/SolicitarAgendamento.tsx`
- `src/pages/Cliente/MeusRelatorios.tsx`
- `src/pages/Obras/EstoqueEPI.tsx`
- `src/pages/Programacao.tsx`
- `src/components/Comercial/NovaPropostaModal.tsx`
- `src/components/Comercial/EditPropostaModal.tsx`
- `src/contexts/AuthContext.tsx` (updateProfile)

---

## 2. Validação Zod em mutations cliente-side faltantes (A03/A04)

**Problema:** quatro páginas inserem direto no Supabase sem `validateInput`. Mesmo com RLS, a validação no servidor protege contra payloads malformados que chegam ao trigger.

**Ação:** adicionar 4 novos schemas em `src/lib/validationSchemas.ts` (sem alterar os existentes):
- `agendamentoInsertSchema` — nome, email, telefone, tipoServico, dataPreferida (>= hoje), prioridade enum, descrição ≤2000 chars
- `reembolsoClienteInsertSchema` — categoria forçada `'reembolso_cliente'`, valor `>0` e `<10_000_000`, descrição ≤500
- `epiMovimentacaoInsertSchema` — tipo_movimentacao enum `entrada|saida`, quantidade int >0, valor_unitario ≥0, regras condicionais (saída exige colaborador_id)
- `agendamentoUpdateSchema` (.partial)

**Aplicação:** chamar `validateInput(schema, payload)` antes de cada `.insert()` nas 4 páginas. Se Zod lança, captura e mostra a primeira mensagem amigável do schema.

---

## 3. Hardening de `manage-user` edge function (A01/A03)

**Ação:**
1. Adicionar Zod (via `https://esm.sh/zod@3`) com schemas `CreateUserBodySchema` e `UpdateRoleBodySchema` validando: email format, password ≥8 + maiúscula + número, role ∈ enum, name 2–100 chars.
2. Sanitizar saída: substituir `createError.message` direto por `'Não foi possível criar o usuário'` + `console.error` interno (PII mascarado).
3. **Rate limit in-memory** (Map<callerId, timestamps[]>) — máx 10 ações / 60s por admin. Retorna 429 com `Retry-After`.
4. Reforçar header de segurança nas respostas: `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`.
5. Manter `verify_jwt = false` (validação manual já existe).

---

## 4. Hardening de `send-auth-email` (A07)

**Ação:**
1. Validar tamanho do payload (`< 64KB`) antes de `await req.json()` — mitiga DoS.
2. Rate limit por IP do `x-forwarded-for` (10/min) — mitiga abuso de hook reaberto.
3. Manter HMAC + mascaramento PII existentes.
4. Headers `X-Content-Type-Options: nosniff` + `Referrer-Policy: no-referrer`.

---

## 5. Hardening de `purge-expired-logs` (A05)

**Ação:**
- Já valida service_role; adicionar header `X-Robots-Tag: noindex` e `Cache-Control: no-store`.
- Limitar `data-anteriores`/`data-novos` no log de auditoria do próprio expurgo (já não armazena conteúdo, ok).

---

## 6. Limpeza de logs cliente-side (A09)

**Ação:** em `src/contexts/AuthContext.tsx`, substituir os 5 `console.error('Error ...', error)` por `console.error('Auth error')` sem objeto — alinha ao padrão já usado em `login()`.

---

## 7. Documentação de pendências manuais (A07)

**Ação:** atualizar `mem://security/auth-protection-mechanisms.md` para deixar registrado:
- usuário precisa habilitar **Leaked Password Protection** no dashboard Supabase Auth (único item que permanece no scanner)
- nota sobre futura troca de CORS `*` por origin-list quando publicar em domínio definitivo

---

## 8. Migration SQL mínima (defense-in-depth)

Adicionar **uma constraint de nível DB** que o Zod faz no front, mas que o RLS não cobre:
```sql
-- despesas: garante que reembolso_cliente só pode ser criado pelo próprio cliente
ALTER TABLE public.despesas
  ADD CONSTRAINT despesas_valor_positivo CHECK (valor > 0);

ALTER TABLE public.epi_movimentacoes
  ADD CONSTRAINT epi_mov_quantidade_positiva CHECK (quantidade > 0),
  ADD CONSTRAINT epi_mov_tipo_valido CHECK (tipo_movimentacao IN ('entrada','saida'));

ALTER TABLE public.agendamentos
  ADD CONSTRAINT agendamentos_status_valido
    CHECK (status IN ('pendente','confirmado','reagendado','cancelado','concluido'));
```

> CHECK constraints estáticos (sem `now()`) — seguros conforme regra de migrations.

---

## ✅ O que NÃO será alterado

- Nenhuma rota, layout, componente UI, regra de negócio, RLS policy existente.
- `useSupabaseData.ts`, hooks de cliente, AccessGuard, ProtectedRoute permanecem intactos.
- Sem novas dependências npm (Zod já presente; edge functions usam esm.sh).
- `dangerouslySetInnerHTML` em `chart.tsx` (shadcn) permanece — conteúdo controlado interno.

---

## 🧪 Validação pós-implementação

1. `tsc --noEmit` — zero erros/avisos.
2. `supabase--linter` deve continuar com **só** o aviso de Leaked Password Protection.
3. Smoke test manual dos 4 formulários afetados (agendamento, reembolso, EPI, edição perfil).
4. Disparar `manage-user` com payload inválido → confirmar 400 sem vazar message.

---

## 📦 Arquivos tocados (resumo)

**Novos (2):**
- `src/lib/errorMessages.ts`
- `supabase/migrations/<timestamp>_security_constraints.sql`

**Modificados (10):**
- `src/lib/validationSchemas.ts` (+4 schemas)
- `src/contexts/AuthContext.tsx` (logs)
- `src/pages/Cliente/SolicitarAgendamento.tsx` (validate + safeError)
- `src/pages/Cliente/MeusRelatorios.tsx` (validate + safeError)
- `src/pages/Obras/EstoqueEPI.tsx` (validate + safeError)
- `src/pages/Programacao.tsx` (safeError)
- `src/components/Comercial/NovaPropostaModal.tsx` (safeError)
- `src/components/Comercial/EditPropostaModal.tsx` (safeError)
- `supabase/functions/manage-user/index.ts` (Zod + rate limit + headers)
- `supabase/functions/send-auth-email/index.ts` (size limit + rate limit + headers)
- `supabase/functions/purge-expired-logs/index.ts` (headers)

**Memória atualizada:**
- `mem://security/owasp-hardening.md` (novo)
- `mem://index.md` (1 linha adicionada)
