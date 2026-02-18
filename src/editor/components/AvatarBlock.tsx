import { useNode, UserComponent } from '@craftjs/core';
import { AvatarBlockSettings } from '../settings/AvatarBlockSettings';

export interface AvatarBlockProps {
  enabled: boolean;
  avatarName: string;
  position: 'left' | 'center' | 'right';
  scale: number;
  height: number;
  borderRadius: number;
  bgColor: string;
  avatarUrl: string;
  animationsUrl: string;
  idleAnimation: string;
  talkingAnimation: string;
  roughness: number;
  metalness: number;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
}

const positionLabels: Record<string, string> = { left: '← Esquerda', center: '● Centro', right: 'Direita →' };
const positionX: Record<string, string> = { left: '25%', center: '50%', right: '75%' };

/** Human silhouette SVG that uses the configured clothing colors */
function AvatarSilhouette({ shirtColor, pantsColor, shoesColor, scale }: { shirtColor: string; pantsColor: string; shoesColor: string; scale: number }) {
  const s = Math.min(Math.max(scale, 0.5), 3);
  const h = 90 * (s / 1.5); // proportional height
  return (
    <svg width="60" height={h} viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
      {/* Head */}
      <circle cx="30" cy="18" r="12" fill="#e8beac" />
      {/* Hair */}
      <ellipse cx="30" cy="12" rx="11" ry="8" fill="#3d2b1f" />
      {/* Neck */}
      <rect x="26" y="28" width="8" height="6" rx="2" fill="#e8beac" />
      {/* Torso / Shirt */}
      <path d="M15 34 Q15 32 20 30 L26 34 L34 34 L40 30 Q45 32 45 34 L48 60 Q48 62 46 62 L14 62 Q12 62 12 60 Z" fill={shirtColor} />
      {/* Arms */}
      <path d="M15 34 L6 55 Q5 58 8 58 L14 58 L15 42 Z" fill={shirtColor} opacity={0.85} />
      <path d="M45 34 L54 55 Q55 58 52 58 L46 58 L45 42 Z" fill={shirtColor} opacity={0.85} />
      {/* Hands */}
      <circle cx="7" cy="57" r="4" fill="#e8beac" />
      <circle cx="53" cy="57" r="4" fill="#e8beac" />
      {/* Pants */}
      <path d="M14 62 L16 95 Q16 97 19 97 L28 97 L30 62 Z" fill={pantsColor} />
      <path d="M46 62 L44 95 Q44 97 41 97 L32 97 L30 62 Z" fill={pantsColor} />
      {/* Shoes */}
      <path d="M16 95 L13 102 Q12 105 16 105 L28 105 Q30 105 29 102 L28 97 L19 97 Z" fill={shoesColor} />
      <path d="M44 95 L47 102 Q48 105 44 105 L32 105 Q30 105 31 102 L32 97 L41 97 Z" fill={shoesColor} />
      {/* Belt */}
      <rect x="14" y="60" width="32" height="4" rx="1" fill="rgba(0,0,0,0.3)" />
    </svg>
  );
}

export const AvatarBlock: UserComponent<Partial<AvatarBlockProps>> = (props) => {
  const {
    enabled = true,
    avatarName = 'Assistente',
    position = 'center',
    scale = 1.5,
    height = 300,
    borderRadius = 16,
    bgColor = 'rgba(255,255,255,0.03)',
    shirtColor = '#1E3A8A',
    pantsColor = '#1F2937',
    shoesColor = '#000000',
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ cursor: 'move', pointerEvents: 'auto' }}
    >
      {enabled ? (
        <div
          className="relative overflow-hidden"
          style={{ height, borderRadius, backgroundColor: bgColor, border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Grid floor effect */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)',
          }} />

          {/* Ambient glow behind avatar */}
          <div className="absolute rounded-full blur-3xl opacity-20" style={{
            width: 100,
            height: 100,
            left: `calc(${positionX[position]} - 50px)`,
            bottom: '20%',
            background: `radial-gradient(circle, ${shirtColor}, transparent)`,
          }} />

          {/* SVG Avatar positioned according to setting */}
          <div className="absolute bottom-4 flex flex-col items-center gap-1" style={{
            left: positionX[position],
            transform: 'translateX(-50%)',
            transition: 'left 0.3s ease',
          }}>
            <AvatarSilhouette shirtColor={shirtColor} pantsColor={pantsColor} shoesColor={shoesColor} scale={scale} />
          </div>

          {/* Info overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/60 font-medium">{avatarName}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm text-[9px] text-white/40">
              <span>{positionLabels[position]}</span>
              <span>•</span>
              <span>×{scale.toFixed(1)}</span>
            </div>
          </div>

          {/* Label */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">Avatar 3D • Preview</span>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ height: 80, borderRadius, backgroundColor: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)' }}
        >
          <span className="text-white/30 text-xs">Avatar desativado</span>
        </div>
      )}
    </div>
  );
};

AvatarBlock.craft = {
  props: {
    enabled: true,
    avatarName: 'Assistente',
    position: 'center',
    scale: 1.5,
    height: 300,
    borderRadius: 16,
    bgColor: 'rgba(255,255,255,0.03)',
    avatarUrl: '/models/avatar.glb',
    animationsUrl: '/models/animations.glb',
    idleAnimation: 'Idle',
    talkingAnimation: 'TalkingOne',
    roughness: 0.5,
    metalness: 0.0,
    shirtColor: '#1E3A8A',
    pantsColor: '#1F2937',
    shoesColor: '#000000',
  },
  related: { settings: AvatarBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Avatar',
};
