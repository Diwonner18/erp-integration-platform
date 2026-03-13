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
    // Validate internal caller: accept either service_role JWT or internal secret
    const authHeader = req.headers.get('Authorization')
    const internalSecret = req.headers.get('x-internal-secret')
    const expectedSecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Allow if called with service_role key (pg_cron/pg_net) or matching internal secret
    const isServiceRole = authHeader?.includes(expectedSecret || '__never__')
    const isInternalCall = internalSecret === expectedSecret

    if (!isServiceRole && !isInternalCall) {
      console.warn('purge-expired-logs called without valid authorization')
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Delete expired logs
    const { data, error } = await supabaseAdmin
      .from('logs_auditoria')
      .delete()
      .not('data_expiracao', 'is', null)
      .lt('data_expiracao', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Erro ao purgar logs:', error.message)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const count = data?.length ?? 0
    console.log(`Expurgo LGPD: ${count} registros expirados removidos.`)

    // Log the purge action itself (won't expire for 5 years)
    await supabaseAdmin.rpc('insert_audit_log', {
      _acao: 'expurgo_lgpd',
      _descricao: `Expurgo automático: ${count} registros expirados removidos`,
      _tabela: 'logs_auditoria',
      _modulo: 'lgpd',
      _nivel_sensibilidade: 'alto',
    })

    return new Response(JSON.stringify({ success: true, purged: count }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro interno no expurgo:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
