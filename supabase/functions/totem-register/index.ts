import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key, x-totem-device-id',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { hardware_id, org_id, name, description, location } = body

    // ── Modo 1: Auto-registro pelo hardware (sem auth) ──────────
    // O totem envia hardware_id + org_id no primeiro boot.
    // Se já existe, retorna o device_id existente.
    if (hardware_id && org_id) {
      // Verificar se org existe
      const { data: org, error: orgErr } = await supabaseAdmin
        .from('organizations')
        .select('id, name')
        .eq('id', org_id)
        .single()

      if (orgErr || !org) {
        return new Response(
          JSON.stringify({ error: 'Organização não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dispositivo existente por hardware_id
      const { data: existing } = await supabaseAdmin
        .from('devices')
        .select('id, name, api_key')
        .eq('hardware_id', hardware_id)
        .single()

      if (existing) {
        console.log(`[Register] Dispositivo já registrado: ${existing.name} (${existing.id})`)
        return new Response(
          JSON.stringify({
            success: true,
            registered: false,
            device: {
              id: existing.id,
              name: existing.name,
              api_key: existing.api_key,
            },
            message: 'Dispositivo já registrado',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Criar novo dispositivo
      const deviceName = name || `Totem ${hardware_id.substring(0, 8)}`
      const { data: device, error: createError } = await supabaseAdmin
        .from('devices')
        .insert({
          name: deviceName,
          description: description || `Auto-registrado (${hardware_id})`,
          location: location || null,
          org_id,
          hardware_id,
          avatar_config: {
            colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' },
            material: { metalness: 0.1, roughness: 0.8 },
            animation: 'idle',
          },
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar dispositivo:', createError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar dispositivo' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`[Register] ✅ Novo dispositivo auto-registrado: ${device.name} (${device.id})`)
      return new Response(
        JSON.stringify({
          success: true,
          registered: true,
          device: {
            id: device.id,
            name: device.name,
            api_key: device.api_key,
          },
          message: 'Dispositivo registrado com sucesso',
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Modo 2: Registro manual via Hub (com auth) ──────────────
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'hardware_id + org_id obrigatórios para auto-registro, ou Authorization header para registro manual' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!name || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Nome e org_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    const { data: role } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isSuperAdmin = role?.role === 'super_admin'
    const isOrgAdmin = profile?.org_id === org_id

    if (!isSuperAdmin && !isOrgAdmin) {
      return new Response(
        JSON.stringify({ error: 'Sem permissão para esta organização' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: device, error: createError } = await supabaseAdmin
      .from('devices')
      .insert({
        name,
        description,
        location,
        org_id,
        avatar_config: {
          colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' },
          material: { metalness: 0.1, roughness: 0.8 },
          animation: 'idle',
        },
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar dispositivo:', createError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar dispositivo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        registered: true,
        device: {
          id: device.id,
          name: device.name,
          api_key: device.api_key,
        },
        message: 'Dispositivo registrado com sucesso',
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao registrar totem:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
