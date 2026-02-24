import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe, User, Store,
  List, LayoutGrid, Hash, ShoppingBag, FileText, Ticket, CreditCard, Keyboard, Pointer,
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
    label: '🖥️ Totem',
    items: [
      { type: 'bigcta' as ElementType, icon: Pointer, label: 'CTA Grande' },
      { type: 'ticket' as ElementType, icon: Ticket, label: 'Senha' },
      { type: 'qrpix' as ElementType, icon: CreditCard, label: 'QR Pix' },
      { type: 'numpad' as ElementType, icon: Keyboard, label: 'Teclado' },
    ],
  },
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
      { type: 'gallery' as ElementType, icon: LayoutGrid, label: 'Galeria' },
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
      { type: 'list' as ElementType, icon: List, label: 'Lista/Menu' },
      { type: 'catalog' as ElementType, icon: ShoppingBag, label: 'Catálogo' },
      { type: 'form' as ElementType, icon: FileText, label: 'Formulário' },
    ],
  },
  {
    label: 'Dados',
    items: [
      { type: 'clock' as ElementType, icon: Clock, label: 'Relógio' },
      { type: 'weather' as ElementType, icon: CloudSun, label: 'Clima' },
      { type: 'countdown' as ElementType, icon: Timer, label: 'Contagem' },
      { type: 'animated-number' as ElementType, icon: Hash, label: 'Nº Animado' },
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
      <div className="p-2 space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1.5 px-0.5">
              {cat.label}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                    onAdd(el);
                  }}
                  title={`Adicionar ${item.label}`}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md border border-transparent hover:bg-primary/10 hover:border-primary/20 transition-all active:scale-95 group cursor-pointer text-left"
                >
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-[10px] font-medium text-muted-foreground/70 group-hover:text-foreground transition-colors leading-none truncate">
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
