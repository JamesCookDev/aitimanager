import { useNode, UserComponent } from '@craftjs/core';
import { TextBlockSettings } from '../settings/TextBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

export interface TextBlockProps {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'semibold' | 'extrabold';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  padding: number;
  letterSpacing: number;
  lineHeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  opacity: number;
  textShadow: boolean;
}

export const TextBlock: UserComponent<Partial<TextBlockProps & LayoutProps>> = (props) => {
  const {
    text = 'Clique para editar',
    fontSize = 16,
    fontWeight = 'normal',
    color = '#ffffff',
    textAlign = 'left',
    padding = 8,
    letterSpacing = 0,
    lineHeight = 1.5,
    textTransform = 'none',
    opacity = 1,
    textShadow = false,
  } = props;

  const { connectors: { connect, drag }, isActive, actions: { setProp } } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const layoutStyle = getLayoutStyle(props as any);

  return (
    // Outer wrapper: handles ALL positioning (absolute/relative, top/left/width/height)
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto', opacity }}>
      {/* Inner wrapper: handles selection ring — no `relative` class that conflicts */}
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-sm' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
        style={{ padding }}
      >
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setProp((p: TextBlockProps) => { p.text = e.currentTarget.innerText; })}
          style={{
            fontSize,
            fontWeight,
            color,
            textAlign,
            outline: 'none',
            minHeight: '1em',
            letterSpacing,
            lineHeight,
            textTransform,
            textShadow: textShadow ? '0 2px 8px rgba(0,0,0,0.5)' : undefined,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

TextBlock.craft = {
  props: {
    text: 'Clique para editar o texto',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#ffffff',
    textAlign: 'left',
    padding: 8,
    letterSpacing: 0,
    lineHeight: 1.5,
    textTransform: 'none',
    opacity: 1,
    textShadow: false,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: TextBlockSettings },
  displayName: 'Texto',
};
