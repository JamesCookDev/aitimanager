import { useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Undo2, Redo2, Maximize2,
  Type, ImageIcon, MousePointer2, LayoutGrid, User, Minus, MoveVertical,
  Menu, Sparkles, Tag, CreditCard, LayoutTemplate, BarChart3, Clock, Palette, Share2,
  Send, Layers, Radio, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import { ChatInterfaceBlock } from '@/editor/components/ChatInterfaceBlock';
import { SceneBlock } from '@/editor/components/SceneBlock';
import { CanvasDropArea } from '@/editor/components/CanvasDropArea';
import { EditorProperties } from '@/editor/components/EditorProperties';
import { exportEditorJson, importEditorJson } from '@/editor/utils/editorStorage';
import { TemplatePicker } from '@/editor/components/TemplatePicker';

import type { PageBuilderConfig } from '@/types/page-builder';

function formatTimeAgo(date: string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

const resolver = {
  TextBlock, ImageBlock, ButtonBlock, ContainerBlock, AvatarBlock,
  SpacerBlock, DividerBlock, MenuBlock, IconBlock, BadgeBlock, CardBlock,
  ProgressBlock, CountdownBlock, GradientTextBlock, SocialLinksBlock,
  VideoEmbedBlock, QRCodeBlock, ChatInterfaceBlock, SceneBlock, CanvasDropArea,
};

export interface IntegratedBuilderRef {
  forceSyncCraftState: () => PageBuilderConfig;
  publish: () => Promise<void>;
}

interface IntegratedBuilderProps {
  config: PageBuilderConfig;
  onUpdateConfig: (config: PageBuilderConfig) => void;
  onFullscreen: () => void;
  deviceName?: string;
  deviceId?: string | null;
  isOnline?: boolean;
  builderRef?: React.RefObject<IntegratedBuilderRef | null>;
}

export function IntegratedBuilder(props: IntegratedBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const nodesChangedRef = useRef<(() => void) | null>(null);

  const handleNodesChange = useCallback((query: any) => {
    nodesChangedRef.current?.();
  }, []);

  return (
    <Editor resolver={resolver} enabled={!previewMode} onNodesChange={handleNodesChange}>
      <IntegratedBuilderInner {...props} previewMode={previewMode} setPreviewMode={setPreviewMode} nodesChangedRef={nodesChangedRef} />
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
      { name: 'Cenário 3D', icon: Layers, element: <SceneBlock /> },
      { name: 'Chat IA', icon: Send, element: <ChatInterfaceBlock /> },
    ],
  },
] as const;

/* ─── Inner component ─────────────────────────────────────────────── */
function IntegratedBuilderInner({
  config, onUpdateConfig, onFullscreen,
  deviceName = 'Totem', deviceId, isOnline = false,
  previewMode, setPreviewMode, builderRef, nodesChangedRef,
}: IntegratedBuilderProps & { previewMode: boolean; setPreviewMode: (v: boolean) => void; nodesChangedRef: React.MutableRefObject<(() => void) | null> }) {
  const { actions, query, connectors, canUndo, canRedo } = useEditor((state, q) => ({
    canUndo: q.history.canUndo(),
    canRedo: q.history.canRedo(),
  }));

  const [leftTab, setLeftTab] = useState<'blocks' | 'templates'>('blocks');
  const [publishing, setPublishing] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);
  const [hasUnpublished, setHasUnpublished] = useState(false);
  const [liveActive, setLiveActive] = useState(false);
  // Canvas preview size controls
  const CANVAS_WIDTHS = [320, 420, 540, 720] as const;
  const [canvasWidthIdx, setCanvasWidthIdx] = useState(1); // default 420

  // Supabase Realtime broadcast channel for live preview
  const liveChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Create/destroy live preview channel when deviceId or isOnline changes
  useEffect(() => {
    if (liveChannelRef.current) {
      supabase.removeChannel(liveChannelRef.current);
      liveChannelRef.current = null;
      setLiveActive(false);
    }
    if (!deviceId || !isOnline) return;

    const channel = supabase.channel(`live-preview:${deviceId}`, {
      config: { broadcast: { self: false } },
    });
    channel.subscribe((status) => {
      setLiveActive(status === 'SUBSCRIBED');
    });
    liveChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      liveChannelRef.current = null;
      setLiveActive(false);
    };
  }, [deviceId, isOnline]);

  // Broadcast current craft state to totem via Realtime
  const broadcastLivePreview = useCallback((craftJson: string) => {
    if (!liveChannelRef.current || !isOnline) return;
    liveChannelRef.current.send({
      type: 'broadcast',
      event: 'ui-update',
      payload: { craft_blocks: craftJson, ts: Date.now() },
    }).catch(() => { /* silent */ });
  }, [isOnline]);


  useEffect(() => {
    if (!deviceId) { setLastPublishedAt(null); return; }
    supabase
      .from('devices')
      .select('updated_at')
      .eq('id', deviceId)
      .single()
      .then(({ data }) => { if (data?.updated_at) setLastPublishedAt(data.updated_at); });
  }, [deviceId]);
  const loadedRef = useRef(false);
  const prevCraftBlocksRef = useRef(config.craft_blocks);
  const configRef = useRef(config);
  const onUpdateConfigRef = useRef(onUpdateConfig);
  const lastSyncedJsonRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs up to date without causing re-renders
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { onUpdateConfigRef.current = onUpdateConfig; }, [onUpdateConfig]);

  // Load saved craft.js blocks from config (re-load on device switch)
  useEffect(() => {
    const craftBlocksChanged = config.craft_blocks !== prevCraftBlocksRef.current;
    prevCraftBlocksRef.current = config.craft_blocks;

    if (loadedRef.current && !craftBlocksChanged) return;

    if (config.craft_blocks) {
      try {
        actions.deserialize(config.craft_blocks);
        lastSyncedJsonRef.current = config.craft_blocks;
      } catch { /* ignore */ }
    }
    loadedRef.current = true;
  }, [config.craft_blocks, actions]);

  // Sync craft.js state back to config (uses refs to avoid dependency loops)
  const syncCraftState = useCallback((): PageBuilderConfig => {
    try {
      const json = query.serialize();
      // Only sync if craft state actually changed since last sync
      if (json === lastSyncedJsonRef.current) return configRef.current;
      lastSyncedJsonRef.current = json;

      let updated = { ...configRef.current, craft_blocks: json };

      try {
        const nodes = JSON.parse(json);

        // Extract AvatarBlock props
        const avatarNode = Object.values(nodes).find(
          (n: any) => n.type?.resolvedName === 'AvatarBlock'
        ) as any;
        if (avatarNode?.props) {
          const ap = avatarNode.props;
          updated = {
            ...updated,
            components: {
              ...updated.components,
              avatar: {
                enabled: ap.enabled ?? true,
                position: ap.position ?? 'center',
                scale: ap.scale ?? 1.5,
                animation: ap.idleAnimation ?? 'Idle',
                colors: {
                  shirt: ap.shirtColor ?? '#1E3A8A',
                  pants: ap.pantsColor ?? '#1F2937',
                  shoes: ap.shoesColor ?? '#000000',
                },
                models: {
                  avatar_url: ap.avatarUrl ?? '/models/avatar.glb',
                  animations_url: ap.animationsUrl ?? '/models/animations.glb',
                },
                animations: {
                  idle: ap.idleAnimation ?? 'Idle',
                  talking: ap.talkingAnimation ?? 'TalkingOne',
                },
                materials: {
                  roughness: ap.roughness ?? 0.5,
                  metalness: ap.metalness ?? 0,
                },
              } as any,
            },
          };
        }

        // Extract ButtonBlock props into components.buttons array
        const buttonNodes = Object.values(nodes).filter(
          (n: any) => n.type?.resolvedName === 'ButtonBlock'
        ) as any[];
        if (buttonNodes.length > 0) {
          const buttons = buttonNodes.map((bn: any) => ({
            label: bn.props?.label ?? 'Clique aqui',
            bgColor: bn.props?.bgColor ?? '#3b82f6',
            textColor: bn.props?.textColor ?? '#ffffff',
            fontSize: bn.props?.fontSize ?? 16,
            borderRadius: bn.props?.borderRadius ?? 8,
            paddingX: bn.props?.paddingX ?? 24,
            paddingY: bn.props?.paddingY ?? 14,
            fullWidth: bn.props?.fullWidth ?? false,
            action: bn.props?.action ?? '',
            borderColor: bn.props?.borderColor ?? 'transparent',
            borderWidth: bn.props?.borderWidth ?? 0,
            shadow: bn.props?.shadow ?? 'none',
            opacity: bn.props?.opacity ?? 1,
            fontWeight: bn.props?.fontWeight ?? 'semibold',
            icon: bn.props?.icon ?? '',
            iconPosition: bn.props?.iconPosition ?? 'left',
          }));
          updated = { ...updated, components: { ...updated.components, buttons } };
        }

        // Extract SocialLinksBlock props
        const socialNodes = Object.values(nodes).filter(
          (n: any) => n.type?.resolvedName === 'SocialLinksBlock'
        ) as any[];
        if (socialNodes.length > 0) {
          const social_links = socialNodes.map((sn: any) => ({
            links: sn.props?.links ?? [],
            layout: sn.props?.layout ?? 'horizontal',
            iconSize: sn.props?.iconSize ?? 40,
            gap: sn.props?.gap ?? 12,
            showLabels: sn.props?.showLabels ?? true,
            bgEnabled: sn.props?.bgEnabled ?? false,
            bgColor: sn.props?.bgColor ?? 'rgba(255,255,255,0.06)',
            borderRadius: sn.props?.borderRadius ?? 16,
            padding: sn.props?.padding ?? 12,
          }));
          updated = { ...updated, components: { ...updated.components, social_links } };
        }

        // Extract VideoEmbedBlock props
        const videoNodes = Object.values(nodes).filter(
          (n: any) => n.type?.resolvedName === 'VideoEmbedBlock'
        ) as any[];
        if (videoNodes.length > 0) {
          const videos = videoNodes.map((vn: any) => ({
            url: vn.props?.url ?? '',
            aspectRatio: vn.props?.aspectRatio ?? '16:9',
            borderRadius: vn.props?.borderRadius ?? 12,
            autoplay: vn.props?.autoplay ?? false,
            muted: vn.props?.muted ?? true,
            loop: vn.props?.loop ?? true,
            opacity: vn.props?.opacity ?? 1,
          }));
          updated = { ...updated, components: { ...updated.components, videos } };
        }

        // Extract QRCodeBlock props
        const qrNodes = Object.values(nodes).filter(
          (n: any) => n.type?.resolvedName === 'QRCodeBlock'
        ) as any[];
        if (qrNodes.length > 0) {
          const qr_codes = qrNodes.map((qn: any) => ({
            content: qn.props?.content ?? '',
            size: qn.props?.size ?? 160,
            fgColor: qn.props?.fgColor ?? '#ffffff',
            bgColor: qn.props?.bgColor ?? 'transparent',
            borderRadius: qn.props?.borderRadius ?? 8,
            padding: qn.props?.padding ?? 12,
            label: qn.props?.label ?? '',
            labelColor: qn.props?.labelColor ?? '#ffffff',
            labelSize: qn.props?.labelSize ?? 12,
          }));
          updated = { ...updated, components: { ...updated.components, qr_codes } };
        }
      } catch { /* ignore parse errors */ }

      onUpdateConfigRef.current(updated);
      setHasUnpublished(true);
      // Broadcast live preview to totem when online
      broadcastLivePreview(json);
      return updated;
    } catch { /* ignore */ }
    return configRef.current;
  }, [query, broadcastLivePreview]);

  // Wire up onNodesChange from Editor to debounced sync
  useEffect(() => {
    nodesChangedRef.current = () => {
      if (!loadedRef.current) return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(syncCraftState, 800);
    };
    return () => {
      nodesChangedRef.current = null;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [nodesChangedRef, syncCraftState]);

  const handleExport = useCallback(() => {
    try { exportEditorJson(query.serialize()); toast.success('JSON exportado'); }
    catch { toast.error('Erro ao exportar'); }
  }, [query]);

  const handleImport = useCallback(async () => {
    try { const json = await importEditorJson(); actions.deserialize(json); syncCraftState(); toast.success('Layout importado'); }
    catch { toast.error('Erro ao importar'); }
  }, [actions, syncCraftState]);

  const handlePublish = useCallback(async () => {
    if (!deviceId) { toast.error('Nenhum dispositivo selecionado'); return; }
    setPublishing(true);
    try {
      // Força sync antes de publicar para garantir dados mais recentes
      let json: string;
      try { json = query.serialize(); } catch { json = lastSyncedJsonRef.current || '{}'; }

      const current = configRef.current;
      const configToSave = { ...current, craft_blocks: json };

      const { data, error } = await supabase
        .from('devices')
        .update({ ui_config: configToSave as any })
        .eq('id', deviceId)
        .select('updated_at')
        .single();

      if (error) throw error;

      onUpdateConfigRef.current(configToSave);
      lastSyncedJsonRef.current = json;
      if (data?.updated_at) setLastPublishedAt(data.updated_at);
      setHasUnpublished(false);
      toast.success('✅ Publicado no Totem!', { description: 'O hardware receberá as mudanças no próximo ciclo.' });
    } catch (err: any) {
      console.error('[Publish] Erro:', err);
      toast.error('Erro ao publicar', { description: err?.message ?? 'Verifique sua conexão e tente novamente.' });
    } finally {
      setPublishing(false);
    }
  }, [deviceId, query]);

  const handleRestart = useCallback(async () => {
    if (!deviceId) { toast.error('Nenhum dispositivo selecionado'); return; }
    setRestarting(true);
    try {
      const { error } = await supabase
        .from('devices')
        .update({ pending_command: 'restart', command_sent_at: new Date().toISOString() } as any)
        .eq('id', deviceId);
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('command_logs').insert({ device_id: deviceId, command: 'restart', sent_by: user.id } as any);
      }
      toast.success('🔄 Comando de reinicialização enviado!', { description: 'O totem reiniciará no próximo heartbeat.' });
    } catch (err: any) {
      toast.error('Erro ao enviar comando de reinicialização', { description: err?.message });
    } finally {
      setRestarting(false);
    }
  }, [deviceId]);

  useImperativeHandle(builderRef, () => ({
    forceSyncCraftState: syncCraftState,
    publish: handlePublish,
  }), [syncCraftState, handlePublish]);

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] rounded-xl border border-border bg-card overflow-hidden">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-border bg-card shrink-0 gap-2">

        {/* Esquerda: nome + status + live */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[120px]">{deviceName}</span>
          <div className={cn('w-2 h-2 rounded-full shrink-0', isOnline ? 'bg-primary' : 'bg-muted-foreground/40')} />
          {liveActive && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Radio className="w-2 h-2 animate-pulse" /> Ao Vivo
            </div>
          )}
        </div>

        {/* Centro: modo Editar | Preview */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setPreviewMode(false)}
            className={cn('px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1',
              !previewMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <Edit3 className="w-3 h-3" /> Editar
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className={cn('px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1',
              previewMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>

        {/* Direita: undo/redo + controles + publicar */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canUndo} onClick={() => actions.history.undo()} title="Desfazer (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canRedo} onClick={() => actions.history.redo()} title="Refazer (Ctrl+Y)">
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExport} title="Exportar JSON">
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleImport} title="Importar JSON">
            <Upload className="w-3.5 h-3.5" />
          </Button>
          {/* Canvas size picker */}
          <div className="flex items-center gap-0.5 bg-muted rounded-md px-1 h-7">
            {CANVAS_WIDTHS.map((w, i) => (
              <button
                key={w}
                onClick={() => setCanvasWidthIdx(i)}
                className={cn(
                  'text-[9px] font-bold px-1.5 h-5 rounded transition-all',
                  canvasWidthIdx === i ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                title={`Preview ${w}px`}
              >{w}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7 px-2.5" onClick={onFullscreen} title="Fullscreen Totem">
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Full</span>
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          {/* Botão Reiniciar */}
          {deviceId && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1 h-7 px-2.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
              onClick={handleRestart}
              disabled={restarting}
              title="Reiniciar totem"
            >
              <RefreshCw className={cn('w-3 h-3', restarting && 'animate-spin')} />
              <span className="hidden sm:inline">{restarting ? '...' : 'Reiniciar'}</span>
            </Button>
          )}
          {/* Botão Publicar — estado visual claro */}
          <div className="relative">
            <Button
              size="sm"
              className={cn(
                'text-xs gap-1.5 h-7 px-3 font-semibold transition-all',
                hasUnpublished
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
              )}
              onClick={handlePublish}
              disabled={publishing}
              title={hasUnpublished ? 'Publicar alterações no Totem' : 'Tudo publicado'}
            >
              <Send className="w-3 h-3" />
              {publishing ? 'Publicando...' : hasUnpublished ? 'Publicar' : 'Publicado ✓'}
            </Button>
            {hasUnpublished && !publishing && (
              <span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold animate-pulse"
                style={{ backgroundColor: 'hsl(48 96% 53%)', color: 'hsl(26 83% 14%)' }}
              >!</span>
            )}
          </div>
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
                            onClick={() => {
                              try {
                                const rootNode = query.node('ROOT').get();
                                actions.add(block.element, 'ROOT', rootNode.data.nodes?.length ?? 0);
                              } catch { /* ignore if canvas not ready */ }
                            }}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 cursor-pointer active:cursor-grabbing transition-all active:scale-95 group"
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
          'flex-1 flex items-start justify-center min-w-0 p-4 overflow-y-auto',
          'bg-[hsl(var(--muted)/0.3)]',
        )}>
          <div
            className={cn(
              'rounded-xl border-2 shadow-xl shrink-0 transition-all duration-300',
              previewMode ? 'border-primary/30 shadow-primary/10' : 'border-border/60'
            )}
            style={{
              width: `min(100%, ${CANVAS_WIDTHS[canvasWidthIdx]}px)`,
              backgroundColor: '#0f172a',
            }}
          >
            {previewMode && (
              <div className="absolute top-3 left-3 z-40 flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                <Eye className="w-3 h-3" /> Preview
              </div>
            )}

            {/*
              NO overflow-hidden or overflow-y-auto here — absolute blocks must not be
              clipped or get a new offsetParent. The CanvasDropArea has position:relative
              and min-height:740px, giving absolute children a proper anchor.
            */}
            <Frame>
              <Element is={CanvasDropArea} canvas bgColor="#0f172a" />
            </Frame>
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
          <span>{CANVAS_WIDTHS[canvasWidthIdx]}px preview</span>
          {lastPublishedAt && (
            <>
              <span>•</span>
              <span className={hasUnpublished ? 'text-yellow-500/80' : ''}>
                {hasUnpublished ? '● Alterações não publicadas' : `✓ Publicado ${formatTimeAgo(lastPublishedAt)}`}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
          <span>{previewMode ? '👁 Preview' : '✏️ Edição'}</span>
        </div>
      </div>
    </div>
  );
}
