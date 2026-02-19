// Divider block component
import { useNode, UserComponent } from '@craftjs/core';
import { DividerBlockSettings } from '../settings/DividerBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

export interface DividerBlockProps {
  color: string; thickness: number; margin: number; lineStyle: 'solid' | 'dashed' | 'dotted';
}

export const DividerBlock: UserComponent<Partial<DividerBlockProps & LayoutProps>> = (allProps) => {
  const { color = 'rgba(255,255,255,0.15)', thickness = 1, margin = 12, lineStyle = 'solid' } = allProps;
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));
  const layoutStyle = getLayoutStyle(allProps as any);

  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
        style={{ paddingTop: margin, paddingBottom: margin }}
      >
        <hr style={{ border: 'none', borderTop: `${thickness}px ${lineStyle} ${color}`, width: '100%' }} />
      </div>
    </div>
  );
};

DividerBlock.craft = {
  props: { color: 'rgba(255,255,255,0.15)', thickness: 1, margin: 12, lineStyle: 'solid', ...DEFAULT_LAYOUT_PROPS },
  related: { settings: DividerBlockSettings },
  displayName: 'Divisor',
};
