import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_USERS = [
  { name: 'Aline Guedes', email: 'aline.guedes@ctguedes.com.br' },
  { name: 'Clara Todesco', email: 'clara.todescog@ctguedes.com.br' },
  { name: 'Agostinho', email: 'agostinho@ctguedes.com.br' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow with service role key for security
    const authHeader = req.headers.get('Authorization')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!authHeader || !authHeader.includes(serviceKey)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceKey
    )

    const results = []

    for (const demo of DEMO_USERS) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(u => u.email === demo.email)
      
      if (existing) {
        // Just ensure is_demo is set
        await supabaseAdmin.from('profiles').update({ is_demo: true }).eq('id', existing.id)
        results.push({ email: demo.email, status: 'already_exists', userId: existing.id })
        continue
      }

      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: demo.email,
        password: 'Demo@2026',
        email_confirm: true,
        user_metadata: { full_name: demo.name },
      })

      if (createError) {
        results.push({ email: demo.email, status: 'error', error: createError.message })
        continue
      }

      // Assign gerenciador_tecnico role
      await supabaseAdmin.from('user_roles').insert({ user_id: newUser.user.id, role: 'gerenciador_tecnico' })

      // Mark as demo
      await supabaseAdmin.from('profiles').update({ is_demo: true }).eq('id', newUser.user.id)

      results.push({ email: demo.email, status: 'created', userId: newUser.user.id })
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
