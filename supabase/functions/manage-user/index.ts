import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Use getClaims for efficient JWT verification
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerId = claimsData.claims.sub as string

    // Check admin or gerenciador_tecnico role
    const { data: isAdmin } = await supabaseAnon.rpc('has_role', { _user_id: callerId, _role: 'admin' })
    const { data: isGT } = await supabaseAnon.rpc('has_role', { _user_id: callerId, _role: 'gerenciador_tecnico' })

    if (!isAdmin && !isGT) {
      return new Response(JSON.stringify({ error: 'Apenas administradores e gerenciadores técnicos podem gerenciar usuários.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { action, name, email, password, role, userId } = body

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (action === 'create') {
      if (!name || !email || !password || !role) {
        return new Response(JSON.stringify({ error: 'Campos obrigatórios: name, email, password, role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const allowedAdminEmails = ['carla.todesco@ctguedes.com.br', 'adm@ctguedes.com.br'];
      if (role === 'admin' && !allowedAdminEmails.includes(email)) {
        return new Response(JSON.stringify({ error: 'O role admin só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const allowedGTEmails = ['diwonner13@gmail.com', 'aline.guedes@ctguedes.com.br', 'clara.todescog@ctguedes.com.br', 'agostinho@ctguedes.com.br'];
      if (role === 'gerenciador_tecnico' && !allowedGTEmails.includes(email)) {
        return new Response(JSON.stringify({ error: 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Domain restriction removed for operational roles (obras, financeira, comercial)
      // Admin can create users with any email for testing/flexibility
      // Only admin and gerenciador_tecnico remain locked to specific emails (checked above)

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      })

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: newUser.user.id, role })

      if (roleError) {
        return new Response(JSON.stringify({ error: `Usuário criado mas erro ao atribuir role: ${roleError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, userId: newUser.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else if (action === 'update_role') {
      if (!userId || !role) {
        return new Response(JSON.stringify({ error: 'Campos obrigatórios: userId, role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!targetUser?.user) {
        return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (targetUser.user.email === 'carla@ctguedes.com.br' && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Apenas o admin principal pode alterar o próprio role.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (isGT && !isAdmin && targetUser.user.id === callerId) {
        return new Response(JSON.stringify({ error: 'Você não pode alterar seu próprio role.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (role === 'admin' && targetUser.user.email !== 'carla@ctguedes.com.br') {
        return new Response(JSON.stringify({ error: 'O role admin só pode ser atribuído a carla@ctguedes.com.br' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const allowedGTEmailsUpdate = ['diwonner13@gmail.com', 'aline.guedes@ctguedes.com.br', 'clara.todescog@ctguedes.com.br', 'agostinho@ctguedes.com.br'];
      if (role === 'gerenciador_tecnico' && !allowedGTEmailsUpdate.includes(targetUser.user.email || '')) {
        return new Response(JSON.stringify({ error: 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      return new Response(JSON.stringify({ error: 'Ação inválida. Use "create" ou "update_role".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
