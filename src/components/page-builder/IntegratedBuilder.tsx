import { useState, useCallback, useEffect, useRef } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Undo2, Redo2, Layers, Maximize2,
  MousePointer, Blocks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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

type EditMode = 'totem' | 'blocks';

function IntegratedBuilderInner({
  config, selectedElement, onSelectElement, onUpdateConfig,
  onFullscreen, deviceName = 'Totem', isOnline = false,
  previewMode, setPreviewMode,
}: IntegratedBuilderProps & { previewMode: boolean; setPreviewMode: (v: boolean) => void }) {
  const { actions, query, canUndo, canRedo } = useEditor((state, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));

  const [editMode, setEditMode] = useState<EditMode>('totem');
  const [rightTab, setRightTab] = useState<'totem' | 'bloco'>('totem');
  const loadedRef = useRef(false);

  // Load saved craft.js blocks from config
  useEffect(() => {
    if (loadedRef.current) return;
    if (config.craft_blocks) {
      try {
        actions.deserialize(config.craft_blocks);
        loadedRef.current = true;
      } catch {
        // ignore invalid state
      }
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

  // Auto-sync craft.js state every 2 seconds
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

  const switchToMode = (mode: EditMode) => {
    if (mode === 'blocks' && editMode === 'totem') {
      // Leaving totem mode — sync any pending craft state
    }
    setEditMode(mode);
    setRightTab(mode === 'totem' ? 'totem' : 'bloco');
  };

  const isVertical = config.canvas.orientation === 'vertical';

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-card/50 mb-3">
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <Button
              variant={editMode === 'totem' ? 'default' : 'ghost'}
              size="sm" className="gap-1.5 text-xs h-7 px-3"
              onClick={() => switchToMode('totem')}
            >
              <MousePointer className="w-3.5 h-3.5" /> Totem
            </Button>
            <Button
              variant={editMode === 'blocks' ? 'default' : 'ghost'}
              size="sm" className="gap-1.5 text-xs h-7 px-3"
              onClick={() => switchToMode('blocks')}
            >
              <Blocks className="w-3.5 h-3.5" /> Blocos
            </Button>
          </div>
          <div className="h-4 w-px bg-border" />
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm" className="gap-1.5 text-xs"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? 'Editar' : 'Preview'}
          </Button>
          {editMode === 'blocks' && (
            <>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={() => actions.history.undo()}>
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={() => actions.history.redo()}>
                <Redo2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {editMode === 'blocks' && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" /> Exportar
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleImport}>
                <Upload className="w-3.5 h-3.5" /> Importar
              </Button>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onFullscreen}>
            <Maximize2 className="w-3.5 h-3.5" /> Tela Cheia
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* LEFT — Block toolbox (only in blocks mode) */}
        {editMode === 'blocks' && !previewMode && (
          <div className="w-48 shrink-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Componentes
              </h3>
            </div>
            <ScrollArea className="flex-1 p-3">
              <EditorToolbox />
            </ScrollArea>
          </div>
        )}

        {/* CENTER — Canvas */}
        <div className="flex-1 overflow-auto flex flex-col gap-2 min-w-0">
          <div className="relative rounded-xl border border-border/60 bg-muted/10 overflow-hidden shadow-lg flex-1">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-30" />

            {/* TOTEM MODE: TotemCanvas is interactive */}
            {editMode === 'totem' && (
              <TotemCanvas
                config={config}
                className="w-full"
                interactive={!previewMode}
                selectedElement={selectedElement}
                onSelectElement={(el) => {
                  onSelectElement(el);
                  setRightTab('totem');
                }}
                onUpdateConfig={onUpdateConfig}
              />
            )}

            {/* BLOCKS MODE: craft.js is interactive, TotemCanvas is background */}
            {editMode === 'blocks' && (
              <div className="relative" style={{ aspectRatio: isVertical ? '9/16' : '16/9' }}>
                {/* TotemCanvas as non-interactive background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <TotemCanvas
                    config={config}
                    className="w-full h-full"
                    interactive={false}
                  />
                </div>

                {/* Craft.js interactive canvas on top */}
                <div className="absolute inset-0 z-10" style={{ minHeight: 200 }}>
                  <Frame>
                    <Element is={CanvasDropArea} canvas bgColor="transparent">
                      {/* Blocks dropped here */}
                    </Element>
                  </Frame>
                </div>
              </div>
            )}
          </div>

          {/* Bottom strip */}
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            <span>{isVertical ? 'Portrait 9:16' : 'Landscape 16:9'}</span>
            <span>•</span>
            <span>{editMode === 'totem' ? 'Modo Totem' : 'Modo Blocos'}</span>
            <span>•</span>
            <span>{deviceName}</span>
          </div>
        </div>

        {/* RIGHT — Contextual sidebar */}
        {!previewMode && (
          <div className="w-80 shrink-0 rounded-xl border border-border bg-card overflow-hidden flex flex-col lg:sticky lg:top-4" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
            <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as 'totem' | 'bloco')} className="flex flex-col h-full">
              <TabsList className="w-full grid grid-cols-2 shrink-0 rounded-none border-b border-border">
                <TabsTrigger value="totem" className="text-xs gap-1 rounded-none">
                  🎯 Totem
                </TabsTrigger>
                <TabsTrigger value="bloco" className="text-xs gap-1 rounded-none">
                  <Edit3 className="w-3.5 h-3.5" /> Blocos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="totem" className="flex-1 mt-0 overflow-hidden">
                <ContextualSidebar
                  config={config}
                  selectedElement={selectedElement}
                  onChange={onUpdateConfig}
                  onSelectElement={onSelectElement}
                />
              </TabsContent>

              <TabsContent value="bloco" className="flex-1 mt-0 overflow-hidden">
                <EditorProperties />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
