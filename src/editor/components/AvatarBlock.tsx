import { useNode, UserComponent } from '@craftjs/core';
import { AvatarBlockSettings } from '../settings/AvatarBlockSettings';

export interface AvatarBlockProps {
  enabled: boolean;
  avatarName: string;
  height: number;
  borderRadius: number;
  bgColor: string;
}

export const AvatarBlock: UserComponent<Partial<AvatarBlockProps>> = ({
  enabled = true, avatarName = 'Assistente', height = 300, borderRadius = 16, bgColor = 'rgba(255,255,255,0.03)',
}) => {
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
          className="flex flex-col items-center justify-center gap-3"
          style={{ height, borderRadius, backgroundColor: bgColor, border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
            <span className="text-3xl">🧑‍💼</span>
          </div>
          <span className="text-white/70 text-sm font-medium">{avatarName}</span>
          <span className="text-white/30 text-[10px] uppercase tracking-wider">Avatar 3D</span>
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
    height: 300,
    borderRadius: 16,
    bgColor: 'rgba(255,255,255,0.03)',
  },
  related: { settings: AvatarBlockSettings },
  displayName: 'Avatar',
};
