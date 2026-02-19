import { useNode, UserComponent } from '@craftjs/core';
import { IconBlockSettings } from '../settings/IconBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

export interface IconBlockProps {
  emoji: string; size: number; bgColor: string; bgEnabled: boolean;
  bgSize: number; bgBorderRadius: number; borderColor: string;
  borderWidth: number; align: 'left' | 'center' | 'right'; shadow: boolean;
}

export const IconBlock: UserComponent<Partial<IconBlockProps & LayoutProps>> = (props) => {
  const {
    emoji = '⭐', size = 32, bgColor = 'rgba(99,102,241,0.2)', bgEnabled = true,
    bgSize = 56, bgBorderRadius = 14, borderColor = 'rgba(99,102,241,0.3)',
    borderWidth = 1, align = 'center', shadow = true,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const layoutStyle = getLayoutStyle(props as any);

  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-sm' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
        style={{
          display: 'flex', padding: 4,
          justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        }}
      >
        <div
          className="flex items-center justify-center transition-transform hover:scale-110"
          style={{
            width: bgEnabled ? bgSize : 'auto', height: bgEnabled ? bgSize : 'auto',
            backgroundColor: bgEnabled ? bgColor : 'transparent', borderRadius: bgBorderRadius,
            border: bgEnabled ? `${borderWidth}px solid ${borderColor}` : 'none',
            fontSize: size, lineHeight: 1,
            boxShadow: shadow && bgEnabled ? `0 4px 16px ${bgColor}` : undefined,
          }}
        >
          {emoji}
        </div>
      </div>
    </div>
  );
};

IconBlock.craft = {
  props: {
    emoji: '⭐', size: 32, bgColor: 'rgba(99,102,241,0.2)', bgEnabled: true,
    bgSize: 56, bgBorderRadius: 14, borderColor: 'rgba(99,102,241,0.3)',
    borderWidth: 1, align: 'center', shadow: true, ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: IconBlockSettings },
  displayName: 'Ícone',
};
