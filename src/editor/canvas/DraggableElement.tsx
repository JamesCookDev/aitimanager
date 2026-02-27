import { useCallback, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import type { CanvasElement } from '../types/canvas';
import type { PageTransition } from '../types/canvas';
import { ElementRenderer } from './renderers/ElementRenderer';
import { Lock, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Build advanced visual styles from element props ─── */
function buildVisualStyles(props: Record<string, any>): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (props.gradientDirection && props.gradientDirection !== 'none' && props.gradientFrom && props.gradientTo) {
    if (props.gradientDirection === 'circle') {
      style.background = `radial-gradient(circle, ${props.gradientFrom}, ${props.gradientTo})`;
    } else {
      style.background = `linear-gradient(${props.gradientDirection}, ${props.gradientFrom}, ${props.gradientTo})`;
    }
  }

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

  if (props.borderWidth && props.borderWidth > 0) {
    style.border = `${props.borderWidth}px solid ${props.borderColor || '#ffffff'}`;
  }

  const filters: string[] = [];
  if (props.filterBlur) filters.push(`blur(${props.filterBlur}px)`);
  if (props.filterBrightness != null && props.filterBrightness !== 100) filters.push(`brightness(${props.filterBrightness}%)`);
  if (props.filterSaturation != null && props.filterSaturation !== 100) filters.push(`saturate(${props.filterSaturation}%)`);
  if (props.filterGrayscale) filters.push(`grayscale(${props.filterGrayscale}%)`);
  if (filters.length > 0) style.filter = filters.join(' ');

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
  onUpdateProps?: (props: Record<string, any>) => void;
  previewMode?: boolean;
  activeViewName?: string;
  availableViews?: { id: string; name: string }[];
  onNavElementSelected?: (info: { selector: string; tag: string; text: string; currentNavigate: string }) => void;
}

export function DraggableElement({ element, scale, selected, onSelect, onMove, onResize, onNavigate, onUpdateProps, previewMode, activeViewName, availableViews, onNavElementSelected }: Props) {
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
    // Double-click on HTML Puro element → enter edit mode
    if (element.type === 'iframe' && element.props.htmlContent && element.props._iframeMode !== 'url') {
      e.stopPropagation();
      onUpdateProps?.({ editMode: true, _activeTool: 'text' });
      return;
    }
    if (element.props.actionType === 'navigate' && element.props.navigateTarget && onNavigate) {
      e.stopPropagation();
      onNavigate(element.props.navigateTarget, element.props.navigateTransition || 'fade');
    }
  }, [element, onNavigate, onUpdateProps]);

  // Handle page navigation from inside iframe (HTML buttons with data-navigate or href="#page")
  const handleIframeNavigatePage = useCallback((pageName: string) => {
    if (!onNavigate) return;
    // Direct view ID match
    onNavigate(pageName, 'fade');
  }, [onNavigate]);

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
        <ElementRenderer element={element} onUpdateProps={onUpdateProps} activeViewName={activeViewName} onNavigatePage={handleIframeNavigatePage} availableViews={availableViews} onNavElementSelected={onNavElementSelected} />
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
        topLeft: cornerHandle,
        topRight: cornerHandle,
        bottomLeft: cornerHandle,
        bottomRight: cornerHandle,
        top: edgeH,
        bottom: edgeH,
        left: edgeV,
        right: edgeV,
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
        {/* Selection outline — Canva-style with rounded corners */}
        {selected && (
          <div
            className="absolute pointer-events-none"
            style={{
              inset: -2,
              border: '2px solid hsl(var(--primary))',
              borderRadius: (element.props.borderRadius || 0) + 2,
              zIndex: 999,
              boxShadow: '0 0 0 1px hsl(var(--primary) / 0.2)',
            }}
          />
        )}

        {/* Hover outline */}
        {!selected && (
          <div
            className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              inset: -1,
              border: '1px solid hsl(var(--primary) / 0.4)',
              borderRadius: (element.props.borderRadius || 0) + 1,
              zIndex: 998,
            }}
          />
        )}

        {/* Element content */}
        <div className="w-full h-full overflow-hidden" style={{ borderRadius: element.props.borderRadius || 0 }}>
          <ElementRenderer element={element} onUpdateProps={onUpdateProps} activeViewName={activeViewName} onNavigatePage={handleIframeNavigatePage} availableViews={availableViews} onNavElementSelected={onNavElementSelected} />
        </div>

        {/* Navigate badge */}
        {hasNavigateAction && selected && (
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none"
            style={{
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            <Navigation className="w-2.5 h-2.5" />
            Duplo-clique para navegar
          </div>
        )}

        {/* Lock indicator */}
        {element.locked && selected && (
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none bg-amber-500/90 text-amber-950"
            style={{ fontSize: 9, fontWeight: 600 }}
          >
            <Lock className="w-2.5 h-2.5" /> Bloqueado
          </div>
        )}

        {/* Dimension badge */}
        {selected && (
          <div
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none font-mono"
            style={{
              fontSize: 9,
              fontWeight: 500,
              background: 'hsl(var(--popover))',
              color: 'hsl(var(--popover-foreground))',
              border: '1px solid hsl(var(--border))',
              padding: '1px 8px',
              borderRadius: 6,
            }}
          >
            {element.width} × {element.height}
          </div>
        )}
      </div>
    </Rnd>
  );
}

/* ── Refined resize handles (Canva-style) ── */
const cornerHandle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: 'hsl(var(--primary))',
  border: '2px solid hsl(var(--primary-foreground))',
  borderRadius: '50%',
  zIndex: 50,
  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
};

const edgeH: React.CSSProperties = {
  height: 4,
  background: 'transparent',
};

const edgeV: React.CSSProperties = {
  width: 4,
  background: 'transparent',
};
