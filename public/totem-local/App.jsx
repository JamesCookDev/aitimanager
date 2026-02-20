/**
 * ══════════════════════════════════════════════════════════════
 *  TOTEM LOCAL — App.jsx  (v3 — Refatoração completa)
 * ══════════════════════════════════════════════════════════════
 *  Todos os 17+ blocos com renderizadores 1:1 com o editor.
 *  Worker de polling para atualização contínua sem quebrar o front.
 *
 *  Blocos suportados:
 *  ─ Conteúdo:  TextBlock, GradientTextBlock, ImageBlock, BadgeBlock, IconBlock
 *  ─ Interação: ButtonBlock, MenuBlock, ChatInterfaceBlock
 *  ─ Mídia:     VideoEmbedBlock, QRCodeBlock, SocialLinksBlock
 *  ─ Dados:     ProgressBlock, CountdownBlock
 *  ─ Layout:    ContainerBlock, CardBlock, SpacerBlock, DividerBlock, CanvasDropArea
 *  ─ 3D:        AvatarBlock (renderizado pela camada Three.js, ignorado aqui)
 * ══════════════════════════════════════════════════════════════
 */
import './index.css';
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSpeech } from "./hooks/useSpeech";
import { createClient } from "@supabase/supabase-js";
import { Loader, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { useCMSConfig } from "./hooks/useCMSConfig";
import { ChatInterface } from "./components/ChatInterface";
// ChatInterface is used as InlineChatInterface replacement below

// ─── Supabase client (live preview) ───────────
const _supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

// ─────────────────────────────────────────────
// 🔧 UTILITÁRIOS
// ─────────────────────────────────────────────
const px = (v) => (typeof v === "number" ? `${v}px` : v);

const SHADOW_MAP = {
  none: "none",
  sm: "0 2px 8px rgba(0,0,0,0.15)",
  md: "0 4px 20px rgba(0,0,0,0.25)",
  lg: "0 8px 40px rgba(0,0,0,0.35)",
};

// ─────────────────────────────────────────────
// 🔄 WORKER: Polling inteligente (15s)
// ─────────────────────────────────────────────
const POLL_INTERVAL = 15_000;

// ─────────────────────────────────────────────
// 📡 LIVE PREVIEW via Supabase Realtime
// ─────────────────────────────────────────────
function useLivePreview(deviceId, onLiveUpdate) {
  const [isLive, setIsLive] = useState(false);
  // Stable ref so channel doesn't recreate on every render
  const onLiveUpdateRef = useRef(onLiveUpdate);
  useEffect(() => { onLiveUpdateRef.current = onLiveUpdate; }, [onLiveUpdate]);

  useEffect(() => {
    if (!deviceId) return;

    const channel = _supabase.channel(`live-preview:${deviceId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "ui-update" }, ({ payload }) => {
        if (payload?.craft_blocks) {
          // Apply immediately — no polling wait
          onLiveUpdateRef.current({ craft_blocks: payload.craft_blocks, _liveTs: payload.ts });
        }
      })
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") {
          console.info("[LivePreview] Canal ativo — aguardando broadcast do Hub");
        }
      });

    return () => {
      _supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [deviceId]); // only re-run if deviceId changes

  return isLive;
}

function useConfigPoller(onUpdate) {
  const lastHashRef = useRef("");

  const fetchLatest = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_CMS_API_URL;
      const apiKey = import.meta.env.VITE_TOTEM_API_KEY || import.meta.env.TOTEM_API_KEY;
      if (!apiUrl || !apiKey) return;

      const res = await fetch(`${apiUrl}/totem-config`, {
        headers: {
          "x-totem-api-key": apiKey,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
      });
      if (!res.ok) return;

      const json = await res.json();
      const newUi = json?.config?.ui;
      if (!newUi) return;

      const hash = JSON.stringify(newUi);
      if (hash !== lastHashRef.current) {
        lastHashRef.current = hash;
        onUpdate(newUi);
      }
    } catch (err) {
      console.warn("[Poller] Falha ao buscar config:", err.message);
    }
  }, [onUpdate]);

  useEffect(() => {
    fetchLatest();
    const id = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchLatest]);
}

// ─────────────────────────────────────────────
// 📦 VERSÕES DOS ARQUIVOS LOCAIS — sincronizado com public/totem-local/manifest.json
// Atualize estas versões sempre que modificar os arquivos correspondentes.
// ─────────────────────────────────────────────
const LOCAL_FILE_VERSIONS = {
  "App.jsx": "3.0.0",
  "main.jsx": "1.0.0",
  "index.css": "1.1.0",
  "hooks/useSpeech.js": "2.1.0",
  "hooks/useCMSConfig.js": "1.2.0",
  "components/Avatar.jsx": "1.5.0",
  "components/ChatInterface.jsx": "1.3.0",
  "components/Scenario.jsx": "1.2.0",
};

// ─────────────────────────────────────────────
// 🔄 HEARTBEAT WORKER — bate pulso a cada 30s e trata comandos remotos
// ─────────────────────────────────────────────
function useHeartbeat() {
  const sendHeartbeat = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_CMS_API_URL;
      const apiKey = import.meta.env.VITE_TOTEM_API_KEY || import.meta.env.TOTEM_API_KEY;
      if (!apiUrl || !apiKey) return;

      const res = await fetch(`${apiUrl}/totem-heartbeat`, {
        method: "POST",
        headers: {
          "x-totem-api-key": apiKey,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_speaking: false,
          status_details: {
            uptime: Math.floor(performance.now() / 1000),
            code_manifest: LOCAL_FILE_VERSIONS,
          },
        }),
      });

      if (!res.ok) {
        console.warn(`[Heartbeat] ❌ Erro HTTP: ${res.status}`);
        return;
      }

      const data = await res.json();
      console.info("[Heartbeat] ✅ OK —", data.name);

      // Processar comando remoto
      if (data.command === "restart") {
        console.warn("[Heartbeat] 🔄 Comando RESTART recebido — recarregando...");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error("[Heartbeat] ❌ Erro:", err.message);
    }
  }, []);

  useEffect(() => {
    sendHeartbeat();
    const id = setInterval(sendHeartbeat, 30_000);
    return () => clearInterval(id);
  }, [sendHeartbeat]);
}



// ─────────────────────────────────────────────
// ⏱️ COUNTDOWN EM TEMPO REAL
// ─────────────────────────────────────────────
const LiveCountdown = React.memo(({ mode, targetDate, countdownMinutes, showLabels, showSeconds, fontSize, labelFontSize, color, bgColor, bgEnabled, borderRadius, separator, fontWeight, gap }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const getSegments = () => {
    if (mode === "clock") {
      return {
        values: [now.getHours(), now.getMinutes(), ...(showSeconds !== false ? [now.getSeconds()] : [])],
        labels: ["Horas", "Min", ...(showSeconds !== false ? ["Seg"] : [])],
      };
    }

    let diffMs = 0;
    if (mode === "date" && targetDate) {
      diffMs = Math.max(0, new Date(targetDate).getTime() - now.getTime());
    } else if (mode === "countdown" || countdownMinutes) {
      diffMs = (countdownMinutes || 60) * 60 * 1000;
    } else {
      diffMs = 86400000;
    }

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const vals = [];
    const lbls = [];
    if (days > 0) { vals.push(days); lbls.push("Dias"); }
    vals.push(h, m);
    lbls.push("Horas", "Min");
    if (showSeconds !== false) { vals.push(s); lbls.push("Seg"); }

    return { values: vals, labels: lbls };
  };

  const { values, labels } = getSegments();
  const sep = separator || ":";
  const fs = fontSize || 28;

  const digitBoxStyle = bgEnabled !== false ? {
    backgroundColor: bgColor || "rgba(255,255,255,0.06)",
    borderRadius: px((borderRadius || 16) / 2),
    padding: "8px 12px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.08)",
  } : {};

  return (
    <div style={{ display: "flex", gap: px(gap || 8), justifyContent: "center", alignItems: "center", width: "100%", padding: "8px" }}>
      {values.map((val, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...digitBoxStyle }}>
            <span style={{ fontSize: px(fs), fontWeight: fontWeight || "bold", color: color || "#fff", fontFamily: "monospace", lineHeight: 1.1 }}>
              {String(val).padStart(2, "0")}
            </span>
            {showLabels !== false && (
              <span style={{ fontSize: px(labelFontSize || 9), color: color || "#fff", opacity: 0.5, textTransform: "uppercase", marginTop: "2px" }}>
                {labels[i]}
              </span>
            )}
          </div>
          {i < values.length - 1 && (
            <span style={{ fontSize: px(fs * 0.8), color: color || "#fff", opacity: 0.4, fontWeight: fontWeight || "bold", fontFamily: "monospace" }}>
              {sep}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

// ─────────────────────────────────────────────
// 📐 LAYOUT PROPS — espelha getLayoutStyle() do Hub
// ─────────────────────────────────────────────
function getLayoutStyle(p) {
  const isAbs = p.positionType === "absolute";
  if (isAbs) {
    const hasRight = p.positionRight != null;
    const hasBottom = p.positionBottom != null;
    return {
      position: "absolute",
      top: hasBottom ? undefined : (p.positionTop ?? 0),
      bottom: hasBottom ? p.positionBottom : undefined,
      left: hasRight ? undefined : (p.positionLeft ?? 0),
      right: hasRight ? p.positionRight : undefined,
      width: p.layoutWidth && p.layoutWidth !== "auto" ? p.layoutWidth : undefined,
      height: p.layoutHeight && p.layoutHeight !== "auto" ? p.layoutHeight : undefined,
      zIndex: p.zIndex || undefined,
      overflow: p.overflow === "visible" ? undefined : p.overflow,
    };
  }
  return {
    position: "relative",
    width: p.layoutWidth && p.layoutWidth !== "auto" ? p.layoutWidth : undefined,
    height: p.layoutHeight && p.layoutHeight !== "auto" ? p.layoutHeight : undefined,
    marginTop: p.marginTop || undefined,
    marginBottom: p.marginBottom || undefined,
    marginLeft: p.marginLeft || undefined,
    marginRight: p.marginRight || undefined,
    alignSelf: p.alignSelf && p.alignSelf !== "auto" ? p.alignSelf : undefined,
    overflow: p.overflow === "visible" ? undefined : p.overflow,
    zIndex: p.zIndex || undefined,
  };
}

// ─────────────────────────────────────────────
// 🧱 RENDERIZADORES INDIVIDUAIS POR BLOCO
// ─────────────────────────────────────────────

/**
 * InlineChatInterface — usa o componente ChatInterface importado
 * e adapta as props vindas do Craft.js para posicionamento absoluto na tela.
 */
function InlineChatInterface({ p }) {
  const position = p.position || 'center';
  const posStyles = {
    bottom_right: { bottom: 32, right: 32 },
    bottom_left:  { bottom: 32, left: 32 },
    top_right:    { top: 32, right: 32 },
    top_left:     { top: 32, left: 32 },
    center:       { bottom: 32, left: '50%', transform: 'translateX(-50%)' },
  };
  const posStyle = posStyles[position] || posStyles.center;

  return (
    <div style={{
      position: 'absolute', zIndex: p.zIndex || 1000, ...posStyle,
      pointerEvents: 'auto', width: 'min(520px, calc(100vw - 64px))',
    }}>
      <ChatInterface
        items={Array.isArray(p.items) ? p.items : []}
        blur={p.blur ?? 20}
        opacity={p.opacity ?? 1}
        headerShow={p.headerShow !== false}
        headerTitle={p.headerTitle || 'Assistente Virtual'}
        headerSubtitle={p.headerSubtitle || 'Online agora'}
        headerIcon={p.headerIcon || '📍'}
        headerIndicatorColor={p.headerIndicatorColor || '#10b981'}
        ctaText={p.ctaText || 'Olá, como posso ajudar?'}
        ctaIcon={p.ctaIcon || '💬'}
        ctaButtonText={p.ctaButtonText || 'Iniciar Conversa'}
        folderArrowSymbol={p.folderArrowSymbol || '▾'}
        itemArrowSymbol={p.itemArrowSymbol || '→'}
        closeOnSelect={p.closeOnSelect !== false}
      />
    </div>
  );
}

/** Renderiza um único nó de acordo com seu tipo */
function renderBlock(blockName, props, childElements) {
  const p = props || {};

  // ── AvatarBlock / ChatBlock / SceneBlock → renderizado em camada separada ──
  if (blockName === "AvatarBlock" || blockName === "ChatBlock" || blockName === "SceneBlock") return null;

  // ── ChatInterfaceBlock → renderizado inline com posicionamento absoluto ──
  if (blockName === "ChatInterfaceBlock") {
    if (p.enabled === false) return null;
    return <InlineChatInterface key="chat-interface" p={p} />;
  }


  // ── SpacerBlock ──
  if (blockName === "SpacerBlock") {
    return <div style={{ height: px(p.height || 32), width: "100%" }} />;
  }

  // ── DividerBlock ──
  if (blockName === "DividerBlock") {
    return (
      <hr style={{
        width: "100%",
        border: "none",
        borderTop: `${px(p.thickness || 1)} ${p.lineStyle || "solid"} ${p.color || "rgba(255,255,255,0.15)"}`,
        margin: `${px(p.margin || 12)} 0`,
      }} />
    );
  }

  // ── BadgeBlock ──
  if (blockName === "BadgeBlock") {
    const variant = p.variant || "glass";
    let variantStyle = {};
    if (variant === "filled") {
      variantStyle = { backgroundColor: p.bgColor || "#6366f1", color: p.textColor || "#fff", border: "none" };
    } else if (variant === "outline") {
      variantStyle = { backgroundColor: "transparent", color: p.bgColor || "#6366f1", border: `1.5px solid ${p.bgColor || "#6366f1"}` };
    } else {
      variantStyle = { backgroundColor: (p.bgColor || "#6366f1") + "22", color: p.textColor || "#fff", border: `1px solid ${(p.bgColor || "#6366f1")}44`, backdropFilter: "blur(8px)" };
    }
    const fs = p.fontSize || 12;
    return (
      <div style={{ display: "flex", justifyContent: p.align === "left" ? "flex-start" : p.align === "right" ? "flex-end" : "center", padding: "4px", width: "100%" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600,
          fontSize: px(fs), borderRadius: px(p.borderRadius || 999),
          padding: `${Math.max(4, fs * 0.4)}px ${fs * 1.2}px`,
          letterSpacing: "0.02em",
          animation: p.pulse ? "pulse 2s infinite" : undefined,
          ...variantStyle,
        }}>
          {p.emoji && <span>{p.emoji}</span>}
          {p.text || "Destaque"}
        </span>
      </div>
    );
  }

  // ── IconBlock ──
  if (blockName === "IconBlock") {
    const bgOn = p.bgEnabled !== false;
    return (
      <div style={{ display: "flex", justifyContent: p.align === "left" ? "flex-start" : p.align === "right" ? "flex-end" : "center", padding: "4px", width: "100%" }}>
        <div style={{
          width: bgOn ? px(p.bgSize || 56) : "auto",
          height: bgOn ? px(p.bgSize || 56) : "auto",
          backgroundColor: bgOn ? (p.bgColor || "rgba(99,102,241,0.2)") : "transparent",
          borderRadius: px(p.bgBorderRadius || 14),
          border: bgOn ? `${p.borderWidth || 1}px solid ${p.borderColor || "rgba(99,102,241,0.3)"}` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: px(p.size || 32), lineHeight: 1,
          boxShadow: p.shadow && bgOn ? `0 4px 16px ${p.bgColor || "rgba(99,102,241,0.2)"}` : undefined,
        }}>
          {p.emoji || "⭐"}
        </div>
      </div>
    );
  }

  // ── TextBlock ──
  if (blockName === "TextBlock") {
    return (
      <p style={{
        fontSize: px(p.fontSize || 16), fontWeight: p.fontWeight || "normal",
        color: p.color || p.textColor || "#fff", textAlign: p.textAlign || "left",
        padding: px(p.padding || 8), letterSpacing: p.letterSpacing || 0,
        lineHeight: p.lineHeight || 1.5, textTransform: p.textTransform || "none",
        opacity: typeof p.opacity === "number" ? p.opacity : 1,
        textShadow: p.textShadow === true ? "0 2px 8px rgba(0,0,0,0.5)" : undefined,
        margin: 0,
      }}>
        {p.text || ""}
      </p>
    );
  }

  // ── GradientTextBlock ──
  if (blockName === "GradientTextBlock") {
    const grad = p.useVia
      ? `linear-gradient(${p.gradientAngle || 90}deg, ${p.gradientFrom || "#6366f1"}, ${p.gradientVia || "#8b5cf6"}, ${p.gradientTo || "#ec4899"})`
      : `linear-gradient(${p.gradientAngle || 90}deg, ${p.gradientFrom || "#6366f1"}, ${p.gradientTo || "#ec4899"})`;
    return (
      <p style={{
        fontSize: px(p.fontSize || 32), fontWeight: p.fontWeight || "bold",
        textAlign: p.textAlign || "center", letterSpacing: p.letterSpacing || 0,
        lineHeight: p.lineHeight || 1.2, textTransform: p.textTransform || "none",
        padding: px(p.padding || 8),
        background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        margin: 0,
      }}>
        {p.text || "Texto Gradiente"}
      </p>
    );
  }

  // ── ImageBlock ──
  if (blockName === "ImageBlock") {
    if (!p.src) {
      return (
        <div style={{
          width: p.width || "100%", minHeight: "80px", borderRadius: px(p.borderRadius || 8),
          backgroundColor: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.4)", fontSize: "14px", padding: px(p.padding || 4),
        }}>
          📷 Sem imagem
        </div>
      );
    }
    return (
      <div style={{ padding: px(p.padding || 4) }}>
        <img
          src={p.src}
          alt={p.alt || "Imagem"}
          style={{
            width: p.width || "100%", height: p.height || "auto",
            objectFit: p.objectFit || "cover", borderRadius: px(p.borderRadius || 8),
            display: "block", opacity: typeof p.opacity === "number" ? p.opacity : 1,
            boxShadow: SHADOW_MAP[p.shadow] || "none",
            border: p.borderEnabled ? `${p.borderWidth || 2}px solid ${p.borderColor || "#fff"}` : undefined,
          }}
        />
      </div>
    );
  }

  // ── ButtonBlock ──
  if (blockName === "ButtonBlock") {
    return (
      <div style={{ padding: "4px" }}>
        <button
          type="button"
          style={{
            backgroundColor: p.bgColor || "hsl(221,83%,53%)",
            color: p.textColor || "#fff",
            fontSize: px(p.fontSize || 16),
            borderRadius: px(p.borderRadius || 8),
            paddingLeft: px(p.paddingX || 24), paddingRight: px(p.paddingX || 24),
            paddingTop: px(p.paddingY || 14), paddingBottom: px(p.paddingY || 14),
            width: p.fullWidth ? "100%" : "auto",
            border: (p.borderWidth || 0) > 0 ? `${p.borderWidth}px solid ${p.borderColor || "transparent"}` : "none",
            cursor: "pointer", fontWeight: p.fontWeight || "600",
            minHeight: "44px", opacity: typeof p.opacity === "number" ? p.opacity : 1,
            boxShadow: SHADOW_MAP[p.shadow] || "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            flexDirection: p.iconPosition === "right" ? "row-reverse" : "row",
            transition: "transform 0.15s",
          }}
        >
          {p.icon && <span style={{ fontSize: px((p.fontSize || 16) * 0.9) }}>{p.icon}</span>}
          {p.label || p.text || "Clique aqui"}
        </button>
      </div>
    );
  }

  // ── MenuBlock ──
  if (blockName === "MenuBlock") {
    const items = Array.isArray(p.items) ? p.items : [];

    // Função recursiva para renderizar item com suporte a pastas
    function MenuItemRow({ item, depth = 0 }) {
      const [open, setOpen] = React.useState(false);
      const isFolder = item.type === "folder" || (item.children && item.children.length > 0);

      const handleClick = () => {
        if (isFolder) {
          setOpen(v => !v);
        } else {
          const msg = item.prompt || item.label || "";
          if (msg && typeof window.__totemSendMessage === "function") {
            window.__totemSendMessage(msg);
          }
        }
      };

      const gradMap = {
        "from-blue-400 to-indigo-400": "linear-gradient(135deg,#60a5fa,#818cf8)",
        "from-teal-400 to-cyan-400": "linear-gradient(135deg,#2dd4bf,#22d3ee)",
        "from-purple-400 to-pink-400": "linear-gradient(135deg,#c084fc,#f472b6)",
        "from-orange-400 to-yellow-400": "linear-gradient(135deg,#fb923c,#facc15)",
        "from-green-400 to-emerald-400": "linear-gradient(135deg,#4ade80,#34d399)",
        "from-rose-400 to-red-400": "linear-gradient(135deg,#fb7185,#f87171)",
      };

      return (
        <div style={{ marginLeft: depth * 12 }}>
          <button
            type="button"
            onClick={handleClick}
            className="kiosk-menu-item"
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              background: isFolder ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.18)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: 16, marginBottom: 6, cursor: "pointer",
              border: `1px solid ${isFolder && open ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.12)"}`,
              fontSize: 13, color: p.titleColor || "#fff", width: "100%", textAlign: "left",
              fontWeight: 600, letterSpacing: "-0.01em", boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              transition: "all 0.15s ease", userSelect: "none", outline: "none",
              minHeight: 44,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.description && <span style={{ fontSize: 11, opacity: 0.6 }}>{item.description}</span>}
            <span style={{ opacity: 0.6, fontSize: 11, flexShrink: 0 }}>
              {isFolder ? (open ? "▲" : (p.folderArrowSymbol || "▼")) : (p.itemArrowSymbol || "→")}
            </span>
          </button>
          {isFolder && open && (
            <div style={{ marginBottom: 4 }}>
              {(item.children || []).map((child, ci) => (
                <MenuItemRow key={child.id || ci} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: p.bgColor || "rgba(30,41,59,0.75)",
        borderRadius: px(p.borderRadius || 28),
        padding: px(p.padding || 20),
        backdropFilter: (p.bgBlur || 0) > 0 ? `blur(${p.bgBlur}px) saturate(1.6)` : undefined,
        WebkitBackdropFilter: (p.bgBlur || 0) > 0 ? `blur(${p.bgBlur}px) saturate(1.6)` : undefined,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}>
        {p.title && (
          <div style={{ fontWeight: 700, marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center", color: p.titleColor || "#fff", fontSize: px(15), letterSpacing: "-0.02em" }}>
            {p.titleIcon && <span style={{ fontSize: 18 }}>{p.titleIcon}</span>}
            <span>{p.title}</span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: px(p.gap || 8) }}>
          {items.map((item, idx) => (
            <MenuItemRow key={item.id || idx} item={item} />
          ))}
        </div>
      </div>
    );
  }

  // ── ProgressBlock ──
  if (blockName === "ProgressBlock") {
    const val = typeof p.value === "number" ? p.value : 65;
    const max = typeof p.maxValue === "number" ? p.maxValue : 100;
    const pct = Math.min(100, Math.max(0, (val / max) * 100));
    const barBg = p.barColor || p.progressColor || "#6366f1";
    const isStriped = p.striped || p.animated;
    return (
      <div style={{ padding: "8px", width: "100%" }}>
        {p.showLabel !== false && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: p.labelColor || "#fff", fontSize: px(p.labelFontSize || 12), fontWeight: 600 }}>
            <span>{p.label || "Progresso"}</span>
            <span style={{ opacity: 0.7 }}>
              {p.showPercentage !== false ? `${Math.round(pct)}%` : `${val}/${max}`}
            </span>
          </div>
        )}
        <div style={{ width: "100%", backgroundColor: p.trackColor || "rgba(255,255,255,0.08)", borderRadius: px(p.borderRadius || 99), height: px(p.height || 12), overflow: "hidden", position: "relative" }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: px(p.borderRadius || 99),
            background: `linear-gradient(90deg, ${barBg}, ${barBg}cc)`,
            transition: p.animated ? "width 1s ease" : "none",
            backgroundSize: isStriped ? "20px 20px" : undefined,
            backgroundImage: isStriped ? "linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)" : undefined,
            animation: isStriped ? "stripe-move 1s linear infinite" : undefined,
          }} />
        </div>
      </div>
    );
  }

  // ── CountdownBlock ──
  if (blockName === "CountdownBlock") {
    return (
      <LiveCountdown
        mode={p.mode || "clock"}
        targetDate={p.targetDate}
        countdownMinutes={p.countdownMinutes}
        showLabels={p.showLabels}
        showSeconds={p.showSeconds}
        fontSize={p.fontSize}
        labelFontSize={p.labelFontSize}
        color={p.color || p.textColor}
        bgColor={p.bgColor}
        bgEnabled={p.bgEnabled}
        borderRadius={p.borderRadius}
        separator={p.separator}
        fontWeight={p.fontWeight}
        gap={p.gap}
      />
    );
  }

  // ── QRCodeBlock ──
  if (blockName === "QRCodeBlock") {
    const qrSize = p.size || 160;
    const qrContent = p.content || p.value || p.url || "https://example.com";
    const cleanFg = (p.fgColor || "#ffffff").replace("#", "");
    const cleanBg = !p.bgColor || p.bgColor === "transparent" ? "000000" : p.bgColor.replace("#", "");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}&color=${cleanFg}&bgcolor=${cleanBg}`;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: px(p.padding || 12), width: "fit-content" }}>
        <img
          src={qrUrl} alt="QR Code"
          style={{ width: px(qrSize), height: px(qrSize), objectFit: "contain", borderRadius: px(p.borderRadius || 8), imageRendering: "pixelated" }}
        />
        {p.label && (
          <span style={{ fontSize: px(p.labelSize || 12), color: p.labelColor || "#fff", textAlign: "center", fontWeight: 500 }}>
            {p.label}
          </span>
        )}
      </div>
    );
  }

  // ── SocialLinksBlock ──
  if (blockName === "SocialLinksBlock") {
    const links = Array.isArray(p.links) ? p.links : [];
    const dir = p.layout === "vertical" ? "column" : "row";
    const bgOn = p.bgEnabled === true;
    return (
      <div style={{
        display: "flex", flexDirection: dir, gap: px(p.gap || 12),
        alignItems: "center", justifyContent: "center", flexWrap: "wrap",
        width: "100%", padding: px(p.padding || 12),
        backgroundColor: bgOn ? (p.bgColor || "rgba(255,255,255,0.06)") : "transparent",
        borderRadius: bgOn ? px(p.borderRadius || 16) : undefined,
        backdropFilter: bgOn ? "blur(8px)" : undefined,
        border: bgOn ? "1px solid rgba(255,255,255,0.08)" : undefined,
      }}>
        {links.map((link, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const url = link.url || link.href || "";
              if (url && url !== "#") {
                if (typeof window.__totemOpenUrl === "function") {
                  window.__totemOpenUrl(url);
                } else {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }
            }}
            style={{
              display: "flex", flexDirection: dir === "column" ? "row" : "column",
              alignItems: "center", gap: "6px", cursor: "pointer",
              transition: "transform 0.2s", background: "none", border: "none",
              outline: "none", padding: 0,
            }}
          >
            <div style={{
              width: px(p.iconSize || 40), height: px(p.iconSize || 40),
              backgroundColor: (link.color || "#6366f1") + "20",
              border: `1px solid ${(link.color || "#6366f1")}40`,
              borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: px((p.iconSize || 40) * 0.5),
            }}>
              {link.icon || "🔗"}
            </div>
            {(p.showLabels ?? true) && (
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                {link.label}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // ── VideoEmbedBlock ──
  if (blockName === "VideoEmbedBlock") {
    const vidSrc = p.url || p.videoUrl || p.src || "";
    if (!vidSrc) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: px(p.borderRadius || 12), border: "2px dashed rgba(255,255,255,0.1)", minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          🎬 Sem vídeo
        </div>
      );
    }
    const isYt = vidSrc.includes("youtube.com") || vidSrc.includes("youtu.be");
    const isMp4 = vidSrc.endsWith(".mp4") || vidSrc.endsWith(".webm");
    let finalSrc = vidSrc;
    if (isYt && !vidSrc.includes("embed")) {
      const videoId = vidSrc.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1];
      if (videoId) finalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=${p.autoplay ? 1 : 0}&mute=${p.muted ? 1 : 0}&loop=${p.loop ? 1 : 0}`;
    }
    const vimeoMatch = vidSrc.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      finalSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${p.autoplay ? 1 : 0}&muted=${p.muted ? 1 : 0}&loop=${p.loop ? 1 : 0}`;
    }
    const ratioMap = { "16:9": "56.25%", "9:16": "177.78%", "4:3": "75%", "1:1": "100%" };
    const ratio = ratioMap[p.aspectRatio] || "56.25%";
    return (
      <div style={{ borderRadius: px(p.borderRadius || 12), overflow: "hidden", opacity: typeof p.opacity === "number" ? p.opacity : 1 }}>
        {isMp4 ? (
          <video src={finalSrc} autoPlay={!!p.autoplay} loop={!!p.loop} muted={!!p.muted || !!p.autoplay} controls style={{ width: "100%", borderRadius: px(p.borderRadius || 12), display: "block" }} />
        ) : (
          <div style={{ position: "relative", paddingBottom: ratio, height: 0 }}>
            <iframe src={finalSrc} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; encrypted-media" allowFullScreen />
          </div>
        )}
      </div>
    );
  }

  // ── CardBlock ──
  if (blockName === "CardBlock") {
    return (
      <div style={{
        backgroundColor: p.bgColor || "rgba(255,255,255,0.06)",
        backdropFilter: (p.bgBlur || 0) > 0 ? `blur(${p.bgBlur}px)` : undefined,
        borderRadius: px(p.borderRadius || 16),
        border: `1px solid ${p.borderColor || "rgba(255,255,255,0.1)"}`,
        padding: px(p.padding || 20),
        boxShadow: SHADOW_MAP[p.elevation] || SHADOW_MAP.md,
      }}>
        {p.showHeader !== false && (p.title || p.subtitle) && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#fff", fontSize: "14px" }}>
              {p.headerIcon && <span style={{ fontSize: "18px" }}>{p.headerIcon}</span>}
              <span>{p.title}</span>
            </div>
            {p.subtitle && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{p.subtitle}</span>}
          </div>
        )}
        {childElements}
      </div>
    );
  }

  // ── ContainerBlock ──
  if (blockName === "ContainerBlock") {
    return (
      <div style={{
        backgroundColor: p.bgColor || "rgba(255,255,255,0.05)",
        padding: px(p.padding || 16), gap: px(p.gap || 8),
        display: "flex", flexDirection: p.direction || "column",
        alignItems: p.alignItems || "stretch",
        justifyContent: p.justifyContent || "flex-start",
        borderRadius: px(p.borderRadius || 12),
        minHeight: px(p.minHeight || 0),
        opacity: typeof p.opacity === "number" ? p.opacity : 1,
        border: (p.borderWidth || 0) > 0 ? `${p.borderWidth}px solid ${p.borderColor || "rgba(255,255,255,0.1)"}` : undefined,
        boxShadow: SHADOW_MAP[p.shadow] || "none",
        backdropFilter: (p.blur || 0) > 0 ? `blur(${p.blur}px)` : undefined,
      }}>
        {childElements}
      </div>
    );
  }

  // ── CanvasDropArea (ROOT container) ──
  if (blockName === "CanvasDropArea") {
    return (
      <div style={{
        position: "relative",
        // Default to transparent so the 3D avatar layer stays visible
        backgroundColor: p.bgColor && p.bgColor !== "transparent" && p.bgColor !== "#0f172a"
          ? p.bgColor
          : "transparent",
        padding: "16px", minHeight: "100%", display: "flex", flexDirection: "column", gap: "8px", width: "100%",
      }}>
        {childElements}
      </div>
    );
  }

  // ── Fallback genérico ──
  return <div style={{ padding: "4px" }}>{p.text || childElements}</div>;
}

// ─────────────────────────────────────────────
// 🧱 CRAFT ENGINE — Renderizador recursivo
// ─────────────────────────────────────────────
const CraftEngine = React.memo(({ nodes, nodeId = "ROOT" }) => {
  if (!nodes || !nodes[nodeId]) return null;

  const node = nodes[nodeId];
  const { type, props = {}, nodes: childIds = [], linkedNodes = {} } = node;

  // Resolve nome do bloco
  let blockName = type;
  if (typeof type === "object" && type.resolvedName) blockName = type.resolvedName;

  // Renderiza filhos recursivamente
  const allChildIds = [...childIds, ...Object.values(linkedNodes)];
  const childElements = allChildIds.map((id) => <CraftEngine key={id} nodes={nodes} nodeId={id} />);

  // Aplica layout props no wrapper (exceto ROOT e blocos que gerenciam posição própria)
  if (nodeId !== "ROOT" && blockName !== "CanvasDropArea" && blockName !== "ChatInterfaceBlock") {
    const layoutStyle = getLayoutStyle(props);
    const hasLayout = props.positionType === "absolute" || props.layoutWidth || props.layoutHeight || props.marginTop || props.marginBottom || props.marginLeft || props.marginRight || props.zIndex;
    if (hasLayout) {
      return (
        <div style={layoutStyle}>
          {renderBlock(blockName, props, childElements)}
        </div>
      );
    }
  }

  return renderBlock(blockName, props, childElements);
});

// ─────────────────────────────────────────────
// 🎨 CSS GLOBAL (animações para ProgressBlock striped + Kiosk UI)
// ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes stripe-move { 0% { background-position: 0 0; } 100% { background-position: 20px 0; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* Kiosk CTA button — breathing pulse */
    @keyframes kiosk-breathe {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.55), 0 8px 40px rgba(0,0,0,0.45); transform: scale(1); }
      50%        { box-shadow: 0 0 0 18px rgba(99,102,241,0),  0 8px 40px rgba(0,0,0,0.45); transform: scale(1.025); }
    }
    @keyframes kiosk-glow-ring {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50%        { opacity: 0;   transform: scale(1.55); }
    }
    @keyframes kiosk-slide-up {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes kiosk-menu-in {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }
    @keyframes kiosk-item-hover {
      from { background: rgba(255,255,255,0.06); }
      to   { background: rgba(255,255,255,0.12); }
    }

    .kiosk-cta-btn {
      animation: kiosk-breathe 3s ease-in-out infinite;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .kiosk-cta-btn:active { transform: scale(0.97) !important; }

    .kiosk-menu-panel { animation: kiosk-menu-in 0.25s ease-out forwards; }

    .kiosk-menu-item {
      transition: background 0.18s ease, transform 0.15s ease;
      cursor: pointer;
    }
    .kiosk-menu-item:hover  { background: rgba(99,102,241,0.18) !important; transform: translateX(4px); }
    .kiosk-menu-item:active { transform: scale(0.98); }

    .kiosk-card { animation: kiosk-slide-up 0.5s ease-out forwards; }

    /* Config update toast */
    @keyframes toast-in  { from { opacity: 0; transform: translateX(120%); } to { opacity: 1; transform: translateX(0); } }
    @keyframes toast-out { from { opacity: 1; transform: translateX(0); }   to { opacity: 0; transform: translateX(120%); } }
    @keyframes toast-progress { from { width: 100%; } to { width: 0%; } }
    @keyframes toast-dot-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }

    .toast-enter { animation: toast-in  0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .toast-exit  { animation: toast-out 0.4s ease-in forwards; }

    /* ── Idle Screen ── */
    @keyframes idle-fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes idle-fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes idle-float {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-14px); }
    }
    @keyframes idle-text-pulse {
      0%,100% { opacity: 1; text-shadow: 0 0 20px rgba(139,92,246,0.6); }
      50%      { opacity: 0.55; text-shadow: 0 0 40px rgba(139,92,246,0.9); }
    }
    @keyframes idle-ring-expand {
      0%   { transform: scale(0.9); opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes idle-particle-up {
      0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
      100% { transform: translateY(-120px) translateX(var(--dx, 0px)) scale(0); opacity: 0; }
    }
    @keyframes idle-star-twinkle {
      0%,100% { opacity: 0; transform: scale(0.5); }
      50%      { opacity: 1; transform: scale(1); }
    }

    .idle-screen-in  { animation: idle-fade-in  0.8s ease-out forwards; }
    .idle-screen-out { animation: idle-fade-out 0.6s ease-in  forwards; }

    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; overflow: hidden; }
  `}</style>
);

// ─────────────────────────────────────────────
// 🌙 IDLE SCREEN — atrai usuários após 60s sem interação
// ─────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 60_000;
const IDLE_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${10 + (i * 73 % 80)}%`,
  delay: `${(i * 0.37) % 3.5}s`,
  dur: `${2.8 + (i * 0.23) % 2.4}s`,
  dx: `${-30 + (i * 17 % 60)}px`,
  size: 3 + (i * 3 % 6),
  color: i % 3 === 0 ? 'rgba(139,92,246,0.85)' : i % 3 === 1 ? 'rgba(99,102,241,0.8)' : 'rgba(236,72,153,0.75)',
}));

function IdleScreen({ visible, onWake }) {
  const [phase, setPhase] = React.useState("hidden"); // hidden | in | visible | out

  React.useEffect(() => {
    if (visible) {
      setPhase("in");
      const t = setTimeout(() => setPhase("visible"), 800);
      return () => clearTimeout(t);
    } else {
      if (phase === "hidden") return;
      setPhase("out");
      const t = setTimeout(() => setPhase("hidden"), 700);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (phase === "hidden") return null;

  return (
    <div
      onClick={onWake}
      onTouchStart={onWake}
      className={phase === "out" ? "idle-screen-out" : "idle-screen-in"}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.18) 0%, rgba(5,10,24,0.92) 70%)",
        backdropFilter: "blur(2px)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {IDLE_PARTICLES.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            bottom: "10%",
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            '--dx': p.dx,
            animation: `idle-particle-up ${p.dur} ${p.delay} ease-out infinite`,
          }} />
        ))}
        {/* Star twinkles */}
        {Array.from({ length: 14 }, (_, i) => (
          <div key={`s${i}`} style={{
            position: "absolute",
            top: `${5 + (i * 61 % 80)}%`,
            left: `${(i * 71 % 90) + 5}%`,
            width: 2 + (i % 2),
            height: 2 + (i % 2),
            borderRadius: "50%",
            background: i % 2 === 0 ? "rgba(255,255,255,0.9)" : "rgba(139,92,246,0.8)",
            animation: `idle-star-twinkle ${1.5 + (i * 0.3) % 2}s ${(i * 0.4) % 2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Pulsing glow rings */}
      {[0, 0.7, 1.4].map((delay, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 220, height: 220,
          borderRadius: "50%",
          border: "1.5px solid rgba(139,92,246,0.5)",
          animation: `idle-ring-expand 3s ${delay}s ease-out infinite`,
        }} />
      ))}

      {/* Icon */}
      <div style={{
        fontSize: "clamp(52px, 8vw, 80px)",
        animation: "idle-float 3.5s ease-in-out infinite",
        marginBottom: 24,
        filter: "drop-shadow(0 0 24px rgba(139,92,246,0.8))",
      }}>
        👋
      </div>

      {/* Main text */}
      <div style={{
        fontSize: "clamp(28px, 4.5vw, 52px)",
        fontWeight: 800,
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 1.15,
        animation: "idle-text-pulse 2.8s ease-in-out infinite",
        marginBottom: 16,
        padding: "0 32px",
      }}>
        Toque para começar
      </div>

      <div style={{
        fontSize: "clamp(14px, 1.8vw, 20px)",
        color: "rgba(255,255,255,0.5)",
        textAlign: "center",
        padding: "0 40px",
        maxWidth: 480,
      }}>
        Estou aqui para ajudar você
      </div>

      {/* Bottom hint */}
      <div style={{
        position: "absolute",
        bottom: 48,
        fontSize: "clamp(11px, 1.2vw, 14px)",
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Toque em qualquer lugar para continuar
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🕐 HOOK: Detecção de inatividade
// ─────────────────────────────────────────────
function useIdleDetection(timeoutMs) {
  const [isIdle, setIsIdle] = React.useState(false);
  const timerRef = React.useRef(null);

  const reset = React.useCallback(() => {
    setIsIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  React.useEffect(() => {
    const events = ["mousemove", "mousedown", "touchstart", "keydown", "scroll", "click"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start timer immediately
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
    };
  }, [reset]);

  return { isIdle, wake: reset };
}

// ─────────────────────────────────────────────
// 🔔 TOAST: Notificação de atualização via polling
// ─────────────────────────────────────────────
function UpdateToast({ visible }) {
  const [phase, setPhase] = React.useState("idle"); // idle | enter | stay | exit

  React.useEffect(() => {
    if (!visible) return;
    setPhase("enter");
    const stayTimer = setTimeout(() => setPhase("exit"), 3200);
    const doneTimer = setTimeout(() => setPhase("idle"), 3650);
    return () => { clearTimeout(stayTimer); clearTimeout(doneTimer); };
  }, [visible]);

  if (phase === "idle") return null;

  return (
    <div
      className={phase === "exit" ? "toast-exit" : "toast-enter"}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(8, 14, 30, 0.82)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.35)",
        borderRadius: 18, padding: "14px 20px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
        minWidth: 260,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Animated sync icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
        border: "1px solid rgba(99,102,241,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>
        🔄
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "#fff",
          letterSpacing: "-0.01em", lineHeight: 1.2,
        }}>
          Configuração atualizada
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.45)",
          marginTop: 3, letterSpacing: "0.01em",
        }}>
          Interface sincronizada via polling
        </div>

        {/* Progress bar */}
        <div style={{
          height: 2, borderRadius: 999, marginTop: 8,
          background: "rgba(255,255,255,0.08)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            animation: `toast-progress 3s linear forwards`,
          }} />
        </div>
      </div>

      {/* Online dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: "50%",
            background: i === 0 ? "#6366f1" : i === 1 ? "#8b5cf6" : "#ec4899",
            animation: `toast-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🎬 EXTRACTOR: pega props do SceneBlock nos craft nodes
// ─────────────────────────────────────────────
function extractSceneProps(nodes) {
  if (!nodes) return null;
  for (const id of Object.keys(nodes)) {
    const node = nodes[id];
    const typeName = typeof node?.type === "object" ? node.type.resolvedName : node?.type;
    if (typeName === "SceneBlock") return node?.props || null;
  }
  return null;
}

// Converte props do SceneBlock para o formato que o Scenario.jsx espera via useCMSConfig
function scenePropsToUiCanvas(sp) {
  if (!sp) return null;
  return {
    environment: {
      preset: sp.envPreset || "city",
      show_floor: sp.showFloor !== false,
      floor_color: sp.floorColor || "#1a1a2e",
      floor_geometry: { width: sp.floorWidth || 20, height: sp.floorHeight || 20 },
      floor_material: { roughness: sp.floorRoughness ?? 0.3, metalness: sp.floorMetalness ?? 0.8 },
      show_wall: sp.showWall !== false,
      wall_geometry: {
        width: sp.wallWidth || 20, height: sp.wallHeight || 12,
        position: [0, sp.wallPosY ?? 4, sp.wallPosZ ?? -5],
      },
      wall_material: { roughness: sp.wallRoughness ?? 0.8, metalness: sp.wallMetalness ?? 0.2 },
      show_particles: sp.showParticles !== false,
      particles: {
        count: sp.particleCount || 50,
        color: sp.particleColor || "#4a90ff",
        size: sp.particleSize || 2,
        speed: sp.particleSpeed || 0.3,
        opacity: sp.particleOpacity || 0.4,
        scale: sp.particleScale || 10,
      },
    },
    background: { color: sp.wallColor || "#0f3460" },
    camera: {
      initial_look_at: {
        position: [sp.camPosX ?? 0, sp.camPosY ?? 1.65, sp.camPosZ ?? 4],
        target: [sp.camTargetX ?? 0, sp.camTargetY ?? 1.5, sp.camTargetZ ?? 0],
        smooth: true,
      },
      controls: {
        minDistance: sp.camMinDist ?? 3,
        maxDistance: sp.camMaxDist ?? 8,
        minPolarAngle: Math.PI / 4,
        maxPolarAngle: Math.PI / 2,
      },
    },
    lighting: {
      ambient: sp.ambientEnabled !== false
        ? { intensity: sp.ambientIntensity ?? 0.4 }
        : undefined,
      directional: [
        ...(sp.dirLightEnabled !== false ? [{
          position: [sp.dirLightPosX ?? 5, sp.dirLightPosY ?? 5, sp.dirLightPosZ ?? 5],
          intensity: sp.dirLightIntensity ?? 1.2,
          color: sp.dirLightColor || "#ffffff",
          castShadow: sp.dirLightCastShadow !== false,
          shadowMapSize: [2048, 2048],
        }] : []),
        ...(sp.fillLightEnabled !== false ? [{
          position: [-5, 3, -5],
          intensity: sp.fillLightIntensity ?? 0.5,
          color: sp.fillLightColor || "#b8d4ff",
          castShadow: false,
        }] : []),
      ],
      spot: sp.spotLightEnabled !== false ? [{
        position: [sp.spotLightPosX ?? 0, sp.spotLightPosY ?? 5, sp.spotLightPosZ ?? -5],
        intensity: sp.spotLightIntensity ?? 0.8,
        angle: sp.spotLightAngle ?? 0.6,
        penumbra: sp.spotLightPenumbra ?? 0.5,
        color: sp.spotLightColor || "#ffd4a3",
        castShadow: sp.spotLightCastShadow !== false,
      }] : [],
      point: [
        ...(sp.pointLight1Enabled !== false ? [{
          position: [-3, 2, 2],
          intensity: sp.pointLight1Intensity ?? 0.3,
          color: sp.pointLight1Color || "#4a90ff",
        }] : []),
        ...(sp.pointLight2Enabled !== false ? [{
          position: [3, 2, 2],
          intensity: sp.pointLight2Intensity ?? 0.3,
          color: sp.pointLight2Color || "#ff6b9d",
        }] : []),
      ],
    },
    shadows: {
      position: [0, 0, 0],
      opacity: sp.shadowOpacity ?? 0.5,
      scale: sp.shadowScale ?? 10,
      blur: sp.shadowBlur ?? 2,
      far: 4, resolution: 256,
      color: sp.shadowColor || "#000000",
    },
  };
}

// ─────────────────────────────────────────────
// 🚀 APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const { ui: initialUi } = useCMSConfig();
  const [liveUi, setLiveUi] = useState(null);
  const [toastKey, setToastKey] = useState(0);
  const { isIdle, wake } = useIdleDetection(IDLE_TIMEOUT_MS);

  // ── Integração com SpeechProvider (nova API: message, onMessagePlayed, loading, listening, sendMessage) ──
  let speechCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    speechCtx = useSpeech();
  } catch (_) {
    // SpeechProvider não está presente — funciona sem TTS/VAD
  }

  // ── Registra handlers globais do bridge Totem ──────────────────────────
  useEffect(() => {
    // 💬 IA: window.__totemSendMessage(text) → chama sendMessage do SpeechProvider
    // Isso dispara o pipeline completo: texto → backend /text → LLM → TTS → avatar fala
    window.__totemSendMessage = (msg) => {
      if (speechCtx?.sendMessage) {
        speechCtx.sendMessage(msg);
      } else {
        console.info("[Totem] 💬 __totemSendMessage (sem SpeechProvider):", msg);
      }
    };
    console.info("[Totem] ✅ window.__totemSendMessage registrado (via SpeechProvider.sendMessage)");

    // 🔊 TTS direto: window.__totemSpeak(text) — fallback via Web Speech API
    // Com a nova arquitetura o TTS é feito pelo backend (Kokoro), mas mantemos
    // o fallback para uso fora do fluxo principal (notificações, etc.)
    if (typeof window.__totemSpeak !== "function") {
      window.__totemSpeak = (text, options) => {
        if (window.speechSynthesis) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = options?.lang || import.meta.env.VITE_TTS_LANG || "pt-BR";
          window.speechSynthesis.speak(utter);
        } else {
          console.info("[Totem] 🔊 TTS stub (sem speechSynthesis):", text);
        }
      };
      console.info("[Totem] ✅ window.__totemSpeak registrado (fallback Web Speech)");
    }

    // 🌐 URL: window.__totemOpenUrl(url) — usa Electron shell ou window.open
    if (typeof window.__totemOpenUrl !== "function") {
      window.__totemOpenUrl = (url) => {
        if (!url || url === "#") return;
        if (window.electronAPI?.openExternal) {
          window.electronAPI.openExternal(url);
          return;
        }
        try {
          const { shell } = window.require?.("electron") || {};
          if (shell?.openExternal) { shell.openExternal(url); return; }
        } catch (_) { /* não está no Electron */ }
        window.open(url, "_blank", "noopener,noreferrer");
      };
      console.info("[Totem] ✅ window.__totemOpenUrl registrado");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechCtx?.sendMessage]);

  // Device ID: read from env (set on hardware) or fallback to config response
  const deviceId = import.meta.env.VITE_TOTEM_DEVICE_ID || null;

  // Wrap setLiveUi to also trigger the update toast
  const handleConfigUpdate = useCallback((newUi) => {
    setLiveUi(newUi);
    setToastKey(k => k + 1);
  }, []);

  // ── Live Preview: aplica config imediatamente via Realtime broadcast ──
  const handleLiveUpdate = useCallback((newUi) => {
    setLiveUi(newUi);
  }, []);

  useConfigPoller(handleConfigUpdate);
  useHeartbeat();
  const isLive = useLivePreview(deviceId, handleLiveUpdate);

  const ui = liveUi || initialUi;

  // Parse craft nodes
  const craftNodes = useMemo(() => {
    const raw = ui?.craft_nodes || ui?.craft_blocks || ui?.nodes || null;
    if (!raw) return null;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
  }, [ui]);

  const hasCraft = craftNodes && craftNodes["ROOT"];

  // Extrair props do SceneBlock para sobrescrever o canvas do Scenario
  const sceneOverride = useMemo(() => {
    if (!hasCraft) return null;
    return scenePropsToUiCanvas(extractSceneProps(craftNodes));
  }, [craftNodes, hasCraft]);

  // Background
  const bgStyle = useMemo(() => {
    const bg = ui?.canvas?.background;
    if (bg?.type === "image" && bg?.image_url) {
      return { backgroundImage: `url(${bg.image_url})`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    if (bg?.gradient) return { backgroundImage: bg.gradient };
    if (bg?.color) return { backgroundColor: bg.color };
    // Default: deep navy so the 3D scene reads well
    return { background: "linear-gradient(160deg, #050a18 0%, #0c1630 60%, #0a0e1f 100%)" };
  }, [ui]);


  const avatarOn = ui?.components?.avatar?.enabled !== false;

  // ── Consumir chat_interface da edge function ──
  // Prioridade: craft_nodes (via InlineChatInterface) > components.chat_interface > ChatInterface padrão
  const chatInterfaceConfig = useMemo(() => {
    return ui?.components?.chat_interface || null;
  }, [ui]);

  const chatOn = chatInterfaceConfig?.enabled !== false;

  // ── Consumir canvas.scene da edge function para sobrescrever Scenario ──
  // Se SceneBlock não está nos craft_nodes locais, usa o scene retornado pelo polling
  const remoteSceneConfig = useMemo(() => {
    if (!ui?.canvas?.scene) return null;
    const s = ui.canvas.scene;
    // Converte o formato da edge function para o formato que scenePropsToUiCanvas espera
    return {
      envPreset: s.env_preset,
      showFloor: s.floor?.show,
      floorColor: s.floor?.color,
      floorWidth: s.floor?.width,
      floorHeight: s.floor?.height,
      floorRoughness: s.floor?.roughness,
      floorMetalness: s.floor?.metalness,
      showWall: s.wall?.show,
      wallColor: s.wall?.color,
      wallWidth: s.wall?.width,
      wallHeight: s.wall?.height,
      wallPosY: s.wall?.pos_y,
      wallPosZ: s.wall?.pos_z,
      wallRoughness: s.wall?.roughness,
      wallMetalness: s.wall?.metalness,
      showParticles: s.particles?.show,
      particleCount: s.particles?.count,
      particleColor: s.particles?.color,
      particleSize: s.particles?.size,
      particleSpeed: s.particles?.speed,
      particleOpacity: s.particles?.opacity,
      particleScale: s.particles?.scale,
      camPosX: s.camera?.position?.[0],
      camPosY: s.camera?.position?.[1],
      camPosZ: s.camera?.position?.[2],
      camTargetX: s.camera?.target?.[0],
      camTargetY: s.camera?.target?.[1],
      camTargetZ: s.camera?.target?.[2],
      camMinDist: s.camera?.min_distance,
      camMaxDist: s.camera?.max_distance,
      ambientEnabled: s.lighting?.ambient?.enabled,
      ambientIntensity: s.lighting?.ambient?.intensity,
      dirLightEnabled: s.lighting?.directional?.enabled,
      dirLightIntensity: s.lighting?.directional?.intensity,
      dirLightColor: s.lighting?.directional?.color,
      dirLightPosX: s.lighting?.directional?.position?.[0],
      dirLightPosY: s.lighting?.directional?.position?.[1],
      dirLightPosZ: s.lighting?.directional?.position?.[2],
      dirLightCastShadow: s.lighting?.directional?.cast_shadow,
      fillLightEnabled: s.lighting?.fill?.enabled,
      fillLightIntensity: s.lighting?.fill?.intensity,
      fillLightColor: s.lighting?.fill?.color,
      spotLightEnabled: s.lighting?.spot?.enabled,
      spotLightIntensity: s.lighting?.spot?.intensity,
      spotLightColor: s.lighting?.spot?.color,
      spotLightPosX: s.lighting?.spot?.position?.[0],
      spotLightPosY: s.lighting?.spot?.position?.[1],
      spotLightPosZ: s.lighting?.spot?.position?.[2],
      spotLightAngle: s.lighting?.spot?.angle,
      spotLightPenumbra: s.lighting?.spot?.penumbra,
      spotLightCastShadow: s.lighting?.spot?.cast_shadow,
      pointLight1Enabled: s.lighting?.point1?.enabled,
      pointLight1Color: s.lighting?.point1?.color,
      pointLight1Intensity: s.lighting?.point1?.intensity,
      pointLight2Enabled: s.lighting?.point2?.enabled,
      pointLight2Color: s.lighting?.point2?.color,
      pointLight2Intensity: s.lighting?.point2?.intensity,
      shadowOpacity: s.shadow?.opacity,
      shadowBlur: s.shadow?.blur,
      shadowScale: s.shadow?.scale,
      shadowColor: s.shadow?.color,
    };
  }, [ui?.canvas?.scene]);

  // Merge ui com override do SceneBlock (craft local) ou scene remoto (polling)
  const mergedUi = useMemo(() => {
    // Local craft SceneBlock tem prioridade sobre scene remoto
    const effectiveSceneOverride = sceneOverride || (remoteSceneConfig ? scenePropsToUiCanvas(remoteSceneConfig) : null);
    if (!effectiveSceneOverride) return ui;
    return { ...ui, canvas: { ...(ui?.canvas || {}), ...effectiveSceneOverride } };
  }, [ui, sceneOverride, remoteSceneConfig]);

  // ── Pan com mouse ──────────────────────────────────────────────────────
  const panRef = useRef({ dragging: false, startX: 0, startY: 0, scrollX: 0, scrollY: 0 });
  const outerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    // Só arrastar com botão do meio (roda) ou com Alt + botão esquerdo
    if (e.button !== 1 && !(e.button === 0 && e.altKey)) return;
    e.preventDefault();
    const state = panRef.current;
    state.dragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.scrollX = outerRef.current?.scrollLeft ?? 0;
    state.scrollY = outerRef.current?.scrollTop ?? 0;
    document.body.style.cursor = "grab";
  }, []);

  const handleMouseMove = useCallback((e) => {
    const state = panRef.current;
    if (!state.dragging) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (outerRef.current) {
      outerRef.current.scrollLeft = state.scrollX - dx;
      outerRef.current.scrollTop = state.scrollY - dy;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    panRef.current.dragging = false;
    document.body.style.cursor = "";
  }, []);

  return (
    <>
      <GlobalStyles />
      <div
        ref={outerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: "100vw", height: "100vh", position: "relative", overflow: "auto",
          userSelect: "none",
          ...bgStyle,
        }}
      >
        <Loader />
        <Leva collapsed hidden />

        {/* 🤖 CAMADA 1: Avatar 3D + Cenário — usa mergedUi com props do SceneBlock */}
        {avatarOn && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <Canvas shadows camera={{ position: [0, 0, 0], fov: 26 }} gl={{ preserveDrawingBuffer: true }}>
              <Scenario uiOverride={mergedUi} />
            </Canvas>
          </div>
        )}

        {/* 🧱 CAMADA 2: Overlay 2D (blocos do Page Builder) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
          <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
            {hasCraft ? (
              <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
                <CraftEngine nodes={craftNodes} nodeId="ROOT" />
              </div>
            ) : (
              <div style={{ pointerEvents: "auto", height: "100%" }}>
                {chatOn && <ChatInterface uiConfig={chatInterfaceConfig} />}
              </div>
            )}
          </div>
        </div>

        {/* 💬 CAMADA 3: Chat Interface via polling (quando não há ChatInterfaceBlock nos craft nodes) */}
        {chatOn && hasCraft && !craftNodes && (
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 40, pointerEvents: "auto", width: "100%", maxWidth: "600px", padding: "0 20px",
          }}>
            <ChatInterface uiConfig={chatInterfaceConfig} />
          </div>
        )}
      </div>

      {/* 🔔 CAMADA 4: Toast de atualização via polling */}
      <UpdateToast key={toastKey} visible={toastKey > 0} />

      {/* 📡 CAMADA 4b: Badge "Ao Vivo" — aparece quando Hub está transmitindo */}
      {isLive && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 999,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#fca5a5",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase",
          boxShadow: "0 0 16px rgba(239,68,68,0.2)",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#ef4444",
            animation: "live-pulse 1.2s ease-in-out infinite",
            display: "inline-block",
            boxShadow: "0 0 6px #ef4444",
          }} />
          Ao Vivo
        </div>
      )}

      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>

      {/* 🌙 CAMADA 5: Tela idle — aparece após 60s sem interação */}
      <IdleScreen visible={isIdle} onWake={wake} />
    </>
  );
}

