import { useCallback, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import type { CanvasElement } from '../types/canvas';
import type { PageTransition } from '../types/canvas';
import { ElementRenderer } from './renderers/ElementRenderer';
import { Lock } from 'lucide-react';

/* ── Build advanced visual styles from element props ─── */
function buildVisualStyles(props: Record<string, any>): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Gradient background
  if (props.gradientDirection && props.gradientDirection !== 'none' && props.gradientFrom && props.gradientTo) {
    if (props.gradientDirection === 'circle') {
      style.background = `radial-gradient(circle, ${props.gradientFrom}, ${props.gradientTo})`;
    } else {
      style.background = `linear-gradient(${props.gradientDirection}, ${props.gradientFrom}, ${props.gradientTo})`;
    }
  }

  // Shadow
  const shadowMap: Record<string, string> = {
    sm: '0 2px 8px rgba(0,0,0,0.15)',
    md: '0 4px 16px rgba(0,0,0,0.25)',
    lg: '0 8px 32px rgba(0,0,0,0.35)',
    glow: `0 0 20px 4px ${props.shadowColor || '#6366f1'}80`,
    neon: `0 0 10px ${props.shadowColor || '#6366f1'}, 0 0 30px ${props.shadowColor || '#6366f1'}80, 0 0 60px ${props.shadowColor || '#6366f1'}40`,
  };
  if (props.shadowPreset && props.shadowPreset !== 'none') {
    style.boxShadow = shadowMap[props.shadowPreset] || 'none';
  }

  // Border
  if (props.borderWidth && props.borderWidth > 0) {
    style.border = `${props.borderWidth}px solid ${props.borderColor || '#ffffff'}`;
  }

  // Filters
  const filters: string[] = [];
  if (props.filterBlur) filters.push(`blur(${props.filterBlur}px)`);
  if (props.filterBrightness != null && props.filterBrightness !== 100) filters.push(`brightness(${props.filterBrightness}%)`);
  if (props.filterSaturation != null && props.filterSaturation !== 100) filters.push(`saturate(${props.filterSaturation}%)`);
  if (props.filterGrayscale) filters.push(`grayscale(${props.filterGrayscale}%)`);
  if (filters.length > 0) style.filter = filters.join(' ');

  // Entrance animation
  if (props.entranceAnimation && props.entranceAnimation !== 'none') {
    const delay = props.entranceDelay || 0;
    const animMap: Record<string, string> = {
      fadeIn: 'fadeIn 0.6s ease-out both',
      slideUp: 'slideUp 0.6s ease-out both',
      slideLeft: 'slideLeft 0.6s ease-out both',
      slideRight: 'slideRight 0.6s ease-out both',
      scaleUp: 'scaleUp 0.5s ease-out both',
      bounce: 'bounce 0.8s ease-out both',
      pulse: 'pulse 2s ease-in-out infinite',
    };
    style.animation = animMap[props.entranceAnimation] || 'none';
    if (delay > 0) style.animationDelay = `${delay}ms`;
  }

  return style;
}

interface Props {
  element: CanvasElement;
  scale: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (x: number, y: number, w: number, h: number) => void;
  onNavigate?: (targetViewId: string, transition?: PageTransition) => void;
  previewMode?: boolean;
}

export function DraggableElement({ element, scale, selected, onSelect, onMove, onResize, onNavigate, previewMode }: Props) {
  const handleDragStop = useCallback((_e: any, d: { x: number; y: number }) => {
    onMove(Math.round(d.x), Math.round(d.y));
  }, [onMove]);

  const handleResizeStop = useCallback((_e: any, _dir: any, ref: HTMLElement, _delta: any, pos: { x: number; y: number }) => {
    onResize(
      Math.round(pos.x),
      Math.round(pos.y),
      Math.round(ref.offsetWidth),
      Math.round(ref.offsetHeight),
    );
  }, [onResize]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (element.props.actionType === 'navigate' && element.props.navigateTarget && onNavigate) {
      e.stopPropagation();
      onNavigate(element.props.navigateTarget, element.props.navigateTransition || 'fade');
    }
  }, [element, onNavigate]);

  const hasNavigateAction = element.props.actionType === 'navigate' && element.props.navigateTarget;
  const visualStyles = useMemo(() => buildVisualStyles(element.props), [element.props]);

  if (!element.visible) return null;

  // Preview mode: render static element with single-click navigation
  if (previewMode) {
    return (
      <div
        style={{
          position: 'absolute',
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          zIndex: element.zIndex,
          opacity: element.opacity,
          cursor: hasNavigateAction ? 'pointer' : 'default',
          borderRadius: element.props.borderRadius || 0,
          overflow: 'hidden',
          ...visualStyles,
        }}
        onClick={(e) => {
          if (hasNavigateAction && onNavigate) {
            e.stopPropagation();
            onNavigate(element.props.navigateTarget, element.props.navigateTransition || 'fade');
          }
        }}
      >
        <ElementRenderer element={element} />
      </div>
    );
  }

  return (
    <Rnd
      position={{ x: element.x, y: element.y }}
      size={{ width: element.width, height: element.height }}
      onDragStart={onSelect}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={element.locked}
      enableResizing={!element.locked}
      scale={scale}
      bounds="parent"
      style={{
        zIndex: element.zIndex,
        opacity: element.opacity,
        cursor: element.locked ? 'default' : 'move',
      }}
      resizeHandleStyles={{
        topLeft: handleStyle,
        topRight: handleStyle,
        bottomLeft: handleStyle,
        bottomRight: handleStyle,
        top: edgeStyleH,
        bottom: edgeStyleH,
        left: edgeStyleV,
        right: edgeStyleV,
      }}
      resizeHandleClasses={{
        topLeft: 'z-50',
        topRight: 'z-50',
        bottomLeft: 'z-50',
        bottomRight: 'z-50',
      }}
      className="group"
    >
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full relative"
        style={{ borderRadius: element.props.borderRadius || 0, ...visualStyles }}
      >
        {/* Selection outline */}
        {selected && (
          <div
            className="absolute -inset-[2px] border-2 border-blue-500 rounded pointer-events-none"
            style={{ zIndex: 999 }}
          />
        )}

        {/* Element content */}
        <div className="w-full h-full overflow-hidden" style={{ borderRadius: element.props.borderRadius || 0 }}>
          <ElementRenderer element={element} />
        </div>

        {/* Navigate indicator */}
        {hasNavigateAction && selected && (
          <div className="absolute -top-6 right-0 bg-primary/90 text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 pointer-events-none whitespace-nowrap">
            🔗 Dê duplo-clique para navegar
          </div>
        )}

        {/* Lock indicator */}
        {element.locked && selected && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 pointer-events-none">
            <Lock className="w-2.5 h-2.5" /> Bloqueado
          </div>
        )}

        {/* Dimension badge on hover/select */}
        {selected && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none font-mono">
            {element.width} × {element.height}
          </div>
        )}
      </div>
    </Rnd>
  );
}

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#3b82f6',
  border: '2px solid #fff',
  borderRadius: 2,
  zIndex: 50,
};

const edgeStyleH: React.CSSProperties = {
  height: 4,
  background: 'transparent',
};

const edgeStyleV: React.CSSProperties = {
  width: 4,
  background: 'transparent',
};
