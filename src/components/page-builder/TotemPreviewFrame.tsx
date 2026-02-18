import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Monitor, Smartphone, Wifi, WifiOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TotemCanvas, type CanvasSelection } from './TotemCanvas';
import type { PageBuilderConfig } from '@/types/page-builder';
import { cn } from '@/lib/utils';

interface TotemPreviewFrameProps {
  config: PageBuilderConfig;
  selectedElement: CanvasSelection;
  onSelectElement: (el: CanvasSelection) => void;
  onUpdateConfig: (config: PageBuilderConfig) => void;
  onFullscreen: () => void;
  deviceName?: string;
  isOnline?: boolean;
}

export function TotemPreviewFrame({
  config, selectedElement, onSelectElement, onUpdateConfig,
  onFullscreen, deviceName = 'Totem', isOnline = false,
}: TotemPreviewFrameProps) {
  const isVertical = config.canvas.orientation === 'vertical';
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/50">
            <motion.div
              className={cn('w-2 h-2 rounded-full', isOnline ? 'bg-success' : 'bg-destructive')}
              animate={{ scale: isOnline ? [1, 1.3, 1] : 1, opacity: isOnline ? [1, 0.6, 1] : 0.7 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {isOnline ? 'Ao Vivo' : 'Offline'}
            </span>
          </div>

          {/* Resolution */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            {isVertical ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{isVertical ? '1080×1920' : '1920×1080'}</span>
          </div>

          {/* Device name */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
            <span>•</span>
            <span>{deviceName}</span>
            <span>•</span>
            <span>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            className="gap-1.5 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5"
            onClick={onFullscreen}
          >
            <Maximize2 className="w-3.5 h-3.5" /> Tela Cheia
          </Button>
        </div>
      </div>

      {/* Canvas area — clean editor style */}
      <motion.div
        className="relative w-full rounded-xl border border-border/60 bg-muted/10 overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ minHeight: '70vh' }}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10" />

        <TotemCanvas
          config={config}
          className="w-full h-full"
          interactive
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
          onUpdateConfig={onUpdateConfig}
        />
      </motion.div>

      {/* Bottom info strip */}
      <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest px-1">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Preview interativo
        </span>
        <span>•</span>
        <span>{isVertical ? 'Portrait 9:16' : 'Landscape 16:9'}</span>
        <span>•</span>
        <span>Drag & drop ativo</span>
      </div>
    </div>
  );
}
