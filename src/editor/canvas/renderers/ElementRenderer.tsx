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
