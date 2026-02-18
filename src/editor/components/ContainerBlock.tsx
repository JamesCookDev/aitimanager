import { useNode, Element, UserComponent } from '@craftjs/core';
import { ContainerBlockSettings } from '../settings/ContainerBlockSettings';

export interface ContainerBlockProps {
  bgColor: string;
  padding: number;
  gap: number;
  direction: 'column' | 'row';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  borderRadius: number;
  minHeight: number;
  children?: React.ReactNode;
}

export const ContainerBlock: UserComponent<Partial<ContainerBlockProps>> = ({
  bgColor = 'rgba(255,255,255,0.05)', padding = 16, gap = 8, direction = 'column', alignItems = 'stretch', justifyContent = 'flex-start', borderRadius = 12, minHeight = 80, children,
}) => {
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{
        backgroundColor: bgColor,
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
    gap: 8,
    direction: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    borderRadius: 12,
    minHeight: 80,
  },
  related: { settings: ContainerBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Container',
};
