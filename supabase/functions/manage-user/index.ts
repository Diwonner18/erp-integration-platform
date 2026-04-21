import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const ALLOWED_ADMIN_EMAILS = [
  'carla.todesco@ctguedes.com.br',
  'adm@ctguedes.com.br',
  'patricia.ariki@ctguedes.com.br',
];
const ALLOWED_GT_EMAILS = [
  'diwonner13@gmail.com',
  'aline.guedes@ctguedes.com.br',
  'clara.todescog@ctguedes.com.br',
  'agostinho@ctguedes.com.br',
];

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

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerId = claimsData.claims.sub as string

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

    // Helper: notify all admins of a pending approval
    const notifyAdmins = async (titulo: string, mensagem: string) => {
      const { data: admins } = await supabaseAdmin
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      if (!admins?.length) return;
      const rows = admins.map((a: any) => ({
        user_id: a.user_id,
        tipo: 'interna' as const,
        titulo,
        mensagem,
        prioridade: 'alta',
      }));
      await supabaseAdmin.from('notificacoes').insert(rows);
    };

    if (action === 'create') {
      if (!name || !email || !password || !role) {
        return new Response(JSON.stringify({ error: 'Campos obrigatórios: name, email, password, role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (role === 'admin' && !ALLOWED_ADMIN_EMAILS.includes(email)) {
        return new Response(JSON.stringify({ error: 'O role admin só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (role === 'gerenciador_tecnico' && !ALLOWED_GT_EMAILS.includes(email)) {
        return new Response(JSON.stringify({ error: 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

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

      // ADMIN: applies role directly (current behavior)
      if (isAdmin) {
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
      }

      // GT: user created without role; create approval request
      const { error: aprovError } = await supabaseAdmin
        .from('aprovacoes')
        .insert({
          tipo: 'atribuicao_role',
          solicitante_id: callerId,
          referencia_tabela: 'user_roles',
          referencia_id: newUser.user.id,
          status: 'pendente',
          comentario: `GT solicita atribuição de role "${role}" ao novo usuário ${email}`,
          dados_solicitacao: {
            action: 'create',
            target_user_id: newUser.user.id,
            target_email: email,
            target_name: name,
            role_anterior: null,
            role_pretendido: role,
          },
        })

      if (aprovError) {
        return new Response(JSON.stringify({ error: `Usuário criado mas erro ao registrar aprovação: ${aprovError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await notifyAdmins(
        'Solicitação de atribuição de role',
        `Gerenciador técnico solicitou atribuir role "${role}" ao novo usuário ${email}.`
      );

      return new Response(JSON.stringify({
        success: true,
        userId: newUser.user.id,
        pending_approval: true,
        message: 'Usuário criado. A atribuição do role aguarda aprovação de um administrador.',
      }), {
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

      const targetEmail = targetUser.user.email || ''

      if (ALLOWED_ADMIN_EMAILS.includes(targetEmail) && !isAdmin) {
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

      if (role === 'admin' && !ALLOWED_ADMIN_EMAILS.includes(targetEmail)) {
        return new Response(JSON.stringify({ error: 'O role admin só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (role === 'gerenciador_tecnico' && !ALLOWED_GT_EMAILS.includes(targetEmail)) {
        return new Response(JSON.stringify({ error: 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Capture current role
      const { data: currentRoleRow } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()
      const currentRole = currentRoleRow?.role ?? null

      // ADMIN: applies directly
      if (isAdmin) {
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
      }

      // GT: create approval request, do not modify user_roles
      const { error: aprovError } = await supabaseAdmin
        .from('aprovacoes')
        .insert({
          tipo: 'alteracao_role',
          solicitante_id: callerId,
          referencia_tabela: 'user_roles',
          referencia_id: userId,
          status: 'pendente',
          comentario: `GT solicita alteração de role de ${targetEmail}: ${currentRole ?? 'nenhum'} → ${role}`,
          dados_solicitacao: {
            action: 'update',
            target_user_id: userId,
            target_email: targetEmail,
            role_anterior: currentRole,
            role_pretendido: role,
          },
        })

      if (aprovError) {
        return new Response(JSON.stringify({ error: aprovError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await notifyAdmins(
        'Solicitação de alteração de role',
        `Gerenciador técnico solicitou alterar role de ${targetEmail} para "${role}" (atual: ${currentRole ?? 'nenhum'}).`
      );

      return new Response(JSON.stringify({
        success: true,
        pending_approval: true,
        message: 'Solicitação enviada. Aguardando aprovação de um administrador.',
      }), {
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
