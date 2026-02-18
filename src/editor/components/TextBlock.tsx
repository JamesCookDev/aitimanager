import { useNode, UserComponent } from '@craftjs/core';
import { TextBlockSettings } from '../settings/TextBlockSettings';

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

export const TextBlock: UserComponent<Partial<TextBlockProps>> = (props) => {
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

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding, cursor: 'move', pointerEvents: 'auto', opacity }}
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
  },
  related: { settings: TextBlockSettings },
  displayName: 'Texto',
};
