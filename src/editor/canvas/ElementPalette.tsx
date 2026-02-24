import { useState } from 'react';
import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe, User, Store,
  List, LayoutGrid, Hash, ShoppingBag, FileText, Ticket, CreditCard, Keyboard, Pointer,
  Search, ChevronRight,
} from 'lucide-react';
import type { ElementType } from '../types/canvas';
import { createElement } from '../types/canvas';
import type { CanvasElement } from '../types/canvas';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
  onAdd: (element: CanvasElement) => void;
}

const CATEGORIES = [
  {
    id: 'totem',
    label: 'Totem',
    icon: '🖥️',
    items: [
      { type: 'bigcta' as ElementType, icon: Pointer, label: 'CTA Grande', desc: 'Botão de chamada principal', preview: '👆' },
      { type: 'ticket' as ElementType, icon: Ticket, label: 'Senha', desc: 'Painel de senhas', preview: '🎫' },
      { type: 'qrpix' as ElementType, icon: CreditCard, label: 'QR Pix', desc: 'Pagamento via Pix', preview: '💠' },
      { type: 'numpad' as ElementType, icon: Keyboard, label: 'Teclado', desc: 'Entrada numérica', preview: '🔢' },
    ],
  },
  {
    id: 'content',
    label: 'Conteúdo',
    icon: '📝',
    items: [
      { type: 'text' as ElementType, icon: Type, label: 'Texto', desc: 'Títulos e parágrafos', preview: 'Aa' },
      { type: 'image' as ElementType, icon: Image, label: 'Imagem', desc: 'Fotos e ilustrações', preview: '🖼️' },
      { type: 'button' as ElementType, icon: MousePointer2, label: 'Botão', desc: 'Ação interativa', preview: '🔘' },
      { type: 'shape' as ElementType, icon: Square, label: 'Forma', desc: 'Retângulos e círculos', preview: '⬜' },
      { type: 'icon' as ElementType, icon: Sparkles, label: 'Ícone', desc: 'Ícones decorativos', preview: '✨' },
    ],
  },
  {
    id: 'media',
    label: 'Mídia',
    icon: '🎬',
    items: [
      { type: 'video' as ElementType, icon: Play, label: 'Vídeo', desc: 'Player de vídeo', preview: '▶️' },
      { type: 'carousel' as ElementType, icon: GalleryHorizontal, label: 'Carrossel', desc: 'Slides de imagens', preview: '🎠' },
      { type: 'gallery' as ElementType, icon: LayoutGrid, label: 'Galeria', desc: 'Grid de imagens', preview: '🖼️' },
      { type: 'iframe' as ElementType, icon: Globe, label: 'Iframe', desc: 'Conteúdo externo', preview: '🌐' },
    ],
  },
  {
    id: 'interactive',
    label: 'Interação',
    icon: '🔗',
    items: [
      { type: 'qrcode' as ElementType, icon: QrCode, label: 'QR Code', desc: 'Código QR dinâmico', preview: '📱' },
      { type: 'chat' as ElementType, icon: MessageSquare, label: 'Chat IA', desc: 'Assistente virtual', preview: '💬' },
      { type: 'form' as ElementType, icon: FileText, label: 'Formulário', desc: 'Coleta de dados', preview: '📋' },
      { type: 'list' as ElementType, icon: List, label: 'Lista/Menu', desc: 'Itens com preço', preview: '📋' },
      { type: 'catalog' as ElementType, icon: ShoppingBag, label: 'Catálogo', desc: 'Produtos com filtro', preview: '🛍️' },
      { type: 'store' as ElementType, icon: Store, label: 'Lojas', desc: 'Diretório de lojas', preview: '🏪' },
      { type: 'map' as ElementType, icon: MapPin, label: 'Mapa', desc: 'Localização', preview: '🗺️' },
      { type: 'social' as ElementType, icon: Share2, label: 'Redes Sociais', desc: 'Links sociais', preview: '🔗' },
    ],
  },
  {
    id: 'data',
    label: 'Dados',
    icon: '📊',
    items: [
      { type: 'clock' as ElementType, icon: Clock, label: 'Relógio', desc: 'Data e hora', preview: '🕐' },
      { type: 'weather' as ElementType, icon: CloudSun, label: 'Clima', desc: 'Previsão do tempo', preview: '🌤️' },
      { type: 'countdown' as ElementType, icon: Timer, label: 'Contagem', desc: 'Timer regressivo', preview: '⏱️' },
      { type: 'animated-number' as ElementType, icon: Hash, label: 'Nº Animado', desc: 'Contador animado', preview: '🔢' },
      { type: 'avatar' as ElementType, icon: User, label: 'Avatar 3D', desc: 'Assistente virtual 3D', preview: '🤖' },
    ],
  },
];

export function ElementPalette({ onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>('totem');

  const searchLower = search.toLowerCase();
  const filtered = search
    ? CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.label.toLowerCase().includes(searchLower) || i.desc.toLowerCase().includes(searchLower)),
      })).filter(cat => cat.items.length > 0)
    : CATEGORIES;

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Buscar elementos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/30 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 pt-0 space-y-1">
          {filtered.map((cat) => {
            const isExpanded = search || expandedCat === cat.id;
            return (
              <div key={cat.id}>
                {/* Category header */}
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                    isExpanded ? "bg-muted/40" : "hover:bg-muted/20"
                  )}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span className="text-[11px] font-semibold text-foreground/80 flex-1">{cat.label}</span>
                  <span className="text-[9px] text-muted-foreground/50">{cat.items.length}</span>
                  <ChevronRight className={cn(
                    "w-3 h-3 text-muted-foreground/40 transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="mt-1 space-y-0.5 pl-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                          onAdd(el);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 p-2 rounded-lg transition-all group cursor-pointer",
                          "border border-transparent",
                          "hover:bg-primary/8 hover:border-primary/20 active:scale-[0.97]"
                        )}
                      >
                        {/* Preview thumbnail */}
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base",
                          "bg-muted/40 group-hover:bg-primary/10 transition-colors"
                        )}>
                          {item.preview}
                        </div>
                        {/* Label + desc */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-[11px] font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-none">
                            {item.label}
                          </div>
                          <div className="text-[9px] text-muted-foreground/50 group-hover:text-muted-foreground/70 mt-0.5 truncate">
                            {item.desc}
                          </div>
                        </div>
                        {/* Add indicator */}
                        <div className="w-5 h-5 rounded-full bg-muted/30 group-hover:bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <span className="text-[10px] text-primary font-bold">+</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
