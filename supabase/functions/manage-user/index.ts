import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
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

const ALLOWED_ROLES = ['admin', 'gerenciador_tecnico', 'obras', 'financeira', 'comercial', 'cliente'] as const

const CreateUserBodySchema = z.object({
  action: z.literal('create'),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200)
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter número'),
  role: z.enum(ALLOWED_ROLES),
})

const UpdateRoleBodySchema = z.object({
  action: z.literal('update_role'),
  userId: z.string().uuid(),
  role: z.enum(ALLOWED_ROLES),
})

const BodySchema = z.discriminatedUnion('action', [CreateUserBodySchema, UpdateRoleBodySchema])

// In-memory rate limit (per warm instance). 10 ações / 60s por caller.
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000
const callerHits = new Map<string, number[]>()

function checkRateLimit(callerId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const hits = (callerHits.get(callerId) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) {
    const oldest = hits[0] ?? now
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    return { allowed: false, retryAfter }
  }
  hits.push(now)
  callerHits.set(callerId, hits)
  return { allowed: true }
}

function safeMaskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***'
  const [u, d] = email.split('@')
  return `${u.slice(0, 3)}***@${d}`
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Não autorizado' }, 401)
    }

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: 'Não autorizado' }, 401)
    }

    const callerId = claimsData.claims.sub as string

    // Rate limit per caller (defesa contra abuso)
    const rl = checkRateLimit(callerId)
    if (!rl.allowed) {
      return jsonResponse(
        { error: 'Muitas requisições. Aguarde alguns instantes.' },
        429,
        { 'Retry-After': String(rl.retryAfter ?? 60) }
      )
    }

    const { data: isAdmin } = await supabaseAnon.rpc('has_role', { _user_id: callerId, _role: 'admin' })
    const { data: isGT } = await supabaseAnon.rpc('has_role', { _user_id: callerId, _role: 'gerenciador_tecnico' })

    if (!isAdmin && !isGT) {
      return jsonResponse({ error: 'Apenas administradores e gerenciadores técnicos podem gerenciar usuários.' }, 403)
    }

    // Limit body size (32KB) — previne memory abuse
    const rawBody = await req.text()
    if (rawBody.length > 32 * 1024) {
      return jsonResponse({ error: 'Payload muito grande.' }, 413)
    }

    let parsedBody: unknown
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return jsonResponse({ error: 'Corpo da requisição inválido.' }, 400)
    }

    const validation = BodySchema.safeParse(parsedBody)
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message ?? 'Dados inválidos'
      return jsonResponse({ error: firstIssue }, 400)
    }
    const body = validation.data

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

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

    if (body.action === 'create') {
      const { name, email, password, role } = body

      if (role === 'admin' && !ALLOWED_ADMIN_EMAILS.includes(email)) {
        return jsonResponse({ error: 'O role admin só pode ser atribuído a e-mails autorizados' }, 400)
      }

      if (role === 'gerenciador_tecnico' && !ALLOWED_GT_EMAILS.includes(email)) {
        return jsonResponse({ error: 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados' }, 400)
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      })

      if (createError || !newUser?.user) {
        console.error(`manage-user: create failed for ${safeMaskEmail(email)} — ${createError?.message ?? 'unknown'}`)
        return jsonResponse({ error: 'Não foi possível criar o usuário.' }, 400)
      }

      if (isAdmin) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: newUser.user.id, role })

        if (roleError) {
          console.error(`manage-user: role insert failed — ${roleError.message}`)
          return jsonResponse({ error: 'Usuário criado, mas houve erro ao atribuir o perfil.' }, 500)
        }

        return jsonResponse({ success: true, userId: newUser.user.id })
      }

      // GT: aprovação requerida
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
        console.error(`manage-user: approval insert failed — ${aprovError.message}`)
        return jsonResponse({ error: 'Usuário criado, mas houve erro ao registrar a aprovação.' }, 500)
      }

      await notifyAdmins(
        'Solicitação de atribuição de role',
        `Gerenciador técnico solicitou atribuir role "${role}" ao novo usuário ${safeMaskEmail(email)}.`
      );

      return jsonResponse({
        success: true,
        userId: newUser.user.id,
        pending_approval: true,
        message: 'Usuário criado. A atribuição do role aguarda aprovação de um administrador.',
      })
    }

    // body.action === 'update_role'
    const { userId, role } = body

    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (!targetUser?.user) {
      return jsonResponse({ error: 'Usuário não encontrado' }, 404)
    }

    const targetEmail = targetUser.user.email || ''

    if (ALLOWED_ADMIN_EMAILS.includes(targetEmail) && !isAdmin) {
      return jsonResponse({ error: 'Apenas o admin principal pode alterar o próprio role.' }, 403)
    }

    if (isGT && !isAdmin && targetUser.user.id === callerId) {
      return jsonResponse({ error: 'Você não pode alterar seu próprio role.' }, 403)
    }

    if (role === 'admin' && !ALLOWED_ADMIN_EMAILS.includes(targetEmail)) {
      return jsonResponse({ error: 'O role admin só pode ser atribuído a e-mails autorizados' }, 400)
    }

    if (role === 'gerenciador_tecnico' && !ALLOWED_GT_EMAILS.includes(targetEmail)) {
      return jsonResponse({ error: 'O role gerenciador_tecnico só pode ser atribuído a e-mails autorizados' }, 400)
    }

    const { data: currentRoleRow } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
    const currentRole = currentRoleRow?.role ?? null

    if (isAdmin) {
      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error(`manage-user: delete role failed — ${deleteError.message}`)
        return jsonResponse({ error: 'Não foi possível remover o perfil atual.' }, 500)
      }

      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (insertError) {
        console.error(`manage-user: insert role failed — ${insertError.message}`)
        return jsonResponse({ error: 'Não foi possível atribuir o novo perfil.' }, 500)
      }

      return jsonResponse({ success: true })
    }

    // GT: aprovação requerida
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
      console.error(`manage-user: approval insert failed — ${aprovError.message}`)
      return jsonResponse({ error: 'Não foi possível registrar a aprovação.' }, 500)
    }

    await notifyAdmins(
      'Solicitação de alteração de role',
      `Gerenciador técnico solicitou alterar role de ${safeMaskEmail(targetEmail)} para "${role}" (atual: ${currentRole ?? 'nenhum'}).`
    );

    return jsonResponse({
      success: true,
      pending_approval: true,
      message: 'Solicitação enviada. Aguardando aprovação de um administrador.',
    })

  } catch (error) {
    console.error('manage-user: unhandled error', (error as Error)?.message)
    return jsonResponse({ error: 'Erro interno do servidor' }, 500)
  }
})
