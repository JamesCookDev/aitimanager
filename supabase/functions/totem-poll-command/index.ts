import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key, x-totem-device-id',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const deviceId = req.headers.get('x-totem-device-id')
    const apiKey = req.headers.get('x-totem-api-key')

    if (!deviceId && !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Device ID ou API key obrigatória' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let query = supabase
      .from('devices')
      .select('id, pending_command')

    if (deviceId) {
      query = query.eq('id', deviceId)
    } else {
      query = query.eq('api_key', apiKey!)
    }

    const { data: device, error } = await query.single()

    if (error || !device) {
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const command = device.pending_command || null

    if (command) {
      await supabase
        .from('devices')
        .update({ pending_command: null, command_sent_at: null })
        .eq('id', device.id)

      await supabase
        .from('command_logs')
        .update({ status: 'delivered', executed_at: new Date().toISOString() })
        .eq('device_id', device.id)
        .eq('command', command)
        .eq('status', 'pending')

      console.log(`[poll-command] Device ${device.id}: comando "${command}" entregue ao worker`)
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