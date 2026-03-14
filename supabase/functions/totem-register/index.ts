import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key, x-totem-device-id',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function defaultAvatarConfig() {
  return {
    colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' },
    material: { metalness: 0.1, roughness: 0.8 },
    animation: 'idle',
  }
}

// ── Modo 1: Enrollment Key (novo fluxo SaaS) ───────────────────
async function handleEnrollment(
  supabase: ReturnType<typeof createClient>,
  { enrollment_key, hardware_id, name, location, description }: Record<string, string>
) {
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, enrollment_enabled, enrollment_expires_at')
    .eq('enrollment_key', enrollment_key)
    .single()

  if (orgErr || !org) return jsonResponse({ error: 'Chave de ativação inválida' }, 404)
  if (!org.enrollment_enabled) return jsonResponse({ error: 'Ativação automática desabilitada para esta organização' }, 403)
  if (org.enrollment_expires_at && new Date(org.enrollment_expires_at) < new Date()) {
    return jsonResponse({ error: 'Chave de ativação expirada' }, 403)
  }

  const { data: existing } = await supabase
    .from('devices')
    .select('id, name, api_key')
    .eq('hardware_id', hardware_id)
    .eq('org_id', org.id)
    .single()

  if (existing) {
    return jsonResponse({
      success: true, registered: false,
      device: { id: existing.id, name: existing.name, api_key: existing.api_key, org_id: org.id },
      organization: org.name,
      message: 'Dispositivo já registrado',
    })
  }

  const deviceName = name || `Totem ${hardware_id.substring(0, 8)}`
  const { data: device, error: createError } = await supabase
    .from('devices')
    .insert({
      name: deviceName,
      description: description || 'Auto-registrado via chave de ativação',
      location: location || null,
      org_id: org.id,
      hardware_id,
      registration_method: 'enrollment',
      avatar_config: defaultAvatarConfig(),
    })
    .select()
    .single()

  if (createError) {
    console.error('Erro ao criar dispositivo:', createError)
    return jsonResponse({ error: 'Erro ao criar dispositivo' }, 500)
  }

  console.log(`[Enrollment] ✅ ${device.name} (${device.id}) → org ${org.id}`)
  return jsonResponse({
    success: true, registered: true,
    device: { id: device.id, name: device.name, api_key: device.api_key, org_id: org.id },
    organization: org.name,
    message: 'Dispositivo registrado com sucesso',
  }, 201)
}

// ── Modo 2: Legacy hardware_id + org_id ─────────────────────────
async function handleHardwareRegister(
  supabase: ReturnType<typeof createClient>,
  { hardware_id, org_id, name, location, description }: Record<string, string>
) {
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', org_id)
    .single()

  if (orgErr || !org) return jsonResponse({ error: 'Organização não encontrada' }, 404)

  const { data: existing } = await supabase
    .from('devices')
    .select('id, name, api_key')
    .eq('hardware_id', hardware_id)
    .eq('org_id', org_id)
    .single()

  if (existing) {
    return jsonResponse({
      success: true, registered: false,
      device: { id: existing.id, name: existing.name, api_key: existing.api_key },
      message: 'Dispositivo já registrado',
    })
  }

  const deviceName = name || `Totem ${hardware_id.substring(0, 8)}`
  const { data: device, error: createError } = await supabase
    .from('devices')
    .insert({
      name: deviceName,
      description: description || `Auto-registrado (${hardware_id})`,
      location: location || null,
      org_id,
      hardware_id,
      registration_method: 'hardware',
      avatar_config: defaultAvatarConfig(),
    })
    .select()
    .single()

  if (createError) {
    console.error('Erro ao criar dispositivo:', createError)
    return jsonResponse({ error: 'Erro ao criar dispositivo' }, 500)
  }

  console.log(`[Register] ✅ ${device.name} (${device.id})`)
  return jsonResponse({
    success: true, registered: true,
    device: { id: device.id, name: device.name, api_key: device.api_key },
    message: 'Dispositivo registrado com sucesso',
  }, 201)
}

// ── Modo 3: Registro manual via Hub (autenticado) ───────────────
async function handleManualRegister(
  supabaseAdmin: ReturnType<typeof createClient>,
  authHeader: string,
  { name, description, location, org_id }: Record<string, string | null>
) {
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) return jsonResponse({ error: 'Usuário não autenticado' }, 401)
  if (!name || !org_id) return jsonResponse({ error: 'Nome e org_id são obrigatórios' }, 400)

  const { data: profile } = await supabaseAdmin.from('profiles').select('org_id').eq('id', user.id).single()
  const { data: role } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).single()

  if (role?.role !== 'super_admin' && profile?.org_id !== org_id) {
    return jsonResponse({ error: 'Sem permissão para esta organização' }, 403)
  }

  const { data: device, error: createError } = await supabaseAdmin
    .from('devices')
    .insert({ name, description, location, org_id, registration_method: 'manual', avatar_config: defaultAvatarConfig() })
    .select()
    .single()

  if (createError) {
    console.error('Erro ao criar dispositivo:', createError)
    return jsonResponse({ error: 'Erro ao criar dispositivo' }, 500)
  }

  return jsonResponse({
    success: true, registered: true,
    device: { id: device.id, name: device.name, api_key: device.api_key },
    message: 'Dispositivo registrado com sucesso',
  }, 201)
}

// ── Entry point ─────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Método não permitido' }, 405)

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { hardware_id, org_id, name, description, location, enrollment_key } = body

    if (enrollment_key && hardware_id) {
      return await handleEnrollment(supabaseAdmin, { enrollment_key, hardware_id, name, location, description })
    }

    if (hardware_id && org_id) {
      return await handleHardwareRegister(supabaseAdmin, { hardware_id, org_id, name, location, description })
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'enrollment_key + hardware_id obrigatórios para auto-registro, ou Authorization header para registro manual' }, 400)
    }

    return await handleManualRegister(supabaseAdmin, authHeader, { name, description, location, org_id })
  } catch (error) {
    console.error('Erro ao registrar totem:', error)
    return jsonResponse({ error: 'Erro interno do servidor' }, 500)
  }
})
