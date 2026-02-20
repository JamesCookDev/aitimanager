import { useNode, UserComponent } from '@craftjs/core';
import { ButtonBlockSettings } from '../settings/ButtonBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

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

export const ButtonBlock: UserComponent<Partial<ButtonBlockProps & LayoutProps>> = (props) => {
  const {
    label = 'Toque para começar',
    bgColor = 'gradient-indigo-pink',
    textColor = '#ffffff',
    fontSize = 17,
    borderRadius = 999,
    paddingX = 28,
    paddingY = 16,
    fullWidth = true,
    borderColor = 'transparent',
    borderWidth = 0,
    shadow = 'md',
    opacity = 1,
    fontWeight = 'bold',
    icon = '',
    iconPosition = 'left',
  } = props;

  const { connectors: { connect, drag }, isActive, isHovered } = useNode((node) => ({
    isActive: node.events.selected,
    isHovered: node.events.hovered,
  }));

  const shadowMap = {
    none: 'none',
    sm: '0 2px 8px rgba(99,102,241,0.25)',
    md: '0 6px 24px rgba(99,102,241,0.4)',
    lg: '0 12px 40px rgba(99,102,241,0.55)',
  };

  const isGradientPreset = bgColor === 'gradient-indigo-pink' || bgColor.startsWith('gradient-');
  const gradientStyle = isGradientPreset
    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
    : undefined;

  const layoutStyle = getLayoutStyle(props as any);

  return (
    <div style={{
      ...layoutStyle,
      cursor: 'move',
      pointerEvents: 'auto',
      opacity,
      zIndex: isActive ? 50 : isHovered ? 40 : (layoutStyle.zIndex || undefined),
      isolation: 'isolate',
    }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-md shadow-lg shadow-primary/20' : isHovered ? 'ring-1 ring-primary/50 rounded-md' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
        style={{ padding: 4 }}
      >
        <button
          type="button"
          className="transition-transform active:scale-95 touch-manipulation flex items-center justify-center gap-2"
          style={{
            background: gradientStyle ?? bgColor,
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
            minHeight: 52,
            boxShadow: shadowMap[shadow],
            flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
            letterSpacing: '-0.01em',
          }}
          onClick={(e) => e.preventDefault()}
        >
          {icon && <span style={{ fontSize: fontSize * 1.05 }}>{icon}</span>}
          {label}
        </button>
      </div>
    </div>
  );
};

ButtonBlock.craft = {
  props: {
    label: 'Toque para começar',
    bgColor: 'gradient-indigo-pink',
    textColor: '#ffffff',
    fontSize: 17,
    borderRadius: 999,
    paddingX: 28,
    paddingY: 16,
    fullWidth: true,
    action: '',
    borderColor: 'transparent',
    borderWidth: 0,
    shadow: 'md',
    opacity: 1,
    fontWeight: 'bold',
    icon: '',
    iconPosition: 'left',
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: ButtonBlockSettings },
  displayName: 'Botão',
};
