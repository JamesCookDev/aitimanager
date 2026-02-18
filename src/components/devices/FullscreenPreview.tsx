import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Monitor, Smartphone } from 'lucide-react';

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

import type { PageBuilderConfig } from '@/types/page-builder';

const resolver = {
  TextBlock, ImageBlock, ButtonBlock, ContainerBlock, AvatarBlock,
  SpacerBlock, DividerBlock, MenuBlock, IconBlock, BadgeBlock, CardBlock,
  ProgressBlock, CountdownBlock, GradientTextBlock, SocialLinksBlock,
  VideoEmbedBlock, QRCodeBlock, CanvasDropArea,
};

interface FullscreenPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PageBuilderConfig;
  deviceName?: string;
  isOnline?: boolean;
}

function FullscreenCanvasInner({ craftBlocks }: { craftBlocks?: string }) {
  const { actions } = useEditor();

  useEffect(() => {
    if (craftBlocks) {
      try { actions.deserialize(craftBlocks); } catch { /* ignore */ }
    }
  }, [craftBlocks, actions]);

  return (
    <div className="w-full h-full overflow-auto" style={{ backgroundColor: '#0f172a' }}>
      <Frame>
        <Element is={CanvasDropArea} canvas bgColor="#0f172a" />
      </Frame>
    </div>
  );
}

export function FullscreenPreview({ open, onOpenChange, config, deviceName = 'Totem', isOnline = false }: FullscreenPreviewProps) {
  const isVertical = config.canvas?.orientation === 'vertical';
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-0 rounded-none bg-black/95 [&>button]:hidden">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <motion.div
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}
                animate={{ scale: isOnline ? [1, 1.3, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                Preview do Totem
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/30">
              {isVertical ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span>{isVertical ? '1080×1920' : '1920×1080'}</span>
              <span className="opacity-40">•</span>
              <span>{deviceName}</span>
              <span className="opacity-40">•</span>
              <span>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          <Button
            variant="ghost" size="icon"
            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full h-9 w-9 border border-white/10 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Canvas centered with Craft.js */}
        <div className="w-full h-full flex items-center justify-center p-6 pt-16">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              height: '88vh',
              aspectRatio: isVertical ? '9/16' : '16/9',
              maxWidth: '92vw',
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -inset-6 rounded-3xl opacity-15 blur-3xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(260, 80%, 50%))' }}
            />

            {/* Device bezel */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[hsl(220,15%,18%)] to-[hsl(222,30%,8%)] border border-white/10 shadow-2xl p-1.5">
              {/* Screen notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-black/80 rounded-b-lg z-10" />

              <div className="w-full h-full rounded-xl overflow-hidden ring-1 ring-white/5">
                <Editor resolver={resolver} enabled={false}>
                  <FullscreenCanvasInner craftBlocks={config.craft_blocks} />
                </Editor>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
