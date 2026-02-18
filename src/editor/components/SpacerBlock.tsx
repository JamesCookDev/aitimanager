import { useNode, UserComponent } from '@craftjs/core';

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
  related: {
    settings: () => {
      // inline settings
      const { useNode } = require('@craftjs/core');
      const { actions: { setProp }, props } = useNode((node: any) => ({ props: node.data.props }));
      return (
        <div className="space-y-3 p-3">
          <label className="text-xs text-muted-foreground">Altura (px)</label>
          <input
            type="range" min={8} max={200} value={props.height}
            onChange={(e) => setProp((p: any) => { p.height = Number(e.target.value); })}
            className="w-full"
          />
          <span className="text-xs text-foreground">{props.height}px</span>
        </div>
      );
    },
  },
  displayName: 'Espaçador',
};
