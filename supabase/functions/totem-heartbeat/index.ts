import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Parse body for status details
    let statusDetails = {}
    let isSpeaking = false
    
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        statusDetails = body.status_details || {}
        isSpeaking = body.is_speaking || false
      } catch {
        // Body vazio é OK para heartbeat simples
      }
    }

    // Buscar e atualizar dispositivo pela API key
    const { data: device, error: fetchError } = await supabase
      .from('devices')
      .select('id, name, avatar_config, model_3d_url, current_version_id, pending_command')
      .eq('api_key', apiKey)
      .single()

    if (fetchError || !device) {
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Capturar comando pendente antes de limpar
    const command = device.pending_command || null

    // Atualizar last_ping, status e limpar comando pendente
    const { error: updateError } = await supabase
      .from('devices')
      .update({ 
        last_ping: new Date().toISOString(),
        is_speaking: isSpeaking,
        status_details: statusDetails,
        last_interaction: isSpeaking ? new Date().toISOString() : undefined,
        pending_command: null,
        command_sent_at: null,
      })
      .eq('id', device.id)

    if (updateError) {
      console.error('Erro ao atualizar dispositivo:', updateError)
    }

    // Marcar comando como executado no log
    if (command) {
      const { error: logError } = await supabase
        .from('command_logs')
        .update({ status: 'executed', executed_at: new Date().toISOString() })
        .eq('device_id', device.id)
        .eq('status', 'pending')

      if (logError) {
        console.error('Erro ao atualizar log de comando:', logError)
      }
    }

    // Buscar versão atual do modelo se existir
    let modelUrl = device.model_3d_url
    if (device.current_version_id) {
      const { data: version } = await supabase
        .from('device_versions')
        .select('model_url')
        .eq('id', device.current_version_id)
        .single()
      
      if (version) {
        modelUrl = version.model_url
      }
    }

    // Retornar configurações atuais + comando pendente
    return new Response(
      JSON.stringify({
        success: true,
        device_id: device.id,
        name: device.name,
        config: device.avatar_config,
        model_url: modelUrl,
        command: command,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no heartbeat:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
