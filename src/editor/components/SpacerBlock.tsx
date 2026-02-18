import { useNode, UserComponent } from '@craftjs/core';
import { SpacerBlockSettings } from '../settings/SpacerBlockSettings';

export interface SpacerBlockProps {
  height: number;
}

export const SpacerBlock: UserComponent<Partial<SpacerBlockProps>> = ({
  height = 32,
}) => {
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : 'hover:bg-white/5'}`}
      style={{ height, cursor: 'move', pointerEvents: 'auto', minWidth: '100%' }}
    >
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/30 text-[10px]">{height}px</span>
        </div>
      )}
    </div>
  );
};

SpacerBlock.craft = {
  props: { height: 32 },
  related: { settings: SpacerBlockSettings },
  displayName: 'Espaçador',
};
