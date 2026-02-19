import { useNode, UserComponent } from '@craftjs/core';
import { GradientTextBlockSettings } from '../settings/GradientTextBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

export interface GradientTextBlockProps {
  text: string; fontSize: number; fontWeight: 'normal' | 'semibold' | 'bold' | 'extrabold';
  gradientFrom: string; gradientTo: string; gradientVia: string; gradientAngle: number;
  useVia: boolean; textAlign: 'left' | 'center' | 'right'; letterSpacing: number;
  lineHeight: number; textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'; padding: number;
}

export const GradientTextBlock: UserComponent<Partial<GradientTextBlockProps & LayoutProps>> = (props) => {
  const {
    text = 'Texto Gradiente', fontSize = 32, fontWeight = 'bold',
    gradientFrom = '#6366f1', gradientTo = '#ec4899', gradientVia = '#8b5cf6',
    gradientAngle = 90, useVia = true, textAlign = 'center',
    letterSpacing = 0, lineHeight = 1.2, textTransform = 'none', padding = 8,
  } = props;
  const { connectors: { connect, drag }, isActive, actions: { setProp } } = useNode((node) => ({ isActive: node.events.selected }));
  const gradient = useVia
    ? `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientVia}, ${gradientTo})`
    : `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`;
  const layoutStyle = getLayoutStyle(props as any);
  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-sm' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
        style={{ padding }}
      >
        <p
          contentEditable suppressContentEditableWarning
          onBlur={(e) => setProp((p: GradientTextBlockProps) => { p.text = e.currentTarget.innerText; })}
          style={{
            fontSize, fontWeight, textAlign, letterSpacing, lineHeight, textTransform,
            background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', outline: 'none', minHeight: '1em',
          }}
        >{text}</p>
      </div>
    </div>
  );
};

GradientTextBlock.craft = {
  props: {
    text: 'Texto Gradiente', fontSize: 32, fontWeight: 'bold',
    gradientFrom: '#6366f1', gradientTo: '#ec4899', gradientVia: '#8b5cf6',
    gradientAngle: 90, useVia: true, textAlign: 'center',
    letterSpacing: 0, lineHeight: 1.2, textTransform: 'none', padding: 8,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: GradientTextBlockSettings },
  displayName: 'Texto Gradiente',
};
