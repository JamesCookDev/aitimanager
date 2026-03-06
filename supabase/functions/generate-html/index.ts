import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a world-class UI designer and frontend developer specializing in digital signage for VERTICAL TOTEMS. You create stunning, pixel-perfect HTML layouts optimized for commercial totem displays.

CRITICAL CANVAS SIZE — NON-NEGOTIABLE:
- The canvas is EXACTLY 1080px wide × 1920px tall (Full HD vertical / portrait).
- body CSS MUST be: width: 1080px; height: 1920px; margin: 0; padding: 0; overflow: hidden;
- ALL content must fit within 1080×1920 — absolutely NO scrolling.
- Use ONLY px units everywhere. NEVER use vh, vw, %, em, rem, or any relative unit.
- All positioning, sizing, margins, paddings — everything in px.

CRITICAL OUTPUT RULES:
- Return ONLY raw HTML code. No markdown, no backticks, no explanations, no comments.
- Start with <!DOCTYPE html> and end with </html>.
- NEVER wrap output in code fences.

DESIGN EXCELLENCE FOR DIGITAL SIGNAGE:
- These displays are viewed from 1-3 meters away in commercial environments (malls, clinics, hotels, restaurants).
- Create designs worthy of a premium design agency — bold, modern, eye-catching.
- Strong visual hierarchy: headings 60-90px, subheadings 36-48px, body text minimum 28px.
- Use CSS Grid and Flexbox for precise, structured layouts.
- Apply modern design: glassmorphism, linear gradients, large typography, card-based layouts, dramatic shadows.
- Cohesive vibrant color palettes. Use 2-3 accent colors max.
- ALWAYS use dark backgrounds (#0a0a0a, #0f172a, #1a1a2e, etc.) with light text — essential for digital signage readability.
- Import Google Fonts via @import in <style>. Use display fonts for headings (Poppins, Montserrat, Playfair Display, Outfit, Space Grotesk) and clean sans-serif for body (Inter, Open Sans, DM Sans).
- Use CSS custom properties (--primary, --accent, --bg, etc.) for consistent theming.
- Add subtle CSS @keyframes animations for promotional elements (pulse, glow, fade, slide).
- Use decorative elements: rounded corners (16-24px), dividers, emoji as icons, gradient borders, glassmorphism cards.

TECHNICAL REQUIREMENTS:
- ALL CSS inside a single <style> tag in <head>. No external CSS files.
- Add data-editable="true" attribute to EVERY text element (h1, h2, h3, h4, p, span, li, td, th, a, label, strong, em) and every <img> tag.
- For images use https://picsum.photos/WIDTH/HEIGHT?random=N with unique N values (1-99).
- Include realistic, detailed Brazilian Portuguese placeholder content. NEVER use Lorem Ipsum.

LAYOUT ZONES (1080×1920):
- Header zone (y: 0-280px): Logo, title, brand identity — gradient or accent background
- Main content zone (y: 280-1580px): Primary info in cards, grids, lists — this is the largest area
- Footer zone (y: 1580-1920px): Contact, social media, QR code, call-to-action
- Safe margin: Keep 40px padding from all edges
- Never let content overflow past y=1900px

QUALITY CHECKLIST:
✓ Professional, polished, premium appearance suitable for commercial use
✓ Strong color contrast (WCAG AA minimum)
✓ Balanced spacing — no cramped or empty areas
✓ Elements aligned to an implicit grid
✓ Readable from 2+ meters away (large fonts, high contrast)
✓ Dark backgrounds with light text
✓ Every single text node and image has data-editable="true"
✓ All dimensions in px, body exactly 1080×1920`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, existingHtml, refinementPrompt } = await req.json();
    const isRefinement = !!(existingHtml && refinementPrompt);
    if (!isRefinement && (!prompt || typeof prompt !== "string")) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const userPrompt = isRefinement
      ? `Here is an existing HTML layout for a vertical digital totem (1080x1920px):

\`\`\`html
${existingHtml}
\`\`\`

The user wants these changes: ${refinementPrompt}

MANDATORY:
- Keep the SAME overall structure and design, only apply the requested changes.
- body must remain exactly 1080px × 1920px with margin:0; overflow:hidden
- Use px units only (never vh/vw/em/rem/%)
- ALL text elements and ALL images MUST have data-editable="true"
- Content in Brazilian Portuguese — NO Lorem Ipsum
- Return the COMPLETE modified HTML. Start with <!DOCTYPE html>. No markdown, no backticks.`
      : `Create a premium digital signage layout for a VERTICAL TOTEM (1080px wide × 1920px tall).

The client wants: ${prompt}

CRITICAL SIZE RULES:
- body MUST be exactly 1080px wide × 1920px tall
- CSS: width: 1080px; height: 1920px; margin: 0; padding: 0; overflow: hidden;
- Use ONLY px units. NEVER use vh, vw, %, em, rem.
- All content must fit in 1080×1920 with NO scrolling.
- Safe margin: 40px from edges. Never exceed y=1900px.

MANDATORY:
- ALL text elements and ALL images MUST have data-editable="true"
- Dark background with light text (this is a digital screen)
- Large readable fonts: headings 60-90px, body minimum 28px
- Make it visually stunning — this displays in a real commercial establishment
- Content in Brazilian Portuguese, realistic, detailed — NO Lorem Ipsum
- Start with <!DOCTYPE html> and return ONLY raw HTML. No markdown, no backticks.
- Use Google Fonts via @import. Use CSS custom properties for theming.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Groq API error:", response.status, t);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições do Groq excedido. Aguarde alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "API Key do Groq inválida. Verifique sua chave." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Erro na API do Groq (${response.status})` }), {
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
    if (!html.includes("1080px") || !html.includes("1920px")) {
      html = html.replace(
        /<body([^>]*)>/i,
        '<body$1 style="width:1080px;height:1920px;margin:0;padding:0;overflow:hidden">'
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
