/**
 * ══════════════════════════════════════════════════════════════
 *  TOTEM LOCAL — App.jsx  (v4 — Free-Form Canvas)
 * ══════════════════════════════════════════════════════════════
 *  Renderizador de canvas livre (1080×1920) com posicionamento
 *  absoluto pixel-perfect. Substitui completamente o Craft.js.
 *
 *  Elementos suportados (16 tipos):
 *  ─ Conteúdo:  text, image, button, shape, icon
 *  ─ Mídia:     video, carousel, qrcode, social
 *  ─ Dados:     clock, weather, countdown
 *  ─ Interação: chat, map, iframe, store
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

// ─── Supabase client (live preview) ───────────
const _supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

// ─────────────────────────────────────────────
// 🔧 UTILITÁRIOS
// ─────────────────────────────────────────────
const px = (v) => (typeof v === "number" ? `${v}px` : v);

// Canvas reference resolution
const CANVAS_W = 1080;
const CANVAS_H = 1920;

// ─────────────────────────────────────────────
// 🔄 WORKER: Polling inteligente (15s)
// ─────────────────────────────────────────────
const POLL_INTERVAL = 15_000;

// ─────────────────────────────────────────────
// 📡 LIVE PREVIEW via Supabase Realtime
// ─────────────────────────────────────────────
function useLivePreview(deviceId, onLiveUpdate) {
  const [isLive, setIsLive] = useState(false);
  const onLiveUpdateRef = useRef(onLiveUpdate);
  useEffect(() => { onLiveUpdateRef.current = onLiveUpdate; }, [onLiveUpdate]);

  useEffect(() => {
    if (!deviceId) return;

    const channel = _supabase.channel(`live-preview:${deviceId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "ui-update" }, ({ payload }) => {
        // New format: free_canvas (replaces craft_blocks)
        if (payload?.free_canvas) {
          onLiveUpdateRef.current({ free_canvas: payload.free_canvas, _liveTs: payload.ts });
        }
        // Legacy fallback
        if (payload?.craft_blocks) {
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
  }, [deviceId]);

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
// 📦 VERSÕES DOS ARQUIVOS LOCAIS
// ─────────────────────────────────────────────
const LOCAL_FILE_VERSIONS = {
  "App.jsx": "4.8.0",
  "main.jsx": "1.0.0",
  "index.css": "1.1.0",
  "hooks/useSpeech.jsx": "2.2.0",
  "hooks/useCMSConfig.js": "1.2.0",
  "components/Avatar.jsx": "1.5.0",
  "components/ChatInterface.jsx": "1.3.0",
  "components/Scenario.jsx": "1.2.0",
};

// ─────────────────────────────────────────────
// 🔄 HEARTBEAT WORKER
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
// 🖼️ FREE CANVAS RENDERER — Renderiza elementos com posição absoluta
// Escala de 1080×1920 → tela real
// ─────────────────────────────────────────────
const FreeCanvasRenderer = React.memo(({ canvas }) => {
  if (!canvas || !canvas.elements || canvas.elements.length === 0) return null;

  const sortedElements = useMemo(() => {
    return [...canvas.elements]
      .filter(el => el.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [canvas.elements]);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      pointerEvents: "none",
    }}>
      {sortedElements.map(el => (
        <FreeCanvasElement key={el.id} element={el} />
      ))}
    </div>
  );
});

function FreeCanvasElement({ element }) {
  const { x, y, width, height, rotation, opacity, props, type } = element;

  // Convert pixel coords from 1080×1920 canvas to percentages
  const style = {
    position: "absolute",
    left: `${(x / CANVAS_W) * 100}%`,
    top: `${(y / CANVAS_H) * 100}%`,
    width: `${(width / CANVAS_W) * 100}%`,
    height: `${(height / CANVAS_H) * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    opacity: opacity ?? 1,
    zIndex: element.zIndex || 1,
    pointerEvents: type === "button" || type === "chat" || type === "social" || type === "qrcode" || type === "iframe" || type === "store" ? "auto" : "none",
    overflow: type === "social" ? "visible" : "hidden",
    borderRadius: props?.borderRadius ? px(props.borderRadius) : undefined,
  };

  return (
    <div style={style}>
      <ElementRenderer type={type} props={props || {}} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🎨 SOCIAL SVG ICONS — ícones de marca embutidos
// ─────────────────────────────────────────────
const SOCIAL_SVG_PATHS = {
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  telegram: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  email: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  website: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  maps: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  pinterest: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z",
  threads: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.19.408-2.285 1.33-3.082.88-.762 2.078-1.19 3.462-1.242 1.028-.038 1.98.065 2.86.275-.11-.58-.315-1.048-.608-1.394-.486-.573-1.264-.862-2.314-.862h-.05c-.802.007-1.532.241-2.11.677l-1.325-1.632c.868-.704 1.969-1.091 3.186-1.12h.079c1.588 0 2.823.528 3.672 1.563.72.874 1.14 2.044 1.265 3.502.469.163.907.374 1.306.634 1.078.703 1.893 1.673 2.36 2.808.737 1.794.829 4.58-1.263 6.622-1.89 1.844-4.207 2.648-7.508 2.672zM8.89 16.932c.052.947.608 1.775 2.086 2.478.717.124 1.378.164 1.985.13 1.022-.056 1.797-.434 2.373-1.15.425-.53.728-1.238.879-2.1-.997-.253-2.07-.376-3.178-.335-.977.036-1.754.296-2.318.768-.552.463-.844 1.12-.827 1.71v.5z",
  discord: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z",
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};

function SocialSVGIcon({ platform, size = 24, color = "#fff" }) {
  const d = SOCIAL_SVG_PATHS[platform];
  if (!d) return <span style={{ fontSize: size * 0.5 }}>🔗</span>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d={d} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// 🧱 ELEMENT RENDERER — renderiza cada tipo de elemento
// ─────────────────────────────────────────────
function ElementRenderer({ type, props: p }) {
  switch (type) {
    case "text":
      return (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center",
          padding: "2%",
          color: p.color || "#fff",
          fontSize: `clamp(12px, ${(p.fontSize || 24) / CANVAS_W * 100}vw, ${(p.fontSize || 24) * 1.5}px)`,
          fontWeight: p.fontWeight || "normal",
          textAlign: p.align || "left",
          fontFamily: p.fontFamily || "Inter, sans-serif",
          justifyContent: p.align === "center" ? "center" : p.align === "right" ? "flex-end" : "flex-start",
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}>
          {p.text || "Texto"}
        </div>
      );

    case "image":
      if (!p.src) {
        return (
          <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>🖼️</span>
          </div>
        );
      }
      return (
        <img
          src={p.src}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: p.fit || "cover",
            borderRadius: p.borderRadius || 0,
            pointerEvents: "none",
          }}
        />
      );

    case "button":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "2%" }}>
          <button
            type="button"
            onClick={() => {
              const action = p.action || p.label || "";
              if (action && typeof window.__totemSendMessage === "function") {
                window.__totemSendMessage(action);
              }
            }}
            style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: p.bgColor || "#6366f1",
              color: p.textColor || "#fff",
              fontSize: `clamp(12px, ${(p.fontSize || 18) / CANVAS_W * 100}vw, ${(p.fontSize || 18) * 1.5}px)`,
              fontWeight: "600",
              borderRadius: p.borderRadius ?? 999,
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "transform 0.15s",
            }}
          >
            {p.label || "Botão"}
          </button>
        </div>
      );

    case "shape":
      return (
        <div style={{
          width: "100%", height: "100%",
          background: p.fill || "#6366f1",
          borderRadius: p.shapeType === "circle" ? "50%" : (p.borderRadius || 0),
          border: p.borderWidth ? `${p.borderWidth}px solid ${p.borderColor || "transparent"}` : undefined,
        }} />
      );

    case "icon":
      return (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: p.color || "#fff",
          fontSize: `clamp(16px, ${(p.size || 48) / CANVAS_W * 100}vw, ${(p.size || 48) * 1.5}px)`,
        }}>
          {p.icon || "⭐"}
        </div>
      );

    case "video": {
      const vidSrc = p.url || "";
      if (!vidSrc) {
        return <PlaceholderBox emoji="🎬" label="Vídeo" />;
      }
      const isYt = vidSrc.includes("youtube.com") || vidSrc.includes("youtu.be");
      const isMp4 = vidSrc.endsWith(".mp4") || vidSrc.endsWith(".webm");
      let finalSrc = vidSrc;
      if (isYt && !vidSrc.includes("embed")) {
        const videoId = vidSrc.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1];
        if (videoId) finalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=${p.autoplay ? 1 : 0}&mute=${p.muted ? 1 : 0}&loop=${p.loop ? 1 : 0}`;
      }
      if (isMp4) {
        return <video src={finalSrc} autoPlay={!!p.autoplay} loop={!!p.loop} muted={!!p.muted || !!p.autoplay} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
      }
      return (
        <iframe src={finalSrc} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; encrypted-media" allowFullScreen />
      );
    }

    case "qrcode": {
      const qrContent = p.value || "https://example.com";
      const cleanFg = (p.fgColor || "#ffffff").replace("#", "");
      const cleanBg = !p.bgColor || p.bgColor === "transparent" ? "000000" : p.bgColor.replace("#", "");
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}&color=${cleanFg}&bgcolor=${cleanBg}`;
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "4%" }}>
          <img src={qrUrl} alt="QR Code" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
        </div>
      );
    }

    case "map": {
      const mLat = p.lat ?? -23.5505;
      const mLng = p.lng ?? -46.6333;
      const mZoom = p.zoom ?? 15;
      const mRadius = p.borderRadius ?? 12;
      const mLabel = p.label || "";
      const mLabelColor = p.labelColor || "#ffffff";
      const mLabelSize = p.labelSize || 14;
      const span = 0.01 / (mZoom / 15);
      const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mLng - span},${mLat - span * 0.6},${mLng + span},${mLat + span * 0.6}&layer=mapnik&marker=${mLat},${mLng}`;
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: mRadius }}>
          <iframe
            src={mapSrc}
            title="Mapa"
            style={{ flex: 1, width: "100%", border: "none", pointerEvents: "auto" }}
          />
          {mLabel && (
            <div style={{ flexShrink: 0, padding: "4px 8px", textAlign: "center", background: "rgba(0,0,0,0.6)" }}>
              <span style={{ color: mLabelColor, fontSize: `clamp(10px, ${mLabelSize / CANVAS_W * 100}vw, ${mLabelSize * 1.5}px)`, fontWeight: 500 }}>{mLabel}</span>
            </div>
          )}
        </div>
      );
    }

    case "social": {
      const links = p.links || [];
      const layout = p.layout || "horizontal";
      const iconSize = p.iconSize || 36;
      const gap = p.gap || 16;
      const showLabels = p.showLabels !== false;
      const bgEnabled = p.bgEnabled || false;
      const bgColor = p.bgColor || "rgba(0,0,0,0.3)";
      const borderRadius = p.borderRadius || 16;
      const padding = p.padding || 12;
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
          <style>{`
            @keyframes social-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
            .social-btn:hover .social-circle { animation: social-pulse 0.6s ease-in-out; box-shadow: 0 0 16px var(--glow); }
            .social-btn:hover { transform: scale(1.12); }
            .social-btn:active { transform: scale(0.95); }
            .social-btn { transition: transform 0.2s ease; }
          `}</style>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap",
            flexDirection: layout === "vertical" ? "column" : "row",
            gap, padding,
            backgroundColor: bgEnabled ? bgColor : "transparent",
            borderRadius: bgEnabled ? borderRadius : 0,
            backdropFilter: bgEnabled ? "blur(8px)" : undefined,
            border: bgEnabled ? "1px solid rgba(255,255,255,0.08)" : undefined,
          }}>
            {links.map((l, i) => {
              const color = l.color || "#6366f1";
              return (
                <button key={l.id || i} className="social-btn" type="button"
                  onClick={() => {
                    const url = l.url || "";
                    if (url && url !== "#") {
                      if (typeof window.__totemOpenUrl === "function") window.__totemOpenUrl(url);
                      else window.open(url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    display: "flex", alignItems: "center",
                    flexDirection: layout === "vertical" ? "row" : "column",
                    gap: showLabels ? 4 : 0, "--glow": color + "66",
                  }}>
                  <div className="social-circle" style={{
                    width: iconSize, height: iconSize,
                    backgroundColor: color + "22", border: `1.5px solid ${color}44`,
                    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    <SocialSVGIcon platform={l.platform || l.label?.toLowerCase() || ""} size={iconSize * 0.55} color={color} />
                  </div>
                  {showLabels && <span style={{ fontSize: Math.max(9, iconSize * 0.28), color: "rgba(255,255,255,0.65)", fontWeight: 500, textAlign: "center" }}>{l.label || l.platform}</span>}
                </button>
              );
            })}
            {links.length === 0 && <span style={{ opacity: 0.4, fontSize: 24 }}>🔗</span>}
          </div>
        </div>
      );
    }

    case "chat":
      return <PlaceholderBox emoji="💬" label="Chat IA" />;

    case "avatar":
      return <AvatarCanvasElement props={p} />;

    case "clock":
      return <LiveClock color={p.color} fontSize={p.fontSize} />;

    case "weather":
      return <PlaceholderBox emoji="🌤️" label={`Clima: ${p.city || "São Paulo"}`} />;

    case "countdown":
      return <LiveCountdown targetDate={p.targetDate} label={p.label} color={p.color} fontSize={p.fontSize} />;

    case "iframe": {
      const url = p.url || "";
      if (!url) return <PlaceholderBox emoji="🌐" label="Iframe — configure a URL" />;
      return <ScaledIframe url={url} scrolling={p.scrolling} borderRadius={p.borderRadius} />;
    }

    case "carousel":
      return <LiveCarousel images={p.images} autoplay={p.autoplay} interval={p.interval} transition={p.transition} borderRadius={p.borderRadius} objectFit={p.objectFit} />;

    case "store":
      return <StoreDirectory props={p} />;

    default:
      return <PlaceholderBox emoji="❓" label={type} />;
  }
}

// ─────────────────────────────────────────────
// 🔲 PLACEHOLDER BOX
// ─────────────────────────────────────────────
function PlaceholderBox({ emoji, label }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 8,
      background: "rgba(255,255,255,0.04)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🏬 STORE DIRECTORY — Diretório de lojas (shopping)
// ─────────────────────────────────────────────
function StoreDirectory({ props: p }) {
  const stores = p.stores || [];
  const title = p.title || "Lojas";
  const titleColor = p.titleColor || "#ffffff";
  const titleSize = p.titleSize || 28;
  const bgColor = p.bgColor || "rgba(0,0,0,0.6)";
  const borderRadius = p.borderRadius || 16;
  const columns = p.columns || 1;
  const gap = p.gap || 12;
  const cardBgColor = p.cardBgColor || "rgba(255,255,255,0.08)";
  const cardBorderRadius = p.cardBorderRadius || 12;
  const accentColor = p.accentColor || "#6366f1";
  const showCategory = p.showCategory !== false;
  const showHours = p.showHours !== false;
  const showPhone = p.showPhone !== false;
  const showFloor = p.showFloor !== false;

  if (stores.length === 0) {
    return <PlaceholderBox emoji="🏬" label="Diretório de Lojas" />;
  }

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      background: bgColor,
      borderRadius,
      padding: 16,
    }}>
      {/* Title */}
      <div style={{ flexShrink: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 24, borderRadius: 2, background: accentColor }} />
        <span style={{
          color: titleColor,
          fontSize: `clamp(16px, ${titleSize / CANVAS_W * 100}vw, ${titleSize * 1.5}px)`,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}>{title}</span>
      </div>

      {/* Store cards — scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        alignContent: "start",
      }}>
        {stores.map((store, idx) => (
          <div key={store.id || idx} style={{
            display: "flex", gap: 12, padding: 12,
            background: cardBgColor,
            borderRadius: cardBorderRadius,
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "background 0.2s",
          }}>
            {/* Logo */}
            <div style={{
              flexShrink: 0, width: 48, height: 48,
              borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              overflow: "hidden",
              background: accentColor + "22",
              border: `1px solid ${accentColor}33`,
            }}>
              {store.logo ? (
                <img src={store.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 20 }}>🏪</span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: "#fff", fontWeight: 600,
                fontSize: `clamp(11px, ${14 / CANVAS_W * 100}vw, 18px)`,
                lineHeight: 1.2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{store.name || "Loja"}</div>

              {store.description && (
                <div style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: `clamp(9px, ${10 / CANVAS_W * 100}vw, 14px)`,
                  marginTop: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>{store.description}</div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 6 }}>
                {showFloor && store.floor && (
                  <span style={{ fontSize: `clamp(8px, ${10 / CANVAS_W * 100}vw, 13px)`, color: "rgba(255,255,255,0.6)" }}>
                    📍 {store.floor}
                  </span>
                )}
                {showCategory && store.category && (
                  <span style={{ fontSize: `clamp(8px, ${10 / CANVAS_W * 100}vw, 13px)`, color: accentColor }}>
                    🏷️ {store.category}
                  </span>
                )}
                {showHours && store.hours && (
                  <span style={{ fontSize: `clamp(8px, ${10 / CANVAS_W * 100}vw, 13px)`, color: "rgba(255,255,255,0.6)" }}>
                    🕐 {store.hours}
                  </span>
                )}
                {showPhone && store.phone && (
                  <span style={{ fontSize: `clamp(8px, ${10 / CANVAS_W * 100}vw, 13px)`, color: "rgba(255,255,255,0.6)" }}>
                    📞 {store.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🤖 AVATAR 3D CANVAS ELEMENT — renderiza o avatar dentro do elemento do canvas
// ─────────────────────────────────────────────
function AvatarCanvasElement({ props: p }) {
  // frameY: -100..100 → vertical pan (neg=up, pos=down)
  // frameZoom: 10..100 → distance (10=far, 100=close)
  const frameY = p.frameY ?? 0;
  const frameZoom = p.frameZoom ?? 50;

  // Map frameZoom 10..100 → camera Z distance 8..2
  const camZ = 8 - (frameZoom / 100) * 6;
  // Base camera at avatar mid-height (1.5), frameY shifts ±1.5
  const camY = 1.5 + (frameY / 100) * 1.5;
  const targetY = 1.0 + (frameY / 100) * 1.2;

  return (
    <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <Canvas shadows camera={{ position: [0, camY, camZ], fov: 30 }} gl={{ preserveDrawingBuffer: true }} style={{ width: "100%", height: "100%" }}>
        <Scenario uiOverride={{
          components: {
            avatar: {
              enabled: true,
              position: "center",
              scale: p.scale || 1.5,
              animation: p.animation || "idle",
              colors: p.colors || { shirt: "#1E3A8A", pants: "#1F2937", shoes: "#000000" },
              models: {
                avatar_url: p.avatarUrl || "/models/avatar.glb",
                animations_url: p.animationsUrl || "/models/animations.glb",
              },
              animations: { idle: "Idle", talking: "TalkingOne" },
              materials: { roughness: 0.5, metalness: 0.0 },
            },
          },
          canvas: {
            camera: {
              initial_look_at: {
                position: [0, camY, camZ],
                target: [0, targetY, 0],
                smooth: false,
              },
              controls: {
                minDistance: camZ,
                maxDistance: camZ,
                minPolarAngle: Math.PI / 2,
                maxPolarAngle: Math.PI / 2,
              },
            },
          },
        }} />
      </Canvas>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🌐 SCALED IFRAME — Renderiza site completo escalado para caber no elemento
// ─────────────────────────────────────────────
function ScaledIframe({ url, scrolling, borderRadius }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState({ sx: 1, sy: 1 });
  const VIRTUAL_W = 1280;
  const VIRTUAL_H = 960;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setScale({ sx: rect.width / VIRTUAL_W, sy: rect.height / VIRTUAL_H });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      borderRadius: borderRadius || 0,
      background: "#fff",
    }}>
      <iframe
        src={url}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: VIRTUAL_W + "px",
          height: VIRTUAL_H + "px",
          border: "none",
          pointerEvents: "auto",
          transformOrigin: "0 0",
          transform: `scale(${scale.sx}, ${scale.sy})`,
        }}
        scrolling={scrolling === false ? "no" : "yes"}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="lazy"
        title="Iframe embed"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🎠 LIVE CAROUSEL — Carrossel de imagens funcional
// ─────────────────────────────────────────────
function LiveCarousel({ images = [], autoplay = true, interval = 5, transition = "fade", borderRadius = 0, objectFit = "contain" }) {
  const [current, setCurrent] = useState(0);
  const filtered = useMemo(() => (images || []).filter(Boolean), [images]);
  const len = filtered.length;

  useEffect(() => {
    if (!autoplay || len <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % len);
    }, (interval || 5) * 1000);
    return () => clearInterval(id);
  }, [autoplay, interval, len]);

  useEffect(() => {
    if (current >= len) setCurrent(0);
  }, [len, current]);

  if (len === 0) {
    return <PlaceholderBox emoji="🎠" label="Carrossel" />;
  }

  const isFade = transition !== "slide";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius }}>
      {filtered.map((src, i) => {
        const fit = objectFit || "contain";
        const isContain = fit === "contain";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isFade ? (i === current ? 1 : 0) : 1,
              transform: !isFade ? `translateX(${(i - current) * 100}%)` : undefined,
              transition: "opacity 0.8s ease, transform 0.6s ease",
              pointerEvents: "none",
            }}
          >
            <img
              src={src}
              alt=""
              style={isContain ? {
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                objectPosition: "center",
              } : {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        );
      })}
      {/* Dots indicator */}
      {len > 1 && (
        <div style={{
          position: "absolute", bottom: 12, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 6, zIndex: 10,
        }}>
          {filtered.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
const LiveClock = React.memo(({ color, fontSize }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: color || "#fff",
      fontSize: `clamp(16px, ${(fontSize || 36) / CANVAS_W * 100}vw, ${(fontSize || 36) * 1.5}px)`,
      fontFamily: "monospace",
      fontWeight: "bold",
    }}>
      {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
});

// ─────────────────────────────────────────────
// ⏱️ LIVE COUNTDOWN
// ─────────────────────────────────────────────
const LiveCountdown = React.memo(({ targetDate, label, color, fontSize }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = targetDate ? Math.max(0, new Date(targetDate).getTime() - now.getTime()) : 0;
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const fs = fontSize || 28;

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 4,
      color: color || "#fff",
    }}>
      {label && <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 600, textTransform: "uppercase" }}>{label}</span>}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        fontSize: `clamp(14px, ${fs / CANVAS_W * 100}vw, ${fs * 1.5}px)`,
        fontFamily: "monospace", fontWeight: "bold",
      }}>
        {days > 0 && <span>{days}d</span>}
        <span>{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────
// 🎨 CSS GLOBAL
// ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    @keyframes kiosk-breathe {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.55), 0 8px 40px rgba(0,0,0,0.45); transform: scale(1); }
      50%        { box-shadow: 0 0 0 18px rgba(99,102,241,0),  0 8px 40px rgba(0,0,0,0.45); transform: scale(1.025); }
    }

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

    @keyframes live-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; overflow: hidden; }
  `}</style>
);

// ─────────────────────────────────────────────
// 🌙 IDLE SCREEN
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
  const [phase, setPhase] = React.useState("hidden");

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
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {IDLE_PARTICLES.map(p => (
          <div key={p.id} style={{
            position: "absolute", bottom: "10%", left: p.x,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            '--dx': p.dx,
            animation: `idle-particle-up ${p.dur} ${p.delay} ease-out infinite`,
          }} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <div key={`s${i}`} style={{
            position: "absolute",
            top: `${5 + (i * 61 % 80)}%`, left: `${(i * 71 % 90) + 5}%`,
            width: 2 + (i % 2), height: 2 + (i % 2), borderRadius: "50%",
            background: i % 2 === 0 ? "rgba(255,255,255,0.9)" : "rgba(139,92,246,0.8)",
            animation: `idle-star-twinkle ${1.5 + (i * 0.3) % 2}s ${(i * 0.4) % 2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {[0, 0.7, 1.4].map((delay, i) => (
        <div key={i} style={{
          position: "absolute", width: 220, height: 220, borderRadius: "50%",
          border: "1.5px solid rgba(139,92,246,0.5)",
          animation: `idle-ring-expand 3s ${delay}s ease-out infinite`,
        }} />
      ))}

      <div style={{ fontSize: "clamp(52px, 8vw, 80px)", animation: "idle-float 3.5s ease-in-out infinite", marginBottom: 24, filter: "drop-shadow(0 0 24px rgba(139,92,246,0.8))" }}>
        👋
      </div>
      <div style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 800, color: "#ffffff", textAlign: "center", lineHeight: 1.15, animation: "idle-text-pulse 2.8s ease-in-out infinite", marginBottom: 16, padding: "0 32px" }}>
        Toque para começar
      </div>
      <div style={{ fontSize: "clamp(14px, 1.8vw, 20px)", color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "0 40px", maxWidth: 480 }}>
        Estou aqui para ajudar você
      </div>
      <div style={{ position: "absolute", bottom: 48, fontSize: "clamp(11px, 1.2vw, 14px)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
    };
  }, [reset]);

  return { isIdle, wake: reset };
}

