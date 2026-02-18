import { useNode, UserComponent } from '@craftjs/core';
import { AvatarBlockSettings } from '../settings/AvatarBlockSettings';

export interface AvatarBlockProps {
  // Core
  enabled: boolean;
  avatarName: string;
  position: 'left' | 'center' | 'right';
  scale: number;
  // Visual placeholder
  height: number;
  borderRadius: number;
  bgColor: string;
  // Models
  avatarUrl: string;
  animationsUrl: string;
  // Animations
  idleAnimation: string;
  talkingAnimation: string;
  // Materials
  roughness: number;
  metalness: number;
  // Colors
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
}

const positionLabels: Record<string, string> = { left: '← Esquerda', center: '● Centro', right: 'Direita →' };

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
          className="flex flex-col items-center justify-center gap-2"
          style={{ height, borderRadius, backgroundColor: bgColor, border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Avatar silhouette preview */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${shirtColor}, ${pantsColor})` }}
          >
            <span className="text-3xl">🧑‍💼</span>
          </div>
          <span className="text-white/70 text-sm font-medium">{avatarName}</span>
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span className="uppercase tracking-wider">Avatar 3D</span>
            <span>•</span>
            <span>{positionLabels[position]}</span>
            <span>•</span>
            <span>×{scale}</span>
          </div>
          {/* Color preview dots */}
          <div className="flex gap-1.5 mt-1">
            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: shirtColor }} title="Camisa" />
            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: pantsColor }} title="Calça" />
            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: shoesColor }} title="Sapato" />
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
