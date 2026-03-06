import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a world-class UI designer and frontend developer. You create stunning, pixel-perfect HTML layouts for vertical digital signage totems (exactly 1080px wide × 1920px tall).

CRITICAL OUTPUT RULES:
- Return ONLY raw HTML. No markdown, no \`\`\`, no explanations, no comments outside the HTML.
- Start with <!DOCTYPE html> and end with </html>.

DESIGN EXCELLENCE:
- Create designs that look like they were made by a top design agency — bold, modern, eye-catching.
- Use strong visual hierarchy: large headings, clear sections, generous whitespace.
- Use CSS Grid and Flexbox for precise layouts.
- Apply modern design trends: glassmorphism, gradients, large typography, card-based layouts.
- Color palettes should be cohesive and vibrant. Use 2-3 accent colors max.
- Typography: Import Google Fonts. Use a display font for headings and a clean sans-serif for body.
- Use CSS custom properties (variables) for consistent theming.

TECHNICAL REQUIREMENTS:
- All CSS must be in a <style> tag inside <head>. No external CSS files.
- Set body to exactly: width: 1080px; height: 1920px; margin: 0; overflow: hidden;
- Use ONLY px units for sizing (not vh/vw) since this renders inside an iframe at fixed dimensions.
- All content must fit within 1080×1920 without scrolling.
- Add data-editable="true" to ALL text elements (h1, h2, h3, p, span with text) and img tags.
- For images, use https://picsum.photos/WIDTH/HEIGHT?random=N with different N values.
- Include realistic, detailed placeholder content matching the user's description.

LAYOUT STRUCTURE:
- Header area (top ~15%): Logo/title zone with brand identity
- Main content (middle ~65%): Primary information, menus, listings, etc.
- Footer area (bottom ~20%): Contact info, QR codes, calls-to-action
- Use subtle CSS animations (@keyframes) for attention-grabbing elements like prices or promotions.
- Add decorative elements: borders, dividers, icons (use emoji as icons), subtle patterns.

QUALITY CHECKLIST:
✓ Professional, polished appearance
✓ Strong color contrast for readability
✓ Balanced use of space — no cramped areas
✓ Visual elements aligned to an implicit grid
✓ Text is large enough to read from 2 meters away (min 24px for body, 48px+ for headings)
✓ Dark backgrounds with light text work best for digital signage`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Create a premium digital signage layout for a vertical totem (1080x1920px). 

The client wants: ${prompt}

Remember:
- body must be exactly 1080px × 1920px with overflow:hidden
- Use px units only (not vh/vw)
- All text and images need data-editable="true"
- Make it visually stunning — this will be displayed in a real commercial establishment
- Include realistic content, not Lorem Ipsum
- Start with <!DOCTYPE html> and return ONLY the HTML code`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 12000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Falha na geração de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    
    // Ensure it starts with DOCTYPE
    if (!html.toLowerCase().startsWith("<!doctype")) {
      const idx = html.toLowerCase().indexOf("<!doctype");
      if (idx > 0) html = html.substring(idx);
    }

    // Ensure body has fixed dimensions
    if (!html.includes("1080px")) {
      html = html.replace(
        /<body/i,
        '<body style="width:1080px;height:1920px;margin:0;overflow:hidden"'
      );
    }

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-html error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
