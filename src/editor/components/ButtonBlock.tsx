import { useNode, UserComponent } from '@craftjs/core';
import { ButtonBlockSettings } from '../settings/ButtonBlockSettings';

export interface ButtonBlockProps {
  label: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fullWidth: boolean;
  action: string;
}

export const ButtonBlock: UserComponent<Partial<ButtonBlockProps>> = ({
  label = 'Clique aqui', bgColor = 'hsl(221,83%,53%)', textColor = '#ffffff', fontSize = 16, borderRadius = 8, paddingX = 24, paddingY = 14, fullWidth = false, action = '',
}) => {
  const { connectors: { connect, drag }, isActive, actions: { setProp } } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding: 4, cursor: 'move' }}
    >
      <button
        type="button"
        className="transition-transform active:scale-95 touch-manipulation"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontSize,
          borderRadius,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: paddingY,
          paddingBottom: paddingY,
          width: fullWidth ? '100%' : 'auto',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          minHeight: 44, // touch-friendly
        }}
        onClick={(e) => e.preventDefault()}
      >
        {label}
      </button>
    </div>
  );
};

ButtonBlock.craft = {
  props: {
    label: 'Clique aqui',
    bgColor: 'hsl(221, 83%, 53%)',
    textColor: '#ffffff',
    fontSize: 16,
    borderRadius: 8,
    paddingX: 24,
    paddingY: 14,
    fullWidth: false,
    action: '',
  },
  related: { settings: ButtonBlockSettings },
  displayName: 'Botão',
};
