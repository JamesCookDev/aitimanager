import { useNode, Element, UserComponent } from '@craftjs/core';
import { CardBlockSettings } from '../settings/CardBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';

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

export const CardBlock: UserComponent<Partial<CardBlockProps>> = (allProps) => {
  const {
    title = 'Título do Card',
    subtitle = '',
    bgColor = 'rgba(30,41,59,0.65)',
    bgBlur = 24,
    borderRadius = 28,
    borderColor = 'rgba(255,255,255,0.12)',
    padding = 24,
    headerIcon = '📋',
    showHeader = true,
    elevation = 'md',
    children,
  } = allProps;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const shadowMap = {
    none: 'none',
    sm: '0 4px 16px rgba(0,0,0,0.2)',
    md: '0 8px 32px rgba(0,0,0,0.3)',
    lg: '0 16px 64px rgba(0,0,0,0.45)',
  };

  const layoutStyle = getLayoutStyle(allProps as any);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ cursor: 'move', pointerEvents: 'auto', ...layoutStyle }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px) saturate(1.5)` : undefined,
          WebkitBackdropFilter: bgBlur > 0 ? `blur(${bgBlur}px) saturate(1.5)` : undefined,
          borderRadius,
          border: `1px solid ${borderColor}`,
          padding,
          boxShadow: shadowMap[elevation],
        }}
      >
        {showHeader && (
          <div className="flex items-center gap-3 mb-4">
            {headerIcon && (
              <span
                className="flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: 'rgba(99,102,241,0.18)',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                {headerIcon}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate" style={{ letterSpacing: '-0.02em' }}>{title}</h3>
              {subtitle && <p className="text-xs text-white/50 truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
        )}
        {children}
        {!children && !showHeader && (
          <div className="flex items-center justify-center min-h-[60px] border-2 border-dashed rounded-2xl"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
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
    bgColor: 'rgba(30,41,59,0.65)',
    bgBlur: 24,
    borderRadius: 28,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 24,
    headerIcon: '📋',
    showHeader: true,
    elevation: 'md',
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: CardBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Card',
};
