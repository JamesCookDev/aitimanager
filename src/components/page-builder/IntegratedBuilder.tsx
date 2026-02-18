import { useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Undo2, Redo2, Maximize2,
  Type, ImageIcon, MousePointer2, LayoutGrid, User, Minus, MoveVertical,
  Menu, Sparkles, Tag, CreditCard, LayoutTemplate, BarChart3, Clock, Palette, Share2,
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
import { MenuBlock } from '@/editor/components/MenuBlock';
import { IconBlock } from '@/editor/components/IconBlock';
import { BadgeBlock } from '@/editor/components/BadgeBlock';
import { CardBlock } from '@/editor/components/CardBlock';
import { ProgressBlock } from '@/editor/components/ProgressBlock';
import { CountdownBlock } from '@/editor/components/CountdownBlock';
import { GradientTextBlock } from '@/editor/components/GradientTextBlock';
import { SocialLinksBlock } from '@/editor/components/SocialLinksBlock';
import { VideoEmbedBlock } from '@/editor/components/VideoEmbedBlock';
import { QRCodeBlock } from '@/editor/components/QRCodeBlock';
import { CanvasDropArea } from '@/editor/components/CanvasDropArea';
import { EditorProperties } from '@/editor/components/EditorProperties';
import { exportEditorJson, importEditorJson } from '@/editor/utils/editorStorage';
import { TemplatePicker } from '@/editor/components/TemplatePicker';

import type { PageBuilderConfig } from '@/types/page-builder';

const resolver = {
  TextBlock, ImageBlock, ButtonBlock, ContainerBlock, AvatarBlock,
  SpacerBlock, DividerBlock, MenuBlock, IconBlock, BadgeBlock, CardBlock,
  ProgressBlock, CountdownBlock, GradientTextBlock, SocialLinksBlock,
  VideoEmbedBlock, QRCodeBlock, CanvasDropArea,
};

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

const BLOCK_CATEGORIES = [
  {
    label: 'Conteúdo',
    blocks: [
      { name: 'Texto', icon: Type, element: <TextBlock /> },
      { name: 'Gradiente', icon: Palette, element: <GradientTextBlock /> },
      { name: 'Imagem', icon: ImageIcon, element: <ImageBlock /> },
      { name: 'Ícone', icon: Sparkles, element: <IconBlock /> },
      { name: 'Badge', icon: Tag, element: <BadgeBlock /> },
    ],
  },
  {
    label: 'Interação',
    blocks: [
      { name: 'Botão', icon: MousePointer2, element: <ButtonBlock /> },
      { name: 'Menu', icon: Menu, element: <MenuBlock /> },
      { name: 'Social', icon: Share2, element: <SocialLinksBlock /> },
    ],
  },
  {
    label: 'Mídia',
    blocks: [
      { name: 'Vídeo', icon: ImageIcon, element: <VideoEmbedBlock /> },
      { name: 'QR Code', icon: Sparkles, element: <QRCodeBlock /> },
    ],
  },
  {
    label: 'Dados',
    blocks: [
      { name: 'Progresso', icon: BarChart3, element: <ProgressBlock /> },
      { name: 'Relógio', icon: Clock, element: <CountdownBlock /> },
    ],
  },
  {
    label: 'Layout',
    blocks: [
      { name: 'Container', icon: LayoutGrid, element: <Element is={ContainerBlock} canvas /> },
      { name: 'Card', icon: CreditCard, element: <Element is={CardBlock} canvas /> },
      { name: 'Espaçador', icon: MoveVertical, element: <SpacerBlock /> },
      { name: 'Divisor', icon: Minus, element: <DividerBlock /> },
    ],
  },
  {
    label: '3D / Avatar',
    blocks: [
      { name: 'Avatar', icon: User, element: <AvatarBlock /> },
    ],
  },
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

  const [leftTab, setLeftTab] = useState<'blocks' | 'templates'>('blocks');
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

  // Sync craft.js state back to config
  const syncCraftState = useCallback((): PageBuilderConfig => {
    try {
      const json = query.serialize();
      if (json !== config.craft_blocks) {
        let updated = { ...config, craft_blocks: json };

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
            <Maximize2 className="w-3.5 h-3.5" /> Preview Totem
          </Button>
        </div>
      </div>

      {/* ═══ 3-COLUMN LAYOUT ═══ */}
      <div className="flex flex-1 min-h-0">

        {/* ─── LEFT SIDEBAR: Blocks + Templates ─── */}
        {!previewMode && (
          <div className="w-56 shrink-0 border-r border-border bg-card flex flex-col min-h-0">
            {/* Tab switcher */}
            <div className="flex border-b border-border shrink-0">
              <button
                onClick={() => setLeftTab('blocks')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors border-b-2',
                  leftTab === 'blocks'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Blocos
              </button>
              <button
                onClick={() => setLeftTab('templates')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors border-b-2',
                  leftTab === 'templates'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> Templates
              </button>
            </div>

            {leftTab === 'blocks' ? (
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-5">
                  {BLOCK_CATEGORIES.map((cat) => (
                    <div key={cat.label}>
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                        {cat.label}
                      </h3>
                      <div className="grid grid-cols-2 gap-1.5">
                        {cat.blocks.map((block) => (
                          <div
                            key={block.name}
                            ref={(ref) => { if (ref) connectors.create(ref, block.element); }}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all active:scale-95 group"
                          >
                            <block.icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{block.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <TemplatePicker onApplied={() => syncCraftState()} />
            )}
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
          <span>•</span>
          <span>{Object.keys(BLOCK_CATEGORIES).length} categorias • {BLOCK_CATEGORIES.reduce((a, c) => a + c.blocks.length, 0)} blocos</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
          <span>{previewMode ? 'Modo Preview' : 'Modo Edição'}</span>
        </div>
      </div>
    </div>
  );
}
