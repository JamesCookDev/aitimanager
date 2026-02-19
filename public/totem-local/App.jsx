/**
 * ========================================================
 *  TOTEM LOCAL — App.jsx (versão corrigida e completa)
 * ========================================================
 *  • Todos os 17 blocos do Page Builder renderizados
 *  • Worker de polling para atualização contínua
 *  • QRCode, Social, Video, etc. 100% funcionais
 * ========================================================
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Loader, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { useCMSConfig } from "./hooks/useCMSConfig";
import { ChatInterface } from "./components/ChatInterface";

// ─────────────────────────────────────────────
// 🔄 WORKER: Polling inteligente com intervalo configurável
// ─────────────────────────────────────────────
const POLL_INTERVAL = 15_000; // 15 segundos

function useConfigPoller(currentUi, onUpdate) {
  const lastHashRef = useRef("");

  const fetchLatest = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_CMS_API_URL;
      const apiKey = import.meta.env.VITE_TOTEM_API_KEY || import.meta.env.TOTEM_API_KEY;
      if (!apiUrl || !apiKey) return;

      const res = await fetch(`${apiUrl}/totem-config`, {
        headers: {
          "x-totem-api-key": apiKey,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
      });
      if (!res.ok) return;

      const json = await res.json();
      const newUi = json?.config?.ui;
      if (!newUi) return;

      // Compara hash simples para evitar re-renders desnecessários
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
    // Primeira busca imediata
    fetchLatest();
    const id = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchLatest]);
}

// ─────────────────────────────────────────────
// ⏱️ COUNTDOWN EM TEMPO REAL
// ─────────────────────────────────────────────
const LiveCountdown = ({ targetDate, countdownMinutes, showLabels, showSeconds, fontSize, labelFontSize, textColor, gap }) => {
  const px = (v) => (typeof v === "number" ? `${v}px` : v);

  const [targetTimestamp] = useState(() => {
    if (targetDate) return new Date(targetDate).getTime();
    if (countdownMinutes) return Date.now() + countdownMinutes * 60000;
    return Date.now() + 86400000;
  });

  const calc = () => {
    const d = targetTimestamp - Date.now();
    if (d <= 0) return { dias: 0, horas: 0, min: 0, seg: 0 };
    return {
      dias: Math.floor(d / 86400000),
      horas: Math.floor((d / 3600000) % 24),
      min: Math.floor((d / 60000) % 60),
      seg: Math.floor((d / 1000) % 60),
    };
  };

  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetTimestamp]);

  const Box = ({ label, value }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: px(fontSize || 28), fontWeight: "bold", color: textColor || "#fff" }}>
        {String(value).padStart(2, "0")}
      </span>
      {showLabels !== false && (
        <span style={{ fontSize: px(labelFontSize || 12), color: textColor || "#fff", opacity: 0.8, textTransform: "uppercase" }}>
          {label}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: px(gap || 20), justifyContent: "center", alignItems: "center", width: "100%" }}>
      {t.dias > 0 && <Box label="Dias" value={t.dias} />}
      <Box label="Horas" value={t.horas} />
      <Box label="Min" value={t.min} />
      {showSeconds !== false && <Box label="Seg" value={t.seg} />}
    </div>
  );
};

// ─────────────────────────────────────────────
// 🧱 CRAFT ENGINE — Renderizador recursivo completo
// ─────────────────────────────────────────────
const CraftEngine = ({ nodes, nodeId = "ROOT" }) => {
  if (!nodes || !nodes[nodeId]) return null;

  const node = nodes[nodeId];
  const { type, props = {}, nodes: childIds = [], linkedNodes = {} } = node;

  // Resolve nome do bloco
  let resolvedName = type;
  if (typeof type === "object" && type.resolvedName) resolvedName = type.resolvedName;
  const blockName = resolvedName;

  // Mapeia bloco → tag HTML
  const TAG_MAP = {
    TextBlock: "p", GradientTextBlock: "p",
    ImageBlock: "img",
    ButtonBlock: "button",
  };
  const CONTAINER_BLOCKS = [
    "CanvasDropArea", "ContainerBlock", "AvatarBlock", "ChatBlock",
    "IconBlock", "BadgeBlock", "CardBlock", "MenuBlock",
    "SpacerBlock", "DividerBlock", "ProgressBlock", "CountdownBlock",
    "SocialLinksBlock", "VideoEmbedBlock", "QRCodeBlock",
  ];
  let TagName = TAG_MAP[blockName] || (CONTAINER_BLOCKS.includes(blockName) ? "div" : blockName);

  // ── Destructure de TODAS as props possíveis ──
  const {
    bgColor, textColor, color, fontSize, textAlign, padding, margin, text, title,
    alignItems, justifyContent, borderRadius, minHeight, paddingX, paddingY,
    fullWidth, objectFit, enabled, showHeader, bgSize, bgBorderRadius,
    borderWidth, shadow, icon, borderColor, bgEnabled, emoji,
    headerIcon, subtitle, bgBlur, titleColor, titleFontSize, titleIcon,
    itemBgColor, itemTextColor, itemFontSize, itemBorderRadius, showItemEmoji,
    items, layout, gap,
    lineStyle, thickness, height, animated, striped, labelColor, progressColor,
    trackColor, value, showLabel, label, barColor, textShadow, iconPosition,
    showSeconds, labelFontSize, maxValue, showPercentage, targetDate,
    lineHeight, textTransform, fontWeight,
    countdownMinutes, showLabels, gradientTo, gradientVia, gradientAngle,
    useVia, gradientFrom, borderEnabled, opacity,
    iconSize, links, aspectRatio, autoplay, autoPlay, videoUrl, url, src,
    controls, muted, loop, fgColor, labelSize, content, size,
    showLabels: showLabelsAlt,
    ...restProps
  } = props;

  const px = (v) => (typeof v === "number" ? `${v}px` : v);
  const isRoot = nodeId === "ROOT";
  const isGradient = blockName === "GradientTextBlock";

  // ── Estilos ──
  const baseStyle = {
    pointerEvents: isRoot ? "none" : "auto",
    width: isRoot ? "100%" : fullWidth ? "100%" : bgSize && bgEnabled ? px(bgSize) : undefined,
    height: isRoot ? "100%" : px(height) || (bgSize && bgEnabled ? px(bgSize) : undefined),
    display:
      isRoot || alignItems || justifyContent ||
      blockName === "SocialLinksBlock" || blockName === "QRCodeBlock"
        ? "flex"
        : undefined,
    flexDirection:
      isRoot ? "column" :
      blockName === "CardBlock" || blockName === "QRCodeBlock" ? "column" : undefined,
    backgroundColor: isRoot || isGradient ? "transparent" : bgColor || undefined,
    color: isGradient ? "transparent" : textColor || color || undefined,
    backgroundImage: isGradient
      ? `linear-gradient(${gradientAngle || 90}deg, ${gradientFrom || color || "#fff"}${useVia && gradientVia ? `, ${gradientVia}` : ""}, ${gradientTo || "#000"})`
      : undefined,
    WebkitBackgroundClip: isGradient ? "text" : undefined,
    WebkitTextFillColor: isGradient ? "transparent" : undefined,
    backgroundClip: isGradient ? "text" : undefined,
    fontSize: px(fontSize),
    textAlign: textAlign || undefined,
    padding: px(padding),
    margin: px(margin),
    minHeight: px(minHeight),
    alignItems: isRoot ? "stretch" : alignItems || undefined,
    justifyContent: justifyContent || undefined,
    borderRadius: px(borderRadius) || px(bgBorderRadius),
    objectFit: objectFit || undefined,
    paddingLeft: px(paddingX),
    paddingRight: px(paddingX),
    paddingTop: px(paddingY),
    paddingBottom: px(paddingY),
    borderWidth: borderEnabled === false ? undefined : px(thickness) || px(borderWidth),
    borderColor: borderEnabled === false ? undefined : borderColor || color || undefined,
    borderStyle: borderEnabled === false ? "none" : lineStyle || (borderWidth || thickness ? "solid" : undefined),
    boxShadow: shadow ? "0px 4px 10px rgba(0,0,0,0.3)" : undefined,
    gap: px(gap),
    textShadow:
      textShadow === true ? "2px 2px 4px rgba(0,0,0,0.5)" :
      typeof textShadow === "string" && !isGradient ? textShadow : undefined,
    lineHeight: lineHeight || undefined,
    textTransform: textTransform || undefined,
    fontWeight: fontWeight || undefined,
    aspectRatio: aspectRatio || undefined,
    backdropFilter: bgBlur ? `blur(${bgBlur}px)` : undefined,
    opacity: typeof opacity === "number" ? opacity : undefined,
    ...props?.style,
  };

  const safeProps = { ...restProps, style: baseStyle };

  // Filhos
  const allChildIds = [...childIds, ...Object.values(linkedNodes)];
  const childElements = allChildIds.map((id) => <CraftEngine key={id} nodes={nodes} nodeId={id} />);

  // ── Renderizadores dedicados por bloco ──
  let innerContent = childElements;

  // ❌ Blocos 3D/Chat — renderizados fora do HTML
  if (blockName === "AvatarBlock" || blockName === "ChatBlock") {
    return null;
  }

  // 🔲 SpacerBlock
  if (blockName === "SpacerBlock") {
    return <div style={{ height: px(height || 24), width: "100%" }} />;
  }

  // ─ DividerBlock
  if (blockName === "DividerBlock") {
    return (
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: `${px(thickness || 1)} ${lineStyle || "solid"} ${color || "rgba(255,255,255,0.2)"}`,
          margin: `${px(padding || 8)} 0`,
          opacity: typeof opacity === "number" ? opacity : 1,
        }}
      />
    );
  }

  // 🏷️ BadgeBlock
  if (blockName === "BadgeBlock") {
    innerContent = (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: px(borderRadius || 999), backgroundColor: bgColor || "rgba(255,255,255,0.1)", color: textColor || color || "#fff", fontSize: px(fontSize || 12), fontWeight: "bold" }}>
        {emoji && <span>{emoji}</span>}
        {text}
      </div>
    );
  }

  // 🔣 IconBlock
  else if (blockName === "IconBlock") {
    innerContent = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: px(bgSize || iconSize || 48), height: px(bgSize || iconSize || 48), fontSize: px(iconSize || 24), backgroundColor: bgEnabled ? bgColor || "rgba(255,255,255,0.1)" : "transparent", borderRadius: px(borderRadius || bgBorderRadius || 12) }}>
        {icon || emoji}
      </div>
    );
  }

  // ⏱️ CountdownBlock
  else if (blockName === "CountdownBlock") {
    innerContent = (
      <LiveCountdown
        targetDate={targetDate}
        countdownMinutes={countdownMinutes}
        showLabels={showLabels}
        showSeconds={showSeconds}
        fontSize={fontSize}
        labelFontSize={labelFontSize}
        textColor={textColor}
        gap={gap}
      />
    );
  }

  // 📊 ProgressBlock
  else if (blockName === "ProgressBlock") {
    const pv = typeof value === "number" ? value : 50;
    const mv = typeof maxValue === "number" ? maxValue : 100;
    const pct = Math.min(100, Math.max(0, (pv / mv) * 100));
    const barStyle = {
      width: `${pct}%`,
      backgroundColor: barColor || progressColor || color || "#6366f1",
      height: "100%",
      borderRadius: "999px",
      transition: "width 0.5s ease-in-out",
    };
    if (striped || animated) {
      barStyle.backgroundImage = "linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)";
      barStyle.backgroundSize = "1rem 1rem";
    }
    if (animated) barStyle.animation = "progress-stripes 1s linear infinite";
    innerContent = (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {(label || showLabel !== false) && (
          <div style={{ display: "flex", justifyContent: "space-between", color: labelColor || "#fff", fontSize: "0.85em", fontWeight: "bold" }}>
            <span>{label || "Progresso"}</span>
            <span>{showPercentage !== false ? `${Math.round(pct)}%` : `${pv}/${mv}`}</span>
          </div>
        )}
        <div style={{ width: "100%", backgroundColor: trackColor || "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden", height: px(height || thickness || 12) }}>
          <div style={barStyle} />
        </div>
      </div>
    );
  }

  // 📱 QRCodeBlock — CORRIGIDO
  else if (blockName === "QRCodeBlock") {
    const qrSize = size || 160;
    const qrContent = content || value || url || "https://example.com";
    // API QR Server não aceita "transparent" — usa preto como fallback
    const cleanFg = (fgColor || "#ffffff").replace("#", "");
    const cleanBg = !bgColor || bgColor === "transparent" ? "000000" : bgColor.replace("#", "");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}&color=${cleanFg}&bgcolor=${cleanBg}`;

    // Sobrescreve estilo do container
    safeProps.style = {
      ...safeProps.style,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "fit-content",
      gap: "8px",
      padding: px(padding || 12),
    };

    innerContent = (
      <>
        <img
          src={qrUrl}
          alt="QR Code"
          style={{
            width: px(qrSize),
            height: px(qrSize),
            objectFit: "contain",
            borderRadius: px(borderRadius || 8),
            imageRendering: "pixelated",
          }}
        />
        {label && (
          <span style={{ fontSize: px(labelSize || 12), color: labelColor || "#fff", textAlign: "center", fontWeight: 500 }}>
            {label}
          </span>
        )}
      </>
    );
  }

  // 🔗 SocialLinksBlock — CORRIGIDO
  else if (blockName === "SocialLinksBlock") {
    const dir = layout === "vertical" ? "column" : "row";
    safeProps.style = {
      ...safeProps.style,
      display: "flex",
      flexDirection: dir,
      gap: px(gap || 12),
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      width: "100%",
      padding: px(padding || 12),
      backgroundColor: bgEnabled ? bgColor || "rgba(255,255,255,0.06)" : "transparent",
      borderRadius: bgEnabled ? px(borderRadius || 16) : undefined,
      backdropFilter: bgEnabled ? "blur(8px)" : undefined,
      border: bgEnabled ? "1px solid rgba(255,255,255,0.08)" : undefined,
    };

    innerContent = Array.isArray(links)
      ? links.map((link, idx) => (
          <a
            key={idx}
            href={link.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: dir === "column" ? "row" : "column",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: px(iconSize || 40),
                height: px(iconSize || 40),
                backgroundColor: (link.color || "#6366f1") + "20",
                border: `1px solid ${(link.color || "#6366f1")}40`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: px((iconSize || 40) * 0.5),
              }}
            >
              {link.icon || "🔗"}
            </div>
            {(showLabels ?? true) && (
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                {link.label}
              </span>
            )}
          </a>
        ))
      : null;
  }

  // 🎬 VideoEmbedBlock
  else if (blockName === "VideoEmbedBlock") {
    const vidSrc = videoUrl || url || src || "";
    const isYoutube = vidSrc.includes("youtube.com") || vidSrc.includes("youtu.be");
    const isMp4 = vidSrc.endsWith(".mp4") || vidSrc.endsWith(".webm");
    let finalSrc = vidSrc;
    if (isYoutube && !vidSrc.includes("embed")) {
      const videoId = vidSrc.split("v=")[1]?.split("&")[0] || vidSrc.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) finalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay || autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls === false ? 0 : 1}`;
    }
    innerContent = (
      <div style={{ width: "100%", minHeight: "150px", borderRadius: px(borderRadius) }}>
        {isMp4 ? (
          <video
            src={finalSrc}
            autoPlay={autoplay || autoPlay}
            loop={loop}
            muted={muted || autoplay || autoPlay}
            controls={controls !== false}
            style={{ width: "100%", height: "100%", objectFit: objectFit || "cover", borderRadius: px(borderRadius) }}
          />
        ) : (
          <iframe
            src={finalSrc}
            style={{ width: "100%", height: "100%", border: "none", borderRadius: px(borderRadius), minHeight: "200px" }}
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // 🃏 CardBlock
  else if (blockName === "CardBlock") {
    safeProps.style = {
      ...safeProps.style,
      display: "flex",
      flexDirection: "column",
      backgroundColor: bgColor || "rgba(255,255,255,0.05)",
      borderRadius: px(borderRadius || 16),
      padding: px(padding || 16),
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: bgBlur ? `blur(${bgBlur}px)` : undefined,
    };
    innerContent = (
      <>
        {showHeader !== false && (title || subtitle) && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: textColor || "#fff" }}>
              {headerIcon && <span>{headerIcon}</span>}
              <span>{title}</span>
            </div>
            {subtitle && <span style={{ fontSize: "0.85em", opacity: 0.8, color: textColor || "#fff" }}>{subtitle}</span>}
          </div>
        )}
        {childElements}
      </>
    );
  }

  // 📋 MenuBlock
  else if (blockName === "MenuBlock") {
    innerContent = (
      <>
        {title && (
          <div style={{ fontWeight: "bold", marginBottom: "10px", display: "flex", gap: "8px", color: titleColor || "#fff" }}>
            {titleIcon && <span>{titleIcon}</span>}
            <span style={{ fontSize: px(titleFontSize) }}>{title}</span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: layout === "list" ? "column" : "row", flexWrap: "wrap", gap: px(gap || 8) }}>
          {Array.isArray(items) &&
            items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: itemBgColor || "rgba(255,255,255,0.1)",
                  color: itemTextColor || "#fff",
                  padding: "8px 14px",
                  borderRadius: px(itemBorderRadius || 12),
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: px(itemFontSize),
                  cursor: "pointer",
                }}
              >
                {showItemEmoji !== false && item.emoji && <span>{item.emoji}</span>}
                <span>{item.label}</span>
              </div>
            ))}
        </div>
      </>
    );
  }

  // 🖼️ ImageBlock
  else if (blockName === "ImageBlock") {
    return (
      <img
        {...restProps}
        src={src || url || props?.src || props?.url}
        alt={props?.alt || "Conteúdo"}
        style={{
          ...baseStyle,
          maxWidth: "100%",
          objectFit: objectFit || "cover",
          borderRadius: px(borderRadius),
        }}
      />
    );
  }

  // 🔘 ButtonBlock
  else if (blockName === "ButtonBlock") {
    safeProps.style = {
      ...safeProps.style,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: px(gap || 8),
      border: "none",
      outline: "none",
    };
    innerContent = (
      <>
        {iconPosition !== "right" && icon && <span>{icon}</span>}
        {text && <span>{text}</span>}
        {iconPosition === "right" && icon && <span>{icon}</span>}
        {!icon && !text && childElements}
      </>
    );
  }

  // 📝 TextBlock / GradientTextBlock
  else if (blockName === "TextBlock" || blockName === "GradientTextBlock") {
    innerContent = text || childElements;
  }

  // 📦 ContainerBlock / CanvasDropArea — renderiza filhos
  else if (blockName === "ContainerBlock" || blockName === "CanvasDropArea") {
    safeProps.style = {
      ...safeProps.style,
      display: "flex",
      flexDirection: "column",
      gap: px(gap || 8),
    };
    innerContent = childElements;
  }

  // Fallback genérico
  else {
    innerContent = text || icon || childElements;
  }

  // Renderiza
  const tag = typeof TagName === "string" ? TagName.toLowerCase() : "div";
  if (tag === "p" || tag === "span" || tag === "h1" || tag === "h2") {
    return React.createElement(tag, safeProps, innerContent);
  }
  return React.createElement(tag, safeProps, innerContent);
};

// ─────────────────────────────────────────────
// 🚀 APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const { ui: initialUi } = useCMSConfig();
  const [liveUi, setLiveUi] = useState(null);

  // O worker de polling atualiza liveUi sem quebrar o estado do React
  useConfigPoller(liveUi || initialUi, setLiveUi);

  const ui = liveUi || initialUi;

  // Parse craft nodes
  const rawNodes = ui?.craft_nodes || ui?.craft_blocks || ui?.nodes || null;
  let craftNodes = rawNodes;
  if (typeof rawNodes === "string") {
    try { craftNodes = JSON.parse(rawNodes); } catch { craftNodes = null; }
  }
  const hasCraft = craftNodes && craftNodes["ROOT"];

  // Background
  let bgStyle = { backgroundColor: "#000000" };
  const bg = ui?.canvas?.background;
  if (bg?.type === "image" && bg?.image_url) {
    bgStyle = { backgroundImage: `url(${bg.image_url})`, backgroundSize: "cover", backgroundPosition: "center" };
  } else if (bg?.gradient) {
    bgStyle = { backgroundImage: bg.gradient };
  } else if (bg?.color) {
    bgStyle = { backgroundColor: bg.color };
  }

  const avatarOn = ui?.components?.avatar?.enabled !== false;
  const chatOn = ui?.components?.chat_interface?.enabled !== false;

  return (
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
        <div style={{ width: "100%", height: "100%" }}>
          {hasCraft ? (
            <CraftEngine nodes={craftNodes} nodeId="ROOT" />
          ) : (
            <div style={{ pointerEvents: "auto", height: "100%" }}>
              {chatOn && <ChatInterface />}
            </div>
          )}
        </div>
      </div>

      {/* 💬 CAMADA 3: Chat Interface (quando usando builder) */}
      {chatOn && hasCraft && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40, pointerEvents: "auto", width: "100%", maxWidth: "600px", padding: "0 20px" }}>
          <ChatInterface />
        </div>
      )}
    </div>
  );
}
