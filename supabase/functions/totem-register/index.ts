import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    // Verificar auth header (usuário logado)
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autenticação obrigatória' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verificar usuário
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { name, description, location, org_id } = body

    if (!name || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Nome e org_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se usuário tem permissão na org
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

    // Criar dispositivo
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
          animation: 'idle'
        }
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
        device: {
          id: device.id,
          name: device.name,
          api_key: device.api_key
        },
        message: 'Dispositivo registrado com sucesso'
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
