import { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import type { CanvasElement } from '../types/canvas';
import type { PageTransition } from '../types/canvas';
import { ElementRenderer } from './renderers/ElementRenderer';
import { Lock } from 'lucide-react';

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
    // Double-click on a button with navigate action triggers navigation
    if (element.type === 'button' && element.props.actionType === 'navigate' && element.props.navigateTarget && onNavigate) {
      e.stopPropagation();
      onNavigate(element.props.navigateTarget, element.props.navigateTransition || 'fade');
    }
  }, [element, onNavigate]);

  if (!element.visible) return null;

  const isNavigateButton = element.type === 'button' && element.props.actionType === 'navigate' && element.props.navigateTarget;

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
          cursor: isNavigateButton ? 'pointer' : 'default',
          borderRadius: element.props.borderRadius || 0,
          overflow: 'hidden',
        }}
        onClick={(e) => {
          if (isNavigateButton && onNavigate) {
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
        style={{ borderRadius: element.props.borderRadius || 0 }}
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
        {isNavigateButton && selected && (
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
