import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { Save, Download, Upload, ZoomIn, ZoomOut, Maximize2, LayoutTemplate, Undo2, Redo2, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, Keyboard, FileText, Blocks, Play, Pencil, MoreVertical, Ruler, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_CANVAS_STATE,
  canvasReducer, createElement, viewUid,
  type CanvasState, type CanvasElement, type ElementType, type CanvasView, type PageTransition,
} from '../types/canvas';
import { useHistory } from '../hooks/useHistory';
import { PagesPanel } from './PagesPanel';
import { DraggableElement } from './DraggableElement';
import { ElementPalette } from './ElementPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { FreeFormTemplatePicker } from './FreeFormTemplatePicker';
import { PageVariablesProvider } from './PageVariablesContext';
import { TotemFrame } from './TotemFrame';
import { ZoneGuides } from './ZoneGuides';

/* ── Page transition variants ─────────── */
const transitionVariants: Record<PageTransition, { initial: any; animate: any; exit: any }> = {
  none: { initial: {}, animate: {}, exit: {} },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-left': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  'slide-right': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  'slide-up': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
};

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
  const [leftTab, setLeftTab] = useState<string>('elements');
  const [pageTransition, setPageTransition] = useState<PageTransition>('fade');
  const [previewMode, setPreviewMode] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const [showZones, setShowZones] = useState(false);

  // Auto-fit scale
  const fitToViewport = useCallback(() => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const frameExtra = showFrame ? { w: 48, h: 80 } : { w: 0, h: 0 };
    const sw = (rect.width - 60) / (CANVAS_WIDTH + frameExtra.w);
    const sh = (rect.height - 60) / (CANVAS_HEIGHT + frameExtra.h);
    const s = Math.min(sw, sh);
    setScale(Math.max(0.15, Math.min(s, 1.5)));
    setViewportSize({ w: rect.width, h: rect.height });
  }, [showFrame]);

  useEffect(() => {
    fitToViewport();
    window.addEventListener('resize', fitToViewport);
    return () => window.removeEventListener('resize', fitToViewport);
  }, [fitToViewport, leftOpen, rightOpen]);

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

  // Navigate to page (with transition)
  const handleNavigateToPage = useCallback((targetViewId: string, transition: PageTransition = 'fade') => {
    if (!targetViewId || targetViewId === activeViewId) return;
    const targetExists = views.some(v => v.id === targetViewId);
    if (!targetExists) {
      toast.error('Página de destino não encontrada');
      return;
    }
    setPageTransition(transition);
    dispatch({ type: 'SET_ACTIVE_VIEW', id: targetViewId });
    toast.info(`Navegou para "${views.find(v => v.id === targetViewId)?.name || targetViewId}"`);
  }, [activeViewId, views, dispatch]);

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

  const totalW = (CANVAS_WIDTH + (showFrame ? 48 : 0)) * scale;
  const totalH = (CANVAS_HEIGHT + (showFrame ? 80 : 0)) * scale;
  const canvasX = Math.max(20, (viewportSize.w - totalW) / 2) + (showFrame ? 24 * scale : 0);
  const canvasY = Math.max(20, (viewportSize.h - totalH) / 2) + (showFrame ? 40 * scale : 0);
  const zoomPercent = Math.round(scale * 100);

  // Active page name for toolbar display
  const activePage = views.find(v => v.id === activeViewId);

  /* Zoom presets use the same fitToViewport from above */

  const ZOOM_PRESETS = [
    { label: 'Ajustar', action: fitToViewport },
    { label: '50%', action: () => setScale(0.5) },
    { label: '75%', action: () => setScale(0.75) },
    { label: '100%', action: () => setScale(1) },
  ];

  return (
    <PageVariablesProvider navigateToPage={handleNavigateToPage}>
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col h-[calc(100vh-5rem)] bg-background rounded-xl border border-border overflow-hidden">
        {/* ── Toolbar ── clean, minimal */}
        <div className="flex items-center justify-between px-2 h-10 border-b border-border bg-card/80 shrink-0">
          {/* Left group */}
          <div className="flex items-center gap-1.5">
            <Tb tip={leftOpen ? "Ocultar painel" : "Mostrar painel"} onClick={() => setLeftOpen(p => !p)} icon={leftOpen ? PanelLeftClose : PanelLeft} />
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {activePage?.name || 'Home'}
            </span>
            {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Alterações não salvas" />}
          </div>

          {/* Center — Zoom controls */}
          <div className="flex items-center gap-0.5 bg-muted/50 rounded-md px-0.5 py-0.5">
            <Tb tip="Zoom −" onClick={() => setScale(s => Math.max(0.15, s - 0.05))} icon={ZoomOut} />
            {ZOOM_PRESETS.map(z => (
              <button
                key={z.label}
                onClick={z.action}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium ${
                  z.label === `${zoomPercent}%`
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {z.label}
              </button>
            ))}
            <span className="text-[10px] font-mono text-muted-foreground/70 w-9 text-center">{zoomPercent}%</span>
            <Tb tip="Zoom +" onClick={() => setScale(s => Math.min(1.5, s + 0.05))} icon={ZoomIn} />
          </div>

          {/* Right group */}
          <div className="flex items-center gap-1">
            <Tb tip="Desfazer" onClick={history.undo} icon={Undo2} disabled={!history.canUndo} />
            <Tb tip="Refazer" onClick={history.redo} icon={Redo2} disabled={!history.canRedo} />
            <div className="h-4 w-px bg-border mx-0.5" />
            <Tb tip="Salvar (Ctrl+S)" onClick={handleSave} icon={Save} />

            {/* Overflow menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowFrame(p => !p)} className="text-xs gap-2">
                  <Monitor className="w-3.5 h-3.5" /> {showFrame ? '✓ ' : ''}Moldura do Totem
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowZones(p => !p)} className="text-xs gap-2">
                  <Ruler className="w-3.5 h-3.5" /> {showZones ? '✓ ' : ''}Guias de Zona
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport} className="text-xs gap-2">
                  <Download className="w-3.5 h-3.5" /> Exportar JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport} className="text-xs gap-2">
                  <Upload className="w-3.5 h-3.5" /> Importar JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowShortcuts(p => !p)} className="text-xs gap-2">
                  <Keyboard className="w-3.5 h-3.5" /> Atalhos de teclado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <FreeFormTemplatePicker
              onApply={(tplState) => dispatch({ type: 'LOAD', state: tplState })}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <LayoutTemplate className="w-3.5 h-3.5" />
                </Button>
              }
            />

            <Tb tip={rightOpen ? "Ocultar propriedades" : "Mostrar propriedades"} onClick={() => setRightOpen(p => !p)} icon={rightOpen ? PanelRightClose : PanelRight} />
            <div className="h-4 w-px bg-border mx-0.5" />

            <Button
              variant={previewMode ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-[11px] gap-1.5 px-3"
              onClick={() => {
                setPreviewMode(p => !p);
                if (!previewMode) dispatch({ type: 'SELECT', id: null });
              }}
            >
              {previewMode ? <Pencil className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {previewMode ? 'Editar' : 'Simular'}
            </Button>
            {onPublish && (
              <Button size="sm" className="h-7 text-[11px] gap-1.5 px-3" onClick={handlePublish}>
                <Maximize2 className="w-3.5 h-3.5" /> Publicar
              </Button>
            )}
          </div>
        </div>

        {showShortcuts && (
          <div className="flex items-center gap-4 px-4 py-1 bg-muted/20 border-b border-border text-[10px] text-muted-foreground shrink-0 flex-wrap">
            <span><kbd className="kbd">Del</kbd> Excluir</span>
            <span><kbd className="kbd">Ctrl+D</kbd> Duplicar</span>
            <span><kbd className="kbd">Ctrl+S</kbd> Salvar</span>
            <span><kbd className="kbd">Ctrl+Z/Y</kbd> Desfazer/Refazer</span>
            <span><kbd className="kbd">↑↓←→</kbd> Mover</span>
          </div>
        )}

        {/* ── Main area ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          {leftOpen && !previewMode && (
            <div className="w-52 border-r border-border bg-card/40 shrink-0 flex flex-col">
              <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
                <TabsList className="w-full shrink-0 rounded-none border-b border-border bg-transparent h-8 px-1">
                  <TabsTrigger value="pages" className="text-[10px] gap-1 data-[state=active]:bg-muted/60 flex-1 h-6">
                    <FileText className="w-3 h-3" /> Páginas ({views.length})
                  </TabsTrigger>
                  <TabsTrigger value="elements" className="text-[10px] gap-1 data-[state=active]:bg-muted/60 flex-1 h-6">
                    <Blocks className="w-3 h-3" /> Adicionar
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

          {/* Canvas viewport */}
          <div
            ref={viewportRef}
            className="flex-1 overflow-auto relative"
            style={{
              background: 'repeating-conic-gradient(hsl(var(--muted)/0.15) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px',
              backgroundColor: 'hsl(var(--muted)/0.05)',
            }}
            onClick={() => dispatch({ type: 'SELECT', id: null })}
          >
            <div
              style={{
                position: 'absolute',
                left: showFrame ? canvasX - 24 * scale : canvasX,
                top: showFrame ? canvasY - 40 * scale : canvasY,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <TotemFrame showFrame={showFrame} canvasWidth={CANVAS_WIDTH} canvasHeight={CANVAS_HEIGHT} scale={scale}>
                <div
                  style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    backgroundColor: currentBgColor,
                    borderRadius: showFrame ? 8 : 12,
                    boxShadow: showFrame ? 'none' : '0 0 0 1px rgba(255,255,255,0.04), 0 16px 64px rgba(0,0,0,0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT', id: null }); }}
                >
                  {/* Zone guides overlay */}
                  <ZoneGuides show={showZones && !previewMode} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeViewId}
                      initial={transitionVariants[pageTransition].initial}
                      animate={transitionVariants[pageTransition].animate}
                      exit={transitionVariants[pageTransition].exit}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                    >
                      {visibleElements
                        .slice()
                        .sort((a, b) => a.zIndex - b.zIndex)
                        .map((el) => (
                          <DraggableElement
                            key={el.id}
                            element={el}
                            scale={scale}
                            selected={!previewMode && el.id === state.selectedId}
                            onSelect={() => { if (!previewMode) dispatch({ type: 'SELECT', id: el.id }); }}
                            onMove={(x, y) => { if (!previewMode) dispatch({ type: 'MOVE', id: el.id, x, y }); }}
                            onResize={(x, y, w, h) => { if (!previewMode) dispatch({ type: 'RESIZE', id: el.id, x, y, width: w, height: h }); }}
                            onNavigate={handleNavigateToPage}
                            previewMode={previewMode}
                          />
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </TotemFrame>
            </div>
          </div>

          {/* Right sidebar — properties */}
          {rightOpen && !previewMode && (
            <div className="w-64 border-l border-border bg-card/40 shrink-0">
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

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-3 h-6 border-t border-border bg-card/60 shrink-0">
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {CANVAS_WIDTH}×{CANVAS_HEIGHT} • {visibleElements.length} elementos
          </span>
          {deviceName && <span className="text-[9px] text-muted-foreground/50">{deviceName}</span>}
        </div>
      </div>
    </TooltipProvider>
    </PageVariablesProvider>
  );
}
