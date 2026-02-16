import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPickerPopover } from '@/components/devices/ColorPickerPopover';
import { UnsplashImagePicker } from '@/components/devices/UnsplashImagePicker';
import {
  Paintbrush, User, MessageSquare, ImageIcon, Settings, ChevronDown,
  Monitor, Layers, FolderPlus, Plus, Trash2, GripVertical, ChevronRight,
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
import type {
  PageBuilderConfig, CanvasConfig, AvatarComponent,
  ChatInterfaceComponent, LogoComponent, MenuCategory, MenuButton, ChatStyle,
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
}

export function ContextualSidebar({ config, selectedElement, onChange }: ContextualSidebarProps) {
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([0]));

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
  const setCategories = (fn: (prev: MenuCategory[]) => MenuCategory[]) => updateMenu({ categories: fn(config.components.chat_interface.menu.categories) });

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

  const renderContent = () => {
    switch (selectedElement) {
      // ── BACKGROUND ──────────────────────────────────────────
      case 'background':
        return (
          <div className="space-y-4">
            <SectionTitle icon={<Paintbrush className="w-4 h-4" />} title="Cenário" />

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
            <SectionTitle icon={<User className="w-4 h-4" />} title="Avatar 3D" />

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
            <SectionTitle icon={<MessageSquare className="w-4 h-4" />} title="Interface / Menu" />

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
            <SectionTitle icon={<ImageIcon className="w-4 h-4" />} title="Logo / Marca" />

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-xs font-medium text-foreground">Visível</span>
              <Switch checked={config.components.logo.enabled} onCheckedChange={(v) => updateLogo({ enabled: v })} />
            </div>

            {config.components.logo.enabled && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">URL da Imagem</Label>
                  <Input value={config.components.logo.url} onChange={(e) => updateLogo({ url: e.target.value })} placeholder="https://..." className="text-xs h-8" />
                  {config.components.logo.url && (
                    <div className="mt-1 p-2 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
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

      // ── NO SELECTION ────────────────────────────────────────
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
              <Paintbrush className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Selecione um elemento</p>
              <p className="text-xs text-muted-foreground mt-1">Clique no fundo, avatar, menu ou logo<br />no canvas ao lado para editá-lo</p>
            </div>

            {/* Quick toggles */}
            <div className="w-full space-y-1.5 pt-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Elementos</p>
              {[
                { label: 'Avatar 3D', enabled: config.components.avatar.enabled, toggle: (v: boolean) => updateAvatar({ enabled: v }), icon: User },
                { label: 'Interface / Menu', enabled: config.components.chat_interface.enabled, toggle: (v: boolean) => updateChat({ enabled: v }), icon: MessageSquare },
                { label: 'Logo', enabled: config.components.logo.enabled, toggle: (v: boolean) => updateLogo({ enabled: v }), icon: ImageIcon },
              ].map((el) => (
                <div key={el.label} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <el.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">{el.label}</span>
                  </div>
                  <Switch checked={el.enabled} onCheckedChange={el.toggle} />
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

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border">
      <div className="text-primary">{icon}</div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
    </div>
  );
}
