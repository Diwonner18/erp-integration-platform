# 🔒 Finalização do Hardening de Segurança — 3 itens restantes

Encerrar o plano OWASP aprovado anteriormente. Apenas hardening cirúrgico, sem mudar fluxo, rota, layout ou regra de negócio.

---

## 1. `supabase/functions/send-auth-email/index.ts`

Adicionar 3 camadas de proteção mantendo HMAC + Resend intactos:

- **Limite de tamanho do payload (DoS — A05):** ler `Content-Length` antes do `req.text()`. Se ausente ou `> 64 KB` → 413.
- **Rate-limit por IP (A07):** `Map<ip, number[]>` em memória. Máx **20 requisições / 60 s** por IP (`x-forwarded-for` → primeiro valor; fallback `unknown`). Excedido → 429 com header `Retry-After: 60`. Usa o mesmo padrão já aplicado em `manage-user`.
- **Headers de segurança em todas as respostas:** `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store`. Centralizar em `secureHeaders` const e mesclar em todos os `Response`.

Sem mudanças no HMAC, no template, no Resend ou nos logs já mascarados.

---

## 2. `supabase/functions/purge-expired-logs/index.ts`

Hardening de cabeçalhos (a função já valida service_role corretamente):

- Adicionar `X-Robots-Tag: noindex`, `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` em **todas** as respostas (200, 403, 500).
- Sanitizar a resposta de erro 500 que hoje devolve `error.message` direto do Postgres → trocar por `'Internal server error'` (mantém log interno detalhado via `console.error`).

Sem mudanças no fluxo de expurgo nem no `insert_audit_log`.

---

## 3. Documentação de memória (`mem://security/owasp-hardening`)

Criar arquivo único consolidando o que foi entregue:

- Lista dos controles OWASP Top 10 cobertos (A01, A03, A04, A05, A07, A09).
- Padrão `getSafeErrorMessage` + onde usar.
- 4 schemas Zod novos e regra "validar antes de toda mutation cliente-side".
- Rate-limit em edge functions (10/60s admin, 20/60s público).
- Constraints SQL de defesa em profundidade.
- **Pendência manual única:** habilitar **Leaked Password Protection** no painel Supabase Auth → Policies (não automatizável via API).
- Nota sobre futura troca de CORS `*` por origin-list ao publicar em domínio definitivo.

Atualizar `mem://index.md` adicionando **uma linha** apontando para o novo arquivo (preservando 100% do conteúdo atual do índice).

---

## ✅ O que NÃO será alterado

- Nenhum schema, RLS, rota, layout, componente UI ou regra de negócio.
- HMAC e validação service_role já existentes ficam intactas.
- Sem novas dependências.
- Sem migration SQL nesta rodada.

---

## 🧪 Validação pós-implementação

1. `tsc --noEmit` zero erros.
2. Smoke test: login → recuperar senha → e-mail chega normalmente (HMAC continua válido).
3. Cron de expurgo continua funcionando (apenas headers extras nas respostas).
4. Curl manual em `send-auth-email` com payload >64 KB → 413; sem signature → 403.

---

## 📦 Arquivos tocados

**Modificados (2):**
- `supabase/functions/send-auth-email/index.ts`
- `supabase/functions/purge-expired-logs/index.ts`

**Memória (2):**
- `mem://security/owasp-hardening` (novo)
- `mem://index.md` (1 linha adicionada, demais preservadas)
