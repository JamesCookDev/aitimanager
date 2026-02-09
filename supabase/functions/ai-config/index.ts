import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Autenticação via API key do dispositivo (mesmo padrão do heartbeat)
    const apiKey = req.headers.get('x-totem-api-key')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key obrigatória', code: 'MISSING_API_KEY' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar dispositivo pela API key para obter org_id
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, org_id, ai_prompt')
      .eq('api_key', apiKey)
      .single()

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado', code: 'INVALID_API_KEY' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar configuração: primeiro por device_id, depois pela org
    let aiConfig = null
    let configError = null

    // 1. Tentar config específica do dispositivo
    const { data: deviceConfig, error: deviceConfigError } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('device_id', device.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (deviceConfig) {
      aiConfig = deviceConfig
    } else {
      // 2. Fallback: config geral da org (sem device_id)
      const { data: orgConfig, error: orgConfigError } = await supabase
        .from('ai_configs')
        .select('*')
        .eq('org_id', device.org_id)
        .is('device_id', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      aiConfig = orgConfig
      configError = orgConfigError
    }

    // Config padrão caso não exista registro na tabela ai_configs
    const defaultConfig = {
      system_prompt: device.ai_prompt || 'Você é um assistente virtual amigável. Responda de forma curta e objetiva.',
      knowledge_base: '',
      model: 'llama3.2:1b',
      temperature: 0.3,
      max_tokens: 50,
      avatar_name: 'Assistente',
      voice: 'af_bella',
      tts_url: null,
      stt_url: null,
    }

    if (configError || !aiConfig) {
      return new Response(
        JSON.stringify({
          success: true,
          device_id: device.id,
          config: defaultConfig,
          source: 'default',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        device_id: device.id,
        config: {
          system_prompt: aiConfig.system_prompt,
          knowledge_base: aiConfig.knowledge_base,
          model: aiConfig.model || 'llama3.2:1b',
          temperature: aiConfig.temperature ?? 0.3,
          max_tokens: aiConfig.max_tokens ?? 50,
          avatar_name: aiConfig.avatar_name || 'Assistente',
          voice: aiConfig.voice || 'af_bella',
          tts_url: aiConfig.tts_url || null,
          stt_url: aiConfig.stt_url || null,
          updated_at: aiConfig.updated_at,
        },
        source: 'database',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro no ai-config:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
