import { useNode, UserComponent } from '@craftjs/core';
import { BadgeBlockSettings } from '../settings/BadgeBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';

export interface BadgeBlockProps {
  text: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  variant: 'filled' | 'outline' | 'glass';
  align: 'left' | 'center' | 'right';
  pulse: boolean;
}

export const BadgeBlock: UserComponent<Partial<BadgeBlockProps>> = (allProps) => {
  const {
    text = 'Destaque', emoji = '🔥', bgColor = '#6366f1', textColor = '#ffffff',
    fontSize = 12, borderRadius = 999, variant = 'glass', align = 'center', pulse = false,
  } = allProps;
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'filled':
        return { backgroundColor: bgColor, color: textColor, border: 'none' };
      case 'outline':
        return { backgroundColor: 'transparent', color: bgColor, border: `1.5px solid ${bgColor}` };
      case 'glass':
      default:
        return {
          backgroundColor: bgColor + '22',
          color: textColor,
          border: `1px solid ${bgColor}44`,
          backdropFilter: 'blur(8px)',
        };
    }
  };

  const layoutStyle = getLayoutStyle(allProps as any);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{
        cursor: 'move',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        padding: 4,
        ...layoutStyle,
      }}
    >
      <span
        className={`inline-flex items-center gap-1.5 font-semibold ${pulse ? 'animate-pulse' : ''}`}
        style={{
          ...getVariantStyle(),
          fontSize,
          borderRadius,
          padding: `${Math.max(4, fontSize * 0.4)}px ${fontSize * 1.2}px`,
          letterSpacing: '0.02em',
        }}
      >
        {emoji && <span>{emoji}</span>}
        {text}
      </span>
    </div>
  );
};

BadgeBlock.craft = {
  props: {
    text: 'Destaque', emoji: '🔥', bgColor: '#6366f1', textColor: '#ffffff',
    fontSize: 12, borderRadius: 999, variant: 'glass', align: 'center', pulse: false,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: BadgeBlockSettings },
  displayName: 'Badge',
};
