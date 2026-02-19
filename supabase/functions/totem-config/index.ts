import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key',
}

// Parse craft_blocks (string or object) into a node tree the local renderer can consume
function parseCraftBlocks(raw: unknown): Record<string, any> | null {
  if (!raw) return null
  if (typeof raw === 'object') return raw as Record<string, any>
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
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

    const { data: device, error: fetchError } = await supabase
      .from('devices')
      .select(`
        id, 
        name, 
        avatar_config, 
        model_3d_url,
        current_version_id,
        ui_config,
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

    // Default new modular config
    const defaultConfig = {
      canvas: {
        orientation: 'vertical',
        background: { type: 'solid', color: '#0f3460' },
        environment: { show_floor: true, show_particles: true, floor_color: '#1a1a2e' },
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
          animations: {
            idle: 'Idle',
            talking: 'TalkingOne',
          },
          materials: {
            roughness: 0.5,
            metalness: 0.0,
          },
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

    const storedUi = device.ui_config || {}
    let mergedUi: any

    // Check if stored config is new modular format
    if (storedUi.canvas && storedUi.components) {
      const craftNodes = parseCraftBlocks(storedUi.craft_blocks)

      // Extract avatar enabled state from craft nodes if available
      let avatarEnabled = storedUi.components?.avatar?.enabled ?? true
      if (craftNodes) {
        const avatarNode = Object.values(craftNodes).find(
          (n: any) => n.type?.resolvedName === 'AvatarBlock'
        ) as any
        if (avatarNode && typeof avatarNode.props?.enabled === 'boolean') {
          avatarEnabled = avatarNode.props.enabled
        }
      }

      mergedUi = {
        canvas: {
          orientation: storedUi.canvas?.orientation || defaultConfig.canvas.orientation,
          background: { ...defaultConfig.canvas.background, ...(storedUi.canvas?.background || {}) },
          environment: { ...defaultConfig.canvas.environment, ...(storedUi.canvas?.environment || {}) },
        },
        components: {
          avatar: (() => {
            const stored = storedUi.components?.avatar || {}
            const def = defaultConfig.components.avatar
            const models = { ...def.models, ...(stored.models || {}) }
            const animations = { ...def.animations, ...(stored.animations || {}) }
            // Sanitize: replace empty strings with defaults and fix paths
            if (!models.avatar_url) models.avatar_url = def.models.avatar_url
            if (!models.animations_url) models.animations_url = def.models.animations_url
            // Fix backslash paths (Windows-style)
            models.avatar_url = models.avatar_url.replace(/\\/g, '/')
            models.animations_url = models.animations_url.replace(/\\/g, '/')
            // Force correct casing for animation names (Three.js is case-sensitive)
            if (!animations.idle || animations.idle === 'idle') animations.idle = 'Idle'
            if (!animations.talking || animations.talking === 'talkingOne') animations.talking = 'TalkingOne'
            return {
              ...def,
              ...stored,
              enabled: avatarEnabled,
              colors: { ...def.colors, ...(stored.colors || {}) },
              models,
              animations,
              materials: { ...def.materials, ...(stored.materials || {}) },
            }
          })(),
          chat_interface: {
            ...defaultConfig.components.chat_interface,
            ...(storedUi.components?.chat_interface || {}),
            header: { ...defaultConfig.components.chat_interface.header, ...(storedUi.components?.chat_interface?.header || {}) },
            menu: {
              ...defaultConfig.components.chat_interface.menu,
              ...(storedUi.components?.chat_interface?.menu || {}),
              categories: storedUi.components?.chat_interface?.menu?.categories || defaultConfig.components.chat_interface.menu.categories,
            },
            style: storedUi.components?.chat_interface?.style || { opacity: 0.85, blur: 12 },
          },
          logo: storedUi.components?.logo || { enabled: false, url: '', position: 'top_center', scale: 1 },
          text_banners: storedUi.components?.text_banners || { enabled: false, items: [] },
        },
        // Custom layers (image, video, shape, clock overlays)
        layers: storedUi.layers || [],
        // Craft.js node tree for 2D overlay rendering (parsed from serialized string)
        craft_nodes: craftNodes,
      }
    } else {
      // Legacy format: migrate on-the-fly for backward compat
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
          environment: {
            show_floor: layout.show_floor ?? true,
            show_particles: layout.show_particles ?? true,
            floor_color: layout.floor_color || '#1a1a2e',
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
            style: { opacity: 0.85, blur: 12 },
          },
          logo: { enabled: false, url: '', position: 'top_center', scale: 1 },
          text_banners: { enabled: false, items: [] },
        },
        layers: [],
        craft_nodes: null,
      }
      if (mergedUi.components.chat_interface.menu.categories.length === 0) {
        mergedUi.components.chat_interface.menu.categories = defaultConfig.components.chat_interface.menu.categories
      }
    }

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
