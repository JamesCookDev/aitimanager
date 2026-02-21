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
