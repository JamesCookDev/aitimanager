import { useState } from 'react';
import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe, User, Megaphone,
  List, LayoutGrid, Hash, ShoppingBag, FileText, Ticket, CreditCard, Keyboard, Pointer,
  Search, ChevronDown, Monitor, PenLine, Film, Link2, BarChart3, Rss, FileCode2,
} from 'lucide-react';
import type { ElementType } from '../types/canvas';
import { createElement } from '../types/canvas';
import type { CanvasElement } from '../types/canvas';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { LucideIcon } from 'lucide-react';

interface Props {
  onAdd: (element: CanvasElement) => void;
}

interface PaletteItem {
  type: ElementType;
  icon: LucideIcon;
  label: string;
  desc: string;
  color: string;
  htmlPuro?: boolean;
}

const CATEGORIES: {
  id: string;
  label: string;
  icon: LucideIcon;
  items: PaletteItem[];
}[] = [
  {
    id: 'totem',
    label: 'Totem',
    icon: Monitor,
    items: [
      { type: 'bigcta', icon: Pointer, label: 'CTA Grande', desc: 'Botão de chamada principal', color: '#6366f1' },
      { type: 'ticket', icon: Ticket, label: 'Senha', desc: 'Painel de senhas', color: '#f59e0b' },
      { type: 'qrpix', icon: CreditCard, label: 'QR Pix', desc: 'Pagamento via Pix', color: '#10b981' },
      { type: 'numpad', icon: Keyboard, label: 'Teclado', desc: 'Entrada numérica', color: '#8b5cf6' },
    ],
  },
  {
    id: 'content',
    label: 'Conteúdo',
    icon: PenLine,
    items: [
      { type: 'text', icon: Type, label: 'Texto', desc: 'Títulos e parágrafos', color: '#3b82f6' },
      { type: 'image', icon: Image, label: 'Imagem', desc: 'Fotos e ilustrações', color: '#ec4899' },
      { type: 'button', icon: MousePointer2, label: 'Botão', desc: 'Ação interativa', color: '#ef4444' },
      { type: 'shape', icon: Square, label: 'Forma', desc: 'Retângulos e círculos', color: '#14b8a6' },
      { type: 'icon', icon: Sparkles, label: 'Ícone', desc: 'Ícones decorativos', color: '#f97316' },
    ],
  },
  {
    id: 'media',
    label: 'Mídia',
    icon: Film,
    items: [
      { type: 'video', icon: Play, label: 'Vídeo', desc: 'Player de vídeo', color: '#ef4444' },
      { type: 'carousel', icon: GalleryHorizontal, label: 'Carrossel', desc: 'Slides de imagens', color: '#8b5cf6' },
      { type: 'gallery', icon: LayoutGrid, label: 'Galeria', desc: 'Grid de imagens', color: '#06b6d4' },
      { type: 'feed' as ElementType, icon: Rss, label: 'Feed', desc: 'Feed estilo Instagram', color: '#f97316' },
      { type: 'iframe', icon: Globe, label: 'Iframe', desc: 'Conteúdo externo', color: '#64748b' },
      { type: 'iframe', icon: FileCode2, label: 'HTML Puro', desc: 'HTML direto no canvas', color: '#0ea5e9', htmlPuro: true },
    ],
  },
  {
    id: 'interactive',
    label: 'Interação',
    icon: Link2,
    items: [
      { type: 'qrcode', icon: QrCode, label: 'QR Code', desc: 'Código QR dinâmico', color: '#1e293b' },
      { type: 'chat', icon: MessageSquare, label: 'Chat IA', desc: 'Assistente virtual', color: '#6366f1' },
      { type: 'form', icon: FileText, label: 'Formulário', desc: 'Coleta de dados', color: '#84cc16' },
      { type: 'list', icon: List, label: 'Lista/Menu', desc: 'Itens com preço', color: '#f59e0b' },
      { type: 'catalog', icon: ShoppingBag, label: 'Catálogo', desc: 'Produtos com filtro', color: '#ec4899' },
      { type: 'store', icon: Megaphone, label: 'Lojas', desc: 'Diretório de lojas', color: '#f97316' },
      { type: 'map', icon: MapPin, label: 'Mapa', desc: 'Localização', color: '#ef4444' },
      { type: 'social', icon: Share2, label: 'Redes Sociais', desc: 'Links sociais', color: '#3b82f6' },
    ],
  },
  {
    id: 'data',
    label: 'Dados',
    icon: BarChart3,
    items: [
      { type: 'clock', icon: Clock, label: 'Relógio', desc: 'Data e hora', color: '#0ea5e9' },
      { type: 'weather', icon: CloudSun, label: 'Clima', desc: 'Previsão do tempo', color: '#f59e0b' },
      { type: 'countdown', icon: Timer, label: 'Contagem', desc: 'Timer regressivo', color: '#ef4444' },
      { type: 'animated-number', icon: Hash, label: 'Nº Animado', desc: 'Contador animado', color: '#10b981' },
      { type: 'avatar', icon: User, label: 'Avatar 3D', desc: 'Assistente virtual 3D', color: '#8b5cf6' },
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
      <div className="p-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            placeholder="Buscar elementos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm bg-muted/20 border-border/40 focus:border-primary/40 rounded-lg"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 pt-2 space-y-2">
          {filtered.map((cat) => {
            const isOpen = search ? true : openCats[cat.id] ?? false;
            const CatIcon = cat.icon;

            return (
              <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleCat(cat.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer",
                    isOpen ? "bg-muted/30" : "hover:bg-muted/15"
                  )}>
                    <CatIcon className="w-4 h-4 text-muted-foreground/60" />
                    <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex-1 text-left">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground/40 tabular-nums">{cat.items.length}</span>
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-muted-foreground/30 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="grid grid-cols-3 gap-2 pt-2 pb-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                          onAdd(el);
                        }}
                        className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-transform p-1.5"
                      >
                        <div
                          className="w-full aspect-square rounded-xl flex items-center justify-center shadow-md transition-all group-hover:shadow-lg group-hover:scale-105"
                          style={{
                            background: `linear-gradient(145deg, ${item.color}, ${item.color}cc)`,
                            boxShadow: `0 4px 12px ${item.color}40, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)`,
                            borderTop: '1px solid rgba(255,255,255,0.3)',
                            borderBottom: '2px solid rgba(0,0,0,0.2)',
                          }}
                        >
                          <item.icon className="w-6 h-6 text-white drop-shadow-md" strokeWidth={2} />
                        </div>
                        <div className="text-center">
                          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-none block">
                            {item.label}
                          </span>
                          <span className="text-[9px] text-muted-foreground/40 leading-none mt-0.5 block">
                            {item.desc}
                          </span>
                        </div>
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
