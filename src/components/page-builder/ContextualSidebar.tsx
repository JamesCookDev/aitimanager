import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPickerPopover } from '@/components/devices/ColorPickerPopover';
import { UnsplashImagePicker } from '@/components/devices/UnsplashImagePicker';
import {
  Paintbrush, User, MessageSquare, ImageIcon, Settings, ChevronDown,
  FolderPlus, Plus, Trash2, GripVertical, ChevronRight, ArrowLeft, Upload,
  Loader2, Type, Play, Square, Circle, Minus, Clock, Eye, EyeOff, Layers,
  Sparkles,
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  PageBuilderConfig, CanvasConfig, AvatarComponent,
  ChatInterfaceComponent, LogoComponent, MenuCategory, MenuButton, ChatStyle,
  TextBannerComponent, TextBannerItem, SnapPosition, Layer, ImageLayer, VideoLayer, ShapeLayer, ClockLayer,
} from '@/types/page-builder';
import { createLayer } from '@/types/page-builder';
import type { CanvasSelection } from './TotemCanvas';

// ── Motion variants ─────────────────────────────────────────────────
const fadeSlide = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

// ── Sortable Button ─────────────────────────────────────────────────
function SortableButton({ btn, idx, onRemove, onUpdate }: {
  btn: MenuButton; idx: number;
  onRemove: () => void;
  onUpdate: (field: keyof MenuButton, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `btn-${idx}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-2 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/50 transition-colors">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <span>{btn.emoji} {btn.label || `Botão ${idx + 1}`}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-[40px_1fr] gap-1.5">
        <Input value={btn.emoji} onChange={(e) => onUpdate('emoji', e.target.value)} className="text-center h-7 text-xs px-1 bg-background/50" />
        <Input value={btn.label} onChange={(e) => onUpdate('label', e.target.value)} className="h-7 text-xs bg-background/50" placeholder="Label" />
      </div>
      <Input value={btn.prompt} onChange={(e) => onUpdate('prompt', e.target.value)} className="h-7 text-xs bg-background/50" placeholder="Prompt IA" />
    </div>
  );
}

// ── Sortable Layer Item ─────────────────────────────────────────────
function SortableLayerItem({ layer, layerTypeIcons, layerTypeLabels, selected, onSelect, onToggleVisible, onRemove }: {
  layer: Layer;
  layerTypeIcons: Record<string, typeof ImageIcon>;
  layerTypeLabels: Record<string, string>;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const Icon = layerTypeIcons[layer.type] || Square;

  return (
    <motion.div
      ref={setNodeRef} style={style}
      whileHover={{ scale: 1.01 }}
      className={`flex items-center justify-between p-2.5 rounded-xl border-2 transition-all cursor-pointer group backdrop-blur-sm ${selected ? 'border-primary/60 bg-primary/8 shadow-[0_0_12px_hsl(var(--primary)/0.15)]' : 'border-border/40 bg-muted/20 hover:border-primary/30 hover:bg-primary/5'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2.5">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/50 transition-colors" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected ? 'bg-primary/20' : 'bg-accent/10'}`}>
          <Icon className={`w-3.5 h-3.5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <span className="text-xs font-semibold text-foreground">{layer.label}</span>
          <p className="text-[10px] text-muted-foreground">{layerTypeLabels[layer.type]} • {layer.visible ? 'Visível' : 'Oculto'}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}>
          {layer.visible ? <Eye className="w-3 h-3 text-muted-foreground" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <Trash2 className="w-3 h-3" />
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}

// ── Sortable Category ───────────────────────────────────────────────
function SortableCat({ cat, idx, expanded, onToggle, onRemove, onUpdateField, onAddButton, onRemoveButton, onUpdateButton, onReorderButtons }: {
  cat: MenuCategory; idx: number; expanded: boolean;
  onToggle: () => void; onRemove: () => void;
  onUpdateField: (field: 'title' | 'icon', value: string) => void;
  onAddButton: () => void;
  onRemoveButton: (i: number) => void;
  onUpdateButton: (i: number, f: keyof MenuButton, v: string) => void;
  onReorderButtons: (old: number, newIdx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `cat-${idx}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const btnSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleBtnDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      onReorderButtons(parseInt(String(active.id).split('-')[1]), parseInt(String(over.id).split('-')[1]));
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between p-2.5 bg-muted/30">
        <div className="flex items-center gap-1.5">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/50 transition-colors">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
            <span className="font-semibold text-foreground">{cat.icon} {cat.title}</span>
            <span className="text-muted-foreground/60 text-[10px] bg-muted/50 px-1.5 py-0.5 rounded-full">{cat.buttons.length}</span>
          </button>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2.5 space-y-2.5">
              <div className="grid grid-cols-[40px_1fr] gap-1.5">
                <Input value={cat.icon} onChange={(e) => onUpdateField('icon', e.target.value)} className="text-center text-base h-7 px-1 bg-background/50" />
                <Input value={cat.title} onChange={(e) => onUpdateField('title', e.target.value)} className="h-7 text-xs bg-background/50" placeholder="Nome" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium">Botões</span>
                <Button variant="outline" size="sm" onClick={onAddButton} className="h-6 text-[10px] px-2 border-dashed border-primary/30 text-primary hover:bg-primary/10">
                  <Plus className="w-2.5 h-2.5 mr-0.5" /> Botão
                </Button>
              </div>
              <DndContext sensors={btnSensors} collisionDetection={closestCenter} onDragEnd={handleBtnDragEnd}>
                <SortableContext items={cat.buttons.map((_, i) => `btn-${i}`)} strategy={verticalListSortingStrategy}>
                  {cat.buttons.map((btn, bi) => (
                    <SortableButton key={`btn-${bi}`} btn={btn} idx={bi} onRemove={() => onRemoveButton(bi)} onUpdate={(f, v) => onUpdateButton(bi, f, v)} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Advanced Section ────────────────────────────────────────────────
function AdvancedSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-primary transition-colors py-2 w-full group">
        <div className="flex items-center gap-2 flex-1">
          <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-medium">Configurações Avançadas</span>
        </div>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-1 border-t border-border/30 mt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

// ── Position Grid (9 snap points) ───────────────────────────────────
function PositionGrid({ value, onChange }: { value: SnapPosition; onChange: (v: SnapPosition) => void }) {
  const positions: { v: SnapPosition; l: string }[] = [
    { v: 'top_left', l: '↖' }, { v: 'top_center', l: '↑' }, { v: 'top_right', l: '↗' },
    { v: 'center_left', l: '←' }, { v: 'center', l: '•' }, { v: 'center_right', l: '→' },
    { v: 'bottom_left', l: '↙' }, { v: 'bottom_center', l: '↓' }, { v: 'bottom_right', l: '↘' },
  ];
  return (
    <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-muted/20 border border-border/30">
      {positions.map((p) => (
        <motion.button
          key={p.v} type="button" onClick={() => onChange(p.v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`py-2 rounded-lg text-xs font-medium transition-all ${value === p.v
            ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_8px_hsl(var(--primary)/0.2)]'
            : 'border border-transparent text-muted-foreground/60 hover:text-foreground hover:bg-muted/40'}`}
        >{p.l}</motion.button>
      ))}
    </div>
  );
}

// ── Back Header ─────────────────────────────────────────────────────
function BackHeader({ title, icon, onBack }: { title: string; icon: React.ReactNode; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2.5 pb-3 border-b border-border/30"
    >
      <motion.button
        type="button" onClick={onBack}
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        className="p-1.5 rounded-lg bg-muted/30 hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
      </motion.button>
      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
interface ContextualSidebarProps {
  config: PageBuilderConfig;
  selectedElement: CanvasSelection;
  onChange: (config: PageBuilderConfig) => void;
  onSelectElement?: (el: CanvasSelection) => void;
}

export function ContextualSidebar({ config, selectedElement, onChange, onSelectElement }: ContextualSidebarProps) {
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([0]));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layerFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLayerId, setUploadingLayerId] = useState<string | null>(null);

  // Helpers
  const updateCanvas = (partial: Partial<CanvasConfig>) => onChange({ ...config, canvas: { ...config.canvas, ...partial } });
  const updateBg = (partial: Partial<CanvasConfig['background']>) => onChange({ ...config, canvas: { ...config.canvas, background: { ...config.canvas.background, ...partial } } });
  const updateEnv = (partial: Partial<CanvasConfig['environment']>) => onChange({ ...config, canvas: { ...config.canvas, environment: { ...config.canvas.environment, ...partial } } });
  const updateAvatar = (partial: Partial<AvatarComponent>) => onChange({ ...config, components: { ...config.components, avatar: { ...config.components.avatar, ...partial } } });
  const updateChat = (partial: Partial<ChatInterfaceComponent>) => onChange({ ...config, components: { ...config.components, chat_interface: { ...config.components.chat_interface, ...partial } } });
  const updateChatStyle = (partial: Partial<ChatStyle>) => updateChat({ style: { ...config.components.chat_interface.style, ...partial } });
  const updateHeader = (partial: Partial<ChatInterfaceComponent['header']>) => updateChat({ header: { ...config.components.chat_interface.header, ...partial } });
  const updateMenu = (partial: Partial<ChatInterfaceComponent['menu']>) => updateChat({ menu: { ...config.components.chat_interface.menu, ...partial } });
  const updateLogo = (partial: Partial<LogoComponent>) => onChange({ ...config, components: { ...config.components, logo: { ...config.components.logo, ...partial } } });
  const updateTextBanners = (partial: Partial<TextBannerComponent>) => onChange({ ...config, components: { ...config.components, text_banners: { ...config.components.text_banners, ...partial } } });
  const updateTextItem = (id: string, partial: Partial<TextBannerItem>) => {
    const items = (config.components.text_banners?.items || []).map(i => i.id === id ? { ...i, ...partial } : i);
    updateTextBanners({ items });
  };
  const addTextItem = () => {
    const newItem: TextBannerItem = {
      id: `txt-${Date.now()}`, text: 'Novo Texto', position: 'top_center',
      fontSize: 'md', color: '#ffffff', bgColor: '#000000', bgEnabled: false, bold: false,
    };
    updateTextBanners({ enabled: true, items: [...(config.components.text_banners?.items || []), newItem] });
  };
  const removeTextItem = (id: string) => {
    updateTextBanners({ items: (config.components.text_banners?.items || []).filter(i => i.id !== id) });
  };
  const setCategories = (fn: (prev: MenuCategory[]) => MenuCategory[]) => updateMenu({ categories: fn(config.components.chat_interface.menu.categories) });

  // Layer helpers
  const layers = config.layers || [];
  const updateLayers = (newLayers: Layer[]) => onChange({ ...config, layers: newLayers });
  const addLayer = (type: Layer['type']) => {
    const layer = createLayer(type);
    updateLayers([...layers, layer]);
    onSelectElement?.(layer.id);
  };
  const removeLayer = (id: string) => {
    updateLayers(layers.filter(l => l.id !== id));
    if (selectedElement === id) onSelectElement?.(null);
  };
  const updateLayer = <T extends Layer>(id: string, partial: Partial<T>) => {
    updateLayers(layers.map(l => l.id === id ? { ...l, ...partial } : l));
  };
  const getLayer = (id: string) => layers.find(l => l.id === id);

  const goBack = () => onSelectElement?.(null);

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('logos').upload(fileName, file, { contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      updateLogo({ url: publicUrl, enabled: true });
      toast.success('Logo enviado!');
    } catch { toast.error('Erro ao enviar'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  // Layer image upload
  const handleLayerImageUpload = async (layerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setUploadingLayerId(layerId);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('logos').upload(fileName, file, { contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      updateLayer<ImageLayer>(layerId, { url: publicUrl } as any);
      toast.success('Imagem enviada!');
    } catch { toast.error('Erro ao enviar'); }
    finally { setUploadingLayerId(null); if (layerFileRef.current) layerFileRef.current.value = ''; }
  };

  const catSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleCatDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setCategories((prev) => arrayMove(prev, parseInt(String(active.id).split('-')[1]), parseInt(String(over.id).split('-')[1])));
    }
  };

  // Gradient state
  const [gradColor1, setGradColor1] = useState(() => {
    const match = config.canvas.background.gradient?.match(/#[0-9a-fA-F]{6}/g);
    return match?.[0] || '#1e3a8a';
  });
  const [gradColor2, setGradColor2] = useState(() => {
    const match = config.canvas.background.gradient?.match(/#[0-9a-fA-F]{6}/g);
    return match?.[1] || '#0f172a';
  });
  const updateGradient = (c1: string, c2: string) => {
    setGradColor1(c1); setGradColor2(c2);
    updateBg({ gradient: `linear-gradient(135deg, ${c1}, ${c2})` });
  };

  const sizePresets = [{ label: 'P', value: 1.0 }, { label: 'M', value: 1.5 }, { label: 'G', value: 2.0 }];

  // ── Fixed elements for hub ──
  const elements = [
    { key: 'background', label: 'Cenário / Fundo', desc: 'Cor, gradiente ou imagem', icon: Paintbrush, color: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-400', enabled: true, noToggle: true },
    { key: 'avatar', label: 'Avatar 3D', desc: config.components.avatar.enabled ? 'Ativo' : 'Desativado', icon: User, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-400', enabled: config.components.avatar.enabled, toggle: (v: boolean) => updateAvatar({ enabled: v }) },
    { key: 'chat', label: 'Interface / Menu', desc: config.components.chat_interface.enabled ? 'Ativo' : 'Desativado', icon: MessageSquare, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400', enabled: config.components.chat_interface.enabled, toggle: (v: boolean) => updateChat({ enabled: v }) },
    { key: 'logo', label: 'Logo / Marca', desc: config.components.logo.enabled ? 'Ativo' : 'Desativado', icon: ImageIcon, color: 'from-purple-500/20 to-violet-500/20', iconColor: 'text-purple-400', enabled: config.components.logo.enabled, toggle: (v: boolean) => updateLogo({ enabled: v }) },
    { key: 'text_banners', label: 'Textos / Banners', desc: config.components.text_banners?.enabled ? 'Ativo' : 'Desativado', icon: Type, color: 'from-pink-500/20 to-rose-500/20', iconColor: 'text-pink-400', enabled: config.components.text_banners?.enabled || false, toggle: (v: boolean) => updateTextBanners({ enabled: v }) },
  ];

  const layerTypeIcons: Record<string, typeof ImageIcon> = {
    image: ImageIcon, video: Play, shape: Square, clock: Clock,
  };
  const layerTypeLabels: Record<string, string> = {
    image: 'Imagem', video: 'Vídeo', shape: 'Forma', clock: 'Relógio',
  };

  // ── Check if selected element is a layer ──
  const selectedLayer = selectedElement ? getLayer(selectedElement) : null;
  const selectedTextBanner = selectedElement?.startsWith('text-')
    ? (config.components.text_banners?.items || []).find(i => i.id === selectedElement.replace('text-', ''))
    : null;

  // ── Styled toggle option ──
  const ToggleRow = ({ label, checked, onChange: onCheck }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/15 backdrop-blur-sm">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheck} />
    </div>
  );

  // ── Styled select buttons ──
  const SelectButton = ({ active, onClick, children, className = '' }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) => (
    <motion.button
      type="button" onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${active
        ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.15)]'
        : 'border-border/30 bg-muted/15 text-muted-foreground hover:border-border/60 hover:text-foreground'} ${className}`}
    >{children}</motion.button>
  );

  const renderContent = () => {
    // ── Text Banner item selected ──
    if (selectedTextBanner) {
      const item = selectedTextBanner;
      return (
        <motion.div {...fadeSlide} className="space-y-4">
          <BackHeader title={`"${item.text.slice(0, 15)}${item.text.length > 15 ? '...' : ''}"`} icon={<Type className="w-4 h-4" />} onBack={goBack} />
          <Input value={item.text} onChange={(e) => updateTextItem(item.id, { text: e.target.value })} placeholder="Digite o texto..." className="h-9 text-xs bg-background/50" />
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Posição</Label>
            <PositionGrid value={item.position} onChange={(v) => updateTextItem(item.id, { position: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tamanho</Label>
            <div className="flex gap-1.5">
              {([{ v: 'sm' as const, l: 'P' }, { v: 'md' as const, l: 'M' }, { v: 'lg' as const, l: 'G' }, { v: 'xl' as const, l: 'XL' }]).map((s) => (
                <SelectButton key={s.v} active={item.fontSize === s.v} onClick={() => updateTextItem(item.id, { fontSize: s.v })}>{s.l}</SelectButton>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1"><ColorPickerPopover color={item.color} onChange={(c) => updateTextItem(item.id, { color: c })} label="Cor" /></div>
            <SelectButton active={item.bold} onClick={() => updateTextItem(item.id, { bold: !item.bold })} className="!flex-none w-10">B</SelectButton>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={item.bgEnabled} onCheckedChange={(v) => updateTextItem(item.id, { bgEnabled: v })} />
            <span className="text-[10px] text-muted-foreground">Fundo</span>
            {item.bgEnabled && <div className="flex-1"><ColorPickerPopover color={item.bgColor} onChange={(c) => updateTextItem(item.id, { bgColor: c })} label="Cor Fundo" /></div>}
          </div>
          <Button variant="destructive" size="sm" className="w-full gap-2 rounded-xl" onClick={() => { removeTextItem(item.id); goBack(); }}>
            <Trash2 className="w-3.5 h-3.5" /> Remover Texto
          </Button>
        </motion.div>
      );
    }

    // ── Layer selected ──
    if (selectedLayer) {
      return <motion.div {...fadeSlide}>{renderLayerEditor(selectedLayer)}</motion.div>;
    }

    // ── Fixed elements ──
    switch (selectedElement) {
      case 'background':
        return (
          <motion.div {...fadeSlide} className="space-y-4">
            <BackHeader title="Cenário" icon={<Paintbrush className="w-4 h-4" />} onBack={goBack} />
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Orientação</Label>
              <div className="flex gap-2">
                {[{ value: 'vertical' as const, label: 'Vertical', icon: '📱' }, { value: 'horizontal' as const, label: 'Horizontal', icon: '🖥️' }].map((opt) => (
                  <SelectButton key={opt.value} active={config.canvas.orientation === opt.value} onClick={() => updateCanvas({ orientation: opt.value })}>
                    {opt.icon} {opt.label}
                  </SelectButton>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Fundo</Label>
              <div className="flex gap-1.5">
                {(['solid', 'gradient', 'image'] as const).map((t) => (
                  <SelectButton key={t} active={config.canvas.background.type === t} onClick={() => updateBg({ type: t })}>
                    {t === 'solid' ? 'Cor' : t === 'gradient' ? 'Gradiente' : 'Imagem'}
                  </SelectButton>
                ))}
              </div>
              {config.canvas.background.type === 'solid' && <ColorPickerPopover color={config.canvas.background.color} onChange={(c) => updateBg({ color: c })} label="Cor de Fundo" />}
              {config.canvas.background.type === 'gradient' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <ColorPickerPopover color={gradColor1} onChange={(c) => updateGradient(c, gradColor2)} label="Cor 1" />
                    <ColorPickerPopover color={gradColor2} onChange={(c) => updateGradient(gradColor1, c)} label="Cor 2" />
                  </div>
                  <div className="h-8 rounded-xl border border-border/30 shadow-inner" style={{ background: config.canvas.background.gradient }} />
                </div>
              )}
              {config.canvas.background.type === 'image' && <UnsplashImagePicker currentImage={config.canvas.background.image_url || ''} onSelect={(url) => updateBg({ image_url: url })} />}
            </div>
            <div className="space-y-2">
              <ToggleRow label="✨ Partículas" checked={config.canvas.environment.show_particles} onChange={(v) => updateEnv({ show_particles: v })} />
              <ToggleRow label="🏗️ Chão 3D" checked={config.canvas.environment.show_floor} onChange={(v) => updateEnv({ show_floor: v })} />
            </div>
            <AdvancedSection>
              {config.canvas.environment.show_floor && <ColorPickerPopover color={config.canvas.environment.floor_color || '#1a1a2e'} onChange={(c) => updateEnv({ floor_color: c })} label="Cor do Chão" />}
            </AdvancedSection>
          </motion.div>
        );

      case 'avatar':
        return (
          <motion.div {...fadeSlide} className="space-y-4">
            <BackHeader title="Avatar 3D" icon={<User className="w-4 h-4" />} onBack={goBack} />
            <ToggleRow label="Visível" checked={config.components.avatar.enabled} onChange={(v) => updateAvatar({ enabled: v })} />
            {config.components.avatar.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tamanho</Label>
                  <div className="flex gap-2">
                    {sizePresets.map((s) => (
                      <SelectButton key={s.label} active={Math.abs(config.components.avatar.scale - s.value) < 0.15} onClick={() => updateAvatar({ scale: s.value })}>{s.label}</SelectButton>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 text-center italic">Arraste o avatar no canvas para posicionar</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Animação</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[{ v: 'idle', l: '🧍 Parado' }, { v: 'talking', l: '💬 Falando' }, { v: 'waving', l: '👋 Acenando' }, { v: 'thinking', l: '🤔 Pensando' }].map((a) => (
                      <SelectButton key={a.v} active={config.components.avatar.animation === a.v} onClick={() => updateAvatar({ animation: a.v })}>{a.l}</SelectButton>
                    ))}
                  </div>
                </div>
                <AdvancedSection>
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground font-medium">Escala Fina</Label>
                    <Slider value={[config.components.avatar.scale]} onValueChange={([v]) => updateAvatar({ scale: Math.round(v * 10) / 10 })} min={0.8} max={2.5} step={0.1} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ColorPickerPopover color={config.components.avatar.colors.shirt} onChange={(c) => updateAvatar({ colors: { ...config.components.avatar.colors, shirt: c } })} label="Camisa" />
                    <ColorPickerPopover color={config.components.avatar.colors.pants} onChange={(c) => updateAvatar({ colors: { ...config.components.avatar.colors, pants: c } })} label="Calça" />
                  </div>
                </AdvancedSection>
              </>
            )}
          </motion.div>
        );

      case 'chat':
        return (
          <motion.div {...fadeSlide} className="space-y-4">
            <BackHeader title="Interface / Menu" icon={<MessageSquare className="w-4 h-4" />} onBack={goBack} />
            <ToggleRow label="Visível" checked={config.components.chat_interface.enabled} onChange={(v) => updateChat({ enabled: v })} />
            {config.components.chat_interface.enabled && (
              <>
                <p className="text-[10px] text-muted-foreground/60 italic">Arraste no canvas para posicionar • Duplo-clique nos textos para editar</p>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">CTA</Label>
                  <div className="grid grid-cols-[40px_1fr] gap-1.5">
                    <Input value={config.components.chat_interface.menu.cta_icon} onChange={(e) => updateMenu({ cta_icon: e.target.value })} className="text-center text-base h-9 px-1 bg-background/50" />
                    <Input value={config.components.chat_interface.menu.cta_text} onChange={(e) => updateMenu({ cta_text: e.target.value })} className="h-9 text-xs bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Categorias & Botões</Label>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5 border-dashed border-primary/30 text-primary hover:bg-primary/10 rounded-lg" onClick={() => {
                      setCategories((prev) => [...prev, { title: 'Nova Categoria', icon: '📂', buttons: [] }]);
                      setExpandedCats((prev) => new Set(prev).add(config.components.chat_interface.menu.categories.length));
                    }}>
                      <FolderPlus className="w-3 h-3 mr-1" /> Categoria
                    </Button>
                  </div>
                  <DndContext sensors={catSensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                    <SortableContext items={config.components.chat_interface.menu.categories.map((_, i) => `cat-${i}`)} strategy={verticalListSortingStrategy}>
                      {config.components.chat_interface.menu.categories.map((cat, ci) => (
                        <SortableCat key={`cat-${ci}`} cat={cat} idx={ci} expanded={expandedCats.has(ci)}
                          onToggle={() => setExpandedCats((prev) => { const n = new Set(prev); n.has(ci) ? n.delete(ci) : n.add(ci); return n; })}
                          onRemove={() => setCategories((prev) => prev.filter((_, i) => i !== ci))}
                          onUpdateField={(f, v) => setCategories((prev) => prev.map((c, i) => i === ci ? { ...c, [f]: v } : c))}
                          onAddButton={() => setCategories((prev) => prev.map((c, i) => i === ci ? { ...c, buttons: [...c.buttons, { emoji: '💬', label: 'Novo', prompt: '', color: 'from-blue-400 to-indigo-400' }] } : c))}
                          onRemoveButton={(bi) => setCategories((prev) => prev.map((c, i) => i === ci ? { ...c, buttons: c.buttons.filter((_, j) => j !== bi) } : c))}
                          onUpdateButton={(bi, f, v) => setCategories((prev) => prev.map((c, i) => i === ci ? { ...c, buttons: c.buttons.map((b, j) => j === bi ? { ...b, [f]: v } : b) } : c))}
                          onReorderButtons={(oldI, newI) => setCategories((prev) => prev.map((c, i) => i === ci ? { ...c, buttons: arrayMove(c.buttons, oldI, newI) } : c))}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
                <AdvancedSection>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Mostrar Header</span>
                      <Switch checked={config.components.chat_interface.header.show} onCheckedChange={(show) => updateHeader({ show })} />
                    </div>
                    {config.components.chat_interface.header.show && (
                      <div className="grid grid-cols-[40px_1fr_1fr] gap-1.5">
                        <Input value={config.components.chat_interface.header.icon} onChange={(e) => updateHeader({ icon: e.target.value })} className="text-center text-base h-7 px-1 bg-background/50" />
                        <Input value={config.components.chat_interface.header.title} onChange={(e) => updateHeader({ title: e.target.value })} className="h-7 text-xs bg-background/50" placeholder="Título" />
                        <Input value={config.components.chat_interface.header.subtitle} onChange={(e) => updateHeader({ subtitle: e.target.value })} className="h-7 text-xs bg-background/50" placeholder="Subtítulo" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                      <span className="text-[10px] font-mono text-primary/80">{Math.round((config.components.chat_interface.style?.opacity ?? 0.85) * 100)}%</span>
                    </div>
                    <Slider value={[config.components.chat_interface.style?.opacity ?? 0.85]} onValueChange={([v]) => updateChatStyle({ opacity: v })} min={0.1} max={1} step={0.05} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground">Blur</Label>
                      <span className="text-[10px] font-mono text-primary/80">{config.components.chat_interface.style?.blur ?? 12}px</span>
                    </div>
                    <Slider value={[config.components.chat_interface.style?.blur ?? 12]} onValueChange={([v]) => updateChatStyle({ blur: v })} min={0} max={24} step={1} />
                  </div>
                </AdvancedSection>
              </>
            )}
          </motion.div>
        );

      case 'logo':
        return (
          <motion.div {...fadeSlide} className="space-y-4">
            <BackHeader title="Logo / Marca" icon={<ImageIcon className="w-4 h-4" />} onBack={goBack} />
            <ToggleRow label="Visível" checked={config.components.logo.enabled} onChange={(v) => updateLogo({ enabled: v })} />
            {config.components.logo.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Imagem do Logo</Label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" className="w-full gap-2 h-9 rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/10" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Enviando...' : 'Enviar Imagem'}
                  </Button>
                  <Input value={config.components.logo.url} onChange={(e) => updateLogo({ url: e.target.value })} placeholder="ou cole uma URL..." className="text-xs h-8 bg-background/50" />
                  {config.components.logo.url && (
                    <div className="p-3 rounded-xl border border-border/30 bg-muted/15 flex items-center justify-center backdrop-blur-sm">
                      <img src={config.components.logo.url} alt="Logo" className="max-h-14 max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tamanho</Label>
                  <div className="flex gap-2">
                    {[{ l: 'P', v: 0.7 }, { l: 'M', v: 1.0 }, { l: 'G', v: 1.8 }].map((s) => (
                      <SelectButton key={s.l} active={Math.abs(config.components.logo.scale - s.v) < 0.2} onClick={() => updateLogo({ scale: s.v })}>{s.l}</SelectButton>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Posição</Label>
                  <PositionGrid value={config.components.logo.position} onChange={(v) => updateLogo({ position: v })} />
                </div>
                <AdvancedSection>
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">Escala Fina</Label>
                    <Slider value={[config.components.logo.scale]} onValueChange={([v]) => updateLogo({ scale: v })} min={0.3} max={3} step={0.1} />
                  </div>
                </AdvancedSection>
              </>
            )}
          </motion.div>
        );

      case 'text_banners':
        return (
          <motion.div {...fadeSlide} className="space-y-4">
            <BackHeader title="Textos / Banners" icon={<Type className="w-4 h-4" />} onBack={goBack} />
            <ToggleRow label="Visível" checked={config.components.text_banners?.enabled || false} onChange={(v) => updateTextBanners({ enabled: v })} />
            {config.components.text_banners?.enabled && (
              <>
                <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/10" onClick={addTextItem}>
                  <Plus className="w-4 h-4" /> Adicionar Texto
                </Button>
                <div className="space-y-1.5">
                  {(config.components.text_banners.items || []).map((item) => (
                    <motion.div key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedElement === `text-${item.id}` ? 'border-primary/50 bg-primary/8' : 'border-border/30 bg-muted/15 hover:border-primary/30'}`}
                      onClick={() => onSelectElement?.(`text-${item.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground truncate max-w-[160px]">"{item.text}"</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); removeTextItem(item.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        );

      // ── HUB (no selection) ──
      default:
        return (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight">Elementos</h3>
                <p className="text-[10px] text-muted-foreground/60">Clique para editar • Arraste para mover</p>
              </div>
            </div>

            {/* Fixed elements */}
            <div className="space-y-2">
              {elements.map((el, i) => (
                <motion.div
                  key={el.key}
                  variants={staggerItem}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between p-3 rounded-xl border-2 border-border/30 bg-muted/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group backdrop-blur-sm"
                  onClick={() => onSelectElement?.(el.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${el.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <el.icon className={`w-4 h-4 ${el.iconColor}`} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground">{el.label}</span>
                      <p className="text-[10px] text-muted-foreground/60">{el.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!el.noToggle && (
                      <Switch
                        checked={el.enabled}
                        onCheckedChange={(v) => { el.toggle?.(v); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Custom Layers */}
            <motion.div variants={staggerItem} className="space-y-3">
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                </div>
                <h4 className="text-xs font-bold text-foreground tracking-tight">Camadas Personalizadas</h4>
              </div>

              {/* Existing layers */}
              {layers.length > 0 && (
                <DndContext
                  sensors={catSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => {
                    const { active, over } = e;
                    if (over && active.id !== over.id) {
                      const oldIndex = layers.findIndex(l => l.id === active.id);
                      const newIndex = layers.findIndex(l => l.id === over.id);
                      if (oldIndex !== -1 && newIndex !== -1) {
                        updateLayers(arrayMove(layers, oldIndex, newIndex));
                      }
                    }
                  }}
                >
                  <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {layers.map((layer) => (
                        <SortableLayerItem
                          key={layer.id}
                          layer={layer}
                          layerTypeIcons={layerTypeIcons}
                          layerTypeLabels={layerTypeLabels}
                          selected={selectedElement === layer.id}
                          onSelect={() => onSelectElement?.(layer.id)}
                          onToggleVisible={() => updateLayer(layer.id, { visible: !layer.visible })}
                          onRemove={() => removeLayer(layer.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Add layer buttons */}
              <div className="grid grid-cols-2 gap-2">
                {([
                  { type: 'image' as const, icon: ImageIcon, label: 'Imagem', color: 'text-blue-400' },
                  { type: 'video' as const, icon: Play, label: 'Vídeo', color: 'text-pink-400' },
                  { type: 'shape' as const, icon: Square, label: 'Forma', color: 'text-amber-400' },
                  { type: 'clock' as const, icon: Clock, label: 'Relógio', color: 'text-emerald-400' },
                ]).map((item) => (
                  <motion.div key={item.type} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-10 text-xs gap-2 rounded-xl border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all"
                      onClick={() => addLayer(item.type)}
                    >
                      <Plus className="w-3 h-3 text-muted-foreground" />
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      {item.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );
    }
  };

  // ── Layer Editor ──────────────────────────────────────────────────
  const renderLayerEditor = (layer: Layer) => {
    const Icon = layerTypeIcons[layer.type] || Square;

    const commonControls = (
      <>
        <ToggleRow label="Visível" checked={layer.visible} onChange={(v) => updateLayer(layer.id, { visible: v })} />
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Nome</Label>
          <Input value={layer.label} onChange={(e) => updateLayer(layer.id, { label: e.target.value })} className="h-9 text-xs bg-background/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Posição</Label>
          <PositionGrid value={layer.position} onChange={(v) => updateLayer(layer.id, { position: v })} />
        </div>
      </>
    );

    const deleteButton = (
      <Button variant="destructive" size="sm" className="w-full gap-2 mt-2 rounded-xl" onClick={() => { removeLayer(layer.id); goBack(); }}>
        <Trash2 className="w-3.5 h-3.5" /> Remover Camada
      </Button>
    );

    switch (layer.type) {
      case 'image': {
        const img = layer as ImageLayer;
        return (
          <div className="space-y-4">
            <BackHeader title={img.label} icon={<ImageIcon className="w-4 h-4" />} onBack={goBack} />
            {commonControls}
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Imagem</Label>
              <input ref={layerFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLayerImageUpload(layer.id, e)} />
              <Button variant="outline" size="sm" className="w-full gap-2 h-9 rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/10" onClick={() => layerFileRef.current?.click()} disabled={uploadingLayerId === layer.id}>
                {uploadingLayerId === layer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingLayerId === layer.id ? 'Enviando...' : 'Enviar Imagem'}
              </Button>
              <Input value={img.url} onChange={(e) => updateLayer<ImageLayer>(layer.id, { url: e.target.value })} placeholder="ou cole URL..." className="text-xs h-8 bg-background/50" />
              {img.url && (
                <div className="p-3 rounded-xl border border-border/30 bg-muted/15 flex items-center justify-center backdrop-blur-sm">
                  <img src={img.url} alt="" className="max-h-16 max-w-full object-contain" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tamanho</Label>
              <div className="flex gap-2">
                {[{ l: 'P', v: 0.6 }, { l: 'M', v: 1.0 }, { l: 'G', v: 1.8 }].map((s) => (
                  <SelectButton key={s.l} active={Math.abs(img.scale - s.v) < 0.2} onClick={() => updateLayer<ImageLayer>(layer.id, { scale: s.v })}>{s.l}</SelectButton>
                ))}
              </div>
            </div>
            <AdvancedSection>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                <Slider value={[img.opacity]} onValueChange={([v]) => updateLayer<ImageLayer>(layer.id, { opacity: v })} min={0.1} max={1} step={0.05} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Borda Arredondada</Label>
                <Slider value={[img.borderRadius]} onValueChange={([v]) => updateLayer<ImageLayer>(layer.id, { borderRadius: v })} min={0} max={50} step={1} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Escala Fina</Label>
                <Slider value={[img.scale]} onValueChange={([v]) => updateLayer<ImageLayer>(layer.id, { scale: v })} min={0.3} max={3} step={0.1} />
              </div>
            </AdvancedSection>
            {deleteButton}
          </div>
        );
      }

      case 'video': {
        const vid = layer as VideoLayer;
        return (
          <div className="space-y-4">
            <BackHeader title={vid.label} icon={<Play className="w-4 h-4" />} onBack={goBack} />
            {commonControls}
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">URL do Vídeo (MP4)</Label>
              <Input value={vid.url} onChange={(e) => updateLayer<VideoLayer>(layer.id, { url: e.target.value })} placeholder="https://..." className="text-xs h-8 bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tamanho</Label>
              <div className="flex gap-2">
                {[{ l: 'P', v: 0.6 }, { l: 'M', v: 1.0 }, { l: 'G', v: 1.8 }].map((s) => (
                  <SelectButton key={s.l} active={Math.abs(vid.scale - s.v) < 0.2} onClick={() => updateLayer<VideoLayer>(layer.id, { scale: s.v })}>{s.l}</SelectButton>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <ToggleRow label="▶️ Autoplay" checked={vid.autoplay} onChange={(v) => updateLayer<VideoLayer>(layer.id, { autoplay: v })} />
              <ToggleRow label="🔁 Loop" checked={vid.loop} onChange={(v) => updateLayer<VideoLayer>(layer.id, { loop: v })} />
              <ToggleRow label="🔇 Mudo" checked={vid.muted} onChange={(v) => updateLayer<VideoLayer>(layer.id, { muted: v })} />
            </div>
            {deleteButton}
          </div>
        );
      }

      case 'shape': {
        const shp = layer as ShapeLayer;
        return (
          <div className="space-y-4">
            <BackHeader title={shp.label} icon={<Square className="w-4 h-4" />} onBack={goBack} />
            {commonControls}
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Forma</Label>
              <div className="flex gap-1.5">
                {([
                  { v: 'rectangle' as const, l: 'Retângulo', icon: Square },
                  { v: 'circle' as const, l: 'Círculo', icon: Circle },
                  { v: 'divider' as const, l: 'Linha', icon: Minus },
                ]).map((s) => (
                  <SelectButton key={s.v} active={shp.shape === s.v} onClick={() => updateLayer<ShapeLayer>(layer.id, { shape: s.v })}>{s.l}</SelectButton>
                ))}
              </div>
            </div>
            <ColorPickerPopover color={shp.color} onChange={(c) => updateLayer<ShapeLayer>(layer.id, { color: c })} label="Cor" />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Largura</Label>
                <Slider value={[shp.width]} onValueChange={([v]) => updateLayer<ShapeLayer>(layer.id, { width: v })} min={10} max={300} step={5} />
              </div>
              {shp.shape !== 'divider' && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Altura</Label>
                  <Slider value={[shp.height]} onValueChange={([v]) => updateLayer<ShapeLayer>(layer.id, { height: v })} min={10} max={300} step={5} />
                </div>
              )}
            </div>
            <AdvancedSection>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                <Slider value={[shp.opacity]} onValueChange={([v]) => updateLayer<ShapeLayer>(layer.id, { opacity: v })} min={0.1} max={1} step={0.05} />
              </div>
            </AdvancedSection>
            {deleteButton}
          </div>
        );
      }

      case 'clock': {
        const clk = layer as ClockLayer;
        return (
          <div className="space-y-4">
            <BackHeader title={clk.label} icon={<Clock className="w-4 h-4" />} onBack={goBack} />
            {commonControls}
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Formato</Label>
              <div className="flex gap-2">
                {[{ v: '24h' as const, l: '24h' }, { v: '12h' as const, l: '12h' }].map((f) => (
                  <SelectButton key={f.v} active={clk.format === f.v} onClick={() => updateLayer<ClockLayer>(layer.id, { format: f.v })}>{f.l}</SelectButton>
                ))}
              </div>
            </div>
            <ToggleRow label="📅 Mostrar Data" checked={clk.showDate} onChange={(v) => updateLayer<ClockLayer>(layer.id, { showDate: v })} />
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tamanho</Label>
              <div className="flex gap-1.5">
                {([{ v: 'sm' as const, l: 'P' }, { v: 'md' as const, l: 'M' }, { v: 'lg' as const, l: 'G' }, { v: 'xl' as const, l: 'XL' }]).map((s) => (
                  <SelectButton key={s.v} active={clk.fontSize === s.v} onClick={() => updateLayer<ClockLayer>(layer.id, { fontSize: s.v })}>{s.l}</SelectButton>
                ))}
              </div>
            </div>
            <ColorPickerPopover color={clk.color} onChange={(c) => updateLayer<ClockLayer>(layer.id, { color: c })} label="Cor do Texto" />
            {deleteButton}
          </div>
        );
      }

      default:
        return <div className="p-4 text-sm text-muted-foreground">Tipo de camada desconhecido</div>;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Gradient top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary shrink-0 opacity-60" />
      <ScrollArea className="flex-1 h-0">
        <div className="p-4 pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={selectedElement || 'hub'} {...fadeSlide}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
