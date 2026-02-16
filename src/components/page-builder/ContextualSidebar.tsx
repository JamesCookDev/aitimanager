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
  FolderPlus, Plus, Trash2, GripVertical, ChevronRight, ArrowLeft, Upload, Loader2, Type,
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
import type {
  PageBuilderConfig, CanvasConfig, AvatarComponent,
  ChatInterfaceComponent, LogoComponent, MenuCategory, MenuButton, ChatStyle,
  TextBannerComponent, TextBannerItem,
} from '@/types/page-builder';
import type { CanvasSelection } from './TotemCanvas';

// ── Sortable Button (compact) ───────────────────────────────────────────
function SortableButton({ btn, idx, onRemove, onUpdate }: {
  btn: MenuButton; idx: number;
  onRemove: () => void;
  onUpdate: (field: keyof MenuButton, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `btn-${idx}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-muted/20 p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <span>{btn.emoji} {btn.label || `Botão ${idx + 1}`}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:bg-destructive/10" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-[40px_1fr] gap-1.5">
        <Input value={btn.emoji} onChange={(e) => onUpdate('emoji', e.target.value)} className="text-center h-7 text-xs px-1" />
        <Input value={btn.label} onChange={(e) => onUpdate('label', e.target.value)} className="h-7 text-xs" placeholder="Label" />
      </div>
      <Input value={btn.prompt} onChange={(e) => onUpdate('prompt', e.target.value)} className="h-7 text-xs" placeholder="Prompt IA" />
    </div>
  );
}

// ── Sortable Category ───────────────────────────────────────────────────
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
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-muted/50">
        <div className="flex items-center gap-1.5">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <button type="button" onClick={onToggle} className="flex items-center gap-1 text-xs">
            {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <span className="font-semibold text-foreground">{cat.icon} {cat.title}</span>
            <span className="text-muted-foreground text-[10px]">({cat.buttons.length})</span>
          </button>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      {expanded && (
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-[40px_1fr] gap-1.5">
            <Input value={cat.icon} onChange={(e) => onUpdateField('icon', e.target.value)} className="text-center text-base h-7 px-1" />
            <Input value={cat.title} onChange={(e) => onUpdateField('title', e.target.value)} className="h-7 text-xs" placeholder="Nome" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Botões</span>
            <Button variant="outline" size="sm" onClick={onAddButton} className="h-6 text-[10px] px-2">
              <Plus className="w-2.5 h-2.5 mr-0.5" /> Botão
            </Button>
          </div>
          <DndContext sensors={btnSensors} collisionDetection={closestCenter} onDragEnd={handleBtnDragEnd}>
            <SortableContext items={cat.buttons.map((_, i) => `btn-${i}`)} strategy={verticalListSortingStrategy}>
              {cat.buttons.map((btn, bi) => (
                <SortableButton
                  key={`btn-${bi}`}
                  btn={btn}
                  idx={bi}
                  onRemove={() => onRemoveButton(bi)}
                  onUpdate={(f, v) => onUpdateButton(bi, f, v)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

// ── Advanced settings collapsible ───────────────────────────────────────
function AdvancedSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 w-full">
        <Settings className="w-3.5 h-3.5" />
        <span>Configurações Avançadas</span>
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Main export ─────────────────────────────────────────────────────────
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
      id: `txt-${Date.now()}`,
      text: 'Novo Texto',
      position: 'top_center',
      fontSize: 'md',
      color: '#ffffff',
      bgColor: '#000000',
      bgEnabled: false,
      bold: false,
    };
    updateTextBanners({ enabled: true, items: [...(config.components.text_banners?.items || []), newItem] });
  };
  const removeTextItem = (id: string) => {
    const items = (config.components.text_banners?.items || []).filter(i => i.id !== id);
    updateTextBanners({ items });
  };
  const setCategories = (fn: (prev: MenuCategory[]) => MenuCategory[]) => updateMenu({ categories: fn(config.components.chat_interface.menu.categories) });

  const goBack = () => onSelectElement?.(null);

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      updateLogo({ url: publicUrl, enabled: true });
      toast.success('Logo enviado com sucesso!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao enviar logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const catSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleCatDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = parseInt(String(active.id).split('-')[1]);
      const newIdx = parseInt(String(over.id).split('-')[1]);
      setCategories((prev) => arrayMove(prev, oldIdx, newIdx));
    }
  };

  // Gradient color state
  const [gradColor1, setGradColor1] = useState(() => {
    const match = config.canvas.background.gradient?.match(/#[0-9a-fA-F]{6}/g);
    return match?.[0] || '#1e3a8a';
  });
  const [gradColor2, setGradColor2] = useState(() => {
    const match = config.canvas.background.gradient?.match(/#[0-9a-fA-F]{6}/g);
    return match?.[1] || '#0f172a';
  });
  const updateGradient = (c1: string, c2: string) => {
    setGradColor1(c1);
    setGradColor2(c2);
    updateBg({ gradient: `linear-gradient(135deg, ${c1}, ${c2})` });
  };

  const sizePresets = [
    { label: 'P', value: 1.0 },
    { label: 'M', value: 1.5 },
    { label: 'G', value: 2.0 },
  ];

  // ── Element list items for the default/hub view ──
  const elements = [
    { key: 'background' as CanvasSelection, label: 'Cenário / Fundo', icon: Paintbrush, enabled: true, noToggle: true },
    { key: 'avatar' as CanvasSelection, label: 'Avatar 3D', icon: User, enabled: config.components.avatar.enabled, toggle: (v: boolean) => updateAvatar({ enabled: v }) },
    { key: 'chat' as CanvasSelection, label: 'Interface / Menu', icon: MessageSquare, enabled: config.components.chat_interface.enabled, toggle: (v: boolean) => updateChat({ enabled: v }) },
    { key: 'logo' as CanvasSelection, label: 'Logo / Marca', icon: ImageIcon, enabled: config.components.logo.enabled, toggle: (v: boolean) => updateLogo({ enabled: v }) },
    { key: 'text_banners' as CanvasSelection, label: 'Textos / Banners', icon: Type, enabled: config.components.text_banners?.enabled || false, toggle: (v: boolean) => updateTextBanners({ enabled: v }) },
  ];

  const renderContent = () => {
    switch (selectedElement) {
      // ── BACKGROUND ──────────────────────────────────────────
      case 'background':
        return (
          <div className="space-y-4">
            <BackHeader title="Cenário" icon={<Paintbrush className="w-4 h-4" />} onBack={goBack} />

            {/* Orientation */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Orientação</Label>
              <div className="flex gap-2">
                {[
                  { value: 'vertical' as const, label: '📱 Vertical' },
                  { value: 'horizontal' as const, label: '🖥️ Horizontal' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateCanvas({ orientation: opt.value })}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${config.canvas.orientation === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background type */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Fundo</Label>
              <div className="flex gap-1.5">
                {(['solid', 'gradient', 'image'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateBg({ type: t })}
                    className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${config.canvas.background.type === t ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'}`}
                  >
                    {t === 'solid' ? 'Cor' : t === 'gradient' ? 'Gradiente' : 'Imagem'}
                  </button>
                ))}
              </div>
              {config.canvas.background.type === 'solid' && (
                <ColorPickerPopover color={config.canvas.background.color} onChange={(c) => updateBg({ color: c })} label="Cor de Fundo" />
              )}
              {config.canvas.background.type === 'gradient' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <ColorPickerPopover color={gradColor1} onChange={(c) => updateGradient(c, gradColor2)} label="Cor 1" />
                    <ColorPickerPopover color={gradColor2} onChange={(c) => updateGradient(gradColor1, c)} label="Cor 2" />
                  </div>
                  <div className="h-6 rounded-lg border border-border" style={{ background: config.canvas.background.gradient }} />
                </div>
              )}
              {config.canvas.background.type === 'image' && (
                <UnsplashImagePicker currentImage={config.canvas.background.image_url || ''} onSelect={(url) => updateBg({ image_url: url })} />
              )}
            </div>

            {/* Environment toggles */}
            <div className="space-y-2">
              {[
                { key: 'show_particles' as const, label: '✨ Partículas' },
                { key: 'show_floor' as const, label: '🏗️ Chão 3D' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30">
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <Switch checked={config.canvas.environment[item.key]} onCheckedChange={(v) => updateEnv({ [item.key]: v })} />
                </div>
              ))}
            </div>

            <AdvancedSection>
              {config.canvas.environment.show_floor && (
                <ColorPickerPopover color={config.canvas.environment.floor_color || '#1a1a2e'} onChange={(c) => updateEnv({ floor_color: c })} label="Cor do Chão" />
              )}
            </AdvancedSection>
          </div>
        );

      // ── AVATAR ──────────────────────────────────────────────
      case 'avatar':
        return (
          <div className="space-y-4">
            <BackHeader title="Avatar 3D" icon={<User className="w-4 h-4" />} onBack={goBack} />

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-xs font-medium text-foreground">Visível</span>
              <Switch checked={config.components.avatar.enabled} onCheckedChange={(v) => updateAvatar({ enabled: v })} />
            </div>

            {config.components.avatar.enabled && (
              <>
                {/* Size — visual presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tamanho</Label>
                  <div className="flex gap-2">
                    {sizePresets.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => updateAvatar({ scale: s.value })}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                          Math.abs(config.components.avatar.scale - s.value) < 0.15
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">Arraste o avatar no canvas para posicionar</p>
                </div>

                {/* Animation */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Animação</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { v: 'idle', l: '🧍 Parado' },
                      { v: 'talking', l: '💬 Falando' },
                      { v: 'waving', l: '👋 Acenando' },
                      { v: 'thinking', l: '🤔 Pensando' },
                    ].map((a) => (
                      <button
                        key={a.v}
                        type="button"
                        onClick={() => updateAvatar({ animation: a.v })}
                        className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                          config.components.avatar.animation === a.v
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {a.l}
                      </button>
                    ))}
                  </div>
                </div>

                <AdvancedSection>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Escala Fina</Label>
                    <Slider value={[config.components.avatar.scale]} onValueChange={([v]) => updateAvatar({ scale: Math.round(v * 10) / 10 })} min={0.8} max={2.5} step={0.1} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ColorPickerPopover color={config.components.avatar.colors.shirt} onChange={(c) => updateAvatar({ colors: { ...config.components.avatar.colors, shirt: c } })} label="Camisa" />
                    <ColorPickerPopover color={config.components.avatar.colors.pants} onChange={(c) => updateAvatar({ colors: { ...config.components.avatar.colors, pants: c } })} label="Calça" />
                  </div>
                </AdvancedSection>
              </>
            )}
          </div>
        );

      // ── CHAT / MENU ─────────────────────────────────────────
      case 'chat':
        return (
          <div className="space-y-4">
            <BackHeader title="Interface / Menu" icon={<MessageSquare className="w-4 h-4" />} onBack={goBack} />

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-xs font-medium text-foreground">Visível</span>
              <Switch checked={config.components.chat_interface.enabled} onCheckedChange={(v) => updateChat({ enabled: v })} />
            </div>

            {config.components.chat_interface.enabled && (
              <>
                <p className="text-[10px] text-muted-foreground">Arraste o painel no canvas para posicionar • Dê duplo-clique nos textos para editar direto</p>

                {/* CTA */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Texto de Chamada (CTA)</Label>
                  <div className="grid grid-cols-[40px_1fr] gap-1.5">
                    <Input value={config.components.chat_interface.menu.cta_icon} onChange={(e) => updateMenu({ cta_icon: e.target.value })} className="text-center text-base h-8 px-1" />
                    <Input value={config.components.chat_interface.menu.cta_text} onChange={(e) => updateMenu({ cta_text: e.target.value })} className="h-8 text-xs" />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Categorias & Botões</Label>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => {
                      setCategories((prev) => [...prev, { title: 'Nova Categoria', icon: '📂', buttons: [] }]);
                      setExpandedCats((prev) => new Set(prev).add(config.components.chat_interface.menu.categories.length));
                    }}>
                      <FolderPlus className="w-2.5 h-2.5 mr-0.5" /> Categoria
                    </Button>
                  </div>

                  <DndContext sensors={catSensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                    <SortableContext items={config.components.chat_interface.menu.categories.map((_, i) => `cat-${i}`)} strategy={verticalListSortingStrategy}>
                      {config.components.chat_interface.menu.categories.map((cat, ci) => (
                        <SortableCat
                          key={`cat-${ci}`}
                          cat={cat}
                          idx={ci}
                          expanded={expandedCats.has(ci)}
                          onToggle={() => setExpandedCats((prev) => {
                            const next = new Set(prev);
                            next.has(ci) ? next.delete(ci) : next.add(ci);
                            return next;
                          })}
                          onRemove={() => setCategories((prev) => prev.filter((_, i) => i !== ci))}
                          onUpdateField={(f, v) => setCategories((prev) => prev.map((c, i) => i === ci ? { ...c, [f]: v } : c))}
                          onAddButton={() => setCategories((prev) => prev.map((c, i) =>
                            i === ci ? { ...c, buttons: [...c.buttons, { emoji: '💬', label: 'Novo', prompt: '', color: 'from-blue-400 to-indigo-400' }] } : c
                          ))}
                          onRemoveButton={(bi) => setCategories((prev) => prev.map((c, i) =>
                            i === ci ? { ...c, buttons: c.buttons.filter((_, j) => j !== bi) } : c
                          ))}
                          onUpdateButton={(bi, f, v) => setCategories((prev) => prev.map((c, i) =>
                            i === ci ? { ...c, buttons: c.buttons.map((b, j) => j === bi ? { ...b, [f]: v } : b) } : c
                          ))}
                          onReorderButtons={(oldI, newI) => setCategories((prev) => prev.map((c, i) =>
                            i === ci ? { ...c, buttons: arrayMove(c.buttons, oldI, newI) } : c
                          ))}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>

                <AdvancedSection>
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Mostrar Header</span>
                      <Switch checked={config.components.chat_interface.header.show} onCheckedChange={(show) => updateHeader({ show })} />
                    </div>
                    {config.components.chat_interface.header.show && (
                      <div className="grid grid-cols-[40px_1fr_1fr] gap-1.5">
                        <Input value={config.components.chat_interface.header.icon} onChange={(e) => updateHeader({ icon: e.target.value })} className="text-center text-base h-7 px-1" />
                        <Input value={config.components.chat_interface.header.title} onChange={(e) => updateHeader({ title: e.target.value })} className="h-7 text-xs" placeholder="Título" />
                        <Input value={config.components.chat_interface.header.subtitle} onChange={(e) => updateHeader({ subtitle: e.target.value })} className="h-7 text-xs" placeholder="Subtítulo" />
                      </div>
                    )}
                  </div>
                  {/* Style */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                      <span className="text-[10px] font-mono text-muted-foreground">{Math.round((config.components.chat_interface.style?.opacity ?? 0.85) * 100)}%</span>
                    </div>
                    <Slider value={[config.components.chat_interface.style?.opacity ?? 0.85]} onValueChange={([v]) => updateChatStyle({ opacity: v })} min={0.1} max={1} step={0.05} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground">Blur</Label>
                      <span className="text-[10px] font-mono text-muted-foreground">{config.components.chat_interface.style?.blur ?? 12}px</span>
                    </div>
                    <Slider value={[config.components.chat_interface.style?.blur ?? 12]} onValueChange={([v]) => updateChatStyle({ blur: v })} min={0} max={24} step={1} />
                  </div>
                </AdvancedSection>
              </>
            )}
          </div>
        );

      // ── LOGO ────────────────────────────────────────────────
      case 'logo':
        return (
          <div className="space-y-4">
            <BackHeader title="Logo / Marca" icon={<ImageIcon className="w-4 h-4" />} onBack={goBack} />

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-xs font-medium text-foreground">Visível</span>
              <Switch checked={config.components.logo.enabled} onCheckedChange={(v) => updateLogo({ enabled: v })} />
            </div>

            {config.components.logo.enabled && (
              <>
                {/* Upload */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Imagem do Logo</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 h-9"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Enviando...' : 'Enviar Imagem'}
                  </Button>
                  <div className="relative">
                    <Input
                      value={config.components.logo.url}
                      onChange={(e) => updateLogo({ url: e.target.value })}
                      placeholder="ou cole uma URL..."
                      className="text-xs h-8"
                    />
                  </div>
                  {config.components.logo.url && (
                    <div className="p-2 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                      <img src={config.components.logo.url} alt="Logo" className="max-h-12 max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                {/* Size — visual */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tamanho</Label>
                  <div className="flex gap-2">
                    {[{ l: 'P', v: 0.7 }, { l: 'M', v: 1.0 }, { l: 'G', v: 1.8 }].map((s) => (
                      <button
                        key={s.l}
                        type="button"
                        onClick={() => updateLogo({ scale: s.v })}
                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                          Math.abs(config.components.logo.scale - s.v) < 0.2
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {s.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Posição</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { v: 'top_left', l: '↖' },
                      { v: 'center_top', l: '↑' },
                      { v: 'top_right', l: '↗' },
                      { v: 'bottom_left', l: '↙' },
                      { v: '', l: '' },
                      { v: 'bottom_right', l: '↘' },
                    ].map((p, i) => p.v ? (
                      <button
                        key={p.v}
                        type="button"
                        onClick={() => updateLogo({ position: p.v as any })}
                        className={`py-2 rounded-lg border text-sm transition-all ${
                          config.components.logo.position === p.v
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {p.l}
                      </button>
                    ) : <div key={i} />)}
                  </div>
                </div>

                <AdvancedSection>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Escala Fina</Label>
                    <Slider value={[config.components.logo.scale]} onValueChange={([v]) => updateLogo({ scale: v })} min={0.3} max={3} step={0.1} />
                  </div>
                </AdvancedSection>
              </>
            )}
          </div>
        );

      // ── TEXT BANNERS ────────────────────────────────────────
      case 'text_banners':
        return (
          <div className="space-y-4">
            <BackHeader title="Textos / Banners" icon={<Type className="w-4 h-4" />} onBack={goBack} />

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-xs font-medium text-foreground">Visível</span>
              <Switch checked={config.components.text_banners?.enabled || false} onCheckedChange={(v) => updateTextBanners({ enabled: v })} />
            </div>

            {config.components.text_banners?.enabled && (
              <>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={addTextItem}>
                  <Plus className="w-4 h-4" /> Adicionar Texto
                </Button>

                <div className="space-y-3">
                  {(config.components.text_banners.items || []).map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground truncate max-w-[180px]">"{item.text}"</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeTextItem(item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <Input
                        value={item.text}
                        onChange={(e) => updateTextItem(item.id, { text: e.target.value })}
                        placeholder="Digite o texto..."
                        className="h-8 text-xs"
                      />

                      {/* Position */}
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Posição</Label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { v: 'top_left', l: '↖' }, { v: 'top_center', l: '↑' }, { v: 'top_right', l: '↗' },
                            { v: 'center', l: '•', span: true },
                            { v: 'bottom_left', l: '↙' }, { v: 'bottom_center', l: '↓' }, { v: 'bottom_right', l: '↘' },
                          ].map((p) => (
                            <button
                              key={p.v}
                              type="button"
                              onClick={() => updateTextItem(item.id, { position: p.v as any })}
                              className={`py-1.5 rounded border text-xs transition-all ${
                                item.position === p.v
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border bg-muted/30 text-muted-foreground'
                              } ${'span' in p ? 'col-start-2' : ''}`}
                            >
                              {p.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font size */}
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Tamanho</Label>
                        <div className="flex gap-1">
                          {[
                            { v: 'sm' as const, l: 'P' },
                            { v: 'md' as const, l: 'M' },
                            { v: 'lg' as const, l: 'G' },
                            { v: 'xl' as const, l: 'XL' },
                          ].map((s) => (
                            <button
                              key={s.v}
                              type="button"
                              onClick={() => updateTextItem(item.id, { fontSize: s.v })}
                              className={`flex-1 py-1.5 rounded border text-xs font-bold transition-all ${
                                item.fontSize === s.v
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border bg-muted/30 text-muted-foreground'
                              }`}
                            >
                              {s.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Style */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ColorPickerPopover color={item.color} onChange={(c) => updateTextItem(item.id, { color: c })} label="Cor" />
                        </div>
                        <button
                          type="button"
                          onClick={() => updateTextItem(item.id, { bold: !item.bold })}
                          className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                            item.bold ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'
                          }`}
                        >
                          B
                        </button>
                      </div>

                      {/* Background */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Switch checked={item.bgEnabled} onCheckedChange={(v) => updateTextItem(item.id, { bgEnabled: v })} />
                          <span className="text-[10px] text-muted-foreground">Fundo</span>
                        </div>
                        {item.bgEnabled && (
                          <div className="flex-1">
                            <ColorPickerPopover color={item.bgColor} onChange={(c) => updateTextItem(item.id, { bgColor: c })} label="Cor Fundo" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      // ── NO SELECTION (HUB) ─────────────────────────────────
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <Paintbrush className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Elementos</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Clique num elemento abaixo ou diretamente no canvas para editá-lo.</p>

            <div className="space-y-1.5">
              {elements.map((el) => (
                <div
                  key={el.key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                  onClick={() => onSelectElement?.(el.key)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <el.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-foreground">{el.label}</span>
                      {!el.noToggle && (
                        <p className="text-[10px] text-muted-foreground">{el.enabled ? 'Ativo' : 'Desativado'}</p>
                      )}
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
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
}

function BackHeader({ title, icon, onBack }: { title: string; icon: React.ReactNode; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border">
      <button
        type="button"
        onClick={onBack}
        className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="text-primary">{icon}</div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
    </div>
  );
}
