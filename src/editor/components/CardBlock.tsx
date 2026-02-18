import { useNode, Element, UserComponent } from '@craftjs/core';
import { CardBlockSettings } from '../settings/CardBlockSettings';

export interface CardBlockProps {
  title: string;
  subtitle: string;
  bgColor: string;
  bgBlur: number;
  borderRadius: number;
  borderColor: string;
  padding: number;
  headerIcon: string;
  showHeader: boolean;
  elevation: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const CardBlock: UserComponent<Partial<CardBlockProps>> = ({
  title = 'Título do Card',
  subtitle = '',
  bgColor = 'rgba(255,255,255,0.06)',
  bgBlur = 16,
  borderRadius = 16,
  borderColor = 'rgba(255,255,255,0.1)',
  padding = 20,
  headerIcon = '📋',
  showHeader = true,
  elevation = 'md',
  children,
}) => {
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const shadowMap = {
    none: 'none',
    sm: '0 2px 8px rgba(0,0,0,0.15)',
    md: '0 4px 20px rgba(0,0,0,0.25)',
    lg: '0 8px 40px rgba(0,0,0,0.35)',
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ cursor: 'move', pointerEvents: 'auto' }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
          borderRadius,
          border: `1px solid ${borderColor}`,
          padding,
          boxShadow: shadowMap[elevation],
        }}
      >
        {showHeader && (
          <div className="flex items-center gap-2.5 mb-3">
            {headerIcon && (
              <span className="text-lg flex-shrink-0">{headerIcon}</span>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
              {subtitle && <p className="text-xs text-white/50 truncate">{subtitle}</p>}
            </div>
          </div>
        )}
        {children}
        {!children && !showHeader && (
          <div className="flex items-center justify-center min-h-[60px] border-2 border-dashed border-white/10 rounded-lg">
            <span className="text-white/30 text-xs">Arraste blocos aqui</span>
          </div>
        )}
      </div>
    </div>
  );
};

CardBlock.craft = {
  props: {
    title: 'Título do Card',
    subtitle: 'Subtítulo opcional',
    bgColor: 'rgba(255,255,255,0.06)',
    bgBlur: 16,
    borderRadius: 16,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    headerIcon: '📋',
    showHeader: true,
    elevation: 'md',
  },
  related: { settings: CardBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Card',
};
