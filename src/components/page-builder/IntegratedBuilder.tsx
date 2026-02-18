import { useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Undo2, Redo2, Maximize2,
  Type, ImageIcon, MousePointer2, LayoutGrid, User, Minus, MoveVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { TextBlock } from '@/editor/components/TextBlock';
import { ImageBlock } from '@/editor/components/ImageBlock';
import { ButtonBlock } from '@/editor/components/ButtonBlock';
import { ContainerBlock } from '@/editor/components/ContainerBlock';
import { AvatarBlock } from '@/editor/components/AvatarBlock';
import { SpacerBlock } from '@/editor/components/SpacerBlock';
import { DividerBlock } from '@/editor/components/DividerBlock';
import { CanvasDropArea } from '@/editor/components/CanvasDropArea';
import { EditorProperties } from '@/editor/components/EditorProperties';
import { exportEditorJson, importEditorJson } from '@/editor/utils/editorStorage';

import type { PageBuilderConfig } from '@/types/page-builder';

const resolver = { TextBlock, ImageBlock, ButtonBlock, ContainerBlock, AvatarBlock, SpacerBlock, DividerBlock, CanvasDropArea };

export interface IntegratedBuilderRef {
  forceSyncCraftState: () => PageBuilderConfig;
}

interface IntegratedBuilderProps {
  config: PageBuilderConfig;
  onUpdateConfig: (config: PageBuilderConfig) => void;
  onFullscreen: () => void;
  deviceName?: string;
  isOnline?: boolean;
  builderRef?: React.RefObject<IntegratedBuilderRef | null>;
}

export function IntegratedBuilder(props: IntegratedBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <Editor resolver={resolver} enabled={!previewMode}>
      <IntegratedBuilderInner {...props} previewMode={previewMode} setPreviewMode={setPreviewMode} />
    </Editor>
  );
}

const CRAFT_BLOCKS = [
  { name: 'Texto', icon: Type, element: <TextBlock /> },
  { name: 'Imagem', icon: ImageIcon, element: <ImageBlock /> },
  { name: 'Botão', icon: MousePointer2, element: <ButtonBlock /> },
  { name: 'Avatar', icon: User, element: <AvatarBlock /> },
  { name: 'Container', icon: LayoutGrid, element: <Element is={ContainerBlock} canvas /> },
  { name: 'Espaçador', icon: MoveVertical, element: <SpacerBlock /> },
  { name: 'Divisor', icon: Minus, element: <DividerBlock /> },
] as const;

/* ─── Inner component ─────────────────────────────────────────────── */
function IntegratedBuilderInner({
  config, onUpdateConfig, onFullscreen,
  deviceName = 'Totem', isOnline = false,
  previewMode, setPreviewMode, builderRef,
}: IntegratedBuilderProps & { previewMode: boolean; setPreviewMode: (v: boolean) => void }) {
  const { actions, query, connectors, canUndo, canRedo } = useEditor((state, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));

  const loadedRef = useRef(false);
  const prevCraftBlocksRef = useRef(config.craft_blocks);

  // Load saved craft.js blocks from config (re-load on device switch)
  useEffect(() => {
    const craftBlocksChanged = config.craft_blocks !== prevCraftBlocksRef.current;
    prevCraftBlocksRef.current = config.craft_blocks;

    if (loadedRef.current && !craftBlocksChanged) return;

    if (config.craft_blocks) {
      try { actions.deserialize(config.craft_blocks); } catch { /* ignore */ }
    }
    loadedRef.current = true;
  }, [config.craft_blocks, actions]);

  // Sync craft.js state back to config — returns the latest config
  // Also extracts AvatarBlock.enabled and syncs it to components.avatar.enabled
  const syncCraftState = useCallback((): PageBuilderConfig => {
    try {
      const json = query.serialize();
      if (json !== config.craft_blocks) {
        let updated = { ...config, craft_blocks: json };

        // Extract AvatarBlock enabled state from craft nodes and sync to components
        try {
          const nodes = JSON.parse(json);
          const avatarNode = Object.values(nodes).find(
            (n: any) => n.type?.resolvedName === 'AvatarBlock'
          ) as any;
          if (avatarNode && typeof avatarNode.props?.enabled === 'boolean') {
            updated = {
              ...updated,
              components: {
                ...updated.components,
                avatar: { ...updated.components.avatar, enabled: avatarNode.props.enabled },
              },
            };
          }
        } catch { /* ignore parse errors */ }

        onUpdateConfig(updated);
        return updated;
      }
    } catch { /* ignore */ }
    return config;
  }, [query, config, onUpdateConfig]);

  // Expose imperative handle so parent can force-sync before saving
  useImperativeHandle(builderRef, () => ({
    forceSyncCraftState: syncCraftState,
  }), [syncCraftState]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] rounded-xl border border-border bg-card overflow-hidden">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-card shrink-0">
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

        {/* ─── LEFT SIDEBAR: Craft.js Blocks ─── */}
        {!previewMode && (
          <div className="w-56 shrink-0 border-r border-border bg-card flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
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

        {/* ─── CENTER: Canvas (Craft.js only) ─── */}
        <div className={cn(
          'flex-1 flex items-center justify-center overflow-auto min-w-0',
          'bg-[hsl(var(--muted)/0.3)]',
        )}>
          <div
            className={cn(
              'relative rounded-xl border-2 overflow-hidden shadow-xl shrink-0 transition-all',
              previewMode ? 'border-primary/30 shadow-primary/10' : 'border-border/60'
            )}
            style={{
              width: '100%',
              maxWidth: '420px',
              aspectRatio: '9/16',
              backgroundColor: '#0f172a',
            }}
          >
            {previewMode && (
              <div className="absolute top-3 left-3 z-40 flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                <Eye className="w-3 h-3" /> Preview
              </div>
            )}

            <div className="w-full h-full">
              <Frame>
                <Element is={CanvasDropArea} canvas bgColor="#0f172a" />
              </Frame>
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
              <div className="p-3">
                <EditorProperties />
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM STATUS BAR ═══ */}
      <div className="h-7 flex items-center justify-between px-4 border-t border-border bg-card/80 shrink-0">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
          <span>1080×1920 (9:16)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
          <span>{previewMode ? 'Modo Preview' : 'Modo Edição'}</span>
        </div>
      </div>
    </div>
  );
}
