import { useReducer, useCallback, useRef, useState, useEffect, DragEvent } from 'react';
import {
  Save, Download, Upload, ZoomIn, ZoomOut, Maximize2, LayoutTemplate, Undo2, Redo2,
  PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, Keyboard, FileText, Blocks,
  Eye, ChevronDown, MoreVertical, Ruler, Monitor, Layers, Pencil, Rocket, Sparkles, FileCode2, FolderOpen, RefreshCw,
  Trash2, Copy, ArrowUp, ArrowDown, Lock, Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
import { SVGImportDialog } from './SVGImportDialog';
import { SavedLayoutsDialog } from './SavedLayoutsDialog';
import { applyFieldOverrides } from '../utils/htmlEditableFields';
import { parseHTMLToCanvas } from '../utils/htmlToCanvas';
import { AIGenerateDialog } from './AIGenerateDialog';
import { HTMLImportDialog } from './HTMLImportDialog';

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
  'slide-down': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
  rotate: {
    initial: { rotate: -180, scale: 0.5, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 180, scale: 0.5, opacity: 0 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(20px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(20px)' },
  },
};

interface Props {
  initialState?: CanvasState | null;
  onSave?: (state: CanvasState) => void;
  onPublish?: (state: CanvasState) => void;
  deviceName?: string;
}

/* ── Toolbar icon button ─────────── */
function Tb({ tip, onClick, icon: Icon, disabled, active, className: cls, label }: {
  tip: string; onClick: () => void; icon: any; disabled?: boolean; active?: boolean; className?: string; label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={label ? "sm" : "icon"}
          className={cn(
            "rounded-lg transition-all",
            label ? "h-9 px-3 gap-1.5 text-xs font-medium" : "h-9 w-9",
            active
              ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            cls,
          )}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon className={cn(label ? "w-4 h-4" : "w-4 h-4")} />
          {label && <span className="hidden lg:inline">{label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs font-medium">{tip}</TooltipContent>
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
  const [showSvgImport, setShowSvgImport] = useState(false);
  const [svgImportMode, setSvgImportMode] = useState<'svg' | 'html' | 'raw' | undefined>(undefined);
  const [showSavedLayouts, setShowSavedLayouts] = useState(false);
  const [selectedNavElement, setSelectedNavElement] = useState<{
    selector: string; tag: string; text: string; currentNavigate: string; elementId: string;
  } | null>(null);
  const [dragOverCanvas, setDragOverCanvas] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHTMLImport, setShowHTMLImport] = useState(false);

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
  const currentBgColor = (state.pageBgColors || {})[activeViewId] || state.bgColor;
  const activePage = views.find(v => v.id === activeViewId);

  const replaceCanvasWithImportedState = useCallback((imported: CanvasState) => {
    const fallbackView = { id: '__default__', name: 'Home', isDefault: true };
    const rawViews = imported.views?.length ? imported.views : [fallbackView];
    const defaultView = rawViews.find(v => v.isDefault) || rawViews[0] || fallbackView;
    const importStamp = Date.now();

    const normalizedElements = (imported.elements || []).map((el, idx) => ({
      ...el,
      id: `${el.id || 'el'}_${importStamp}_${idx}`,
      viewId: el.viewId || defaultView.id,
    }));

    dispatch({
      type: 'LOAD',
      state: {
        ...DEFAULT_CANVAS_STATE,
        ...imported,
        selectedId: null,
        activeViewId: defaultView.id,
        views: rawViews,
        elements: normalizedElements,
        pageBgColors: imported.pageBgColors || {},
      },
    });
  }, [dispatch]);

  /* ── HTML file/text drop handler ── */
  const handleCanvasDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCanvas(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      const html = await file.text();
      const result = parseHTMLToCanvas(html);
      if (result.elements.length === 0) { toast.error('Nenhum elemento reconhecido no HTML'); return; }

      replaceCanvasWithImportedState({
        ...DEFAULT_CANVAS_STATE,
        bgColor: result.bgColor,
        elements: result.elements.map(el => ({ ...el, viewId: '__default__' })),
        views: [{ id: '__default__', name: 'Home', isDefault: true }],
        activeViewId: '__default__',
        pageBgColors: result.bgColor ? { __default__: result.bgColor } : {},
      });
      toast.success(`${result.elements.length} elementos importados do arquivo`);
      return;
    }

    const htmlData = e.dataTransfer.getData('text/html') || e.dataTransfer.getData('text/plain');
    if (htmlData && htmlData.includes('<') && htmlData.includes('>')) {
      const result = parseHTMLToCanvas(htmlData);
      if (result.elements.length === 0) { toast.error('Nenhum elemento reconhecido no HTML'); return; }

      replaceCanvasWithImportedState({
        ...DEFAULT_CANVAS_STATE,
        bgColor: result.bgColor,
        elements: result.elements.map(el => ({ ...el, viewId: '__default__' })),
        views: [{ id: '__default__', name: 'Home', isDefault: true }],
        activeViewId: '__default__',
        pageBgColors: result.bgColor ? { __default__: result.bgColor } : {},
      });
      toast.success(`${result.elements.length} elementos importados`);
    }
  }, [replaceCanvasWithImportedState]);

  const handleCanvasDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const hasHtml = Array.from(e.dataTransfer.types).some(t => t === 'Files' || t === 'text/html' || t === 'text/plain');
    if (hasHtml) setDragOverCanvas(true);
  }, []);

  const handleCanvasDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX <= rect.left || clientX >= rect.right || clientY <= rect.top || clientY >= rect.bottom) {
      setDragOverCanvas(false);
    }
  }, []);

  const handleNavigateToPage = useCallback((targetViewId: string, transition: PageTransition = 'fade') => {
    if (!targetViewId || targetViewId === activeViewId) return;
    let target = views.find(v => v.id === targetViewId);
    if (!target) {
      target = views.find(v => v.name.toLowerCase() === targetViewId.toLowerCase());
    }
    if (!target) { toast.error('Página de destino não encontrada'); return; }
    setPageTransition(transition);
    dispatch({ type: 'SET_ACTIVE_VIEW', id: target.id });
    toast.info(`Navegou para "${target.name}"`);
  }, [activeViewId, views, dispatch]);

  const handleAdd = useCallback((el: CanvasElement) => {
    dispatch({ type: 'ADD_ELEMENT', payload: { ...el, viewId: activeViewId } });
    setLeftTab('elements');
  }, [dispatch, activeViewId]);

  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onSave || saving) return;
    const usedViewIds = new Set(state.elements.map(e => e.viewId).filter(Boolean));
    usedViewIds.add('__default__');
    const cleanViews = (state.views || []).filter(v => v.isDefault || usedViewIds.has(v.id));
    const cleanState = { ...state, views: cleanViews.length ? cleanViews : [{ id: '__default__', name: 'Home', isDefault: true }] };
    setSaving(true);
    try {
      await onSave(cleanState);
      setDirty(false);
      toast.success('Layout salvo!');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Erro ao salvar layout');
    } finally {
      setSaving(false);
    }
  }, [state, onSave, saving]);

  const handleClearAll = useCallback(() => {
    if (state.elements.length === 0) {
      toast.info('O canvas já está vazio');
      return;
    }
    dispatch({ type: 'LOAD', state: { ...DEFAULT_CANVAS_STATE } });
    setDirty(true);
    toast.success('Canvas limpo!');
  }, [state.elements.length, dispatch]);


  const handlePublish = useCallback(async () => {
    if (!onPublish || publishing) return;
    const usedViewIds = new Set(state.elements.map(e => e.viewId).filter(Boolean));
    usedViewIds.add('__default__');
    const cleanViews = (state.views || []).filter(v => v.isDefault || usedViewIds.has(v.id));
    const cleanState = { ...state, views: cleanViews.length ? cleanViews : [{ id: '__default__', name: 'Home', isDefault: true }] };
    setPublishing(true);
    try {
      await onPublish(cleanState);
      setDirty(false);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setPublishing(false);
    }
  }, [state, onPublish, publishing]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `layout-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url); toast.success('JSON exportado');
  }, [state]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      try {
        const text = await file.text();
        dispatch({ type: 'LOAD', state: JSON.parse(text) as CanvasState });
        toast.success('Layout importado');
      } catch { toast.error('Arquivo inválido'); }
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
      if (ctrl && e.key === 'd') { if (state.selectedId) { dispatch({ type: 'DUPLICATE', id: state.selectedId }); e.preventDefault(); } }
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

  const ZOOM_PRESETS = [
    { label: 'Fit', action: fitToViewport },
    { label: '50%', action: () => setScale(0.5) },
    { label: '75%', action: () => setScale(0.75) },
    { label: '100%', action: () => setScale(1) },
  ];

  /* ── Floating element toolbar ── */
  const FloatingElementToolbar = () => {
    if (!selectedElement || previewMode) return null;
    const elX = selectedElement.x * scale + canvasX;
    const elY = selectedElement.y * scale + canvasY;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="absolute z-[100] pointer-events-auto"
        style={{
          left: elX,
          top: Math.max(8, elY - 52),
        }}
      >
        <div className="flex items-center gap-1 bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-2xl px-2 py-1.5">
          <span className="text-xs font-semibold text-foreground px-2 max-w-[120px] truncate">
            {selectedElement.name}
          </span>
          <Separator orientation="vertical" className="h-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/60" onClick={() => dispatch({ type: 'DUPLICATE', id: selectedElement.id })}>
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Duplicar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/60" onClick={() => dispatch({ type: 'BRING_FORWARD', id: selectedElement.id })}>
                <ArrowUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Trazer frente</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/60" onClick={() => dispatch({ type: 'SEND_BACKWARD', id: selectedElement.id })}>
                <ArrowDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Enviar trás</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/60" onClick={() => {
                const el = state.elements.find(e => e.id === selectedElement.id);
                if (el) dispatch({ type: 'UPDATE_ELEMENT', id: el.id, patch: { locked: !el.locked } });
              }}>
                {selectedElement.locked ? <Lock className="w-4 h-4 text-warning" /> : <Unlock className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">{selectedElement.locked ? 'Desbloquear' : 'Bloquear'}</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => dispatch({ type: 'DELETE_ELEMENT', id: selectedElement.id })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Excluir</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    );
  };

  return (
    <PageVariablesProvider navigateToPage={handleNavigateToPage}>
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-[calc(100vh-5rem)] bg-background overflow-hidden rounded-xl border border-border/50 shadow-lg">

        {/* ══════ TOP TOOLBAR ══════ */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-border/60 bg-card/90 backdrop-blur-sm shrink-0">

          {/* ── Left cluster: Panel toggle + Page selector ── */}
          <div className="flex items-center gap-2">
            <Tb
              tip={leftOpen ? "Ocultar painel" : "Mostrar painel"}
              onClick={() => setLeftOpen(p => !p)}
              icon={leftOpen ? PanelLeftClose : PanelLeft}
              active={leftOpen}
            />

            <Separator orientation="vertical" className="h-6" />

            {/* Page pill - bigger and more prominent */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-all">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary max-w-[120px] truncate">{activePage?.name || 'Home'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-primary/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {views.map(v => (
                  <DropdownMenuItem
                    key={v.id}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', id: v.id })}
                    className={cn("text-sm gap-2 py-2", v.id === activeViewId && "bg-primary/10 text-primary font-medium")}
                  >
                    <FileText className="w-4 h-4" />
                    {v.name}
                    {v.isDefault && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">Home</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dirty indicator */}
            {dirty && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span className="text-[10px] text-warning font-medium hidden sm:inline">Não salvo</span>
              </div>
            )}
          </div>

          {/* ── Center: Zoom controls ── */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 bg-muted/30 rounded-xl px-1.5 py-1 border border-border/40">
              <Tb tip="Zoom −" onClick={() => setScale(s => Math.max(0.15, s - 0.05))} icon={ZoomOut} />
              {ZOOM_PRESETS.map(z => (
                <button
                  key={z.label}
                  onClick={z.action}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg transition-all font-semibold",
                    z.label === `${zoomPercent}%`
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {z.label}
                </button>
              ))}
              <span className="text-xs font-mono text-muted-foreground/60 w-10 text-center tabular-nums">{zoomPercent}%</span>
              <Tb tip="Zoom +" onClick={() => setScale(s => Math.min(1.5, s + 0.05))} icon={ZoomIn} />
            </div>
          </div>

          {/* ── Right cluster: Actions ── */}
          <div className="flex items-center gap-1">
            <Tb tip="Desfazer (Ctrl+Z)" onClick={history.undo} icon={Undo2} disabled={!history.canUndo} />
            <Tb tip="Refazer (Ctrl+Y)" onClick={history.redo} icon={Redo2} disabled={!history.canRedo} />

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Save button with label */}
            <Tb tip="Salvar (Ctrl+S)" onClick={handleSave} icon={Save} label="Salvar" />

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowFrame(p => !p)} className="text-sm gap-3 py-2.5">
                  <Monitor className="w-4 h-4" />
                  <span className="flex-1">Moldura do Totem</span>
                  {showFrame && <span className="text-xs text-primary font-bold">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowZones(p => !p)} className="text-sm gap-3 py-2.5">
                  <Ruler className="w-4 h-4" />
                  <span className="flex-1">Guias de Zona</span>
                  {showZones && <span className="text-xs text-primary font-bold">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAIGenerate(true)} className="text-sm gap-3 py-2.5">
                  <Sparkles className="w-4 h-4 text-violet-500" /> Gerar com IA ✨
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport} className="text-sm gap-3 py-2.5">
                  <Download className="w-4 h-4" /> Exportar JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport} className="text-sm gap-3 py-2.5">
                  <Upload className="w-4 h-4" /> Importar JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSvgImportMode('raw'); setShowSvgImport(true); }} className="text-sm gap-3 py-2.5">
                  <FileCode2 className="w-4 h-4 text-cyan-500" /> HTML Puro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSvgImportMode('svg'); setShowSvgImport(true); }} className="text-sm gap-3 py-2.5">
                  <FileCode2 className="w-4 h-4" /> Importar SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowHTMLImport(true)} className="text-sm gap-3 py-2.5">
                  <Upload className="w-4 h-4 text-blue-500" /> Importar HTML → Widgets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSavedLayouts(true)} className="text-sm gap-3 py-2.5">
                  <FolderOpen className="w-4 h-4" /> Layouts Salvos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowShortcuts(p => !p)} className="text-sm gap-3 py-2.5">
                  <Keyboard className="w-4 h-4" /> Atalhos
                  {showShortcuts && <span className="text-xs text-primary font-bold">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Templates */}
            <FreeFormTemplatePicker
              onApply={(tplState) => dispatch({ type: 'LOAD', state: tplState })}
              trigger={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60">
                      <LayoutTemplate className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-medium">Templates</TooltipContent>
                </Tooltip>
              }
            />

            <Tb
              tip={rightOpen ? "Ocultar propriedades" : "Mostrar propriedades"}
              onClick={() => setRightOpen(p => !p)}
              icon={rightOpen ? PanelRightClose : PanelRight}
              active={rightOpen}
            />

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Preview toggle */}
            <Button
              variant={previewMode ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "h-9 text-xs gap-1.5 px-4 rounded-lg font-semibold",
                previewMode && "shadow-md"
              )}
              onClick={() => {
                setPreviewMode(p => !p);
                if (!previewMode) dispatch({ type: 'SELECT', id: null });
              }}
            >
              {previewMode ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Editar' : 'Preview'}
            </Button>

            {/* Publish — prominent CTA */}
            {onPublish && (
              <Button
                size="sm"
                className="h-9 text-xs gap-1.5 px-5 rounded-lg font-bold shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Publicando...</>
                ) : (
                  <><Rocket className="w-4 h-4" /> Publicar</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Keyboard shortcuts bar */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border/40"
            >
              <div className="flex items-center gap-5 px-4 py-2 bg-muted/20 text-xs text-muted-foreground flex-wrap">
                <span><kbd className="kbd">Del</kbd> Excluir</span>
                <span><kbd className="kbd">Ctrl+D</kbd> Duplicar</span>
                <span><kbd className="kbd">Ctrl+S</kbd> Salvar</span>
                <span><kbd className="kbd">Ctrl+Z/Y</kbd> Desfazer</span>
                <span><kbd className="kbd">↑↓←→</kbd> Mover</span>
                <span><kbd className="kbd">Shift+↑</kbd> Mover 10px</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════ MAIN WORKSPACE ══════ */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left Sidebar ── */}
          <AnimatePresence>
            {leftOpen && !previewMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 272, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="border-r border-border/50 bg-card/60 backdrop-blur-sm shrink-0 flex flex-col overflow-hidden"
              >
                <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
                  <TabsList className="w-full shrink-0 rounded-none bg-transparent h-11 px-2 gap-1 border-b border-border/40">
                    <TabsTrigger
                      value="pages"
                      className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-9 rounded-lg font-semibold"
                    >
                      <Layers className="w-4 h-4" /> Páginas
                    </TabsTrigger>
                    <TabsTrigger
                      value="elements"
                      className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-9 rounded-lg font-semibold"
                    >
                      <Sparkles className="w-4 h-4" /> Elementos
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
                      onAddView={(name, parentId) => {
                        const id = viewUid();
                        dispatch({ type: 'ADD_VIEW', view: { id, name, parentId: parentId || null } });
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
                      onSetParent={(viewId, parentId) => dispatch({ type: 'UPDATE_VIEW', id: viewId, patch: { parentId } })}
                    />
                  </TabsContent>
                  <TabsContent value="elements" className="flex-1 overflow-hidden mt-0">
                    <ElementPalette onAdd={handleAdd} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Canvas Viewport ── */}
          <div
            ref={viewportRef}
            className="flex-1 overflow-auto relative"
            style={{
              background: `
                radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.03) 0%, transparent 60%),
                repeating-conic-gradient(hsl(var(--muted) / 0.04) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px
              `,
              backgroundColor: 'hsl(var(--background))',
            }}
            onClick={() => dispatch({ type: 'SELECT', id: null })}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
          >
            {/* Floating element toolbar */}
            <AnimatePresence>
              {selectedElement && <FloatingElementToolbar />}
            </AnimatePresence>

            {/* Drop overlay */}
            {dragOverCanvas && (
              <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
                <div className="bg-card/90 backdrop-blur-sm rounded-xl px-8 py-5 shadow-xl border border-primary/30 text-center">
                  <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-base font-semibold text-foreground">Solte o arquivo HTML aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">Cada elemento será separado e editável</p>
                </div>
              </div>
            )}
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
                    borderRadius: showFrame ? 8 : 16,
                    boxShadow: showFrame
                      ? 'none'
                      : '0 0 0 1px rgba(255,255,255,0.05), 0 30px 100px -20px rgba(0,0,0,0.6)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT', id: null }); }}
                >
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
                            onUpdateProps={(props) => dispatch({ type: 'UPDATE_PROPS', id: el.id, props })}
                            previewMode={previewMode}
                            activeViewName={activePage?.name}
                            availableViews={views.map(v => ({ id: v.id, name: v.name }))}
                            onNavElementSelected={(info) => {
                              setSelectedNavElement({ ...info, elementId: el.id });
                              dispatch({ type: 'SELECT', id: el.id });
                            }}
                          />
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </TotemFrame>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <AnimatePresence>
            {rightOpen && !previewMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="border-l border-border/50 bg-card/60 backdrop-blur-sm shrink-0 overflow-hidden"
              >
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
                  selectedNavElement={selectedNavElement}
                  onAssignNavigation={(selector, pageId, pageName) => {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                      iframe.contentWindow?.postMessage({
                        type: 'assign-navigate',
                        selector,
                        page: pageId,
                        pageName,
                      }, '*');
                    });
                    if (state.selectedId) {
                      const el = state.elements.find(e => e.id === state.selectedId);
                      if (el?.props?.htmlContent) {
                        const currentHtml = el.props.htmlContent;
                        const updatedHtml = applyFieldOverrides(currentHtml, {
                          [`__nav_${selector}`]: pageId,
                        });
                        dispatch({ type: 'UPDATE_PROPS', id: state.selectedId, props: { htmlContent: updatedHtml } });
                      }
                    }
                    setSelectedNavElement(prev => prev ? { ...prev, currentNavigate: pageId } : null);
                  }}
                  onClearNavElement={() => setSelectedNavElement(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ══════ STATUS BAR ══════ */}
        <div className="flex items-center justify-between px-4 h-7 border-t border-border/40 bg-card/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
              {CANVAS_WIDTH}×{CANVAS_HEIGHT}
            </span>
            <span className="text-[10px] text-muted-foreground/30">•</span>
            <span className="text-[10px] text-muted-foreground/50">
              {visibleElements.length} elemento{visibleElements.length !== 1 ? 's' : ''}
            </span>
            {selectedElement && (
              <>
                <span className="text-[10px] text-muted-foreground/30">•</span>
                <span className="text-[10px] text-primary/70 font-medium">{selectedElement.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {deviceName && <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1"><Monitor className="w-3 h-3" />{deviceName}</span>}
            <span className="text-[10px] text-muted-foreground/25 font-semibold tracking-widest uppercase">Totem Builder</span>
          </div>
        </div>
      </div>
    </TooltipProvider>

    <SVGImportDialog
      open={showSvgImport}
      onOpenChange={(v) => { setShowSvgImport(v); if (!v) setSvgImportMode(undefined); }}
      initialMode={svgImportMode}
      onImport={(imported) => {
        replaceCanvasWithImportedState(imported);
      }}
    />

    <SavedLayoutsDialog
      open={showSavedLayouts}
      onOpenChange={setShowSavedLayouts}
      currentState={state}
      onLoad={(loaded) => dispatch({ type: 'LOAD', state: loaded })}
    />

    <AIGenerateDialog
      open={showAIGenerate}
      onOpenChange={setShowAIGenerate}
      onGenerated={(html) => {
        const el = createElement('iframe');
        el.x = 0; el.y = 0; el.width = 1080; el.height = 1920;
        el.props = {
          ...el.props,
          _iframeMode: 'html',
          htmlContent: html,
          borderRadius: 0,
          scrolling: false,
        };
        el.viewId = activeViewId;
        dispatch({ type: 'ADD_ELEMENT', payload: el });
        toast.success('Layout HTML importado no canvas!');
      }}
      views={state.views}
      activeViewId={activeViewId}
      onGenerateMultiPage={(pages) => {
        pages.forEach((page, i) => {
          let targetViewId: string;

          if (i === 0) {
            targetViewId = activeViewId;
          } else {
            const newViewId = viewUid();
            dispatch({ type: 'ADD_VIEW', view: { id: newViewId, name: page.name, isDefault: false } });
            targetViewId = newViewId;
          }

          const el = createElement('iframe');
          el.x = 0; el.y = 0; el.width = 1080; el.height = 1920;
          el.props = {
            ...el.props,
            _iframeMode: 'html',
            htmlContent: page.html,
            borderRadius: 0,
            scrolling: false,
          };
          el.viewId = targetViewId;
          dispatch({ type: 'ADD_ELEMENT', payload: el });
        });
      }}
      existingHtml={selectedElement?.props?._iframeMode === 'html' ? selectedElement.props.htmlContent : undefined}
      onRefined={(html) => {
        if (state.selectedId) {
          dispatch({ type: 'UPDATE_PROPS', id: state.selectedId, props: { htmlContent: html } });
          toast.success('Layout refinado com sucesso!');
        }
      }}
    />

    <HTMLImportDialog
      open={showHTMLImport}
      onOpenChange={setShowHTMLImport}
      onImport={(elements, importBgColor) => {
        replaceCanvasWithImportedState({
          ...DEFAULT_CANVAS_STATE,
          bgColor: importBgColor || DEFAULT_CANVAS_STATE.bgColor,
          elements: elements.map(el => ({ ...el, viewId: '__default__' })),
          views: [{ id: '__default__', name: 'Home', isDefault: true }],
          activeViewId: '__default__',
          pageBgColors: importBgColor ? { __default__: importBgColor } : {},
        });
      }}
    />
    </PageVariablesProvider>
  );
}
