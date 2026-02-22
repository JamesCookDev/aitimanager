import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import QRCode from 'qrcode';
import type { CanvasElement } from '../../types/canvas';
import { MapPin, Image as ImageIcon, Play, QrCode, MessageSquare, Clock, CloudSun, Timer, Globe, Share2, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { SocialIcon } from '@/editor/shared/socialIcons';

interface Props {
  element: CanvasElement;
}

export function ElementRenderer({ element }: Props) {
  switch (element.type) {
    case 'text':
      return <TextRenderer {...element.props} />;
    case 'image':
      return <ImageRenderer {...element.props} />;
    case 'button':
      return <ButtonRenderer {...element.props} />;
    case 'shape':
      return <ShapeRenderer {...element.props} />;
    case 'icon':
      return <IconRenderer {...element.props} />;
    case 'video':
      return <VideoRenderer {...element.props} />;
    case 'qrcode':
      return <QRPlaceholder {...element.props} />;
    case 'map':
      return <MapPlaceholder {...element.props} />;
    case 'social':
      return <SocialRenderer {...element.props} />;
    case 'chat':
      return <ChatPlaceholder {...element.props} />;
    case 'clock':
      return <ClockRenderer {...element.props} />;
    case 'weather':
      return <WeatherPlaceholder {...element.props} />;
    case 'countdown':
      return <CountdownPlaceholder {...element.props} />;
    case 'iframe':
      return <IframePlaceholder {...element.props} />;
    case 'carousel':
      return <CarouselRenderer {...element.props} />;
    case 'avatar':
      return <AvatarRenderer {...element.props} />;
    case 'store':
      return <StoreRenderer {...element.props} />;
    default:
      return <div className="w-full h-full bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">?</div>;
  }
}

/* ── Individual renderers ────────────────────── */

function TextRenderer(props: any) {
  return (
    <div
      className="w-full h-full flex items-center p-2 select-none"
      style={{
        color: props.color || '#fff',
        fontSize: props.fontSize || 24,
        fontWeight: props.fontWeight || 'normal',
        textAlign: props.align || 'left',
        fontFamily: props.fontFamily || 'Inter',
        justifyContent: props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start',
        lineHeight: 1.2,
      }}
    >
      {props.text || 'Texto'}
    </div>
  );
}

function ImageRenderer(props: any) {
  if (!props.src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center gap-2">
        <ImageIcon className="w-8 h-8 text-slate-500" />
        <span className="text-[11px] text-slate-500">Arraste uma imagem</span>
      </div>
    );
  }
  return (
    <img
      src={props.src}
      alt=""
      className="w-full h-full pointer-events-none select-none"
      style={{ objectFit: props.fit || 'cover', borderRadius: props.borderRadius || 0 }}
    />
  );
}

function ButtonRenderer(props: any) {
  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      <button
        className="w-full h-full flex items-center justify-center gap-2 transition-transform select-none font-semibold"
        style={{
          background: props.bgColor || '#6366f1',
          color: props.textColor || '#fff',
          fontSize: props.fontSize || 18,
          borderRadius: props.borderRadius ?? 999,
          letterSpacing: '-0.01em',
        }}
      >
        {props.label || 'Botão'}
      </button>
    </div>
  );
}

function ShapeRenderer(props: any) {
  return (
    <div
      className="w-full h-full"
      style={{
        background: props.fill || '#6366f1',
        borderRadius: props.shapeType === 'circle' ? '50%' : (props.borderRadius || 0),
        border: props.borderWidth ? `${props.borderWidth}px solid ${props.borderColor || 'transparent'}` : undefined,
      }}
    />
  );
}

function IconRenderer(props: any) {
  return (
    <div className="w-full h-full flex items-center justify-center select-none" style={{ color: props.color || '#fff' }}>
      <span style={{ fontSize: props.size || 48 }}>{props.icon || '⭐'}</span>
    </div>
  );
}

