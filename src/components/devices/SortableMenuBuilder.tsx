import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Plus, Trash2, GripVertical, Save, FolderPlus, ChevronDown, ChevronRight } from 'lucide-react';
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

interface QuickAction {
  emoji: string;
  label: string;
  prompt: string;
  color: string;
}

interface MenuCategory {
  category_title: string;
  category_icon: string;
  buttons: QuickAction[];
}

interface UiConfig {
  title: string;
  subtitle: string;
  header_icon: string;
  cta_text: string;
  cta_icon: string;
  menu_title: string;
  menu_subtitle: string;
  quick_actions?: QuickAction[];
  menu_categories?: MenuCategory[];
}

const COLOR_PRESETS = [
  { label: 'Teal / Cyan', value: 'from-teal-400 to-cyan-400' },
  { label: 'Purple / Pink', value: 'from-purple-400 to-pink-400' },
  { label: 'Orange / Yellow', value: 'from-orange-400 to-yellow-400' },
  { label: 'Blue / Indigo', value: 'from-blue-400 to-indigo-400' },
  { label: 'Green / Emerald', value: 'from-green-400 to-emerald-400' },
  { label: 'Rose / Red', value: 'from-rose-400 to-red-400' },
];

// Sortable category card
function SortableCategoryCard({
  category,
  catIdx,
  expanded,
  onToggle,
  onRemove,
  onUpdateField,
  onAddButton,
  onRemoveButton,
  onUpdateButton,
  onReorderButtons,
}: {
  category: MenuCategory;
  catIdx: number;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateField: (field: 'category_title' | 'category_icon', value: string) => void;
  onAddButton: () => void;
  onRemoveButton: (idx: number) => void;
  onUpdateButton: (idx: number, field: keyof QuickAction, value: string) => void;
  onReorderButtons: (oldIndex: number, newIndex: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `cat-${catIdx}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  const buttonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleButtonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(String(active.id).split('-')[1]);
      const newIndex = parseInt(String(over.id).split('-')[1]);
      onReorderButtons(oldIndex, newIndex);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-muted/50">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <button type="button" onClick={onToggle} className="flex items-center gap-2">
            {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">{category.category_icon} {category.category_title}</span>
            <span className="text-xs text-muted-foreground">({category.buttons.length})</span>
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Icone</Label>
              <Input
                value={category.category_icon}
                onChange={(e) => onUpdateField('category_icon', e.target.value)}
                className="text-center text-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome da Categoria</Label>
              <Input
                value={category.category_title}
                onChange={(e) => onUpdateField('category_title', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Botoes</Label>
              <Button variant="outline" size="sm" onClick={onAddButton}>
                <Plus className="w-3 h-3 mr-1" />
                Botao
              </Button>
            </div>

            <DndContext sensors={buttonSensors} collisionDetection={closestCenter} onDragEnd={handleButtonDragEnd}>
              <SortableContext items={category.buttons.map((_, i) => `btn-${i}`)} strategy={verticalListSortingStrategy}>
                {category.buttons.map((btn, btnIdx) => (
                  <SortableButtonCard
                    key={`btn-${btnIdx}`}
                    btn={btn}
                    btnIdx={btnIdx}
                    onRemove={() => onRemoveButton(btnIdx)}
                    onUpdate={(field, value) => onUpdateButton(btnIdx, field, value)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable button card
function SortableButtonCard({
  btn,
  btnIdx,
  onRemove,
  onUpdate,
}: {
  btn: QuickAction;
  btnIdx: number;
  onRemove: () => void;
  onUpdate: (field: keyof QuickAction, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `btn-${btnIdx}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <span>{btn.emoji} {btn.label || `Botao ${btnIdx + 1}`}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Icone</Label>
          <Input
            value={btn.emoji}
            onChange={(e) => onUpdate('emoji', e.target.value)}
            className="text-center"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            value={btn.label}
            onChange={(e) => onUpdate('label', e.target.value)}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs text-muted-foreground">Cor</Label>
          <select
            value={btn.color}
            onChange={(e) => onUpdate('color', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {COLOR_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>{preset.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Prompt (pergunta enviada para a IA)</Label>
        <Textarea
          value={btn.prompt}
          onChange={(e) => onUpdate('prompt', e.target.value)}
          placeholder="Ex: Quais sao os horarios de funcionamento?"
          rows={2}
        />
      </div>
    </div>
  );
}

interface SortableMenuBuilderProps {
  deviceId: string;
  initialConfig?: UiConfig | null;
}

export function SortableMenuBuilder({ deviceId, initialConfig }: SortableMenuBuilderProps) {
  const [title, setTitle] = useState(initialConfig?.title || 'Assistente Virtual');
  const [subtitle, setSubtitle] = useState(initialConfig?.subtitle || 'Totem Interativo');
  const [headerIcon, setHeaderIcon] = useState(initialConfig?.header_icon || '📍');
  const [ctaText, setCtaText] = useState(initialConfig?.cta_text || 'Como posso ajudar?');
  const [ctaIcon, setCtaIcon] = useState(initialConfig?.cta_icon || '💬');
  const [menuTitle, setMenuTitle] = useState(initialConfig?.menu_title || 'Escolha uma opcao');
  const [menuSubtitle, setMenuSubtitle] = useState(initialConfig?.menu_subtitle || 'Respostas rapidas disponiveis');
  const [categories, setCategories] = useState<MenuCategory[]>(
    initialConfig?.menu_categories ||
    (initialConfig?.quick_actions?.length
      ? [{ category_title: 'Geral', category_icon: '⚡', buttons: initialConfig.quick_actions }]
      : [{ category_title: 'Geral', category_icon: '⚡', buttons: [{ emoji: 'ℹ️', label: 'Informacoes', prompt: 'Quem e voce?', color: 'from-teal-400 to-cyan-400' }] }])
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([0]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (initialConfig) {
      setTitle(initialConfig.title || 'Assistente Virtual');
      setSubtitle(initialConfig.subtitle || 'Totem Interativo');
      setHeaderIcon(initialConfig.header_icon || '📍');
      setCtaText(initialConfig.cta_text || 'Como posso ajudar?');
      setCtaIcon(initialConfig.cta_icon || '💬');
      setMenuTitle(initialConfig.menu_title || 'Escolha uma opcao');
      setMenuSubtitle(initialConfig.menu_subtitle || 'Respostas rapidas disponiveis');
      if (initialConfig.menu_categories?.length) {
        setCategories(initialConfig.menu_categories);
      } else if (initialConfig.quick_actions?.length) {
        setCategories([{ category_title: 'Geral', category_icon: '⚡', buttons: initialConfig.quick_actions }]);
      }
    }
  }, [initialConfig]);

  const markChanged = () => setHasChanges(true);

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(String(active.id).split('-')[1]);
      const newIndex = parseInt(String(over.id).split('-')[1]);
      setCategories(prev => arrayMove(prev, oldIndex, newIndex));
      markChanged();
    }
  };

  const addCategory = () => {
    setCategories(prev => [...prev, { category_title: 'Nova Categoria', category_icon: '📂', buttons: [] }]);
    setExpandedCats(prev => new Set(prev).add(categories.length));
    markChanged();
  };

  const removeCategory = (idx: number) => {
    setCategories(prev => prev.filter((_, i) => i !== idx));
    markChanged();
  };

  const updateCategoryField = (idx: number, field: 'category_title' | 'category_icon', value: string) => {
    setCategories(prev => prev.map((cat, i) => i === idx ? { ...cat, [field]: value } : cat));
    markChanged();
  };

  const addButton = (catIdx: number) => {
    setCategories(prev => prev.map((cat, i) =>
      i === catIdx
        ? { ...cat, buttons: [...cat.buttons, { emoji: '💬', label: 'Novo Botao', prompt: '', color: 'from-blue-400 to-indigo-400' }] }
        : cat
    ));
    markChanged();
  };

  const removeButton = (catIdx: number, btnIdx: number) => {
    setCategories(prev => prev.map((cat, i) =>
      i === catIdx ? { ...cat, buttons: cat.buttons.filter((_, j) => j !== btnIdx) } : cat
    ));
    markChanged();
  };

  const updateButton = (catIdx: number, btnIdx: number, field: keyof QuickAction, value: string) => {
    setCategories(prev => prev.map((cat, i) =>
      i === catIdx
        ? { ...cat, buttons: cat.buttons.map((btn, j) => j === btnIdx ? { ...btn, [field]: value } : btn) }
        : cat
    ));
    markChanged();
  };

  const reorderButtons = (catIdx: number, oldIndex: number, newIndex: number) => {
    setCategories(prev => prev.map((cat, i) =>
      i === catIdx ? { ...cat, buttons: arrayMove(cat.buttons, oldIndex, newIndex) } : cat
    ));
    markChanged();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existingConfig = initialConfig || {};
      const newConfig: any = {
        ...existingConfig,
        title,
        subtitle,
        header_icon: headerIcon,
        cta_text: ctaText,
        cta_icon: ctaIcon,
        menu_title: menuTitle,
        menu_subtitle: menuSubtitle,
        menu_categories: categories,
      };
      delete newConfig.quick_actions;

      const { error } = await supabase
        .from('devices')
        .update({ ui_config: newConfig })
        .eq('id', deviceId);

      if (error) throw error;

      toast.success('Menu atualizado com sucesso!', {
        description: 'As mudancas serao aplicadas no proximo carregamento.',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar ui_config:', error);
      toast.error('Erro ao salvar configuracao do menu');
    } finally {
      setSaving(false);
    }
  };

  const totalButtons = categories.reduce((sum, cat) => sum + cat.buttons.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Menu Dinamico
          </h3>
          <p className="text-sm text-muted-foreground">Organize categorias e botoes arrastando-os</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Menu'}
        </Button>
      </div>

      {/* Title, Subtitle & Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Titulo da Interface</Label>
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); markChanged(); }}
            placeholder="Assistente Virtual"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtitulo</Label>
          <Input
            value={subtitle}
            onChange={(e) => { setSubtitle(e.target.value); markChanged(); }}
            placeholder="Totem Interativo"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Icone do Header</Label>
          <Input
            value={headerIcon}
            onChange={(e) => { setHeaderIcon(e.target.value); markChanged(); }}
            placeholder="📍"
            className="text-center text-lg"
          />
        </div>
      </div>

      {/* CTA & Menu Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Texto do CTA</Label>
          <Input
            value={ctaText}
            onChange={(e) => { setCtaText(e.target.value); markChanged(); }}
            placeholder="Como posso ajudar?"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Icone do CTA</Label>
          <Input
            value={ctaIcon}
            onChange={(e) => { setCtaIcon(e.target.value); markChanged(); }}
            placeholder="💬"
            className="text-center text-lg"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Titulo do Menu</Label>
          <Input
            value={menuTitle}
            onChange={(e) => { setMenuTitle(e.target.value); markChanged(); }}
            placeholder="Escolha uma opcao"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtitulo do Menu</Label>
          <Input
            value={menuSubtitle}
            onChange={(e) => { setMenuSubtitle(e.target.value); markChanged(); }}
            placeholder="Respostas rapidas disponiveis"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border bg-muted/30 p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Pre-visualizacao</p>
        <div className="text-center space-y-2 mb-4">
          <h3 className="text-lg font-bold text-foreground">{title || 'Titulo'}</h3>
          <p className="text-sm text-muted-foreground">{subtitle || 'Subtitulo'}</p>
        </div>
        {categories.map((cat, ci) => (
          <div key={ci} className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">
              {cat.category_icon} {cat.category_title}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {cat.buttons.map((btn, bi) => (
                <div
                  key={bi}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${btn.color} text-white text-sm font-medium shadow-md`}
                >
                  <span>{btn.emoji}</span>
                  <span>{btn.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Categories Editor with DnD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Categorias ({categories.length}) - {totalButtons} botoes
          </Label>
          <Button variant="outline" size="sm" onClick={addCategory}>
            <FolderPlus className="w-4 h-4 mr-1" />
            Adicionar Categoria
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={categories.map((_, i) => `cat-${i}`)} strategy={verticalListSortingStrategy}>
            {categories.map((category, catIdx) => (
              <SortableCategoryCard
                key={`cat-${catIdx}`}
                category={category}
                catIdx={catIdx}
                expanded={expandedCats.has(catIdx)}
                onToggle={() => {
                  setExpandedCats(prev => {
                    const next = new Set(prev);
                    next.has(catIdx) ? next.delete(catIdx) : next.add(catIdx);
                    return next;
                  });
                }}
                onRemove={() => removeCategory(catIdx)}
                onUpdateField={(field, value) => updateCategoryField(catIdx, field, value)}
                onAddButton={() => addButton(catIdx)}
                onRemoveButton={(btnIdx) => removeButton(catIdx, btnIdx)}
                onUpdateButton={(btnIdx, field, value) => updateButton(catIdx, btnIdx, field, value)}
                onReorderButtons={(old, newIdx) => reorderButtons(catIdx, old, newIdx)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
