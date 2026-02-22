import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-totem-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, device_id } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Optionally fetch AI config for system prompt
    let systemPrompt = 'Você é um assistente virtual amigável e prestativo. Responda de forma clara e objetiva em português.'

    if (device_id) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Try device-specific config first
        const { data: deviceConfig } = await supabase
          .from('ai_configs')
          .select('system_prompt, knowledge_base')
          .eq('device_id', device_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (deviceConfig) {
          systemPrompt = deviceConfig.system_prompt || systemPrompt
          if (deviceConfig.knowledge_base) {
            systemPrompt += `\n\nBase de conhecimento:\n${deviceConfig.knowledge_base}`
          }
        } else {
          // Fallback: get device's org and org-level config
          const { data: device } = await supabase
            .from('devices')
            .select('org_id, ai_prompt')
            .eq('id', device_id)
            .single()

          if (device?.ai_prompt) {
            systemPrompt = device.ai_prompt
          }

          if (device?.org_id) {
            const { data: orgConfig } = await supabase
              .from('ai_configs')
              .select('system_prompt, knowledge_base')
              .eq('org_id', device.org_id)
              .is('device_id', null)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (orgConfig) {
              systemPrompt = orgConfig.system_prompt || systemPrompt
              if (orgConfig.knowledge_base) {
                systemPrompt += `\n\nBase de conhecimento:\n${orgConfig.knowledge_base}`
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch AI config, using default prompt:', e)
      }
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const t = await response.text()
      console.error('AI gateway error:', response.status, t)
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    })
  } catch (e) {
    console.error('totem-chat error:', e)
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
