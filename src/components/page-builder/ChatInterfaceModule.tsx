import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageSquare, FolderPlus, Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChatInterfaceComponent, ChatStyle, MenuCategory, MenuButton } from '@/types/page-builder';

const COLOR_PRESETS = [
  { label: 'Teal / Cyan', value: 'from-teal-400 to-cyan-400' },
  { label: 'Purple / Pink', value: 'from-purple-400 to-pink-400' },
  { label: 'Orange / Yellow', value: 'from-orange-400 to-yellow-400' },
  { label: 'Blue / Indigo', value: 'from-blue-400 to-indigo-400' },
  { label: 'Green / Emerald', value: 'from-green-400 to-emerald-400' },
  { label: 'Rose / Red', value: 'from-rose-400 to-red-400' },
];

// Sortable button
function SortableButton({ btn, idx, onRemove, onUpdate }: {
  btn: MenuButton; idx: number;
  onRemove: () => void;
  onUpdate: (field: keyof MenuButton, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `btn-${idx}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span>{btn.emoji} {btn.label || `Botão ${idx + 1}`}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Ícone</Label>
          <Input value={btn.emoji} onChange={(e) => onUpdate('emoji', e.target.value)} className="text-center h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Label</Label>
          <Input value={btn.label} onChange={(e) => onUpdate('label', e.target.value)} className="h-8 text-xs" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Cor</Label>
        <select
          value={btn.color}
          onChange={(e) => onUpdate('color', e.target.value)}
          className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {COLOR_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Prompt IA</Label>
        <Textarea value={btn.prompt} onChange={(e) => onUpdate('prompt', e.target.value)} rows={1} className="text-xs min-h-[32px]" />
      </div>
    </div>
  );
}

// Sortable category
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
      <div className="flex items-center justify-between p-2.5 bg-muted/50">
        <div className="flex items-center gap-1.5">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-xs">
            {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="font-semibold text-foreground">{cat.icon} {cat.title}</span>
            <span className="text-muted-foreground">({cat.buttons.length})</span>
          </button>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      {expanded && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Ícone</Label>
              <Input value={cat.icon} onChange={(e) => onUpdateField('icon', e.target.value)} className="text-center text-base h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Nome</Label>
              <Input value={cat.title} onChange={(e) => onUpdateField('title', e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Botões</Label>
            <Button variant="outline" size="sm" onClick={onAddButton} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" /> Botão
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

interface ChatInterfaceModuleProps {
  chatInterface: ChatInterfaceComponent;
  onChange: (chatInterface: ChatInterfaceComponent) => void;
}

export function ChatInterfaceModule({ chatInterface, onChange }: ChatInterfaceModuleProps) {
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([0]));

  const update = (partial: Partial<ChatInterfaceComponent>) => {
    onChange({ ...chatInterface, ...partial });
  };

  const updateStyle = (partial: Partial<ChatStyle>) => {
    onChange({ ...chatInterface, style: { ...chatInterface.style, ...partial } });
  };

  const updateHeader = (partial: Partial<ChatInterfaceComponent['header']>) => {
    onChange({ ...chatInterface, header: { ...chatInterface.header, ...partial } });
  };

  const updateMenu = (partial: Partial<ChatInterfaceComponent['menu']>) => {
    onChange({ ...chatInterface, menu: { ...chatInterface.menu, ...partial } });
  };

  const setCategories = (fn: (prev: MenuCategory[]) => MenuCategory[]) => {
    updateMenu({ categories: fn(chatInterface.menu.categories) });
  };

  const sensors = useSensors(
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

  return (
    <div className="space-y-4">
      {/* Global toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Interface / Menu</span>
        </div>
        <Switch checked={chatInterface.enabled} onCheckedChange={(enabled) => update({ enabled })} />
      </div>

      {chatInterface.enabled && (
        <Accordion type="multiple" defaultValue={['header', 'cta', 'categories']} className="space-y-1">
          {/* Position */}
          <AccordionItem value="position" className="border-b border-border px-1">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Posição na Tela</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'bottom_right', label: '↘ Inferior Direita' },
                  { value: 'bottom_left', label: '↙ Inferior Esquerda' },
                  { value: 'top_right', label: '↗ Superior Direita' },
                  { value: 'top_left', label: '↖ Superior Esquerda' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update({ position: opt.value as any })}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${chatInterface.position === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Style (Opacity & Blur) */}
          <AccordionItem value="style" className="border-b border-border px-1">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Estilo Visual</AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{Math.round((chatInterface.style?.opacity ?? 0.85) * 100)}%</span>
                </div>
                <Slider
                  value={[chatInterface.style?.opacity ?? 0.85]}
                  onValueChange={([v]) => updateStyle({ opacity: v })}
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Blur (Desfoque)</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{chatInterface.style?.blur ?? 12}px</span>
                </div>
                <Slider
                  value={[chatInterface.style?.blur ?? 12]}
                  onValueChange={([v]) => updateStyle({ blur: v })}
                  min={0}
                  max={24}
                  step={1}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Header */}
          <AccordionItem value="header" className="border-b border-border px-1">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Cabeçalho</AccordionTrigger>
            <AccordionContent className="pb-3 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30">
                <span className="text-xs text-foreground">Mostrar Header</span>
                <Switch checked={chatInterface.header.show} onCheckedChange={(show) => updateHeader({ show })} />
              </div>
              {chatInterface.header.show && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Ícone</Label>
                    <Input value={chatInterface.header.icon} onChange={(e) => updateHeader({ icon: e.target.value })} className="text-center text-base h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Título</Label>
                    <Input value={chatInterface.header.title} onChange={(e) => updateHeader({ title: e.target.value })} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Subtítulo</Label>
                    <Input value={chatInterface.header.subtitle} onChange={(e) => updateHeader({ subtitle: e.target.value })} className="h-8 text-xs" />
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* CTA */}
          <AccordionItem value="cta" className="border-b border-border px-1">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">CTA (Chamada)</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Ícone CTA</Label>
                  <Input value={chatInterface.menu.cta_icon} onChange={(e) => updateMenu({ cta_icon: e.target.value })} className="text-center text-base h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Texto CTA</Label>
                  <Input value={chatInterface.menu.cta_text} onChange={(e) => updateMenu({ cta_text: e.target.value })} className="h-8 text-xs" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Categories */}
          <AccordionItem value="categories" className="border-b-0 px-1">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
              Categorias & Botões ({chatInterface.menu.categories.length})
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-2">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                  setCategories((prev) => [...prev, { title: 'Nova Categoria', icon: '📂', buttons: [] }]);
                  setExpandedCats((prev) => new Set(prev).add(chatInterface.menu.categories.length));
                }}>
                  <FolderPlus className="w-3 h-3 mr-1" /> Categoria
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                <SortableContext items={chatInterface.menu.categories.map((_, i) => `cat-${i}`)} strategy={verticalListSortingStrategy}>
                  {chatInterface.menu.categories.map((cat, ci) => (
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
                      onReorderButtons={(old, newIdx) => setCategories((prev) => prev.map((c, i) =>
                        i === ci ? { ...c, buttons: arrayMove(c.buttons, old, newIdx) } : c
                      ))}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
