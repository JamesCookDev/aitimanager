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
      console.warn(`[totem-config] Dispositivo não encontrado para api_key: ${apiKey?.slice(0, 8)}...`)
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
      let craftNodes: Record<string, any> | null = null
      try {
        craftNodes = parseCraftBlocks(storedUi.craft_blocks)
      } catch (e) {
        console.error('Failed to parse craft_blocks:', e)
      }

      // Safely get craft node values array
      const craftNodeValues: any[] = craftNodes ? Object.values(craftNodes) : []
      console.log(`[totem-config] craft_nodes recebidos: ${craftNodeValues.length}`)

      // Extract avatar enabled state from craft nodes if available
      let avatarEnabled = storedUi.components?.avatar?.enabled ?? true
      try {
        if (craftNodeValues.length > 0) {
          const avatarNode = craftNodeValues.find(
            (n: any) => n?.type?.resolvedName === 'AvatarBlock'
          )
          if (avatarNode && typeof avatarNode?.props?.enabled === 'boolean') {
            avatarEnabled = avatarNode.props.enabled
          }
        }
      } catch (e) {
        console.error('Failed to extract avatar state:', e)
      }

      // ── Extract SceneBlock props from craft nodes ─────────────────────────
      let sceneOverride: Record<string, any> | null = null
      try {
        if (craftNodeValues.length > 0) {
          const sceneNode = craftNodeValues.find(
            (n: any) => n?.type?.resolvedName === 'SceneBlock'
          )
          if (sceneNode?.props) {
            const sp = sceneNode.props
            console.log(`[totem-config] SceneBlock encontrado — envPreset: ${sp.envPreset}, partículas: ${sp.showParticles}, chão: ${sp.showFloor}`)
            sceneOverride = {
              // Environment
              env_preset: sp.envPreset ?? 'city',
              // Camera
              camera: {
                position: [sp.camPosX ?? 0, sp.camPosY ?? 1.65, sp.camPosZ ?? 4],
                target: [sp.camTargetX ?? 0, sp.camTargetY ?? 1.5, sp.camTargetZ ?? 0],
                min_distance: sp.camMinDist ?? 3,
                max_distance: sp.camMaxDist ?? 8,
              },
              // Lighting
              lighting: {
                ambient: { enabled: sp.ambientEnabled ?? true, intensity: sp.ambientIntensity ?? 0.4 },
                directional: {
                  enabled: sp.dirLightEnabled ?? true,
                  intensity: sp.dirLightIntensity ?? 1.2,
                  color: sp.dirLightColor ?? '#ffffff',
                  position: [sp.dirLightPosX ?? 5, sp.dirLightPosY ?? 5, sp.dirLightPosZ ?? 5],
                  cast_shadow: sp.dirLightCastShadow ?? true,
                },
                fill: { enabled: sp.fillLightEnabled ?? true, intensity: sp.fillLightIntensity ?? 0.5, color: sp.fillLightColor ?? '#b8d4ff' },
                spot: {
                  enabled: sp.spotLightEnabled ?? true,
                  intensity: sp.spotLightIntensity ?? 0.8,
                  color: sp.spotLightColor ?? '#ffd4a3',
                  position: [sp.spotLightPosX ?? 0, sp.spotLightPosY ?? 5, sp.spotLightPosZ ?? -5],
                  angle: sp.spotLightAngle ?? 0.6,
                  penumbra: sp.spotLightPenumbra ?? 0.5,
                  cast_shadow: sp.spotLightCastShadow ?? true,
                },
                point1: { enabled: sp.pointLight1Enabled ?? true, color: sp.pointLight1Color ?? '#4a90ff', intensity: sp.pointLight1Intensity ?? 0.3 },
                point2: { enabled: sp.pointLight2Enabled ?? true, color: sp.pointLight2Color ?? '#ff6b9d', intensity: sp.pointLight2Intensity ?? 0.3 },
              },
              // Floor
              floor: {
                show: sp.showFloor ?? true,
                color: sp.floorColor ?? '#1a1a2e',
                width: sp.floorWidth ?? 20,
                height: sp.floorHeight ?? 20,
                roughness: sp.floorRoughness ?? 0.3,
                metalness: sp.floorMetalness ?? 0.8,
              },
              // Wall
              wall: {
                show: sp.showWall ?? true,
                color: sp.wallColor ?? '#0f3460',
                width: sp.wallWidth ?? 20,
                height: sp.wallHeight ?? 12,
                roughness: sp.wallRoughness ?? 0.8,
                metalness: sp.wallMetalness ?? 0.2,
                pos_y: sp.wallPosY ?? 4,
                pos_z: sp.wallPosZ ?? -5,
              },
              // Particles
              particles: {
                show: sp.showParticles ?? true,
                count: sp.particleCount ?? 50,
                color: sp.particleColor ?? '#4a90ff',
                size: sp.particleSize ?? 2,
                speed: sp.particleSpeed ?? 0.3,
                opacity: sp.particleOpacity ?? 0.4,
                scale: sp.particleScale ?? 10,
              },
              // Contact shadow
              shadow: {
                opacity: sp.shadowOpacity ?? 0.5,
                blur: sp.shadowBlur ?? 2,
                scale: sp.shadowScale ?? 10,
                color: sp.shadowColor ?? '#000000',
              },
            }
          } else {
            console.log(`[totem-config] SceneBlock não encontrado nos craft_nodes`)
          }
        } else {
          console.log(`[totem-config] Nenhum craft_node disponível para extrair SceneBlock`)
        }
      } catch (e) {
        console.error('[totem-config] Erro ao extrair SceneBlock:', e)
      }

      mergedUi = {
        canvas: {
          orientation: storedUi.canvas?.orientation || defaultConfig.canvas.orientation,
          background: { ...defaultConfig.canvas.background, ...(storedUi.canvas?.background || {}) },
          environment: { ...defaultConfig.canvas.environment, ...(storedUi.canvas?.environment || {}) },
          // SceneBlock overrides from craft_nodes (takes priority over stored canvas)
          ...(sceneOverride ? { scene: sceneOverride } : {}),
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
          chat_interface: (() => {
            // Try to extract from ChatInterfaceBlock craft node first
            const chatNode = craftNodeValues.find(
              (n: any) => n?.type?.resolvedName === 'ChatInterfaceBlock'
            )
            if (chatNode?.props) {
              const cp = chatNode.props
              console.log(`[totem-config] ChatInterfaceBlock encontrado — enabled: ${cp.enabled}, posição: ${cp.position}`)
              return {
                enabled: cp.enabled ?? true,
                position: cp.position ?? 'bottom_right',
                header: {
                  show: cp.headerShow ?? true,
                  icon: cp.headerIcon ?? '📍',
                  title: cp.headerTitle ?? 'Assistente Virtual',
                  subtitle: cp.headerSubtitle ?? 'Online agora',
                  indicator_color: cp.headerIndicatorColor ?? '#10b981',
                },
                cta: {
                  text: cp.ctaText ?? 'Como posso ajudar?',
                  icon: cp.ctaIcon ?? '💬',
                },
                items: cp.items ?? [],
                close_on_select: cp.closeOnSelect ?? true,
                style: {
                  opacity: cp.opacity ?? 1,
                  blur: cp.blur ?? 15,
                  z_index: cp.zIndex ?? 1000,
                },
                symbols: {
                  folder_arrow: cp.folderArrowSymbol ?? '▼',
                  item_arrow: cp.itemArrowSymbol ?? '→',
                  folder_icon_default: cp.folderIconDefault ?? '📁',
                  item_icon_default: cp.itemIconDefault ?? '💬',
                },
              }
            }
            // Fallback to stored config
            return {
              ...defaultConfig.components.chat_interface,
              ...(storedUi.components?.chat_interface || {}),
              header: { ...defaultConfig.components.chat_interface.header, ...(storedUi.components?.chat_interface?.header || {}) },
              menu: {
                ...defaultConfig.components.chat_interface.menu,
                ...(storedUi.components?.chat_interface?.menu || {}),
                categories: storedUi.components?.chat_interface?.menu?.categories || defaultConfig.components.chat_interface.menu.categories,
              },
              style: storedUi.components?.chat_interface?.style || { opacity: 0.85, blur: 12 },
            }
          })(),
          logo: storedUi.components?.logo || { enabled: false, url: '', position: 'top_center', scale: 1 },
          text_banners: storedUi.components?.text_banners || { enabled: false, items: [] },
          // Extract buttons from craft_nodes or stored components
          buttons: (() => {
            try {
              if (storedUi.components?.buttons && Array.isArray(storedUi.components.buttons) && storedUi.components.buttons.length > 0) {
                return storedUi.components.buttons
              }
              const btnNodes = craftNodeValues.filter((n: any) => n?.type?.resolvedName === 'ButtonBlock')
              if (btnNodes.length > 0) {
                return btnNodes.map((bn: any) => ({
                  label: bn?.props?.label ?? 'Clique aqui',
                  bgColor: bn?.props?.bgColor ?? '#3b82f6',
                  textColor: bn?.props?.textColor ?? '#ffffff',
                  fontSize: bn?.props?.fontSize ?? 16,
                  borderRadius: bn?.props?.borderRadius ?? 8,
                  paddingX: bn?.props?.paddingX ?? 24,
                  paddingY: bn?.props?.paddingY ?? 14,
                  fullWidth: bn?.props?.fullWidth ?? false,
                  action: bn?.props?.action ?? '',
                  fontWeight: bn?.props?.fontWeight ?? 'semibold',
                  icon: bn?.props?.icon ?? '',
                  iconPosition: bn?.props?.iconPosition ?? 'left',
                  shadow: bn?.props?.shadow ?? 'none',
                  opacity: bn?.props?.opacity ?? 1,
                }))
              }
            } catch (e) { console.error('Error extracting buttons:', e) }
            return []
          })(),
          // Extract social links from stored or craft_nodes
          social_links: (() => {
            try {
              if (storedUi.components?.social_links && Array.isArray(storedUi.components.social_links) && storedUi.components.social_links.length > 0) {
                return storedUi.components.social_links
              }
              const socialNodes = craftNodeValues.filter((n: any) => n?.type?.resolvedName === 'SocialLinksBlock')
              if (socialNodes.length > 0) {
                return socialNodes.map((sn: any) => ({
                  links: sn?.props?.links ?? [],
                  layout: sn?.props?.layout ?? 'horizontal',
                  iconSize: sn?.props?.iconSize ?? 40,
                  gap: sn?.props?.gap ?? 12,
                  showLabels: sn?.props?.showLabels ?? true,
                  bgEnabled: sn?.props?.bgEnabled ?? false,
                  bgColor: sn?.props?.bgColor ?? 'rgba(255,255,255,0.06)',
                  borderRadius: sn?.props?.borderRadius ?? 16,
                  padding: sn?.props?.padding ?? 12,
                }))
              }
            } catch (e) { console.error('Error extracting social_links:', e) }
            return []
          })(),
          // Extract video embeds from stored or craft_nodes
          videos: (() => {
            try {
              if (storedUi.components?.videos && Array.isArray(storedUi.components.videos) && storedUi.components.videos.length > 0) {
                return storedUi.components.videos
              }
              const vidNodes = craftNodeValues.filter((n: any) => n?.type?.resolvedName === 'VideoEmbedBlock')
              if (vidNodes.length > 0) {
                return vidNodes.map((vn: any) => ({
                  url: vn?.props?.url ?? '',
                  aspectRatio: vn?.props?.aspectRatio ?? '16:9',
                  borderRadius: vn?.props?.borderRadius ?? 12,
                  autoplay: vn?.props?.autoplay ?? false,
                  muted: vn?.props?.muted ?? true,
                  loop: vn?.props?.loop ?? true,
                  opacity: vn?.props?.opacity ?? 1,
                }))
              }
            } catch (e) { console.error('Error extracting videos:', e) }
            return []
          })(),
          // Extract QR codes from stored or craft_nodes
          qr_codes: (() => {
            try {
              if (storedUi.components?.qr_codes && Array.isArray(storedUi.components.qr_codes) && storedUi.components.qr_codes.length > 0) {
                return storedUi.components.qr_codes
              }
              const qrNodes = craftNodeValues.filter((n: any) => n?.type?.resolvedName === 'QRCodeBlock')
              if (qrNodes.length > 0) {
                return qrNodes.map((qn: any) => ({
                  content: qn?.props?.content ?? '',
                  size: qn?.props?.size ?? 160,
                  fgColor: qn?.props?.fgColor ?? '#ffffff',
                  bgColor: qn?.props?.bgColor ?? 'transparent',
                  borderRadius: qn?.props?.borderRadius ?? 8,
                  padding: qn?.props?.padding ?? 12,
                  label: qn?.props?.label ?? '',
                  labelColor: qn?.props?.labelColor ?? '#ffffff',
                  labelSize: qn?.props?.labelSize ?? 12,
                }))
              }
            } catch (e) { console.error('Error extracting qr_codes:', e) }
            return []
          })(),
          // Extract text blocks from craft_nodes for the local renderer
          texts: (() => {
            try {
              const textNodes = craftNodeValues.filter((n: any) => n?.type?.resolvedName === 'TextBlock')
              if (textNodes.length > 0) {
                return textNodes.map((tn: any) => ({
                  text: tn?.props?.text ?? '',
                  fontSize: tn?.props?.fontSize ?? 16,
                  fontWeight: tn?.props?.fontWeight ?? 'normal',
                  color: tn?.props?.color ?? '#ffffff',
                  textAlign: tn?.props?.textAlign ?? 'left',
                  padding: tn?.props?.padding ?? 8,
                  letterSpacing: tn?.props?.letterSpacing ?? 0,
                  lineHeight: tn?.props?.lineHeight ?? 1.5,
                  textTransform: tn?.props?.textTransform ?? 'none',
                  opacity: tn?.props?.opacity ?? 1,
                  textShadow: tn?.props?.textShadow ?? false,
                }))
              }
            } catch (e) { console.error('Error extracting texts:', e) }
            return []
          })(),
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
