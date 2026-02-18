import { useNode, UserComponent } from '@craftjs/core';

export interface DividerBlockProps {
  color: string;
  thickness: number;
  margin: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export const DividerBlock: UserComponent<Partial<DividerBlockProps>> = ({
  color = 'rgba(255,255,255,0.15)', thickness = 1, margin = 12, style = 'solid',
}) => {
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ paddingTop: margin, paddingBottom: margin, cursor: 'move', pointerEvents: 'auto' }}
    >
      <hr style={{ border: 'none', borderTop: `${thickness}px ${style} ${color}`, width: '100%' }} />
    </div>
  );
};

DividerBlock.craft = {
  props: {
    color: 'rgba(255,255,255,0.15)',
    thickness: 1,
    margin: 12,
    style: 'solid',
  },
  related: {
    settings: () => {
      const { useNode } = require('@craftjs/core');
      const { actions: { setProp }, props } = useNode((node: any) => ({ props: node.data.props }));
      return (
        <div className="space-y-3 p-3">
          <div>
            <label className="text-xs text-muted-foreground">Espessura</label>
            <input type="range" min={1} max={8} value={props.thickness}
              onChange={(e) => setProp((p: any) => { p.thickness = Number(e.target.value); })}
              className="w-full" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Estilo</label>
            <select value={props.style}
              onChange={(e) => setProp((p: any) => { p.style = e.target.value; })}
              className="w-full mt-1 rounded bg-muted border border-border text-sm p-1.5">
              <option value="solid">Sólido</option>
              <option value="dashed">Tracejado</option>
              <option value="dotted">Pontilhado</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Cor</label>
            <input type="color" value={props.color}
              onChange={(e) => setProp((p: any) => { p.color = e.target.value; })}
              className="w-full h-8 mt-1" />
          </div>
        </div>
      );
    },
  },
  displayName: 'Divisor',
};
