import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key',
}

/**
 * Endpoint para o worker reportar resultado de execução de comandos.
 * POST { command: string, status: 'executed' | 'failed', error?: string }
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = req.headers.get('x-totem-api-key')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key obrigatória' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: device, error: fetchErr } = await supabase
      .from('devices')
      .select('id')
      .eq('api_key', apiKey)
      .single()

    if (fetchErr || !device) {
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { command, status, error: execError } = body

    if (!command || !status) {
      return new Response(
        JSON.stringify({ error: 'command e status são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the most recent matching log entry
    const { error: updateErr } = await supabase
      .from('command_logs')
      .update({
        status: status === 'executed' ? 'executed' : 'failed',
        executed_at: new Date().toISOString(),
      })
      .eq('device_id', device.id)
      .eq('command', command)
      .eq('status', 'delivered')
      .order('sent_at', { ascending: false })
      .limit(1)

    if (updateErr) {
      console.error(`[command-report] Erro ao atualizar log:`, updateErr)
    }

    console.log(`[command-report] Device ${device.id}: "${command}" → ${status}${execError ? ` (${execError})` : ''}`)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Erro no command-report:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