function Placeholder({ icon: Icon, label, gradient }: { icon: any; label: string; gradient: string }) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${gradient} rounded-lg`}>
      <Icon className="w-8 h-8 text-white/60" />
      <span className="text-[11px] text-white/50 font-medium">{label}</span>
    </div>
  );
}

function getVideoEmbedUrl(url: string, autoplay: boolean, muted: boolean, loop: boolean): string | null {
  try {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
    if (ytMatch) {
      const p = new URLSearchParams();
      if (autoplay) p.set('autoplay', '1');
      if (muted) p.set('mute', '1');
      if (loop) { p.set('loop', '1'); p.set('playlist', ytMatch[1]); }
      p.set('controls', '0');
      p.set('modestbranding', '1');
      return `https://www.youtube.com/embed/${ytMatch[1]}?${p.toString()}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const p = new URLSearchParams();
      if (autoplay) p.set('autoplay', '1');
      if (muted) p.set('muted', '1');
      if (loop) p.set('loop', '1');
      p.set('controls', '0');
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${p.toString()}`;
    }
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) return url;
    if (url.includes('embed')) return url;
  } catch {}
  return null;
}

function VideoRenderer(props: any) {
  const url = props.url || '';
  if (!url) {
    return <Placeholder icon={Play} label="Cole uma URL de vídeo" gradient="bg-gradient-to-br from-purple-900/80 to-indigo-900/80" />;
  }

  const embedUrl = getVideoEmbedUrl(url, props.autoplay !== false, props.muted !== false, props.loop !== false);
  const isDirectVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');

  if (isDirectVideo || (embedUrl && (embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm')))) {
    return (
      <video
        src={embedUrl || url}
        autoPlay={props.autoplay !== false}
        muted={props.muted !== false}
        loop={props.loop !== false}
        playsInline
        className="w-full h-full object-cover pointer-events-none"
        style={{ borderRadius: props.borderRadius || 0 }}
      />
    );
  }

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full border-none pointer-events-none"
        style={{ borderRadius: props.borderRadius || 0 }}
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
      />
    );
  }

  return <Placeholder icon={Play} label="URL inválida" gradient="bg-gradient-to-br from-red-900/80 to-purple-900/80" />;
}

function QRPlaceholder(props: any) {
  const value = props.value || '';
  const fgColor = props.fgColor || '#ffffff';
  const bgColor = !props.bgColor || props.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : props.bgColor;
  const ecLevel = props.errorCorrectionLevel || 'M';
  const margin = props.margin ?? 1;
  const label = props.label || '';
  const labelColor = props.labelColor || '#ffffff';
  const labelSize = props.labelSize || 14;
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) { setDataUrl(null); return; }
    QRCode.toDataURL(value, {
      width: 512,
      margin,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel as any,
    }).then(setDataUrl).catch(() => setDataUrl(null));
  }, [value, fgColor, bgColor, ecLevel, margin]);

  if (!value || !dataUrl) {
    return <Placeholder icon={QrCode} label="Configure a URL" gradient="bg-gradient-to-br from-slate-800 to-slate-900" />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-[6%] gap-[4%]">
      <img src={dataUrl} alt="QR Code" className="max-w-full max-h-full object-contain flex-1" style={{ imageRendering: 'pixelated' }} />
      {label && <span style={{ color: labelColor, fontSize: labelSize, fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>}
    </div>
  );
}

function MapPlaceholder(props: any) {
  const lat = props.lat ?? -23.5505;
  const lng = props.lng ?? -46.6333;
  const zoom = props.zoom ?? 15;
  const borderRadius = props.borderRadius ?? 12;
  const label = props.label || '';
  const labelColor = props.labelColor || '#ffffff';
  const labelSize = props.labelSize || 14;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01 / (zoom / 15)},${lat - 0.006 / (zoom / 15)},${lng + 0.01 / (zoom / 15)},${lat + 0.006 / (zoom / 15)}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ borderRadius }}>
      <iframe
        src={src}
        className="flex-1 w-full border-0"
        style={{ pointerEvents: 'none' }}
        title="Mapa"
      />
      {label && (
        <div className="flex-shrink-0 px-2 py-1 text-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <span style={{ color: labelColor, fontSize: labelSize, fontWeight: 500 }}>{label}</span>
        </div>
      )}
    </div>
  );
}

function ChatPlaceholder(_props: any) {
  return <Placeholder icon={MessageSquare} label="Chat IA" gradient="bg-gradient-to-br from-blue-900/80 to-cyan-900/80" />;
}

function WeatherPlaceholder(_props: any) {
  return <Placeholder icon={CloudSun} label="Clima" gradient="bg-gradient-to-br from-sky-900/80 to-blue-900/80" />;
}

function CountdownPlaceholder(_props: any) {
  return <Placeholder icon={Timer} label="Contagem Regressiva" gradient="bg-gradient-to-br from-orange-900/80 to-red-900/80" />;
}

function IframePlaceholder(props: any) {
  const url = props.url || '';
  if (!url) {
    return <Placeholder icon={Globe} label="Cole a URL do site" gradient="bg-gradient-to-br from-gray-800 to-gray-900" />;
  }
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ borderRadius: props.borderRadius || 0 }}>
      <iframe
        src={url}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
        title="Iframe embed"
      />
      {/* Overlay to prevent interaction in editor */}
      <div className="absolute inset-0" />
    </div>
  );
}

function CarouselRenderer(props: any) {
  const images: string[] = (props.images || []).filter((s: string) => !!s);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplay = props.autoplay !== false;
  const interval = (props.interval || 5) * 1000;
  const transition = props.transition || 'fade';

  const next = useCallback(() => {
    if (images.length <= 1) return;
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    intervalRef.current = setInterval(next, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoplay, interval, next, images.length]);

  // Reset index if images change
  useEffect(() => {
    if (current >= images.length) setCurrent(0);
  }, [images.length, current]);

  if (images.length === 0) {
    return <Placeholder icon={ImageIcon} label="Adicione imagens ao carrossel" gradient="bg-gradient-to-br from-pink-900/80 to-rose-900/80" />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden select-none" style={{ borderRadius: props.borderRadius || 0 }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectFit: props.objectFit || 'contain',
            opacity: transition === 'fade' ? (i === current ? 1 : 0) : 1,
            transform: transition === 'slide' ? `translateX(${(i - current) * 100}%)` : undefined,
            transition: 'opacity 0.6s ease, transform 0.5s ease',
          }}
        />
      ))}
      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-1 transition-colors z-10">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-1 transition-colors z-10">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClockRenderer(props: any) {
  return (
    <div
      className="w-full h-full flex items-center justify-center select-none font-mono"
      style={{ color: props.color || '#fff', fontSize: props.fontSize || 36 }}
    >
      {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
}

function SocialRenderer(props: any) {
  const links = props.links || [];
  const layout = props.layout || 'horizontal';
  const iconSize = props.iconSize || 36;
  const gap = props.gap || 16;
  const showLabels = props.showLabels !== false;
  const bgEnabled = props.bgEnabled || false;
  const bgColor = props.bgColor || 'rgba(0,0,0,0.3)';
  const borderRadius = props.borderRadius || 16;
  const padding = props.padding || 12;

  if (links.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Share2 className="w-8 h-8 text-white/30" />
        <span className="text-white/30 text-xs ml-2">Adicione redes sociais</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ padding: 4 }}>
      <style>{`
        @keyframes social-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .social-icon-btn:hover .social-icon-circle { animation: social-pulse 0.6s ease-in-out; box-shadow: 0 0 16px var(--glow-color); }
        .social-icon-btn:hover { transform: scale(1.12); }
        .social-icon-btn:active { transform: scale(0.95); }
        .social-icon-btn { transition: transform 0.2s ease; }
      `}</style>
      <div className="flex items-center justify-center" style={{
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap, padding,
        backgroundColor: bgEnabled ? bgColor : 'transparent',
        borderRadius: bgEnabled ? borderRadius : 0,
        backdropFilter: bgEnabled ? 'blur(8px)' : undefined,
        border: bgEnabled ? '1px solid rgba(255,255,255,0.08)' : undefined,
        flexWrap: 'wrap',
      }}>
        {links.map((link: any) => {
          const color = link.color || '#6366f1';
          return (
            <div key={link.id || link.platform} className="social-icon-btn flex items-center cursor-pointer"
              style={{ flexDirection: layout === 'vertical' ? 'row' : 'column', gap: showLabels ? 4 : 0, '--glow-color': color + '66' } as any}>
              <div className="social-icon-circle flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: iconSize, height: iconSize,
                  backgroundColor: color + '22',
                  border: `1.5px solid ${color}44`,
                }}>
                <SocialIconInline platform={link.platform} size={iconSize} color={color} />
              </div>
              {showLabels && (
                <span style={{ fontSize: Math.max(9, iconSize * 0.28), color: 'rgba(255,255,255,0.65)', fontWeight: 500, textAlign: 'center' }}>
                  {link.label || link.platform}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SocialIconInline({ platform, size, color }: { platform: string; size: number; color: string }) {
  return <SocialIcon platform={platform} size={size} color={color} />;
}

function AvatarRenderer(props: any) {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#0f3460' }}>
      {/* Sparkle dots */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3, height: 3,
            background: 'rgba(74,144,255,0.5)',
            left: `${12 + i * 22}%`,
            top: `${25 + (i % 3) * 22}%`,
            animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Scene SVG — fills the entire element, scales with it */}
      <svg
        viewBox="0 0 200 380"
        className="w-full h-full absolute inset-0"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Sky background */}
        <rect x="0" y="0" width="200" height="380" fill="#0f3460" />

        {/* Floor */}
        <rect x="0" y="280" width="200" height="100" fill="#4a5568" />
        <rect x="0" y="280" width="200" height="6" fill="rgba(255,255,255,0.06)" />

        {/* Shadow under avatar */}
        <ellipse cx="100" cy="283" rx="35" ry="6" fill="rgba(0,0,0,0.35)" />

        {/* Head - skin */}
        <circle cx="100" cy="48" r="24" fill="#d4a088" />
        {/* Hair */}
        <ellipse cx="100" cy="34" rx="22" ry="16" fill="#8B4513" />
        <ellipse cx="100" cy="40" rx="20" ry="10" fill="#8B4513" opacity="0.6" />
        {/* Eyes */}
        <circle cx="92" cy="50" r="2.5" fill="#2d3748" />
        <circle cx="108" cy="50" r="2.5" fill="#2d3748" />
        <circle cx="93" cy="49" r="0.8" fill="white" />
        <circle cx="109" cy="49" r="0.8" fill="white" />
        {/* Nose & Mouth */}
        <path d="M97 55 Q100 58 103 55" stroke="#c4956e" strokeWidth="1" fill="none" />
        <path d="M94 61 Q100 64 106 61" stroke="#b07d6a" strokeWidth="1.2" fill="none" />

        {/* Neck */}
        <rect x="92" y="70" width="16" height="12" rx="3" fill="#d4a088" />

        {/* Body / Shirt */}
        <path d="M60 86 Q60 80 72 77 L92 84 L108 84 L128 77 Q140 80 140 86 L144 190 Q144 193 141 193 L59 193 Q56 193 56 190 Z" fill={props.colors?.shirt || '#1E3A8A'} />
        <path d="M92 84 Q100 89 108 84" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />
        <path d="M78 95 L76 190" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <path d="M122 95 L124 190" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />

        {/* Arms */}
        <path d="M60 86 L46 150 Q44 156 49 156 L60 154 L64 110 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.9" />
        <path d="M140 86 L154 150 Q156 156 151 156 L140 154 L136 110 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.9" />
        {/* Hands */}
        <ellipse cx="47" cy="156" rx="6" ry="5.5" fill="#d4a088" />
        <ellipse cx="153" cy="156" rx="6" ry="5.5" fill="#d4a088" />

        {/* Belt */}
        <rect x="59" y="191" width="82" height="7" rx="1.5" fill="rgba(0,0,0,0.25)" />

        {/* Legs / Pants */}
        <path d="M59 198 L64 272 Q64 276 70 276 L98 276 L100 198 Z" fill={props.colors?.pants || '#1F2937'} />
        <path d="M141 198 L136 272 Q136 276 130 276 L102 276 L100 198 Z" fill={props.colors?.pants || '#1F2937'} />

        {/* Shoes */}
        <path d="M64 272 L58 283 Q56 288 64 288 L98 288 Q101 288 100 283 L98 276 L70 276 Z" fill={props.colors?.shoes || '#111'} />
        <path d="M136 272 L142 283 Q144 288 136 288 L102 288 Q99 288 100 283 L102 276 L130 276 Z" fill={props.colors?.shoes || '#111'} />
      </svg>

      {/* Label */}
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <span className="text-[9px] font-semibold text-white/50 bg-black/30 px-2 py-0.5 rounded-full">
          Avatar 3D
        </span>
      </div>
    </div>
  );
}

function StoreRenderer(props: any) {
  const stores = props.stores || [];
  const title = props.title || 'Lojas';
  const titleColor = props.titleColor || '#ffffff';
  const titleSize = props.titleSize || 28;
  const bgColor = props.bgColor || 'rgba(0,0,0,0.6)';
  const borderRadius = props.borderRadius || 16;
  const columns = props.columns || 1;
  const gap = props.gap || 12;
  const cardBgColor = props.cardBgColor || 'rgba(255,255,255,0.08)';
  const cardBorderRadius = props.cardBorderRadius || 12;
  const accentColor = props.accentColor || '#6366f1';
  const showCategory = props.showCategory !== false;
  const showHours = props.showHours !== false;
  const showPhone = props.showPhone !== false;
  const showFloor = props.showFloor !== false;
  const showFilter = props.showCategoryFilter !== false;
  const showSearch = props.showSearch !== false;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = stores.map((s: any) => s.category).filter(Boolean);
    return [...new Set(cats)] as string[];
  }, [stores]);

  const filtered = useMemo(() => {
    let result = stores;
    if (activeCategory) result = result.filter((s: any) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s: any) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [stores, activeCategory, search]);

  if (stores.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: bgColor, borderRadius }}>
        <Store className="w-10 h-10 text-white/30" />
        <span className="text-white/40 text-xs">Adicione lojas ao diretório</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none" style={{ background: bgColor, borderRadius, padding: 16 }}>
      {/* Title */}
      <div className="flex-shrink-0 mb-2 flex items-center gap-2">
        <div className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
        <span style={{ color: titleColor, fontSize: titleSize, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</span>
      </div>

      {/* Search bar */}
      {showSearch && stores.length > 2 && (
        <div className="flex-shrink-0 mb-2 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar loja..."
            className="w-full h-8 rounded-lg border-none outline-none text-xs px-3"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: 11,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}
            >✕</button>
          )}
        </div>
      )}

      {/* Category filter */}
      {showFilter && categories.length > 1 && (
        <div className="flex-shrink-0 flex gap-1.5 mb-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory(null)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
            style={{
              background: !activeCategory ? accentColor : 'rgba(255,255,255,0.08)',
              color: !activeCategory ? '#fff' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${!activeCategory ? accentColor : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                background: activeCategory === cat ? accentColor : 'rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${activeCategory === cat ? accentColor : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Store cards */}
      <div className="flex-1 overflow-y-auto" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
        {filtered.map((store: any, idx: number) => (
          <div key={store.id} className="flex flex-col transition-colors animate-scale-in" style={{ background: cardBgColor, borderRadius: cardBorderRadius, border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
            <div className="flex gap-3 p-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: accentColor + '22', border: `1px solid ${accentColor}33` }}>
                {store.logo ? (
                  <img src={store.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5" style={{ color: accentColor }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm leading-tight truncate">{store.name || 'Loja'}</div>
                {store.description && expandedId !== store.id && <div className="text-white/50 text-[10px] mt-0.5 line-clamp-1">{store.description}</div>}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                  {showFloor && store.floor && <span className="text-[10px] text-white/60 flex items-center gap-0.5">📍 {store.floor}</span>}
                  {showCategory && store.category && <span className="text-[10px] flex items-center gap-0.5" style={{ color: accentColor }}>🏷️ {store.category}</span>}
                </div>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === store.id ? null : store.id)}
                className="flex-shrink-0 self-start px-2 py-1 rounded-md text-[9px] font-semibold transition-all"
                style={{
                  background: expandedId === store.id ? accentColor : accentColor + '22',
                  color: expandedId === store.id ? '#fff' : accentColor,
                  border: `1px solid ${accentColor}44`,
                }}
              >
                {expandedId === store.id ? '✕' : 'Detalhes'}
              </button>
            </div>
            {expandedId === store.id && (
              <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-0" style={{ animation: 'storeCardIn 0.2s ease-out both' }}>
                {store.description && <div className="text-white/60 text-[10px] mt-2 leading-relaxed">{store.description}</div>}
                <div className="flex flex-col gap-1 mt-2">
                  {store.hours && <span className="text-[10px] text-white/60 flex items-center gap-1">🕐 Horário: {store.hours}</span>}
                  {store.phone && <span className="text-[10px] text-white/60 flex items-center gap-1">📞 Telefone: {store.phone}</span>}
                  {store.floor && <span className="text-[10px] text-white/60 flex items-center gap-1">📍 Localização: {store.floor}</span>}
                  {store.category && <span className="text-[10px] flex items-center gap-1" style={{ color: accentColor }}>🏷️ Categoria: {store.category}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-6">
            <span className="text-white/40 text-xs">Nenhuma loja nesta categoria</span>
          </div>
        )}
      </div>
    </div>
  );
}
