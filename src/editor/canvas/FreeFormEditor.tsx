import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { Save, Download, Upload, ZoomIn, ZoomOut, Maximize2, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_CANVAS_STATE,
  canvasReducer, createElement,
  type CanvasState, type CanvasElement, type ElementType,
} from '../types/canvas';
import { DraggableElement } from './DraggableElement';
import { ElementPalette } from './ElementPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { FreeFormTemplatePicker } from './FreeFormTemplatePicker';

interface Props {
  initialState?: CanvasState | null;
  onSave?: (state: CanvasState) => void;
  onPublish?: (state: CanvasState) => void;
  deviceName?: string;
}

export function FreeFormEditor({ initialState, onSave, onPublish, deviceName }: Props) {
  const [state, dispatch] = useReducer(canvasReducer, initialState || DEFAULT_CANVAS_STATE);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [viewportSize, setViewportSize] = useState({ w: 600, h: 800 });

  // Auto-fit scale on mount and resize
  useEffect(() => {
    function fitScale() {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const sw = (rect.width - 40) / CANVAS_WIDTH;
      const sh = (rect.height - 40) / CANVAS_HEIGHT;
      const s = Math.min(sw, sh, 0.6);
      setScale(Math.max(0.15, s));
      setViewportSize({ w: rect.width, h: rect.height });
    }
    fitScale();
    window.addEventListener('resize', fitScale);
    return () => window.removeEventListener('resize', fitScale);
  }, []);

  // Load initial state
  useEffect(() => {
    if (initialState) {
      dispatch({ type: 'LOAD', state: initialState });
    }
  }, [initialState]);

  const selectedElement = state.elements.find(e => e.id === state.selectedId) || null;

  const handleAdd = useCallback((el: CanvasElement) => {
    dispatch({ type: 'ADD_ELEMENT', payload: el });
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(state);
    toast.success('Layout salvo!');
  }, [state, onSave]);

  const handlePublish = useCallback(() => {
    onPublish?.(state);
  }, [state, onPublish]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exportado');
  }, [state]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as CanvasState;
        dispatch({ type: 'LOAD', state: parsed });
        toast.success('Layout importado');
      } catch {
        toast.error('Arquivo inválido');
      }
    };
    input.click();
  }, []);

  const canvasX = (viewportSize.w - CANVAS_WIDTH * scale) / 2;
  const canvasY = Math.max(20, (viewportSize.h - CANVAS_HEIGHT * scale) / 2);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Canvas Editor</h2>
          {deviceName && (
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{deviceName}</span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground">{CANVAS_WIDTH}×{CANVAS_HEIGHT}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(0.15, s - 0.05))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(1, s + 0.05))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <FreeFormTemplatePicker
            onApply={(tplState) => dispatch({ type: 'LOAD', state: tplState })}
            trigger={
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5" /> Templates
              </Button>
            }
          />
          <div className="h-4 w-px bg-border" />
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> Salvar
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleImport}>
            <Upload className="w-3.5 h-3.5" /> Importar
          </Button>
          {onPublish && (
            <Button size="sm" className="text-xs gap-1.5" onClick={handlePublish}>
              <Maximize2 className="w-3.5 h-3.5" /> Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — element palette */}
        <div className="w-48 border-r border-border bg-card/30 shrink-0">
          <ElementPalette onAdd={handleAdd} />
        </div>

        {/* Canvas viewport */}
        <div
          ref={viewportRef}
          className="flex-1 overflow-auto relative"
          style={{
            background: 'radial-gradient(circle at center, hsl(var(--muted)/0.3) 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundColor: 'hsl(var(--muted)/0.1)',
          }}
          onClick={() => dispatch({ type: 'SELECT', id: null })}
        >
          {/* Scaled canvas */}
          <div
            style={{
              position: 'absolute',
              left: canvasX,
              top: canvasY,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {/* Canvas background */}
            <div
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                backgroundColor: state.bgColor,
                borderRadius: 16,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT', id: null }); }}
            >
              {/* Elements */}
              {state.elements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => (
                  <DraggableElement
                    key={el.id}
                    element={el}
                    scale={scale}
                    selected={el.id === state.selectedId}
                    onSelect={() => dispatch({ type: 'SELECT', id: el.id })}
                    onMove={(x, y) => dispatch({ type: 'MOVE', id: el.id, x, y })}
                    onResize={(x, y, w, h) => dispatch({ type: 'RESIZE', id: el.id, x, y, width: w, height: h })}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Right sidebar — properties */}
        <div className="w-64 border-l border-border bg-card/30 shrink-0">
          <PropertiesPanel
            element={selectedElement}
            onUpdate={(patch) => {
              if (state.selectedId) dispatch({ type: 'UPDATE_ELEMENT', id: state.selectedId, patch });
            }}
            onUpdateProps={(props) => {
              if (state.selectedId) dispatch({ type: 'UPDATE_PROPS', id: state.selectedId, props });
            }}
            onDelete={() => {
              if (state.selectedId) dispatch({ type: 'DELETE_ELEMENT', id: state.selectedId });
            }}
            onDuplicate={() => {
              if (state.selectedId) dispatch({ type: 'DUPLICATE', id: state.selectedId });
            }}
            onBringForward={() => {
              if (state.selectedId) dispatch({ type: 'BRING_FORWARD', id: state.selectedId });
            }}
            onSendBackward={() => {
              if (state.selectedId) dispatch({ type: 'SEND_BACKWARD', id: state.selectedId });
            }}
            bgColor={state.bgColor}
            onBgColorChange={(c) => dispatch({ type: 'SET_BG_COLOR', color: c })}
          />
        </div>
      </div>
    </div>
  );
}
