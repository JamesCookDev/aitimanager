import { useNode, UserComponent } from '@craftjs/core';
import { TextBlockSettings } from '../settings/TextBlockSettings';

export interface TextBlockProps {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'semibold';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  padding: number;
}

export const TextBlock: UserComponent<Partial<TextBlockProps>> = ({
  text = 'Clique para editar', fontSize = 16, fontWeight = 'normal', color = '#ffffff', textAlign = 'left', padding = 8,
}) => {
  const { connectors: { connect, drag }, isActive, actions: { setProp } } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding, cursor: 'move', pointerEvents: 'auto' }}
    >
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setProp((props: TextBlockProps) => { props.text = e.currentTarget.innerText; })}
        style={{ fontSize, fontWeight, color, textAlign, outline: 'none', minHeight: '1em' }}
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
  },
  related: { settings: TextBlockSettings },
  displayName: 'Texto',
};
