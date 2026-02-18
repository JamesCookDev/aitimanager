// Divider block component - no require() allowed
import { useNode, UserComponent } from '@craftjs/core';
import { DividerBlockSettings } from '../settings/DividerBlockSettings';

export interface DividerBlockProps {
  color: string;
  thickness: number;
  margin: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

export const DividerBlock: UserComponent<Partial<DividerBlockProps>> = ({
  color = 'rgba(255,255,255,0.15)', thickness = 1, margin = 12, lineStyle = 'solid',
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
      <hr style={{ border: 'none', borderTop: `${thickness}px ${lineStyle} ${color}`, width: '100%' }} />
    </div>
  );
};

DividerBlock.craft = {
  props: {
    color: 'rgba(255,255,255,0.15)',
    thickness: 1,
    margin: 12,
    lineStyle: 'solid',
  },
  related: { settings: DividerBlockSettings },
  displayName: 'Divisor',
};
