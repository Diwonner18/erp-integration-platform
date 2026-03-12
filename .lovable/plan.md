

# Plano: V8 - Expurgo Automatico de Logs LGPD

## Objetivo
Criar uma Edge Function scheduled que deleta registros expirados da tabela `logs_auditoria` (onde `data_expiracao < now()`), garantindo conformidade LGPD.

## Implementacao

### 1. Edge Function `purge-expired-logs`
- Cria `supabase/functions/purge-expired-logs/index.ts`
- Usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS (logs_auditoria nao permite DELETE via client)
- Deleta registros onde `data_expiracao IS NOT NULL AND data_expiracao < now()`
- Retorna contagem de registros deletados
- Protege com verificacao de Authorization header (anon key ou service role)

### 2. Atualizar config.toml
- Adicionar `[functions.purge-expired-logs]` com `verify_jwt = false`

### 3. Agendar via pg_cron
- Habilitar extensoes `pg_cron` e `pg_net`
- Criar cron job diario (1x por dia, meia-noite) que chama a Edge Function via `net.http_post`

### 4. Garantir data_expiracao preenchida
- Atualizar a funcao `insert_audit_log` para preencher `data_expiracao` automaticamente (5 anos) caso nao seja fornecida

## Detalhes tecnicos
- A Edge Function usa `supabaseAdmin` (service role) para deletar, ja que RLS bloqueia DELETE em `logs_auditoria`
- O cron roda diariamente as 00:00 UTC
- Logs de execucao do expurgo sao registrados na propria auditoria

