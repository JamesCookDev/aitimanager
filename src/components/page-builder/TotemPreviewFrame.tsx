import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Monitor, Smartphone, Signal, Wifi, WifiOff, Battery, Volume2 } from 'lucide-react';
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
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Top toolbar */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
            <motion.div
              className={cn('w-2 h-2 rounded-full', isOnline ? 'bg-success' : 'bg-destructive')}
              animate={{ scale: isOnline ? [1, 1.3, 1] : 1, opacity: isOnline ? [1, 0.6, 1] : 0.7 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              {isOnline ? 'Ao Vivo' : 'Offline'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground/60">
            <Monitor className="w-3 h-3" />
            <span>{isVertical ? '1080×1920' : '1920×1080'}</span>
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

      {/* Device Frame */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Outer glow */}
        <div className="absolute -inset-3 rounded-[2rem] opacity-30 blur-xl pointer-events-none"
          style={{ background: 'var(--gradient-primary)' }}
        />

        {/* Device bezel */}
        <div className={cn(
          'relative rounded-[1.5rem] p-3 bg-gradient-to-b from-[hsl(217,25%,18%)] to-[hsl(222,47%,8%)]',
          'border border-[hsl(217,25%,25%)] shadow-2xl',
          isVertical ? 'max-w-[420px]' : 'max-w-full',
        )}>
          {/* Top bezel bar — simulated device chrome */}
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-success/70" />
              ) : (
                <WifiOff className="w-3 h-3 text-destructive/50" />
              )}
              <Signal className="w-3 h-3 text-muted-foreground/40" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">
                {deviceName}
              </span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span className="text-[10px] font-mono text-muted-foreground/40">
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground/40" />
              <Battery className="w-3 h-3 text-muted-foreground/40" />
            </div>
          </div>

          {/* Screen area with inner shadow */}
          <div className="relative rounded-xl overflow-hidden ring-1 ring-white/5">
            {/* Scan line effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, hsl(217 91% 60% / 0.03) 50%, transparent 100%)',
                backgroundSize: '100% 4px',
              }}
            />

            {/* Subtle reflection overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />

            <TotemCanvas
              config={config}
              className="w-full"
              interactive
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onUpdateConfig={onUpdateConfig}
            />
          </div>

          {/* Bottom bezel — home indicator */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-24 h-1 rounded-full bg-muted-foreground/15" />
          </div>
        </div>

        {/* Reflection under the device */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-[50%] bg-primary/5 blur-xl pointer-events-none" />
      </motion.div>

      {/* Bottom info strip */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
        <span className="flex items-center gap-1">
          {isVertical ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
          {isVertical ? 'Portrait 9:16' : 'Landscape 16:9'}
        </span>
        <span>•</span>
        <span>Preview interativo</span>
        <span>•</span>
        <span>Drag & drop ativo</span>
      </div>
    </div>
  );
}
