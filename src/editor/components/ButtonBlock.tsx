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
  borderColor: string;
  borderWidth: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  opacity: number;
  fontWeight: 'normal' | 'semibold' | 'bold';
  icon: string;
  iconPosition: 'left' | 'right';
}

export const ButtonBlock: UserComponent<Partial<ButtonBlockProps>> = (props) => {
  const {
    label = 'Clique aqui',
    bgColor = 'hsl(221,83%,53%)',
    textColor = '#ffffff',
    fontSize = 16,
    borderRadius = 8,
    paddingX = 24,
    paddingY = 14,
    fullWidth = false,
    action = '',
    borderColor = 'transparent',
    borderWidth = 0,
    shadow = 'none',
    opacity = 1,
    fontWeight = 'semibold',
    icon = '',
    iconPosition = 'left',
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const shadowMap = { none: 'none', sm: '0 2px 6px rgba(0,0,0,0.2)', md: '0 4px 16px rgba(0,0,0,0.3)', lg: '0 8px 32px rgba(0,0,0,0.4)' };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding: 4, cursor: 'move', pointerEvents: 'auto' }}
    >
      <button
        type="button"
        className="transition-transform active:scale-95 touch-manipulation flex items-center justify-center gap-2"
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
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          cursor: 'pointer',
          fontWeight,
          minHeight: 44,
          boxShadow: shadowMap[shadow],
          opacity,
          flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
        }}
        onClick={(e) => e.preventDefault()}
      >
        {icon && <span style={{ fontSize: fontSize * 0.9 }}>{icon}</span>}
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
    borderColor: 'transparent',
    borderWidth: 0,
    shadow: 'none',
    opacity: 1,
    fontWeight: 'semibold',
    icon: '',
    iconPosition: 'left',
  },
  related: { settings: ButtonBlockSettings },
  displayName: 'Botão',
};
