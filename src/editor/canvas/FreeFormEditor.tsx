import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { Save, Download, Upload, ZoomIn, ZoomOut, Maximize2, LayoutTemplate, Undo2, Redo2, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, Keyboard, FileText, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_CANVAS_STATE,
  canvasReducer, createElement, viewUid,
  type CanvasState, type CanvasElement, type ElementType, type CanvasView,
} from '../types/canvas';
import { useHistory } from '../hooks/useHistory';
import { PagesPanel } from './PagesPanel';
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

/* ── Toolbar button with tooltip ─────────── */
function Tb({ tip, onClick, icon: Icon, disabled }: { tip: string; onClick: () => void; icon: any; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} disabled={disabled}>
          <Icon className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px]">{tip}</TooltipContent>
    </Tooltip>
  );
}

export function FreeFormEditor({ initialState, onSave, onPublish, deviceName }: Props) {
  const history = useHistory(initialState || DEFAULT_CANVAS_STATE);
  const [state, rawDispatch] = useReducer(canvasReducer, initialState || DEFAULT_CANVAS_STATE);

  const dispatch = useCallback((action: Parameters<typeof rawDispatch>[0]) => {
    rawDispatch(action);
  }, []);

  // Sync reducer state → history
  const prevStateRef = useRef(state);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;
    if (prev.elements !== state.elements || prev.bgColor !== state.bgColor) {
      history.push(state);
    }
  }, [state]);

  // Apply undo/redo to reducer
  useEffect(() => {
    if (history.state !== state && history.state.elements !== state.elements) {
      rawDispatch({ type: 'LOAD', state: history.state });
    }
  }, [history.state]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [viewportSize, setViewportSize] = useState({ w: 600, h: 800 });
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [leftTab, setLeftTab] = useState<string>('pages');

  // Auto-fit scale
  useEffect(() => {
    function fitScale() {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const sw = (rect.width - 40) / CANVAS_WIDTH;
      const sh = (rect.height - 40) / CANVAS_HEIGHT;
      const s = Math.min(sw, sh, 0.85);
      setScale(Math.max(0.2, s));
      setViewportSize({ w: rect.width, h: rect.height });
    }
    fitScale();
    window.addEventListener('resize', fitScale);
    return () => window.removeEventListener('resize', fitScale);
  }, [leftOpen, rightOpen]);

  // Load initial state
  useEffect(() => {
    if (initialState) {
      dispatch({ type: 'LOAD', state: initialState });
      history.load(initialState);
      setDirty(false);
    }
  }, [initialState]);

  useEffect(() => { setDirty(true); }, [state.elements, state.bgColor]);

  const selectedElement = state.elements.find(e => e.id === state.selectedId) || null;
  const activeViewId = state.activeViewId || '__default__';
  const views = state.views?.length ? state.views : [{ id: '__default__', name: 'Home', isDefault: true }];

  const visibleElements = state.elements.filter(el => el.viewId === activeViewId);

  // Get per-page background color
  const currentBgColor = (state.pageBgColors || {})[activeViewId] || state.bgColor;

  const handleAdd = useCallback((el: CanvasElement) => {
    dispatch({ type: 'ADD_ELEMENT', payload: { ...el, viewId: activeViewId } });
    setLeftTab('elements'); // Switch to elements tab after adding
  }, [dispatch, activeViewId]);

  const handleSave = useCallback(() => {
    onSave?.(state);
    setDirty(false);
    toast.success('Layout salvo!');
  }, [state, onSave]);

  const handlePublish = useCallback(() => {
    onPublish?.(state);
    setDirty(false);
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
  }, [dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedId) { dispatch({ type: 'DELETE_ELEMENT', id: state.selectedId }); e.preventDefault(); }
      }
      if (ctrl && e.key === 'd') {
        if (state.selectedId) { dispatch({ type: 'DUPLICATE', id: state.selectedId }); e.preventDefault(); }
      }
      if (ctrl && e.key === 's') { handleSave(); e.preventDefault(); }
      if (ctrl && e.key === 'z' && !e.shiftKey) { history.undo(); e.preventDefault(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { history.redo(); e.preventDefault(); }
      if (e.key === 'Escape') { dispatch({ type: 'SELECT', id: null }); }
      if (state.selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const el = state.elements.find(x => x.id === state.selectedId);
        if (el && !el.locked) {
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          dispatch({ type: 'MOVE', id: el.id, x: el.x + dx, y: el.y + dy });
          e.preventDefault();
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.selectedId, state.elements, dispatch, handleSave, history]);

  const canvasX = (viewportSize.w - CANVAS_WIDTH * scale) / 2;
  const canvasY = Math.max(20, (viewportSize.h - CANVAS_HEIGHT * scale) / 2);
  const zoomPercent = Math.round(scale * 100);

  // Active page name for toolbar display
  const activePage = views.find(v => v.id === activeViewId);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col h-[calc(100vh-5rem)] bg-background rounded-xl border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card/60 shrink-0">
          <div className="flex items-center gap-2">
            <Tb tip={leftOpen ? "Ocultar painel (⇐)" : "Mostrar painel"} onClick={() => setLeftOpen(p => !p)} icon={leftOpen ? PanelLeftClose : PanelLeft} />
            <div className="h-4 w-px bg-border" />
            <h2 className="text-xs font-semibold text-foreground hidden sm:block">Canvas</h2>
            {deviceName && <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full hidden sm:inline">{deviceName}</span>}
            <div className="h-4 w-px bg-border hidden sm:block" />
            {/* Current page indicator */}
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {activePage?.name || 'Home'}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/60">{CANVAS_WIDTH}×{CANVAS_HEIGHT}</span>
            {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Alterações não salvas" />}
          </div>

          <div className="flex items-center gap-1 bg-muted/40 rounded-lg px-1 py-0.5">
            <Tb tip="Diminuir zoom" onClick={() => setScale(s => Math.max(0.2, s - 0.05))} icon={ZoomOut} />
            <button
              className="text-[10px] font-mono text-muted-foreground w-10 text-center hover:text-foreground transition-colors"
              onClick={() => {
                if (viewportRef.current) {
                  const rect = viewportRef.current.getBoundingClientRect();
                  const sw = (rect.width - 40) / CANVAS_WIDTH;
                  const sh = (rect.height - 40) / CANVAS_HEIGHT;
                  setScale(Math.max(0.2, Math.min(sw, sh, 0.85)));
                }
              }}
              title="Ajustar ao viewport"
            >{zoomPercent}%</button>
            <Tb tip="Aumentar zoom" onClick={() => setScale(s => Math.min(1, s + 0.05))} icon={ZoomIn} />
          </div>

          <div className="flex items-center gap-1">
            <Tb tip="Desfazer (Ctrl+Z)" onClick={history.undo} icon={Undo2} disabled={!history.canUndo} />
            <Tb tip="Refazer (Ctrl+Y)" onClick={history.redo} icon={Redo2} disabled={!history.canRedo} />
            <div className="h-4 w-px bg-border mx-0.5" />
            <FreeFormTemplatePicker
              onApply={(tplState) => dispatch({ type: 'LOAD', state: tplState })}
              trigger={
                <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 px-2">
                  <LayoutTemplate className="w-3.5 h-3.5" /> <span className="hidden md:inline">Templates</span>
                </Button>
              }
            />
            <Tb tip="Salvar (Ctrl+S)" onClick={handleSave} icon={Save} />
            <Tb tip="Exportar JSON" onClick={handleExport} icon={Download} />
            <Tb tip="Importar JSON" onClick={handleImport} icon={Upload} />
            <Tb tip="Atalhos de teclado" onClick={() => setShowShortcuts(p => !p)} icon={Keyboard} />
            <Tb tip={rightOpen ? "Ocultar propriedades (⇒)" : "Mostrar propriedades"} onClick={() => setRightOpen(p => !p)} icon={rightOpen ? PanelRightClose : PanelRight} />
            <div className="h-4 w-px bg-border mx-0.5" />
            {onPublish && (
              <Button size="sm" className="h-7 text-[11px] gap-1.5 px-3" onClick={handlePublish}>
                <Maximize2 className="w-3.5 h-3.5" /> Publicar
              </Button>
            )}
          </div>
        </div>

        {showShortcuts && (
          <div className="flex items-center gap-4 px-4 py-1.5 bg-muted/30 border-b border-border text-[10px] text-muted-foreground shrink-0 flex-wrap">
            <span><kbd className="kbd">Del</kbd> Excluir</span>
            <span><kbd className="kbd">Ctrl+D</kbd> Duplicar</span>
            <span><kbd className="kbd">Ctrl+S</kbd> Salvar</span>
            <span><kbd className="kbd">Ctrl+Z</kbd> Desfazer</span>
            <span><kbd className="kbd">Ctrl+Y</kbd> Refazer</span>
            <span><kbd className="kbd">Esc</kbd> Desselecionar</span>
            <span><kbd className="kbd">↑↓←→</kbd> Mover (Shift=10px)</span>
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden">
          {leftOpen && (
            <div className="w-56 border-r border-border bg-card/30 shrink-0 flex flex-col transition-all">
              <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
                <TabsList className="w-full shrink-0 rounded-none border-b border-border bg-transparent h-9 px-2">
                  <TabsTrigger value="pages" className="text-[11px] gap-1.5 data-[state=active]:bg-muted/50 flex-1 h-7">
                    <FileText className="w-3 h-3" /> Páginas
                    <span className="text-[9px] text-muted-foreground ml-0.5">({views.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="elements" className="text-[11px] gap-1.5 data-[state=active]:bg-muted/50 flex-1 h-7">
                    <Blocks className="w-3 h-3" /> Elementos
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pages" className="flex-1 overflow-hidden mt-0">
                  <PagesPanel
                    views={views}
                    activeViewId={activeViewId}
                    viewIdleTimeout={state.viewIdleTimeout ?? 30}
                    elementCounts={views.reduce((acc, v) => {
                      acc[v.id] = state.elements.filter(e => e.viewId === v.id).length;
                      return acc;
                    }, {} as Record<string, number>)}
                    pageBgColors={state.pageBgColors || {}}
                    globalBgColor={state.bgColor}
                    onSelectView={(id) => dispatch({ type: 'SET_ACTIVE_VIEW', id })}
                    onAddView={(name) => {
                      const id = viewUid();
                      dispatch({ type: 'ADD_VIEW', view: { id, name } });
                      dispatch({ type: 'SET_ACTIVE_VIEW', id });
                    }}
                    onRenameView={(id, name) => dispatch({ type: 'UPDATE_VIEW', id, patch: { name } })}
                    onDeleteView={(id) => dispatch({ type: 'DELETE_VIEW', id })}
                    onDuplicateView={(id) => dispatch({ type: 'DUPLICATE_VIEW', id })}
                    onSetDefault={(id) => {
                      views.forEach(v => dispatch({ type: 'UPDATE_VIEW', id: v.id, patch: { isDefault: v.id === id } }));
                    }}
                    onSetIdleTimeout={(s) => dispatch({ type: 'SET_VIEW_IDLE_TIMEOUT', seconds: s })}
                    onSetPageBgColor={(viewId, color) => dispatch({ type: 'SET_PAGE_BG_COLOR', viewId, color })}
                  />
                </TabsContent>
                <TabsContent value="elements" className="flex-1 overflow-hidden mt-0">
                  <ElementPalette onAdd={handleAdd} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div
            ref={viewportRef}
            className="flex-1 overflow-auto relative"
            style={{
              background: 'radial-gradient(circle at center, hsl(var(--muted)/0.3) 1px, transparent 1px)',
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              backgroundColor: 'hsl(var(--muted)/0.08)',
            }}
            onClick={() => dispatch({ type: 'SELECT', id: null })}
          >
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
              <div
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  backgroundColor: currentBgColor,
                  borderRadius: 16,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT', id: null }); }}
              >
                {visibleElements
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

          {rightOpen && (
            <div className="w-72 border-l border-border bg-card/30 shrink-0 transition-all">
              <PropertiesPanel
                element={selectedElement}
                elements={state.elements}
                onUpdate={(patch) => { if (state.selectedId) dispatch({ type: 'UPDATE_ELEMENT', id: state.selectedId, patch }); }}
                onUpdateProps={(props) => { if (state.selectedId) dispatch({ type: 'UPDATE_PROPS', id: state.selectedId, props }); }}
                onDelete={() => { if (state.selectedId) dispatch({ type: 'DELETE_ELEMENT', id: state.selectedId }); }}
                onDuplicate={() => { if (state.selectedId) dispatch({ type: 'DUPLICATE', id: state.selectedId }); }}
                onBringForward={() => { if (state.selectedId) dispatch({ type: 'BRING_FORWARD', id: state.selectedId }); }}
                onSendBackward={() => { if (state.selectedId) dispatch({ type: 'SEND_BACKWARD', id: state.selectedId }); }}
                onSelectElement={(id) => dispatch({ type: 'SELECT', id })}
                onToggleVisibility={(id) => {
                  const el = state.elements.find(e => e.id === id);
                  if (el) dispatch({ type: 'UPDATE_ELEMENT', id, patch: { visible: !el.visible } });
                }}
                onToggleLock={(id) => {
                  const el = state.elements.find(e => e.id === id);
                  if (el) dispatch({ type: 'UPDATE_ELEMENT', id, patch: { locked: !el.locked } });
                }}
                bgColor={currentBgColor}
                onBgColorChange={(c) => {
                  // If we have per-page colors, update the page color; otherwise update global
                  if (activeViewId) {
                    dispatch({ type: 'SET_PAGE_BG_COLOR', viewId: activeViewId, color: c });
                  } else {
                    dispatch({ type: 'SET_BG_COLOR', color: c });
                  }
                }}
                selectedId={state.selectedId}
                views={views}
                onAssignView={(elementId, viewId) => dispatch({ type: 'ASSIGN_ELEMENT_VIEW', elementId, viewId })}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