// ─────────────────────────────────────────────
// 🔔 TOAST: Notificação de atualização
// ─────────────────────────────────────────────
function UpdateToast({ visible }) {
  const [phase, setPhase] = React.useState("idle");

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
        minWidth: 260, pointerEvents: "none", userSelect: "none",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
        border: "1px solid rgba(99,102,241,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>🔄</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
          Configuração atualizada
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "0.01em" }}>
          Interface sincronizada
        </div>
        <div style={{ height: 2, borderRadius: 999, marginTop: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", animation: "toast-progress 3s linear forwards" }} />
        </div>
      </div>
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
// 🚀 APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const { ui: initialUi } = useCMSConfig();
  const [liveUi, setLiveUi] = useState(null);
  const [toastKey, setToastKey] = useState(0);
  const { isIdle, wake } = useIdleDetection(IDLE_TIMEOUT_MS);

  // ── SpeechProvider ──
  let speechCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    speechCtx = useSpeech();
  } catch (_) {}

  // ── Registra handlers globais do bridge Totem ──
  useEffect(() => {
    window.__totemSendMessage = (msg) => {
      if (speechCtx?.sendMessage) {
        speechCtx.sendMessage(msg);
      } else {
        console.info("[Totem] 💬 __totemSendMessage (sem SpeechProvider):", msg);
      }
    };

    if (typeof window.__totemSpeak !== "function") {
      window.__totemSpeak = (text, options) => {
        if (window.speechSynthesis) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = options?.lang || import.meta.env.VITE_TTS_LANG || "pt-BR";
          window.speechSynthesis.speak(utter);
        }
      };
    }

    if (typeof window.__totemOpenUrl !== "function") {
      window.__totemOpenUrl = (url) => {
        if (!url || url === "#") return;
        if (window.electronAPI?.openExternal) { window.electronAPI.openExternal(url); return; }
        try {
          const { shell } = window.require?.("electron") || {};
          if (shell?.openExternal) { shell.openExternal(url); return; }
        } catch (_) {}
        window.open(url, "_blank", "noopener,noreferrer");
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechCtx?.sendMessage]);

  const deviceId = import.meta.env.VITE_TOTEM_DEVICE_ID || null;

  const handleConfigUpdate = useCallback((newUi) => {
    setLiveUi(newUi);
    setToastKey(k => k + 1);
  }, []);

  const handleLiveUpdate = useCallback((newUi) => {
    setLiveUi(newUi);
  }, []);

  useConfigPoller(handleConfigUpdate);
  useHeartbeat();
  const isLive = useLivePreview(deviceId, handleLiveUpdate);

  const ui = liveUi || initialUi;

  // ── Parse free_canvas ──
  const freeCanvas = useMemo(() => {
    const raw = ui?.free_canvas || null;
    if (!raw) return null;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
  }, [ui]);

  const hasFreeCanvas = freeCanvas && Array.isArray(freeCanvas.elements) && freeCanvas.elements.length > 0;

  // Background
  const bgStyle = useMemo(() => {
    // Free canvas background color
    if (hasFreeCanvas && freeCanvas.bgColor) {
      return { backgroundColor: freeCanvas.bgColor };
    }
    const bg = ui?.canvas?.background;
    if (bg?.type === "image" && bg?.image_url) {
      return { backgroundImage: `url(${bg.image_url})`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    if (bg?.gradient) return { backgroundImage: bg.gradient };
    if (bg?.color) return { backgroundColor: bg.color };
    return { background: "linear-gradient(160deg, #050a18 0%, #0c1630 60%, #0a0e1f 100%)" };
  }, [ui, freeCanvas, hasFreeCanvas]);

  // Avatar is now rendered as a free canvas element (type: 'avatar')
  // No longer a fixed background layer


  return (
    <>
      <GlobalStyles />
      <div
        style={{
          width: "100vw", height: "100vh", position: "relative", overflow: "hidden",
          userSelect: "none",
          ...bgStyle,
        }}
      >
        <Loader />
        <Leva collapsed hidden />

        {/* 🖼️ Free Canvas — todos os elementos (incluindo avatar 3D) */}
        {hasFreeCanvas && (
          <div style={{ position: "absolute", inset: 0, zIndex: 30 }}>
            <FreeCanvasRenderer canvas={freeCanvas} />
          </div>
        )}

        {/* 💬 Chat Interface fallback (quando não há free_canvas) */}
        {!hasFreeCanvas && (
          <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto", height: "100%" }}>
              <ChatInterface uiConfig={ui?.components?.chat_interface || null} />
            </div>
          </div>
        )}
      </div>

      {/* 🔔 Toast de atualização */}
      <UpdateToast key={toastKey} visible={toastKey > 0} />

      {/* 📡 Badge "Ao Vivo" */}
      {isLive && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 999,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          color: "#fca5a5", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          boxShadow: "0 0 16px rgba(239,68,68,0.2)",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: "#ef4444",
            animation: "live-pulse 1.2s ease-in-out infinite",
            display: "inline-block", boxShadow: "0 0 6px #ef4444",
          }} />
          Ao Vivo
        </div>
      )}

      {/* 🌙 Tela idle */}
      <IdleScreen visible={isIdle} onWake={wake} />
    </>
  );
}
