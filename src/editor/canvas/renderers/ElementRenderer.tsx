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

  // Map zoom 10..100 → scale 0.5..1.8
  const scale = 0.5 + (frameZoom / 100) * 1.3;
  // Map frameY → vertical offset
  const translateY = -(frameY / 100) * 120;
  const vbW = 200 / scale;
  const vbH = 400 / scale;
  const vbX = 100 - vbW / 2;
  const vbY = 200 - vbH / 2 + translateY / scale;

  // Floor position in viewBox coords (avatar feet ~365)
  const floorY = 340;

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#0f3460' }}>
      {/* Sparkle dots */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3, height: 3,
            background: 'rgba(74,144,255,0.5)',
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Scene SVG with avatar */}
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full h-full absolute inset-0"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Floor */}
        <rect x="-200" y={floorY} width="600" height="300" fill="#4a5568" />
        <rect x="-200" y={floorY} width="600" height="8" fill="rgba(255,255,255,0.06)" />

        {/* Shadow under avatar */}
        <ellipse cx="100" cy={floorY + 4} rx="40" ry="8" fill="rgba(0,0,0,0.35)" />

        {/* Head - skin */}
        <circle cx="100" cy="45" r="28" fill="#d4a088" />
        {/* Hair */}
        <ellipse cx="100" cy="30" rx="26" ry="18" fill="#8B4513" />
        <ellipse cx="100" cy="38" rx="24" ry="12" fill="#8B4513" opacity="0.6" />
        {/* Eyes */}
        <circle cx="90" cy="48" r="3" fill="#2d3748" />
        <circle cx="110" cy="48" r="3" fill="#2d3748" />
        <circle cx="91" cy="47" r="1" fill="white" />
        <circle cx="111" cy="47" r="1" fill="white" />
        {/* Nose */}
        <path d="M97 53 Q100 57 103 53" stroke="#c4956e" strokeWidth="1.2" fill="none" />
        {/* Mouth */}
        <path d="M93 60 Q100 64 107 60" stroke="#b07d6a" strokeWidth="1.5" fill="none" />
        {/* Ears */}
        <ellipse cx="72" cy="48" rx="5" ry="8" fill="#d4a088" />
        <ellipse cx="128" cy="48" rx="5" ry="8" fill="#d4a088" />

        {/* Neck */}
        <rect x="90" y="70" width="20" height="16" rx="4" fill="#d4a088" />

        {/* Body / Shirt */}
        <path d="M55 90 Q55 82 70 78 L90 86 L110 86 L130 78 Q145 82 145 90 L150 220 Q150 224 146 224 L54 224 Q50 224 50 220 Z" fill={props.colors?.shirt || '#1E3A8A'} />
        {/* Collar */}
        <path d="M90 86 Q100 92 110 86" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
        {/* Shirt shading */}
        <path d="M75 100 L72 220" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
        <path d="M125 100 L128 220" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />

        {/* Arms */}
        <path d="M55 90 L38 170 Q36 178 42 178 L55 175 L60 120 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.9" />
        <path d="M145 90 L162 170 Q164 178 158 178 L145 175 L140 120 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.9" />
        {/* Hands */}
        <ellipse cx="40" cy="178" rx="8" ry="7" fill="#d4a088" />
        <ellipse cx="160" cy="178" rx="8" ry="7" fill="#d4a088" />

        {/* Belt */}
        <rect x="54" y="222" width="92" height="8" rx="2" fill="rgba(0,0,0,0.3)" />

        {/* Legs / Pants */}
        <path d="M54 230 L60 330 Q60 335 68 335 L98 335 L100 230 Z" fill={props.colors?.pants || '#1F2937'} />
        <path d="M146 230 L140 330 Q140 335 132 335 L102 335 L100 230 Z" fill={props.colors?.pants || '#1F2937'} />

        {/* Shoes */}
        <path d="M60 330 L52 345 Q50 352 60 352 L98 352 Q102 352 100 345 L98 335 L68 335 Z" fill={props.colors?.shoes || '#111'} />
        <path d="M140 330 L148 345 Q150 352 140 352 L102 352 Q98 352 100 345 L102 335 L132 335 Z" fill={props.colors?.shoes || '#111'} />
      </svg>

      {/* Label overlay */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-[9px] font-semibold text-white/50 bg-black/30 px-2 py-0.5 rounded-full">
          Avatar 3D
        </span>
      </div>
    </div>
  );
}
