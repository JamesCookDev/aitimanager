import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2 } from 'lucide-react';
import { TotemCanvas } from '@/components/page-builder/TotemCanvas';
import type { PageBuilderConfig } from '@/types/page-builder';

interface FullscreenPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PageBuilderConfig;
}

export function FullscreenPreview({ open, onOpenChange, config }: FullscreenPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-0 rounded-none bg-black [&>button]:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-white/70" />
          <span className="text-xs text-white/70 font-medium">Preview em Tela Cheia</span>
        </div>

        <div className="w-full h-full flex items-center justify-center p-8">
          <TotemCanvas config={config} className="max-h-full max-w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
