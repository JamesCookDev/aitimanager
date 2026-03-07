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
      .select(`
        id, 
        name, 
        avatar_config, 
        model_3d_url,
        current_version_id,
        ui_config,
        ai_prompt,
        org_id,
        organization:organizations(name)
      `)

    if (deviceId) {
      query = query.eq('id', deviceId)
    } else {
      query = query.eq('api_key', apiKey!)
    }

    const { data: device, error: fetchError } = await query.single()

    if (fetchError || !device) {
      console.warn(`[totem-config] Dispositivo não encontrado — id:${deviceId} / key:${apiKey?.slice(0, 8)}...`)
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[totem-config] Device: ${device.id} (${device.name}) requisitou configuração`)

    let modelData = null
    if (device.current_version_id) {
      const { data: version } = await supabase
        .from('device_versions')
        .select('*')
        .eq('id', device.current_version_id)
        .single()
      modelData = version
    }

    const avatarConfig = device.avatar_config || {}
    const storedUi = device.ui_config || {}

    // Default config
    const defaultConfig = {
      canvas: {
        orientation: 'vertical',
        background: { type: 'solid', color: '#0f3460' },
      },
      components: {
        avatar: {
          enabled: true,
          position: 'center',
          scale: 1.5,
          animation: 'idle',
          colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' },
          models: {
            avatar_url: '/models/avatar.glb',
            animations_url: '/models/animations.glb',
          },
          animations: { idle: 'Idle', talking: 'TalkingOne' },
          materials: { roughness: 0.5, metalness: 0.0 },
        },
        chat_interface: {
          enabled: true,
          position: 'bottom_right',
          header: { show: true, icon: '📍', title: 'Assistente', subtitle: 'Totem Interativo' },
          menu: {
            cta_icon: '💬',
            cta_text: 'Posso ajudar?',
            categories: [
              { title: 'Geral', icon: '⚡', buttons: [{ emoji: 'ℹ️', label: 'Informações', prompt: 'Quem é você?', color: 'from-teal-400 to-cyan-400' }] }
            ],
          },
        },
      },
    }

    // ── Build merged UI config ──
    let mergedUi: any

    // Extract free_canvas early — it may exist regardless of old/new format
    const freeCanvas = storedUi.free_canvas || null

    if (storedUi.canvas && storedUi.components) {
      const avatarStored = storedUi.components?.avatar || {}
      const avatarDef = defaultConfig.components.avatar
      const models = { ...avatarDef.models, ...(avatarStored.models || {}) }
      const animations = { ...avatarDef.animations, ...(avatarStored.animations || {}) }

      if (!models.avatar_url) models.avatar_url = avatarDef.models.avatar_url
      if (!models.animations_url) models.animations_url = avatarDef.models.animations_url
      models.avatar_url = models.avatar_url.replace(/\\/g, '/')
      models.animations_url = models.animations_url.replace(/\\/g, '/')
      if (!animations.idle || animations.idle === 'idle') animations.idle = 'Idle'
      if (!animations.talking || animations.talking === 'talkingOne') animations.talking = 'TalkingOne'

      mergedUi = {
        canvas: {
          orientation: storedUi.canvas?.orientation || defaultConfig.canvas.orientation,
          background: { ...defaultConfig.canvas.background, ...(storedUi.canvas?.background || {}) },
        },
        components: {
          avatar: {
            ...avatarDef,
            ...avatarStored,
            enabled: avatarStored.enabled ?? true,
            colors: { ...avatarDef.colors, ...(avatarStored.colors || {}) },
            models,
            animations,
            materials: { ...avatarDef.materials, ...(avatarStored.materials || {}) },
          },
          chat_interface: {
            ...defaultConfig.components.chat_interface,
            ...(storedUi.components?.chat_interface || {}),
            header: { ...defaultConfig.components.chat_interface.header, ...(storedUi.components?.chat_interface?.header || {}) },
            menu: {
              ...defaultConfig.components.chat_interface.menu,
              ...(storedUi.components?.chat_interface?.menu || {}),
              categories: storedUi.components?.chat_interface?.menu?.categories || defaultConfig.components.chat_interface.menu.categories,
            },
          },
        },
        free_canvas: freeCanvas,
      }
    } else {
      const layout = storedUi.layout || {}
      mergedUi = {
        canvas: {
          orientation: 'vertical',
          background: {
            type: layout.bg_type || 'solid',
            color: layout.bg_color || '#0f3460',
            gradient: layout.bg_gradient || undefined,
            image_url: layout.bg_image || undefined,
          },
        },
        components: {
          avatar: {
            enabled: true,
            position: layout.avatar_position || 'center',
            scale: layout.avatar_scale || 1.5,
            animation: 'idle',
            colors: avatarConfig.colors || defaultConfig.components.avatar.colors,
          },
          chat_interface: {
            enabled: layout.show_chat_menu !== false,
            position: layout.chat_position === 'left' ? 'bottom_left' : 'bottom_right',
            header: {
              show: layout.show_header !== false,
              icon: storedUi.header_icon || '📍',
              title: storedUi.title || 'Assistente',
              subtitle: storedUi.subtitle || 'Totem Interativo',
            },
            menu: {
              cta_icon: storedUi.cta_icon || '💬',
              cta_text: storedUi.cta_text || 'Posso ajudar?',
              categories: (storedUi.menu_categories || []).map((cat: any) => ({
                title: cat.category_title || cat.title || 'Geral',
                icon: cat.category_icon || cat.icon || '⚡',
                buttons: cat.buttons || [],
              })),
            },
          },
        },
        free_canvas: null,
      }
      if (mergedUi.components.chat_interface.menu.categories.length === 0) {
        mergedUi.components.chat_interface.menu.categories = defaultConfig.components.chat_interface.menu.categories
      }
    }

    const elementCount = mergedUi.free_canvas?.elements?.length || 0
    console.log(`[totem-config] free_canvas elements: ${elementCount}`)

    // ── AI CONFIG ──
    let aiConfigResult: any = null

    const { data: deviceAiConfig } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('device_id', device.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (deviceAiConfig) {
      aiConfigResult = deviceAiConfig
    } else {
      const { data: orgAiConfig } = await supabase
        .from('ai_configs')
        .select('*')
        .eq('org_id', device.org_id)
        .is('device_id', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      aiConfigResult = orgAiConfig
    }

    const defaultAi = {
      system_prompt: device.ai_prompt || 'Você é um assistente virtual amigável. Responda de forma curta e objetiva.',
      knowledge_base: '',
      model: 'llama3.2:1b',
      temperature: 0.3,
      max_tokens: 50,
      avatar_name: 'Assistente',
      voice: 'af_bella',
      base_url: null,
      tts_url: null,
      stt_url: null,
      llm_url: null,
      tts_speed: 1,
      tts_model: 'kokoro',
    }

    const ai = aiConfigResult ? {
      system_prompt: aiConfigResult.system_prompt,
      knowledge_base: aiConfigResult.knowledge_base,
      model: aiConfigResult.model || defaultAi.model,
      temperature: aiConfigResult.temperature ?? defaultAi.temperature,
      max_tokens: aiConfigResult.max_tokens ?? defaultAi.max_tokens,
      avatar_name: aiConfigResult.avatar_name || defaultAi.avatar_name,
      voice: aiConfigResult.voice || defaultAi.voice,
      base_url: aiConfigResult.base_url || null,
      tts_url: aiConfigResult.tts_url || null,
      stt_url: aiConfigResult.stt_url || null,
      llm_url: aiConfigResult.llm_url || null,
      tts_speed: aiConfigResult.tts_speed ?? defaultAi.tts_speed,
      tts_model: aiConfigResult.tts_model || defaultAi.tts_model,
    } : defaultAi

    console.log(`[totem-config] AI config source: ${aiConfigResult ? 'database' : 'default'}`)

    return new Response(
      JSON.stringify({
        success: true,
        config: {
          device_id: device.id,
          device_name: device.name,
          organization: device.organization?.name || 'Sem organização',
          avatar: avatarConfig,
          model: modelData ? {
            url: modelData.model_url,
            version_notes: modelData.version_notes,
            file_name: modelData.file_name,
            updated_at: modelData.created_at
          } : null,
          ui: mergedUi,
          ai,
        }
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