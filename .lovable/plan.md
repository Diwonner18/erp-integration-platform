

# Adicionar SEND_EMAIL_HOOK_SECRET

## O que será feito

Usar a ferramenta de secrets para solicitar ao usuário o valor do HMAC Secret gerado pelo Supabase e salvá-lo como `SEND_EMAIL_HOOK_SECRET` nas secrets do projeto.

## Após isso

A configuração estará completa:
- ✅ Edge Function `send-auth-email` deployada
- ✅ `RESEND_API_KEY` configurada
- ✅ Hook HTTPS ativado no Supabase
- ✅ `SEND_EMAIL_HOOK_SECRET` configurado

O sistema de e-mails personalizados estará funcional para signup, recovery, email_change e magiclink.

