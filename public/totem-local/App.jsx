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
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Loader, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { useCMSConfig } from "./hooks/useCMSConfig";
import { ChatInterface } from "./components/ChatInterface";

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
// 🧱 RENDERIZADORES INDIVIDUAIS POR BLOCO
// ─────────────────────────────────────────────

/**
 * ChatInterfaceBlock local — converte props do Craft.js para o componente
 * ChatInterface real (com useSpeech + useCMSConfig internal override).
 */
function InlineChatInterface({ p }) {
  const [dropOpen, setDropOpen] = React.useState(false);
  const [activeSubmenu, setActiveSubmenu] = React.useState(null);

  const items = Array.isArray(p.items) ? p.items : [];
  const blur = p.blur ?? 15;
  const opacity = p.opacity ?? 1;

  // Styles from block props
  const headerShow = p.headerShow !== false;
  const position = p.position || 'bottom_right';
  const posStyles = {
    bottom_right: { bottom: 0, right: 0 },
    bottom_left: { bottom: 0, left: 0 },
    top_right: { top: 0, right: 0 },
    top_left: { top: 0, left: 0 },
    center: { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
  };
  const posStyle = posStyles[position] || posStyles.bottom_right;

  const handleAction = (node) => {
    const msg = node.prompt || node.message || node.label || '';
    if (msg && window.__totemSendMessage) window.__totemSendMessage(msg);
    if (p.closeOnSelect !== false) { setDropOpen(false); setActiveSubmenu(null); }
  };

  const renderNode = (node, depth = 0) => {
    const isFolder = node.type === 'folder' || (node.children && node.children.length > 0);
    const isOpen = activeSubmenu === node.id || String(activeSubmenu || '').startsWith(`${node.id}-`);
    return (
      <div key={node.id} style={{ marginLeft: depth * 12 }}>
        <div
          onClick={isFolder ? () => setActiveSubmenu(isOpen ? null : node.id) : () => handleAction(node)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 4,
            border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#fff', fontWeight: 500,
            transition: 'background 0.15s',
          }}
        >
          <span style={{ fontSize: 16 }}>{node.icon}</span>
          <span style={{ flex: 1 }}>{node.label}</span>
          {node.description && <span style={{ opacity: 0.5, fontSize: 10 }}>{node.description}</span>}
          {isFolder
            ? <span style={{ opacity: 0.4, fontSize: 9, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{p.folderArrowSymbol || '▼'}</span>
            : <span style={{ opacity: 0.4 }}>{p.itemArrowSymbol || '→'}</span>}
        </div>
        {isFolder && isOpen && (node.children || []).map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', zIndex: p.zIndex || 1000, ...posStyle, pointerEvents: 'auto', minWidth: 260, maxWidth: 340 }}>
      {/* Header */}
      {headerShow && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px',
          background: `rgba(16,23,42,${opacity * 0.9})`,
          backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
          borderRadius: '14px 14px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.headerIndicatorColor || '#10b981', boxShadow: `0 0 8px ${p.headerIndicatorColor || '#10b981'}` }} />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{p.headerTitle || 'Assistente'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
            <span>{p.headerIcon || '📍'}</span>
            <span>{p.headerSubtitle || 'Online'}</span>
          </div>
        </div>
      )}
      {/* Toggle button */}
      <div
        onClick={() => setDropOpen(!dropOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer',
          background: `rgba(16,23,42,${opacity * 0.88})`,
          backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
          border: '1px solid rgba(255,255,255,0.12)', opacity,
          borderRadius: headerShow ? '0 0 14px 14px' : 14,
          transition: 'background 0.2s',
        }}
      >
        <span style={{ fontSize: 18 }}>{p.ctaIcon || '💬'}</span>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 500, flex: 1 }}>{p.ctaText || 'Como posso ajudar?'}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          {p.folderArrowSymbol || '▼'}
        </span>
      </div>
      {/* Dropdown */}
      {dropOpen && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 6,
          background: `rgba(16,23,42,${opacity * 0.92})`,
          backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 10,
          maxHeight: '55vh', overflowY: 'auto', opacity,
        }}>
          {items.length === 0
            ? <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: '12px 0' }}>Nenhum item configurado</p>
            : items.map(item => renderNode(item))}
        </div>
      )}
    </div>
  );
}

