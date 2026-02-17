import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Wifi, WifiOff, Monitor, Smartphone } from 'lucide-react';
import { TotemCanvas } from '@/components/page-builder/TotemCanvas';
import type { PageBuilderConfig } from '@/types/page-builder';

interface FullscreenPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PageBuilderConfig;
  deviceName?: string;
  isOnline?: boolean;
}

export function FullscreenPreview({ open, onOpenChange, config, deviceName = 'Totem', isOnline = false }: FullscreenPreviewProps) {
  const isVertical = config.canvas.orientation === 'vertical';
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
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <motion.div
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}
                animate={{ scale: isOnline ? [1, 1.3, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                Simulação em Tela Cheia
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/30">
              {isVertical ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span>{isVertical ? '1080×1920' : '1920×1080'}</span>
              <span>•</span>
              <span>{deviceName}</span>
              <span>•</span>
              <span>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          <Button
            variant="ghost" size="icon"
            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full h-10 w-10 border border-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Canvas centered */}
        <div className="w-full h-full flex items-center justify-center p-8 pt-20">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              height: '85vh',
              aspectRatio: isVertical ? '9/16' : '16/9',
              maxWidth: '90vw',
            }}
          >
            {/* Ambient glow */}
            <div className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'var(--gradient-primary)' }}
            />

            {/* Bezel */}
            <div className="relative w-full h-full rounded-2xl p-2 bg-gradient-to-b from-[hsl(217,20%,15%)] to-[hsl(222,40%,6%)] border border-white/10 shadow-2xl">
              <div className="w-full h-full rounded-xl overflow-hidden ring-1 ring-white/5">
                <TotemCanvas config={config} className="w-full h-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
