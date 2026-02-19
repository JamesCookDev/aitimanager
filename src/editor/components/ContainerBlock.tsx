import { useNode, UserComponent } from '@craftjs/core';
import { ContainerBlockSettings } from '../settings/ContainerBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';

export interface ContainerBlockProps {
  bgColor: string;
  padding: number;
  gap: number;
  direction: 'column' | 'row';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  borderRadius: number;
  minHeight: number;
  opacity: number;
  borderColor: string;
  borderWidth: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  blur: number;
  children?: React.ReactNode;
}

export const ContainerBlock: UserComponent<Partial<ContainerBlockProps>> = (props) => {
  const {
    bgColor = 'rgba(255,255,255,0.05)',
    padding = 16,
    gap = 10,
    direction = 'column',
    alignItems = 'stretch',
    justifyContent = 'flex-start',
    borderRadius = 24,
    minHeight = 80,
    opacity = 1,
    borderColor = 'rgba(255,255,255,0.1)',
    borderWidth = 1,
    shadow = 'sm',
    blur = 16,
    children,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const shadowMap = {
    none: 'none',
    sm: '0 4px 16px rgba(0,0,0,0.2)',
    md: '0 8px 32px rgba(0,0,0,0.3)',
    lg: '0 16px 56px rgba(0,0,0,0.45)',
  };

  const layoutStyle = getLayoutStyle(props as any);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{
        backgroundColor: bgColor,
        backdropFilter: blur > 0 ? `blur(${blur}px) saturate(1.4)` : undefined,
        WebkitBackdropFilter: blur > 0 ? `blur(${blur}px) saturate(1.4)` : undefined,
        padding,
        gap,
        display: 'flex',
        flexDirection: direction,
        alignItems,
        justifyContent,
        borderRadius,
        minHeight,
        cursor: 'move',
        pointerEvents: 'auto',
        opacity,
        border: `${Math.max(borderWidth, 1)}px solid ${borderColor}`,
        boxShadow: shadowMap[shadow],
        ...layoutStyle,
      }}
    >
      {children}
    </div>
  );
};

ContainerBlock.craft = {
  props: {
    bgColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    gap: 10,
    direction: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    borderRadius: 24,
    minHeight: 80,
    opacity: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    shadow: 'sm',
    blur: 16,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: ContainerBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Container',
};
