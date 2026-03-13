

# Configurar Resend para Emails de Autenticação

## Situação

Este projeto usa um Supabase externo, portanto o sistema gerenciado de emails do Lovable não está disponível. A abordagem correta é criar uma Edge Function manual que usa a API do Resend.

## Próximo Passo Imediato

Preciso adicionar o secret `RESEND_API_KEY` ao Supabase antes de criar a Edge Function. Vou solicitar a chave na implementação.

## Implementação

### 1. Adicionar secret `RESEND_API_KEY`
Solicitar a API Key do Resend ao usuário via ferramenta de secrets.

### 2. Criar `supabase/functions/send-auth-email/index.ts`
- Recebe payload do Supabase Auth Hook (eventos: `signup`, `recovery`, `email_change`)
- Envia emails via `POST https://api.resend.com/emails`
- Remetente: `CT Guedes <noreply@ctguedes.com.br>`
- Templates HTML em português com cores da marca (#575547, #d6d9c9), fundo branco
- Validação HMAC do webhook secret

### 3. Atualizar `supabase/config.toml`
Adicionar `[functions.send-auth-email]` com `verify_jwt = false`.

### 4. Deploy e teste da Edge Function

## Passos Manuais (após deploy)

1. No Supabase Dashboard → **Authentication → Hooks** → ativar hook "Send Email" apontando para a Edge Function
2. Copiar o `SEND_EMAIL_HOOK_SECRET` gerado e adicioná-lo como secret no Supabase
3. Testar enviando um reset de senha

