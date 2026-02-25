import { useState } from 'react';
import {
  Type, Image, MousePointer2, Square, Sparkles, Play, QrCode, MapPin,
  Share2, MessageSquare, GalleryHorizontal, Clock, CloudSun, Timer, Globe, User, Megaphone,
  List, LayoutGrid, Hash, ShoppingBag, FileText, Ticket, CreditCard, Keyboard, Pointer,
  Search, ChevronDown, Monitor, PenLine, Film, Link2, BarChart3, Rss,
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

/* ── Mini canvas-style previews ── */
function MiniPreview({ type, icon: Icon, color }: { type: string; icon: LucideIcon; color: string }) {
  const common = "w-full h-full flex items-center justify-center pointer-events-none select-none";

  switch (type) {
    case 'text':
      return (
        <div className={`${common} flex-col gap-0.5 p-1.5`}>
          <div className="w-[80%] h-[3px] rounded-full bg-white/90" />
          <div className="w-[60%] h-[2px] rounded-full bg-white/40" />
          <div className="w-[70%] h-[2px] rounded-full bg-white/30" />
        </div>
      );
    case 'image':
      return (
        <div className={`${common} p-1`}>
          <div className="w-full h-full rounded bg-gradient-to-br from-pink-500/40 to-purple-600/40 flex items-center justify-center border border-white/10">
            <Image className="w-3.5 h-3.5 text-white/50" />
          </div>
        </div>
      );
    case 'button':
      return (
        <div className={`${common} p-2`}>
          <div className="w-full h-5 rounded-md flex items-center justify-center text-[6px] font-bold text-white tracking-wide" style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)`, boxShadow: `0 2px 6px ${color}60` }}>
            CLIQUE
          </div>
        </div>
      );
    case 'shape':
      return (
        <div className={`${common} p-2`}>
          <div className="w-8 h-8 rounded-md border-2 border-teal-400/60 bg-teal-400/10" />
        </div>
      );
    case 'icon':
      return (
        <div className={`${common}`}>
          <span className="text-lg drop-shadow-md">⭐</span>
        </div>
      );
    case 'video':
      return (
        <div className={`${common} p-1`}>
          <div className="w-full h-full rounded bg-gradient-to-br from-red-900/50 to-red-800/30 flex items-center justify-center border border-white/10">
            <Play className="w-4 h-4 text-white/70 fill-white/30" />
          </div>
        </div>
      );
    case 'carousel':
      return (
        <div className={`${common} gap-0.5 p-1`}>
          <div className="w-3 h-full rounded bg-white/10 border border-white/10" />
          <div className="w-5 h-full rounded bg-white/20 border border-white/15" />
          <div className="w-3 h-full rounded bg-white/10 border border-white/10" />
        </div>
      );
    case 'gallery':
      return (
        <div className={`${common} p-1`}>
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-sm bg-white/15 border border-white/10" />
            ))}
          </div>
        </div>
      );
    case 'qrcode':
      return (
        <div className={`${common} p-2`}>
          <div className="w-8 h-8 bg-white rounded-sm p-0.5">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
              {[1,1,1,1,0,1,1,1,0].map((v, i) => (
                <div key={i} className={`rounded-[1px] ${v ? 'bg-black' : 'bg-white'}`} />
              ))}
            </div>
          </div>
        </div>
      );
    case 'chat':
      return (
        <div className={`${common} flex-col gap-0.5 p-1.5 items-start`}>
          <div className="w-[70%] h-[5px] rounded-full bg-indigo-400/40 self-start" />
          <div className="w-[55%] h-[5px] rounded-full bg-white/20 self-end" />
          <div className="w-[65%] h-[5px] rounded-full bg-indigo-400/40 self-start" />
        </div>
      );
    case 'form':
      return (
        <div className={`${common} flex-col gap-1 p-1.5`}>
          <div className="w-full h-[4px] rounded-sm bg-white/10 border border-white/15" />
          <div className="w-full h-[4px] rounded-sm bg-white/10 border border-white/15" />
          <div className="w-[50%] h-[5px] rounded-sm self-end" style={{ background: color }} />
        </div>
      );
    case 'clock':
      return (
        <div className={`${common} flex-col`}>
          <span className="text-[8px] font-bold text-white/80 tabular-nums">14:35</span>
          <span className="text-[5px] text-white/40">Ter, 25 Fev</span>
        </div>
      );
    case 'weather':
      return (
        <div className={`${common} flex-col`}>
          <CloudSun className="w-4 h-4 text-amber-300/70" />
          <span className="text-[7px] font-bold text-white/70">28°C</span>
        </div>
      );
    case 'countdown':
      return (
        <div className={`${common} gap-0.5`}>
          {['02','15','33'].map((v, i) => (
            <div key={i} className="w-[18px] h-5 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <span className="text-[6px] font-bold text-white/80 tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      );
    case 'animated-number':
      return (
        <div className={`${common} flex-col`}>
          <span className="text-[14px] font-black text-emerald-400/80 tabular-nums">1.247</span>
        </div>
      );
    case 'avatar':
      return (
        <div className={`${common}`}>
          <div className="w-8 h-10 rounded-md bg-gradient-to-b from-violet-500/30 to-violet-900/30 border border-violet-400/20 flex items-end justify-center overflow-hidden">
            <User className="w-5 h-5 text-violet-300/50 translate-y-1" />
          </div>
        </div>
      );
    case 'social':
      return (
        <div className={`${common} gap-1`}>
          {['📘','📸','🎵'].map((e, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px]">{e}</div>
          ))}
        </div>
      );
    case 'list':
      return (
        <div className={`${common} flex-col gap-0.5 p-1.5 items-stretch`}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-amber-400/60 shrink-0" />
              <div className="flex-1 h-[3px] rounded-full bg-white/20" />
            </div>
          ))}
        </div>
      );
    case 'catalog':
      return (
        <div className={`${common} p-1`}>
          <div className="w-full h-full grid grid-cols-2 gap-0.5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-sm bg-pink-500/15 border border-pink-500/20 flex flex-col items-center justify-center">
                <ShoppingBag className="w-2.5 h-2.5 text-pink-300/40" />
              </div>
            ))}
          </div>
        </div>
      );
    case 'map':
      return (
        <div className={`${common} p-1`}>
          <div className="w-full h-full rounded bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-red-400/60" />
          </div>
        </div>
      );
    case 'bigcta':
      return (
        <div className={`${common} p-1.5`}>
          <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(145deg, ${color}80, ${color}40)`, border: `1px solid ${color}60` }}>
            <Pointer className="w-4 h-4 text-white/70" />
          </div>
        </div>
      );
    case 'ticket':
      return (
        <div className={`${common} flex-col`}>
          <Ticket className="w-4 h-4 text-amber-400/60" />
          <span className="text-[6px] font-bold text-white/50 tabular-nums">A-042</span>
        </div>
      );
    case 'qrpix':
      return (
        <div className={`${common} flex-col gap-0.5`}>
          <CreditCard className="w-4 h-4 text-emerald-400/60" />
          <span className="text-[5px] text-white/40">PIX</span>
        </div>
      );
    case 'numpad':
      return (
        <div className={`${common} p-1.5`}>
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <div key={n} className="rounded-sm bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <span className="text-[5px] font-bold text-white/50">{n}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'feed':
      return (
        <div className={`${common} flex-col gap-0.5 p-1`}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-full flex-1 rounded-sm bg-orange-500/15 border border-orange-500/20 flex items-center gap-0.5 px-1">
              <div className="w-2 h-2 rounded-sm bg-orange-400/30 shrink-0" />
              <div className="flex-1 h-[2px] rounded-full bg-white/15" />
            </div>
          ))}
        </div>
      );
    case 'iframe':
      return (
        <div className={`${common} p-1`}>
          <div className="w-full h-full rounded bg-slate-700/40 border border-white/10 flex flex-col">
            <div className="h-2 border-b border-white/10 flex items-center gap-0.5 px-1">
              <div className="w-1 h-1 rounded-full bg-red-400/60" />
              <div className="w-1 h-1 rounded-full bg-yellow-400/60" />
              <div className="w-1 h-1 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Globe className="w-3 h-3 text-white/20" />
            </div>
          </div>
        </div>
      );
    case 'store':
      return (
        <div className={`${common} flex-col gap-0.5 p-1`}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-full flex-1 rounded-sm bg-orange-500/15 border border-orange-500/20 flex items-center gap-0.5 px-1">
              <Megaphone className="w-2 h-2 text-orange-400/40 shrink-0" />
              <div className="flex-1 h-[2px] rounded-full bg-white/15" />
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className={`${common}`} style={{ background: `linear-gradient(145deg, ${color}30, ${color}15)` }}>
          <Icon className="w-5 h-5 text-white/50" strokeWidth={2} />
        </div>
      );
  }
}

interface PaletteItem {
  type: ElementType;
  icon: LucideIcon;
  label: string;
  desc: string;
  color: string; // bg color for the icon square
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
            const CatIcon = cat.icon;

            return (
              <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleCat(cat.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer",
                    isOpen ? "bg-muted/30" : "hover:bg-muted/15"
                  )}>
                    <CatIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider flex-1 text-left">{cat.label}</span>
                    <span className="text-[8px] text-muted-foreground/40 tabular-nums">{cat.items.length}</span>
                    <ChevronDown className={cn(
                      "w-3 h-3 text-muted-foreground/30 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="grid grid-cols-3 gap-1.5 pt-1 pb-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          const el = createElement(item.type, 80 + Math.random() * 200, 80 + Math.random() * 400);
                          onAdd(el);
                        }}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-90 transition-transform"
                      >
                        <div
                          className="w-full aspect-[4/3] rounded-lg overflow-hidden shadow-md transition-all group-hover:shadow-lg group-hover:scale-105 border border-white/[0.06]"
                          style={{ background: '#0f172a' }}
                        >
                          <MiniPreview type={item.type} icon={item.icon} color={item.color} />
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
