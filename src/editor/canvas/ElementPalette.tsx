import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe,
} from 'lucide-react';
import type { ElementType } from '../types/canvas';
import { createElement } from '../types/canvas';
import type { CanvasElement } from '../types/canvas';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  onAdd: (element: CanvasElement) => void;
}

const CATEGORIES = [
  {
    label: 'Conteúdo',
    items: [
      { type: 'text' as ElementType, icon: Type, label: 'Texto' },
      { type: 'image' as ElementType, icon: Image, label: 'Imagem' },
      { type: 'button' as ElementType, icon: MousePointer2, label: 'Botão' },
      { type: 'shape' as ElementType, icon: Square, label: 'Forma' },
      { type: 'icon' as ElementType, icon: Sparkles, label: 'Ícone' },
    ],
  },
  {
    label: 'Mídia',
    items: [
      { type: 'video' as ElementType, icon: Play, label: 'Vídeo' },
      { type: 'carousel' as ElementType, icon: GalleryHorizontal, label: 'Carrossel' },
      { type: 'iframe' as ElementType, icon: Globe, label: 'Iframe' },
    ],
  },
  {
    label: 'Interação',
    items: [
      { type: 'qrcode' as ElementType, icon: QrCode, label: 'QR Code' },
      { type: 'map' as ElementType, icon: MapPin, label: 'Mapa' },
      { type: 'social' as ElementType, icon: Share2, label: 'Redes Sociais' },
      { type: 'chat' as ElementType, icon: MessageSquare, label: 'Chat IA' },
    ],
  },
  {
    label: 'Dados',
    items: [
      { type: 'clock' as ElementType, icon: Clock, label: 'Relógio' },
      { type: 'weather' as ElementType, icon: CloudSun, label: 'Clima' },
      { type: 'countdown' as ElementType, icon: Timer, label: 'Contagem' },
    ],
  },
];

export function ElementPalette({ onAdd }: Props) {
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-5">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Elementos</h3>

        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
              {cat.label}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                    onAdd(el);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/50 bg-card hover:bg-primary/10 hover:border-primary/40 transition-all active:scale-95 group cursor-pointer"
                >
                  <item.icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
