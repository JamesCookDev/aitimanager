import { useState, useCallback, useEffect, useRef } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Undo2, Redo2, Layers, Maximize2,
  Paintbrush, User, MessageSquare, ImageIcon, Type, Play, Square, Clock,
  Plus, Trash2, ChevronRight, Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { TextBlock } from '@/editor/components/TextBlock';
import { ImageBlock } from '@/editor/components/ImageBlock';
import { ButtonBlock } from '@/editor/components/ButtonBlock';
import { ContainerBlock } from '@/editor/components/ContainerBlock';
import { CanvasDropArea } from '@/editor/components/CanvasDropArea';
import { EditorToolbox } from '@/editor/components/EditorToolbox';
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

function IntegratedBuilderInner({
  config, selectedElement, onSelectElement, onUpdateConfig,
  onFullscreen, deviceName = 'Totem', isOnline = false,
  previewMode, setPreviewMode,
}: IntegratedBuilderProps & { previewMode: boolean; setPreviewMode: (v: boolean) => void }) {
  const { actions, query, canUndo, canRedo } = useEditor((state, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));

  const [sidebarTab, setSidebarTab] = useState<'elements' | 'properties'>('elements');
  const loadedRef = useRef(false);

  // Load saved craft.js blocks from config
  useEffect(() => {
    if (loadedRef.current) return;
    if (config.craft_blocks) {
      try {
        actions.deserialize(config.craft_blocks);
        loadedRef.current = true;
      } catch { /* ignore */ }
    } else {
      loadedRef.current = true;
    }
  }, [config.craft_blocks, actions]);

  // Sync craft.js state back to config on changes
  const syncCraftState = useCallback(() => {
    try {
      const json = query.serialize();
      if (json !== config.craft_blocks) {
        onUpdateConfig({ ...config, craft_blocks: json });
      }
    } catch { /* ignore */ }
  }, [query, config, onUpdateConfig]);

  useEffect(() => {
    const interval = setInterval(syncCraftState, 2000);
    return () => clearInterval(interval);
  }, [syncCraftState]);

  const handleExport = useCallback(() => {
    try {
      const json = query.serialize();
      exportEditorJson(json);
      toast.success('JSON exportado');
    } catch { toast.error('Erro ao exportar'); }
  }, [query]);

  const handleImport = useCallback(async () => {
    try {
      const json = await importEditorJson();
      actions.deserialize(json);
      syncCraftState();
      toast.success('Layout importado');
    } catch { toast.error('Erro ao importar'); }
  }, [actions, syncCraftState]);

  const isVertical = config.canvas.orientation === 'vertical';

  // Totem element definitions for the unified sidebar
  const totemElements = [
    { key: 'background', label: 'Cenário', icon: Paintbrush, iconColor: 'text-orange-400', enabled: true },
    { key: 'avatar', label: 'Avatar 3D', icon: User, iconColor: 'text-blue-400', enabled: config.components.avatar.enabled,
      toggle: (v: boolean) => onUpdateConfig({ ...config, components: { ...config.components, avatar: { ...config.components.avatar, enabled: v } } }) },
    { key: 'chat', label: 'Interface', icon: MessageSquare, iconColor: 'text-emerald-400', enabled: config.components.chat_interface.enabled,
      toggle: (v: boolean) => onUpdateConfig({ ...config, components: { ...config.components, chat_interface: { ...config.components.chat_interface, enabled: v } } }) },
    { key: 'logo', label: 'Logo', icon: ImageIcon, iconColor: 'text-purple-400', enabled: config.components.logo.enabled,
      toggle: (v: boolean) => onUpdateConfig({ ...config, components: { ...config.components, logo: { ...config.components.logo, enabled: v } } }) },
    { key: 'text_banners', label: 'Textos', icon: Type, iconColor: 'text-pink-400', enabled: config.components.text_banners?.enabled || false,
      toggle: (v: boolean) => onUpdateConfig({ ...config, components: { ...config.components, text_banners: { ...config.components.text_banners, enabled: v } } }) },
  ];

  // Layer types that can be added
  const layerTypes: { type: Layer['type']; label: string; icon: typeof ImageIcon }[] = [
    { type: 'image', label: 'Imagem', icon: ImageIcon },
    { type: 'video', label: 'Vídeo', icon: Play },
    { type: 'shape', label: 'Forma', icon: Square },
    { type: 'clock', label: 'Relógio', icon: Clock },
  ];

  const addLayerFromToolbox = (type: Layer['type']) => {
    const layer = createLayer(type);
    const layers = [...(config.layers || []), layer];
    onUpdateConfig({ ...config, layers });
    onSelectElement(layer.id);
    setSidebarTab('properties');
  };

  const handleSelectTotemElement = (key: string) => {
    onSelectElement(key);
    setSidebarTab('elements'); // Stay on Totem tab to show inline properties
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-card/50 mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm" className="gap-1.5 text-xs"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? 'Editar' : 'Preview'}
          </Button>
          <div className="h-4 w-px bg-border" />
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={() => actions.history.undo()}>
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={() => actions.history.redo()}>
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleImport}>
            <Upload className="w-3.5 h-3.5" /> Importar
          </Button>
          <div className="h-4 w-px bg-border" />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onFullscreen}>
            <Maximize2 className="w-3.5 h-3.5" /> Tela Cheia
          </Button>
        </div>
      </div>

      {/* 2-column layout: LEFT sidebar + canvas */}
      <div className="flex flex-1 gap-3 overflow-hidden">

        {/* LEFT SIDEBAR */}
        {!previewMode && (
          <div className="w-72 shrink-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
            <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'elements' | 'properties')} className="flex flex-col h-full">
              {/* Tabs: Totem / Blocos */}
              <TabsList className="w-full grid grid-cols-2 shrink-0 rounded-none border-b border-border bg-card/80">
                <TabsTrigger value="elements" className="text-xs gap-1.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Paintbrush className="w-3.5 h-3.5" /> Totem
                </TabsTrigger>
                <TabsTrigger value="properties" className="text-xs gap-1.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Edit3 className="w-3.5 h-3.5" /> Blocos
                </TabsTrigger>
              </TabsList>

              {/* TOTEM TAB — Elements + Properties */}
              <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {/* Header */}
                  <div className="p-4 pb-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-primary" /> Elementos
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Clique para editar • Arraste para mover</p>
                  </div>

                  {/* Totem Elements */}
                  <div className="px-3 pb-2 space-y-1">
                    {totemElements.map((el) => (
                      <div
                        key={el.key}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                          selectedElement === el.key
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-transparent hover:border-border hover:bg-muted/30'
                        }`}
                        onClick={() => handleSelectTotemElement(el.key)}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-muted/40 ${el.iconColor}`}>
                          <el.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground block">{el.label}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {el.key === 'background' ? 'Cor, gradiente ou imagem' : el.enabled ? 'Ativo' : 'Desativado'}
                          </span>
                        </div>
                        {el.toggle && (
                          <Switch
                            checked={el.enabled}
                            onCheckedChange={(v) => { el.toggle!(v); }}
                            className="scale-90"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    ))}
                  </div>

                  <Separator className="mx-3" />

                  {/* Camadas Personalizadas */}
                  <div className="p-3">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3 h-3" /> Camadas Personalizadas
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {layerTypes.map((lt) => (
                        <button
                          key={lt.type}
                          onClick={() => addLayerFromToolbox(lt.type)}
                          className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <lt.icon className="w-4 h-4" />
                          <span className="text-[10px] font-medium">{lt.label}</span>
                        </button>
                      ))}
                    </div>
                    {(config.layers || []).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {(config.layers || []).map((layer) => (
                          <div
                            key={layer.id}
                            className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-all text-xs group ${
                              selectedElement === layer.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                            }`}
                            onClick={() => handleSelectTotemElement(layer.id)}
                          >
                            {(() => {
                              const LIcon = layerTypes.find(l => l.type === layer.type)?.icon || Square;
                              return <LIcon className="w-3 h-3 shrink-0" />;
                            })()}
                            <span className="truncate flex-1">{layer.label}</span>
                            <button
                              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                const layers = (config.layers || []).filter(l => l.id !== layer.id);
                                onUpdateConfig({ ...config, layers });
                                if (selectedElement === layer.id) onSelectElement(null);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contextual Properties when element selected */}
                  {selectedElement && (
                    <>
                      <Separator className="mx-3" />
                      <ContextualSidebar
                        config={config}
                        selectedElement={selectedElement}
                        onChange={onUpdateConfig}
                        onSelectElement={onSelectElement}
                      />
                    </>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* BLOCOS TAB — Craft.js blocks + properties */}
              <TabsContent value="properties" className="flex-1 mt-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Edit3 className="w-3 h-3" /> Blocos Visuais
                    </h3>
                    <EditorToolbox />
                  </div>

                  <Separator className="mx-3" />

                  <div className="p-3">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Propriedades do Bloco
                    </h3>
                    <EditorProperties />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* CENTER — Canvas (no right sidebar) */}
        <div className="flex-1 overflow-auto flex flex-col gap-2 min-w-0">
          <div className="relative rounded-xl border border-border/60 bg-muted/10 overflow-hidden shadow-lg flex items-center justify-center"
               style={{ height: 'calc(100vh - 16rem)' }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-30" />

            <div className="relative h-full" style={{ aspectRatio: isVertical ? '9/16' : '16/9', maxHeight: '100%', maxWidth: '100%' }}>
              {/* Craft.js drop zone — behind TotemCanvas */}
              <div className="absolute inset-0 z-0">
                <Frame>
                  <Element is={CanvasDropArea} canvas bgColor="transparent" />
                </Frame>
              </div>

              {/* TotemCanvas on top — fully interactive */}
              <div className="relative z-10 w-full h-full">
                <TotemCanvas
                  config={config}
                  className="w-full h-full"
                  interactive={!previewMode}
                  selectedElement={selectedElement}
                  onSelectElement={(el) => {
                    onSelectElement(el);
                    setSidebarTab('elements');
                  }}
                  onUpdateConfig={onUpdateConfig}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            <span>{isVertical ? 'Portrait 9:16' : 'Landscape 16:9'}</span>
            <span>•</span>
            <span>Editor Unificado</span>
            <span>•</span>
            <span>{deviceName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
