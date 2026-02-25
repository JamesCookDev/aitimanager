import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { device_id, org_id, form_title, fields, webhook_url, webhook_method, webhook_headers } = body;

    if (!fields || typeof fields !== "object") {
      return new Response(JSON.stringify({ error: "fields is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save to database
    const { error: dbError } = await supabase.from("form_submissions").insert({
      device_id: device_id || null,
      org_id: org_id || null,
      form_title: form_title || "Formulário",
      fields,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    // Forward to webhook if configured
    let webhookResult = null;
    if (webhook_url) {
      try {
        const method = webhook_method || "POST";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (webhook_headers) {
          try {
            const parsed = typeof webhook_headers === "string" ? JSON.parse(webhook_headers) : webhook_headers;
            Object.assign(headers, parsed);
          } catch { /* ignore bad headers */ }
        }
        const resp = await fetch(webhook_url, {
          method,
          headers,
          body: JSON.stringify({ form_title, fields, device_id, submitted_at: new Date().toISOString() }),
        });
        webhookResult = { status: resp.status, ok: resp.ok };
      } catch (e) {
        webhookResult = { error: String(e) };
      }
    }

    return new Response(
      JSON.stringify({ success: true, webhook: webhookResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
