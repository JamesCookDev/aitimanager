import type { CanvasElement } from '../../types/canvas';
import { MapPin, Image as ImageIcon, Play, QrCode, MessageSquare, Clock, CloudSun, Timer, Globe, Share2 } from 'lucide-react';

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
      return <VideoPlaceholder {...element.props} />;
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
      return <CarouselPlaceholder {...element.props} />;
    case 'avatar':
      return <AvatarRenderer {...element.props} />;
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

function VideoPlaceholder(_props: any) {
  return <Placeholder icon={Play} label="Vídeo" gradient="bg-gradient-to-br from-purple-900/80 to-indigo-900/80" />;
}

function QRPlaceholder(_props: any) {
  return <Placeholder icon={QrCode} label="QR Code" gradient="bg-gradient-to-br from-slate-800 to-slate-900" />;
}

function MapPlaceholder(_props: any) {
  return <Placeholder icon={MapPin} label="Mapa" gradient="bg-gradient-to-br from-emerald-900/80 to-teal-900/80" />;
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

function IframePlaceholder(_props: any) {
  return <Placeholder icon={Globe} label="Iframe" gradient="bg-gradient-to-br from-gray-800 to-gray-900" />;
}

function CarouselPlaceholder(_props: any) {
  return <Placeholder icon={ImageIcon} label="Carrossel" gradient="bg-gradient-to-br from-pink-900/80 to-rose-900/80" />;
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
  const platforms: Record<string, string> = {
    instagram: '📷', facebook: '👤', twitter: '🐦', tiktok: '🎵', youtube: '▶️', whatsapp: '💬', linkedin: '💼',
  };
  const links = props.links || [];
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ gap: props.gap || 16 }}>
      {links.map((l: any, i: number) => (
        <span key={i} style={{ fontSize: props.iconSize || 32 }}>{platforms[l.platform] || '🔗'}</span>
      ))}
      {links.length === 0 && <Share2 className="w-6 h-6 text-white/40" />}
    </div>
  );
}

function AvatarRenderer(props: any) {
  const frameY = props.frameY ?? 0;
  const frameZoom = props.frameZoom ?? 50;

  // Map zoom 10..100 → SVG scale 0.5..1.8
  const scale = 0.5 + (frameZoom / 100) * 1.3;
  // Map frameY -100..100 → vertical translate (positive = shift avatar down in view)
  const translateY = -(frameY / 100) * 120;

  // ViewBox center shifts with frameY; zoom changes viewBox size
  const vbW = 200 / scale;
  const vbH = 400 / scale;
  const vbX = 100 - vbW / 2;
  const vbY = 200 - vbH / 2 + translateY / scale;

  return (
    <div className="w-full h-full flex flex-col items-center justify-end relative overflow-hidden" style={{ background: 'transparent' }}>
      <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.85 }}>
        <defs>
          <linearGradient id="avatar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={props.colors?.shirt || '#818cf8'} stopOpacity="0.9" />
            <stop offset="100%" stopColor={props.colors?.shirt || '#6366f1'} stopOpacity="0.6" />
          </linearGradient>
          <filter id="avatar-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Head */}
        <circle cx="100" cy="60" r="35" fill="#e8beac" filter="url(#avatar-glow)" />
        {/* Body */}
        <path d="M60 100 Q100 85 140 100 L150 250 Q100 260 50 250 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.8" filter="url(#avatar-glow)" />
        {/* Legs */}
        <rect x="65" y="250" width="28" height="110" rx="10" fill={props.colors?.pants || '#1F2937'} opacity="0.8" />
        <rect x="107" y="250" width="28" height="110" rx="10" fill={props.colors?.pants || '#1F2937'} opacity="0.8" />
        {/* Shoes */}
        <ellipse cx="79" cy="365" rx="18" ry="10" fill={props.colors?.shoes || '#000'} opacity="0.7" />
        <ellipse cx="121" cy="365" rx="18" ry="10" fill={props.colors?.shoes || '#000'} opacity="0.7" />
        {/* Arms */}
        <rect x="30" y="110" width="22" height="100" rx="10" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.7" transform="rotate(-8 41 110)" />
        <rect x="148" y="110" width="22" height="100" rx="10" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.7" transform="rotate(8 159 110)" />
      </svg>
      {/* Label */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-[10px] font-semibold text-white/60 bg-black/30 px-2 py-0.5 rounded-full">
          Avatar 3D · V{frameY} Z{frameZoom}
        </span>
      </div>
    </div>
  );
}
