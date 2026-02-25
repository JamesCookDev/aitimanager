import { useState } from 'react';
import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe, User, Store, Megaphone,
  List, LayoutGrid, Hash, ShoppingBag, FileText, Ticket, CreditCard, Keyboard, Pointer,
  Search, ChevronDown, Plus,
} from 'lucide-react';
import type { ElementType } from '../types/canvas';
import { createElement } from '../types/canvas';
import type { CanvasElement } from '../types/canvas';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  onAdd: (element: CanvasElement) => void;
}

const CATEGORIES = [
  {
    id: 'totem',
    label: 'Totem',
    icon: '🖥️',
    color: 'from-primary/20 to-accent/10',
    items: [
      { type: 'bigcta' as ElementType, icon: Pointer, label: 'CTA Grande', desc: 'Botão de chamada principal' },
      { type: 'ticket' as ElementType, icon: Ticket, label: 'Senha', desc: 'Painel de senhas' },
      { type: 'qrpix' as ElementType, icon: CreditCard, label: 'QR Pix', desc: 'Pagamento via Pix' },
      { type: 'numpad' as ElementType, icon: Keyboard, label: 'Teclado', desc: 'Entrada numérica' },
    ],
  },
  {
    id: 'content',
    label: 'Conteúdo',
    icon: '📝',
    color: 'from-blue-500/10 to-blue-400/5',
    items: [
      { type: 'text' as ElementType, icon: Type, label: 'Texto', desc: 'Títulos e parágrafos' },
      { type: 'image' as ElementType, icon: Image, label: 'Imagem', desc: 'Fotos e ilustrações' },
      { type: 'button' as ElementType, icon: MousePointer2, label: 'Botão', desc: 'Ação interativa' },
      { type: 'shape' as ElementType, icon: Square, label: 'Forma', desc: 'Retângulos e círculos' },
      { type: 'icon' as ElementType, icon: Sparkles, label: 'Ícone', desc: 'Ícones decorativos' },
    ],
  },
  {
    id: 'media',
    label: 'Mídia',
    icon: '🎬',
    color: 'from-purple-500/10 to-purple-400/5',
    items: [
      { type: 'video' as ElementType, icon: Play, label: 'Vídeo', desc: 'Player de vídeo' },
      { type: 'carousel' as ElementType, icon: GalleryHorizontal, label: 'Carrossel', desc: 'Slides de imagens' },
      { type: 'gallery' as ElementType, icon: LayoutGrid, label: 'Galeria', desc: 'Grid de imagens' },
      { type: 'iframe' as ElementType, icon: Globe, label: 'Iframe', desc: 'Conteúdo externo' },
    ],
  },
  {
    id: 'interactive',
    label: 'Interação',
    icon: '🔗',
    color: 'from-green-500/10 to-green-400/5',
    items: [
      { type: 'qrcode' as ElementType, icon: QrCode, label: 'QR Code', desc: 'Código QR dinâmico' },
      { type: 'chat' as ElementType, icon: MessageSquare, label: 'Chat IA', desc: 'Assistente virtual' },
      { type: 'form' as ElementType, icon: FileText, label: 'Formulário', desc: 'Coleta de dados' },
      { type: 'list' as ElementType, icon: List, label: 'Lista/Menu', desc: 'Itens com preço' },
      { type: 'catalog' as ElementType, icon: ShoppingBag, label: 'Catálogo', desc: 'Produtos com filtro' },
      { type: 'store' as ElementType, icon: Megaphone, label: 'Lojas', desc: 'Diretório de lojas' },
      { type: 'map' as ElementType, icon: MapPin, label: 'Mapa', desc: 'Localização' },
      { type: 'social' as ElementType, icon: Share2, label: 'Redes Sociais', desc: 'Links sociais' },
    ],
  },
  {
    id: 'data',
    label: 'Dados',
    icon: '📊',
    color: 'from-amber-500/10 to-amber-400/5',
    items: [
      { type: 'clock' as ElementType, icon: Clock, label: 'Relógio', desc: 'Data e hora' },
      { type: 'weather' as ElementType, icon: CloudSun, label: 'Clima', desc: 'Previsão do tempo' },
      { type: 'countdown' as ElementType, icon: Timer, label: 'Contagem', desc: 'Timer regressivo' },
      { type: 'animated-number' as ElementType, icon: Hash, label: 'Nº Animado', desc: 'Contador animado' },
      { type: 'avatar' as ElementType, icon: User, label: 'Avatar 3D', desc: 'Assistente virtual 3D' },
    ],
  },
];

export function ElementPalette({ onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ totem: true, content: true });

  const searchLower = search.toLowerCase();
  const filtered = search
    ? CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.label.toLowerCase().includes(searchLower) || i.desc.toLowerCase().includes(searchLower)),
      })).filter(cat => cat.items.length > 0)
    : CATEGORIES;

  const toggleCat = (id: string) => {
    setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-2 pb-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Buscar elementos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-7 pl-8 text-[10px] bg-muted/20 border-border/40 focus:border-primary/40 rounded-md"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {filtered.map((cat) => {
            const isOpen = search ? true : openCats[cat.id] ?? false;

            return (
              <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleCat(cat.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer",
                    isOpen ? "bg-muted/30" : "hover:bg-muted/15"
                  )}>
                    <span className="text-[11px]">{cat.icon}</span>
                    <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider flex-1 text-left">{cat.label}</span>
                    <span className="text-[8px] text-muted-foreground/40 tabular-nums">{cat.items.length}</span>
                    <ChevronDown className={cn(
                      "w-3 h-3 text-muted-foreground/30 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="grid grid-cols-2 gap-1 pt-1 pb-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                          onAdd(el);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all group cursor-pointer",
                          "border border-border/30 bg-card/40",
                          "hover:bg-primary/8 hover:border-primary/25 hover:shadow-sm hover:shadow-primary/5",
                          "active:scale-95"
                        )}
                      >
                        <div className="w-8 h-8 rounded-md bg-muted/30 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <item.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-none text-center">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
