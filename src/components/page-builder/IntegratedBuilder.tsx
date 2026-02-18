import { useState, useCallback, useEffect, useRef } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Undo2, Redo2, Save, Maximize2,
  Paintbrush, User, MessageSquare, ImageIcon, Type, Play, Square, Clock,
  Plus, Trash2, ChevronRight, Layers, GripVertical, ArrowLeft,
  Wifi, WifiOff, MousePointer2, LayoutGrid, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { TextBlock } from '@/editor/components/TextBlock';
import { ImageBlock } from '@/editor/components/ImageBlock';
import { ButtonBlock } from '@/editor/components/ButtonBlock';
import { ContainerBlock } from '@/editor/components/ContainerBlock';
import { CanvasDropArea } from '@/editor/components/CanvasDropArea';
import { EditorProperties } from '@/editor/components/EditorProperties';
import { exportEditorJson, importEditorJson } from '@/editor/utils/editorStorage';

import { TotemCanvas, type CanvasSelection } from './TotemCanvas';
import { ContextualSidebar } from './ContextualSidebar';
import type { PageBuilderConfig } from '@/types/page-builder';
import { createLayer, type Layer } from '@/types/page-builder';

const resolver = { TextBlock, ImageBlock, ButtonBlock, ContainerBlock, CanvasDropArea };

interface IntegratedBuilderProps {
  config: PageBuilderConfig;
  selectedElement: CanvasSelection;
  onSelectElement: (el: CanvasSelection) => void;
  onUpdateConfig: (config: PageBuilderConfig) => void;
  onFullscreen: () => void;
  deviceName?: string;
  isOnline?: boolean;
}

export function IntegratedBuilder(props: IntegratedBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <Editor resolver={resolver} enabled={!previewMode}>
      <IntegratedBuilderInner {...props} previewMode={previewMode} setPreviewMode={setPreviewMode} />
    </Editor>
  );
}

/* ─── Totem element definitions ───────────────────────────────────── */
const TOTEM_ELEMENTS = [
  { key: 'background', label: 'Cenário', icon: Paintbrush, desc: 'Cor, gradiente ou imagem' },
  { key: 'avatar', label: 'Avatar 3D', icon: User, desc: 'Modelo 3D interativo' },
  { key: 'chat', label: 'Interface', icon: MessageSquare, desc: 'Chat e menu' },
  { key: 'logo', label: 'Logo', icon: ImageIcon, desc: 'Marca ou logo' },
  { key: 'text_banners', label: 'Textos', icon: Type, desc: 'Banners de texto' },
] as const;

const LAYER_TYPES: { type: Layer['type']; label: string; icon: typeof ImageIcon }[] = [
  { type: 'image', label: 'Imagem', icon: ImageIcon },
  { type: 'video', label: 'Vídeo', icon: Play },
  { type: 'shape', label: 'Forma', icon: Square },
  { type: 'clock', label: 'Relógio', icon: Clock },
];

const CRAFT_BLOCKS = [
  { name: 'Texto', icon: Type, element: <TextBlock /> },
  { name: 'Imagem', icon: ImageIcon, element: <ImageBlock /> },
  { name: 'Botão', icon: MousePointer2, element: <ButtonBlock /> },
  { name: 'Container', icon: LayoutGrid, element: <Element is={ContainerBlock} canvas /> },
] as const;

