import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe, User, Store,
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
      { type: 'store' as ElementType, icon: Store, label: 'Lojas' },
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
  {
    label: '3D',
    items: [
      { type: 'avatar' as ElementType, icon: User, label: 'Avatar 3D' },
    ],
  },
];

export function ElementPalette({ onAdd }: Props) {
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Elementos</h3>

        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2 px-0.5">
              {cat.label}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                    onAdd(el);
                  }}
                  title={`Adicionar ${item.label}`}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg border border-transparent bg-transparent hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-90 group cursor-pointer"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-medium text-muted-foreground/60 group-hover:text-foreground transition-colors leading-none">
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
