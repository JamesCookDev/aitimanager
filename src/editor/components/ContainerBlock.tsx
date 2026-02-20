import { useNode, UserComponent } from '@craftjs/core';
import { ContainerBlockSettings } from '../settings/ContainerBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

export interface ContainerBlockProps {
  bgColor: string;
  // Padding individual por lado
  padding: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingIndividual: boolean;
  gap: number;
  direction: 'column' | 'row';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  // Tamanho explícito
  width: string;   // 'auto' | '100%' | '50%' | Npx
  height: string;  // 'auto' | '100%' | Npx
  minHeight: number;
  maxWidth?: number;
  // Visual
  borderRadius: number;
  opacity: number;
  bgOpacity: number;
  borderColor: string;
  borderWidth: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  blur: number;
  overflow: 'visible' | 'hidden' | 'auto' | 'scroll';
  children?: React.ReactNode;
}

export const ContainerBlock: UserComponent<Partial<ContainerBlockProps & LayoutProps>> = (props) => {
  const {
    bgColor = 'rgba(255,255,255,0.05)',
    padding = 16,
    paddingTop, paddingRight, paddingBottom, paddingLeft,
    paddingIndividual = false,
    gap = 10,
    direction = 'column',
    wrap = 'nowrap',
    alignItems = 'stretch',
    justifyContent = 'flex-start',
    width = 'auto',
    height = 'auto',
    minHeight = 80,
    maxWidth,
    opacity = 1,
    bgOpacity = 1,
    borderColor = 'rgba(255,255,255,0.1)',
    borderWidth = 1,
    shadow = 'sm',
    blur = 16,
  overflow = 'visible',
  borderRadius = 24,
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

  // Compute padding style
  const paddingStyle = paddingIndividual
    ? {
        paddingTop: paddingTop ?? padding,
        paddingRight: paddingRight ?? padding,
        paddingBottom: paddingBottom ?? padding,
        paddingLeft: paddingLeft ?? padding,
      }
    : { padding };

  // Width/height from own props (overridden by LayoutProps if set there)
  const sizeStyle = {
    width: layoutStyle.width ?? (width !== 'auto' ? width : undefined),
    height: layoutStyle.height ?? (height !== 'auto' ? height : undefined),
    minHeight,
    maxWidth: maxWidth ? maxWidth : undefined,
  };

  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto', opacity }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
        style={{
          backgroundColor: bgColor,
          backdropFilter: blur > 0 ? `blur(${blur}px) saturate(1.4)` : undefined,
          WebkitBackdropFilter: blur > 0 ? `blur(${blur}px) saturate(1.4)` : undefined,
          ...paddingStyle,
          gap,
          display: 'flex',
          flexDirection: direction,
          flexWrap: wrap,
          alignItems,
          justifyContent,
          ...sizeStyle,
          borderRadius,
          border: `${Math.max(borderWidth, 0)}px solid ${borderColor}`,
          boxShadow: shadowMap[shadow],
          overflow,
        }}
      >
        {children}
      </div>
    </div>
  );
};

ContainerBlock.craft = {
  props: {
    bgColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    paddingIndividual: false,
    gap: 10,
    direction: 'column',
    wrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: 'auto',
    height: 'auto',
    minHeight: 80,
    opacity: 1,
    bgOpacity: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    shadow: 'sm',
    blur: 16,
    overflow: 'visible',
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: ContainerBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Container',
};
