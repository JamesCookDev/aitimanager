import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-totem-api-key, x-totem-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supaUrl, serviceKey);

    // Identify device by API key header or device-id header
    const apiKey = req.headers.get("x-totem-api-key");
    const deviceId = req.headers.get("x-totem-device-id");

    let query = supabase
      .from("devices")
      .select("id, published_html, updated_at");

    if (apiKey) {
      query = query.eq("api_key", apiKey);
    } else if (deviceId) {
      query = query.eq("id", deviceId);
    } else {
      return new Response(JSON.stringify({ error: "Missing x-totem-api-key or x-totem-device-id header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "Device not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check If-None-Match for caching
    const etag = `"${new Date(data.updated_at).getTime()}"`;
    const clientEtag = req.headers.get("if-none-match");
    if (clientEtag === etag) {
      return new Response(null, { status: 304, headers: corsHeaders });
    }

    if (!data.published_html) {
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="width:1080px;height:1920px;margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#94a3b8"><h1>Aguardando publicação...</h1></body></html>`,
        {
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", ETag: etag },
        }
      );
    }

    return new Response(data.published_html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        ETag: etag,
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("totem-html error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
