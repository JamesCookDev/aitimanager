import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key',
}

/**
 * Endpoint exclusivo para o sync-worker buscar comandos pendentes
 * SEM atualizar last_ping (não interfere no status online/offline do totem)
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

    // Busca apenas o pending_command, sem tocar em last_ping
    const { data: device, error } = await supabase
      .from('devices')
      .select('id, pending_command')
      .eq('api_key', apiKey)
      .single()

    if (error || !device) {
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const command = device.pending_command || null

    // Se houver comando, limpa sem alterar last_ping
    if (command) {
      await supabase
        .from('devices')
        .update({ pending_command: null, command_sent_at: null })
        .eq('id', device.id)
    }

    return new Response(
      JSON.stringify({ command }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Erro no poll-command:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