/* ─── Inner component ─────────────────────────────────────────────── */
function IntegratedBuilderInner({
  config, selectedElement, onSelectElement, onUpdateConfig,
  onFullscreen, deviceName = 'Totem', isOnline = false,
  previewMode, setPreviewMode,
}: IntegratedBuilderProps & { previewMode: boolean; setPreviewMode: (v: boolean) => void }) {
  const { actions, query, connectors, canUndo, canRedo } = useEditor((state, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));

  const loadedRef = useRef(false);

  // Load saved craft.js blocks from config
  useEffect(() => {
    if (loadedRef.current) return;
    if (config.craft_blocks) {
      try { actions.deserialize(config.craft_blocks); loadedRef.current = true; } catch { /* ignore */ }
    } else { loadedRef.current = true; }
  }, [config.craft_blocks, actions]);

  // Sync craft.js state back to config
  const syncCraftState = useCallback(() => {
    try {
      const json = query.serialize();
      if (json !== config.craft_blocks) onUpdateConfig({ ...config, craft_blocks: json });
    } catch { /* ignore */ }
  }, [query, config, onUpdateConfig]);

  useEffect(() => {
    const interval = setInterval(syncCraftState, 2000);
    return () => clearInterval(interval);
  }, [syncCraftState]);

  const handleExport = useCallback(() => {
    try { exportEditorJson(query.serialize()); toast.success('JSON exportado'); }
    catch { toast.error('Erro ao exportar'); }
  }, [query]);

  const handleImport = useCallback(async () => {
    try { const json = await importEditorJson(); actions.deserialize(json); syncCraftState(); toast.success('Layout importado'); }
    catch { toast.error('Erro ao importar'); }
  }, [actions, syncCraftState]);

  const isVertical = config.canvas.orientation === 'vertical';

  // Element enable state helpers
  const getEnabled = (key: string) => {
    switch (key) {
      case 'avatar': return config.components.avatar.enabled;
      case 'chat': return config.components.chat_interface.enabled;
      case 'logo': return config.components.logo.enabled;
      case 'text_banners': return config.components.text_banners?.enabled || false;
      default: return true;
    }
  };

  const toggleEnabled = (key: string, v: boolean) => {
    switch (key) {
      case 'avatar': onUpdateConfig({ ...config, components: { ...config.components, avatar: { ...config.components.avatar, enabled: v } } }); break;
      case 'chat': onUpdateConfig({ ...config, components: { ...config.components, chat_interface: { ...config.components.chat_interface, enabled: v } } }); break;
      case 'logo': onUpdateConfig({ ...config, components: { ...config.components, logo: { ...config.components.logo, enabled: v } } }); break;
      case 'text_banners': onUpdateConfig({ ...config, components: { ...config.components, text_banners: { ...config.components.text_banners, enabled: v } } }); break;
    }
  };

  const addLayer = (type: Layer['type']) => {
    const layer = createLayer(type);
    onUpdateConfig({ ...config, layers: [...(config.layers || []), layer] });
    onSelectElement(layer.id);
  };

  const removeLayer = (id: string) => {
    onUpdateConfig({ ...config, layers: (config.layers || []).filter(l => l.id !== id) });
    if (selectedElement === id) onSelectElement(null);
  };

  const isTotemElement = typeof selectedElement === 'string' &&
    (TOTEM_ELEMENTS.some(e => e.key === selectedElement) || (config.layers || []).some(l => l.id === selectedElement));

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] rounded-xl border border-border bg-card overflow-hidden">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-card shrink-0">
        {/* Left: mode + status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground tracking-tight">{deviceName}</span>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', isOnline ? 'bg-primary' : 'bg-muted-foreground/40')} />
            <span className="text-[11px] text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Center: mode toggle */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setPreviewMode(false)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              !previewMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Edit3 className="w-3.5 h-3.5 inline mr-1.5" />Editar
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              previewMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1.5" />Preview
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={() => actions.history.undo()} title="Desfazer">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={() => actions.history.redo()} title="Refazer">
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8" onClick={handleImport}>
            <Upload className="w-3.5 h-3.5" /> Importar
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={onFullscreen}>
            <Maximize2 className="w-3.5 h-3.5" /> Tela Cheia
          </Button>
        </div>
      </div>

      {/* ═══ 3-COLUMN LAYOUT ═══ */}
      <div className="flex flex-1 min-h-0">

        {/* ─── LEFT SIDEBAR: Blocks ─── */}
        {!previewMode && (
          <div className="w-56 shrink-0 border-r border-border bg-card flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">

                {/* Totem Elements */}
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Elementos do Totem
                  </h3>
                  <div className="space-y-1">
                    {TOTEM_ELEMENTS.map((el) => {
                      const enabled = getEnabled(el.key);
                      const isSelected = selectedElement === el.key;
                      return (
                        <button
                          key={el.key}
                          onClick={() => onSelectElement(el.key)}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-all text-left group',
                            isSelected
                              ? 'bg-primary/10 ring-2 ring-primary/30'
                              : 'hover:bg-muted/50 active:bg-muted'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground'
                          )}>
                            <el.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-foreground block">{el.label}</span>
                            <span className="text-[10px] text-muted-foreground">{enabled ? 'Ativo' : 'Desativado'}</span>
                          </div>
                          {el.key !== 'background' && (
                            <Switch
                              checked={enabled}
                              onCheckedChange={(v) => toggleEnabled(el.key, v)}
                              className="scale-[0.7]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Custom Layers */}
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Camadas
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {LAYER_TYPES.map((lt) => (
                      <button
                        key={lt.type}
                        onClick={() => addLayer(lt.type)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                      >
                        <lt.icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{lt.label}</span>
                      </button>
                    ))}
                  </div>
                  {(config.layers || []).length > 0 && (
                    <div className="space-y-0.5">
                      {(config.layers || []).map((layer) => {
                        const LIcon = LAYER_TYPES.find(l => l.type === layer.type)?.icon || Square;
                        const isSelected = selectedElement === layer.id;
                        return (
                          <div
                            key={layer.id}
                            className={cn(
                              'flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all group',
                              isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/40'
                            )}
                            onClick={() => onSelectElement(layer.id)}
                          >
                            <LIcon className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                            <span className="text-xs flex-1 truncate">{layer.label}</span>
                            {!layer.visible && <EyeOff className="w-3 h-3 text-muted-foreground/40" />}
                            <button
                              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-0.5"
                              onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Craft.js Blocks (Drag & Drop) */}
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Blocos Visuais
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CRAFT_BLOCKS.map((block) => (
                      <div
                        key={block.name}
                        ref={(ref) => { if (ref) connectors.create(ref, block.element); }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-accent/50 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all active:scale-95"
                      >
                        <block.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">{block.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </ScrollArea>
          </div>
        )}

        {/* ─── CENTER: Canvas ─── */}
        <div className={cn(
          'flex-1 flex items-center justify-center overflow-auto min-w-0',
          'bg-[hsl(var(--muted)/0.3)]',
          // Checkerboard-like subtle pattern
        )}>
          <div
            className={cn(
              'relative rounded-xl border-2 overflow-hidden shadow-xl shrink-0 transition-all',
              previewMode ? 'border-primary/30 shadow-primary/10' : 'border-border/60'
            )}
            style={{
              width: '100%',
              maxWidth: isVertical ? '420px' : '720px',
              aspectRatio: isVertical ? '9/16' : '16/9',
            }}
          >
            {/* Preview mode badge */}
            {previewMode && (
              <div className="absolute top-3 left-3 z-40 flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                <Eye className="w-3 h-3" /> Preview
              </div>
            )}

            {/* Canvas layers */}
            <div className="relative w-full h-full">
              {/* Craft.js overlay (behind totem for pass-through) */}
              <div className="absolute inset-0 z-0">
                <Frame>
                  <Element is={CanvasDropArea} canvas bgColor="transparent" />
                </Frame>
              </div>

              {/* TotemCanvas (interactive foreground) */}
              <div className="relative z-10 w-full h-full">
                <TotemCanvas
                  config={config}
                  className="w-full h-full"
                  interactive={!previewMode}
                  selectedElement={selectedElement}
                  onSelectElement={onSelectElement}
                  onUpdateConfig={onUpdateConfig}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR: Properties ─── */}
        {!previewMode && (
          <div className="w-72 shrink-0 border-l border-border bg-card flex flex-col min-h-0">
            <div className="h-10 flex items-center px-4 border-b border-border shrink-0">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Propriedades
              </h3>
            </div>

            <ScrollArea className="flex-1">
              {/* Totem element properties */}
              {isTotemElement && selectedElement ? (
                <ContextualSidebar
                  config={config}
                  selectedElement={selectedElement}
                  onChange={onUpdateConfig}
                  onSelectElement={onSelectElement}
                />
              ) : selectedElement ? (
                /* Craft.js block properties */
                <div className="p-3">
                  <EditorProperties />
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
                    <MousePointer2 className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Nenhum elemento selecionado
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Clique em um elemento na sidebar esquerda ou no canvas para editar suas propriedades
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM STATUS BAR ═══ */}
      <div className="h-7 flex items-center justify-between px-4 border-t border-border bg-card/80 shrink-0">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
          <span>{isVertical ? '1080×1920 (9:16)' : '1920×1080 (16:9)'}</span>
          <span>•</span>
          <span>{(config.layers || []).length} camadas</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
          <span>{previewMode ? 'Modo Preview' : 'Modo Edição'}</span>
        </div>
      </div>
    </div>
  );
}
