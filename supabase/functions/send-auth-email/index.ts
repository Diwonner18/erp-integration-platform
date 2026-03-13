import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// HMAC verification for Supabase Auth Hook
async function verifyHMAC(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
    // Supabase sends signature as "v1,<hex>"
    const expected = signature.startsWith('v1,') ? signature.slice(3) : signature
    return computed === expected
  } catch {
    return false
  }
}

// Brand colors
const BRAND_PRIMARY = '#575547'
const BRAND_SECONDARY = '#d6d9c9'
const BRAND_BG = '#ffffff'

function getEmailTemplate(type: string, confirmationUrl: string, email: string): { subject: string; html: string } {
  const baseStyle = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: ${BRAND_BG};
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    overflow: hidden;
  `
  const headerStyle = `
    background-color: ${BRAND_PRIMARY};
    padding: 32px 24px;
    text-align: center;
  `
  const bodyStyle = `
    padding: 32px 24px;
  `
  const buttonStyle = `
    display: inline-block;
    background-color: ${BRAND_PRIMARY};
    color: #ffffff;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 24px 0;
  `
  const footerStyle = `
    background-color: ${BRAND_SECONDARY};
    padding: 16px 24px;
    text-align: center;
    font-size: 12px;
    color: ${BRAND_PRIMARY};
  `

  const wrapEmail = (subject: string, title: string, message: string, buttonText: string) => ({
    subject,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">CT Guedes</h1>
    </div>
    <div style="${bodyStyle}">
      <h2 style="color:${BRAND_PRIMARY};margin:0 0 16px;font-size:20px;">${title}</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">Olá,</p>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">${message}</p>
      <div style="text-align:center;">
        <a href="${confirmationUrl}" style="${buttonStyle}" target="_blank">${buttonText}</a>
      </div>
      <p style="color:#999;font-size:13px;line-height:1.5;margin:24px 0 0;">
        Se você não solicitou esta ação, ignore este e-mail.
      </p>
      <p style="color:#999;font-size:12px;margin:16px 0 0;">
        Caso o botão não funcione, copie e cole o link abaixo no seu navegador:<br>
        <a href="${confirmationUrl}" style="color:${BRAND_PRIMARY};word-break:break-all;font-size:12px;">${confirmationUrl}</a>
      </p>
    </div>
    <div style="${footerStyle}">
      <p style="margin:0;">© ${new Date().getFullYear()} CT Guedes — Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>`
  })

  switch (type) {
    case 'signup':
      return wrapEmail(
        'Confirme sua conta — CT Guedes',
        'Confirmação de Conta',
        'Obrigado por se cadastrar na plataforma CT Guedes. Para ativar sua conta, clique no botão abaixo:',
        'Confirmar Conta'
      )
    case 'recovery':
      return wrapEmail(
        'Redefinição de Senha — CT Guedes',
        'Redefinir Senha',
        'Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:',
        'Redefinir Senha'
      )
    case 'email_change':
      return wrapEmail(
        'Alteração de E-mail — CT Guedes',
        'Confirmar Novo E-mail',
        `Você solicitou a alteração do e-mail da sua conta para <strong>${email}</strong>. Clique no botão abaixo para confirmar:`,
        'Confirmar E-mail'
      )
    case 'magiclink':
      return wrapEmail(
        'Link de Acesso — CT Guedes',
        'Acesso Rápido',
        'Clique no botão abaixo para acessar sua conta:',
        'Acessar Conta'
      )
    default:
      return wrapEmail(
        'CT Guedes',
        'Ação Necessária',
        'Clique no botão abaixo para continuar:',
        'Continuar'
      )
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.text()

    // Verify HMAC signature if SEND_EMAIL_HOOK_SECRET is configured
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
    if (hookSecret) {
      const signature = req.headers.get('x-supabase-webhook-signature') || ''
      const isValid = await verifyHMAC(payload, signature, hookSecret)
      if (!isValid) {
        console.warn('send-auth-email: Invalid HMAC signature')
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const body = JSON.parse(payload)

    // Supabase Auth Hook payload structure
    const { user, email_data } = body
    const emailType = email_data?.email_action_type || 'signup'
    const confirmationUrl = email_data?.confirmation_url || email_data?.action_link || ''
    const recipientEmail = user?.email || email_data?.email || ''

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: 'No recipient email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { subject, html } = getEmailTemplate(emailType, confirmationUrl, recipientEmail)

    // Send via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CT Guedes <noreply@ctguedes.com.br>',
        to: [recipientEmail],
        subject,
        html,
      }),
    })

    const resendResult = await resendResponse.text()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendResult)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Email sent: type=${emailType}, to=${recipientEmail}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-auth-email error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
