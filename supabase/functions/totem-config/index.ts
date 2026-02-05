import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key',
}

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

    // Buscar dispositivo pela API key
    const { data: device, error: fetchError } = await supabase
      .from('devices')
      .select(`
        id, 
        name, 
        avatar_config, 
        model_3d_url,
        current_version_id,
        organization:organizations(name)
      `)
      .eq('api_key', apiKey)
      .single()

    if (fetchError || !device) {
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar versão atual do modelo
    let modelData = null
    if (device.current_version_id) {
      const { data: version } = await supabase
        .from('device_versions')
        .select('*')
        .eq('id', device.current_version_id)
        .single()
      
      modelData = version
    }

    // Estruturar resposta para o cliente Avatar
    const config = device.avatar_config || {}
    
    return new Response(
      JSON.stringify({
        device_id: device.id,
        device_name: device.name,
        organization: device.organization?.name || 'Sem organização',
        colors: config.colors || {
          shirt: '#1E3A8A',
          pants: '#1F2937',
          shoes: '#000000'
        },
        material: config.material || {
          metalness: 0.1,
          roughness: 0.8
        },
        textures: config.textures || {},
        animation: config.animation || 'idle',
        model: modelData ? {
          url: modelData.model_url,
          version_notes: modelData.version_notes,
          file_name: modelData.file_name,
          updated_at: modelData.created_at
        } : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao buscar config:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
