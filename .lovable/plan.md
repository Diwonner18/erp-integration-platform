

# Configurar o Send Email Hook no Supabase

## O que você está vendo

Essa é a tela correta. Você precisa mudar o **Hook type** de "Postgres" para **"HTTPS"**, pois nossa função é uma Edge Function (endpoint HTTP), não uma função Postgres.

## Passo a passo

1. **Hook type**: Selecione **HTTPS** (em vez de Postgres)
2. **URL**: Cole a URL da Edge Function:
   ```
   https://mpuocbbascmfpfmsrdwo.supabase.co/functions/v1/send-auth-email
   ```
3. O Supabase vai gerar um **HMAC Secret** — copie esse valor
4. Clique em **Save** para ativar o hook

## Depois de salvar

Me envie o **HMAC Secret** gerado pelo Supabase para que eu configure como `SEND_EMAIL_HOOK_SECRET` nas secrets do projeto. Isso garante que a Edge Function valide a autenticidade das requisições.

