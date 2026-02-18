import { useNode, UserComponent } from '@craftjs/core';
import { IconBlockSettings } from '../settings/IconBlockSettings';

export interface IconBlockProps {
  emoji: string;
  size: number;
  bgColor: string;
  bgEnabled: boolean;
  bgSize: number;
  bgBorderRadius: number;
  borderColor: string;
  borderWidth: number;
  align: 'left' | 'center' | 'right';
  shadow: boolean;
}

export const IconBlock: UserComponent<Partial<IconBlockProps>> = ({
  emoji = '⭐',
  size = 32,
  bgColor = 'rgba(99,102,241,0.2)',
  bgEnabled = true,
  bgSize = 56,
  bgBorderRadius = 14,
  borderColor = 'rgba(99,102,241,0.3)',
  borderWidth = 1,
  align = 'center',
  shadow = true,
}) => {
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

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
      }}
    >
      <div
        className="flex items-center justify-center transition-transform hover:scale-110"
        style={{
          width: bgEnabled ? bgSize : 'auto',
          height: bgEnabled ? bgSize : 'auto',
          backgroundColor: bgEnabled ? bgColor : 'transparent',
          borderRadius: bgBorderRadius,
          border: bgEnabled ? `${borderWidth}px solid ${borderColor}` : 'none',
          fontSize: size,
          lineHeight: 1,
          boxShadow: shadow && bgEnabled ? `0 4px 16px ${bgColor}` : undefined,
        }}
      >
        {emoji}
      </div>
    </div>
  );
};

IconBlock.craft = {
  props: {
    emoji: '⭐',
    size: 32,
    bgColor: 'rgba(99,102,241,0.2)',
    bgEnabled: true,
    bgSize: 56,
    bgBorderRadius: 14,
    borderColor: 'rgba(99,102,241,0.3)',
    borderWidth: 1,
    align: 'center',
    shadow: true,
  },
  related: { settings: IconBlockSettings },
  displayName: 'Ícone',
};