/** Renderiza um único nó de acordo com seu tipo */
function renderBlock(blockName, props, childElements) {
  const p = props || {};

  // ── AvatarBlock / ChatBlock → renderizado em camada separada ──
  if (blockName === "AvatarBlock" || blockName === "ChatBlock") return null;

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
    const lay = p.layout || "grid";
    const cols = p.columns || 2;
    const gridStyle = lay === "grid"
      ? { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: px(p.gap || 8) }
      : lay === "pills"
        ? { display: "flex", flexWrap: "wrap", gap: px(p.gap || 8) }
        : { display: "flex", flexDirection: "column", gap: px(p.gap || 8) };

    return (
      <div style={{
        backgroundColor: p.bgColor || "rgba(255,255,255,0.06)",
        opacity: p.bgOpacity ?? 1,
        borderRadius: px(p.borderRadius || 16),
        padding: px(p.padding || 16),
        backdropFilter: (p.bgBlur || 0) > 0 ? `blur(${p.bgBlur}px)` : undefined,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {p.title && (
          <div style={{ fontWeight: 600, marginBottom: "10px", display: "flex", gap: "8px", color: p.titleColor || "#fff", fontSize: px(p.titleFontSize || 14) }}>
            {p.titleIcon && <span>{p.titleIcon}</span>}
            <span>{p.title}</span>
          </div>
        )}
        <div style={gridStyle}>
          {items.map((item, idx) => {
            if (lay === "pills") {
              return (
                <div key={idx} style={{
                  backgroundColor: (item.color || "#6366f1") + "22",
                  color: p.itemTextColor || "#fff",
                  fontSize: px(p.itemFontSize || 13),
                  borderRadius: "999px", padding: "8px 16px",
                  border: `1px solid ${(item.color || "#6366f1")}44`,
                  fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "6px",
                  cursor: "pointer",
                }}>
                  {p.showItemEmoji !== false && item.emoji && <span>{item.emoji}</span>}
                  <span>{item.label}</span>
                </div>
              );
            }
            return (
              <div key={idx} style={{
                backgroundColor: p.itemBgColor || "rgba(255,255,255,0.08)",
                color: p.itemTextColor || "#fff",
                fontSize: px(p.itemFontSize || 13),
                borderRadius: px(p.itemBorderRadius || 12),
                padding: lay === "list" ? "12px 16px" : "14px 12px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: lay === "grid" ? "center" : "left",
                display: "flex", flexDirection: lay === "grid" ? "column" : "row",
                alignItems: "center", gap: "8px",
                fontWeight: 500, backdropFilter: "blur(8px)", minHeight: "44px",
                cursor: "pointer",
              }}>
                {p.showItemEmoji !== false && item.emoji && (
                  <span style={{
                    width: lay === "grid" ? "36px" : "32px", height: lay === "grid" ? "36px" : "32px",
                    borderRadius: "10px", backgroundColor: (item.color || "#6366f1") + "25",
                    fontSize: lay === "grid" ? "18px" : "16px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {item.emoji}
                  </span>
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              </div>
            );
          })}
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
          <a key={idx} href={link.url || "#"} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", flexDirection: dir === "column" ? "row" : "column",
            alignItems: "center", gap: "6px", textDecoration: "none", cursor: "pointer",
            transition: "transform 0.2s",
          }}>
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
          </a>
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
        backgroundColor: p.bgColor === "transparent" ? "transparent" : (p.bgColor || "#0f172a"),
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

  return renderBlock(blockName, props, childElements);
});

// ─────────────────────────────────────────────
// 🎨 CSS GLOBAL (animações para ProgressBlock striped)
// ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes stripe-move { 0% { background-position: 0 0; } 100% { background-position: 20px 0; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; overflow: hidden; }
  `}</style>
);

// ─────────────────────────────────────────────
// 🚀 APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const { ui: initialUi } = useCMSConfig();
  const [liveUi, setLiveUi] = useState(null);

  // Worker de polling — atualiza liveUi sem re-mount desnecessário
  useConfigPoller(setLiveUi);

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

  // Background
  const bgStyle = useMemo(() => {
    const bg = ui?.canvas?.background;
    if (bg?.type === "image" && bg?.image_url) {
      return { backgroundImage: `url(${bg.image_url})`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    if (bg?.gradient) return { backgroundImage: bg.gradient };
    if (bg?.color) return { backgroundColor: bg.color };
    return { backgroundColor: "#000000" };
  }, [ui]);

  const avatarOn = ui?.components?.avatar?.enabled !== false;
  const chatOn = ui?.components?.chat_interface?.enabled !== false;

  return (
    <>
      <GlobalStyles />
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", ...bgStyle }}>
        <Loader />
        <Leva collapsed hidden />

        {/* 🤖 CAMADA 1: Avatar 3D */}
        {avatarOn && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <Canvas shadows camera={{ position: [0, 0, 0], fov: 26 }} gl={{ preserveDrawingBuffer: true }}>
              <OrbitControls makeDefault enableZoom enablePan enableRotate />
              <Scenario />
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
                {chatOn && <ChatInterface />}
              </div>
            )}
          </div>
        </div>

        {/* 💬 CAMADA 3: Chat Interface (quando usando builder) */}
        {chatOn && hasCraft && (
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 40, pointerEvents: "auto", width: "100%", maxWidth: "600px", padding: "0 20px",
          }}>
            <ChatInterface />
          </div>
        )}
      </div>
    </>
  );
}
