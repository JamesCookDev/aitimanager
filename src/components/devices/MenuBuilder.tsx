import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Plus, Trash2, GripVertical, Save, Sparkles, FolderPlus, ChevronDown, ChevronRight } from 'lucide-react';

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
  quick_actions?: QuickAction[];
  menu_categories?: MenuCategory[];
}

const COLOR_PRESETS = [
  { label: 'Teal → Cyan', value: 'from-teal-400 to-cyan-400' },
  { label: 'Purple → Pink', value: 'from-purple-400 to-pink-400' },
  { label: 'Orange → Yellow', value: 'from-orange-400 to-yellow-400' },
  { label: 'Blue → Indigo', value: 'from-blue-400 to-indigo-400' },
  { label: 'Green → Emerald', value: 'from-green-400 to-emerald-400' },
  { label: 'Rose → Red', value: 'from-rose-400 to-red-400' },
];

const DEFAULT_CATEGORY: MenuCategory = {
  category_title: 'Nova Categoria',
  category_icon: '📂',
  buttons: [],
};

interface MenuBuilderProps {
  deviceId: string;
  initialConfig?: UiConfig | null;
}

export function MenuBuilder({ deviceId, initialConfig }: MenuBuilderProps) {
  const [title, setTitle] = useState(initialConfig?.title || 'Assistente Virtual');
  const [subtitle, setSubtitle] = useState(initialConfig?.subtitle || 'Como posso ajudar?');
  const [categories, setCategories] = useState<MenuCategory[]>(
    initialConfig?.menu_categories || 
    // Migrate old quick_actions to a single category
    (initialConfig?.quick_actions?.length
      ? [{ category_title: 'Geral', category_icon: '⚡', buttons: initialConfig.quick_actions }]
      : [{ category_title: 'Geral', category_icon: '⚡', buttons: [{ emoji: 'ℹ️', label: 'Informações', prompt: 'Quem é você?', color: 'from-teal-400 to-cyan-400' }] }])
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (initialConfig) {
      setTitle(initialConfig.title || 'Assistente Virtual');
      setSubtitle(initialConfig.subtitle || 'Como posso ajudar?');
      if (initialConfig.menu_categories?.length) {
        setCategories(initialConfig.menu_categories);
      } else if (initialConfig.quick_actions?.length) {
        setCategories([{ category_title: 'Geral', category_icon: '⚡', buttons: initialConfig.quick_actions }]);
      }
    }
  }, [initialConfig]);

  const markChanged = () => setHasChanges(true);

  const toggleExpand = (idx: number) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const addCategory = () => {
    setCategories(prev => [...prev, { ...DEFAULT_CATEGORY }]);
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
        ? { ...cat, buttons: [...cat.buttons, { emoji: '💬', label: 'Novo Botão', prompt: '', color: 'from-blue-400 to-indigo-400' }] }
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build the full ui_config preserving layout and other fields
      const existingConfig = initialConfig || {};
      const newConfig: any = {
        ...existingConfig,
        title,
        subtitle,
        menu_categories: categories,
      };
      // Remove old quick_actions since we migrated to menu_categories
      delete newConfig.quick_actions;

      const { error } = await supabase
        .from('devices')
        .update({ ui_config: newConfig })
        .eq('id', deviceId);

      if (error) throw error;

      toast.success('Menu do totem atualizado!', {
        description: 'As mudanças serão aplicadas no próximo carregamento do dispositivo.',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar ui_config:', error);
      toast.error('Erro ao salvar configuração do menu');
    } finally {
      setSaving(false);
    }
  };

  const totalButtons = categories.reduce((sum, cat) => sum + cat.buttons.length, 0);

  return (
    <Card className="card-industrial">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Construtor de Menu Dinâmico
            </CardTitle>
            <CardDescription>
              Organize botões em categorias para a tela do totem
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Menu'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Título da Interface</Label>
            <Input
              value={title}
              onChange={(e) => { setTitle(e.target.value); markChanged(); }}
              placeholder="Assistente Virtual"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtítulo</Label>
            <Input
              value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); markChanged(); }}
              placeholder="Como posso ajudar?"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Pré-visualização</p>
          <div className="text-center space-y-2 mb-4">
            <h3 className="text-lg font-bold text-foreground">{title || 'Título'}</h3>
            <p className="text-sm text-muted-foreground">{subtitle || 'Subtítulo'}</p>
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

        {/* Categories Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Categorias ({categories.length}) • {totalButtons} botões
            </Label>
            <Button variant="outline" size="sm" onClick={addCategory}>
              <FolderPlus className="w-4 h-4 mr-1" />
              Adicionar Categoria
            </Button>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma categoria configurada</p>
              <p className="text-xs mt-1">Adicione categorias para organizar os botões</p>
            </div>
          )}

          {categories.map((category, catIdx) => (
            <div key={catIdx} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Category Header */}
              <div
                className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
                onClick={() => toggleExpand(catIdx)}
              >
                <div className="flex items-center gap-3">
                  {expandedCats.has(catIdx) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-lg">{category.category_icon}</span>
                  <span className="text-sm font-semibold text-foreground">{category.category_title}</span>
                  <span className="text-xs text-muted-foreground">({category.buttons.length} botões)</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); removeCategory(catIdx); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Category Content */}
              {expandedCats.has(catIdx) && (
                <div className="p-4 space-y-4">
                  {/* Category Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ícone</Label>
                      <Input
                        value={category.category_icon}
                        onChange={(e) => updateCategoryField(catIdx, 'category_icon', e.target.value)}
                        placeholder="📂"
                        className="text-center text-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nome da Categoria</Label>
                      <Input
                        value={category.category_title}
                        onChange={(e) => updateCategoryField(catIdx, 'category_title', e.target.value)}
                        placeholder="Nome da categoria"
                      />
                    </div>
                  </div>

                  {/* Buttons in this category */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Botões</Label>
                      <Button variant="outline" size="sm" onClick={() => addButton(catIdx)}>
                        <Plus className="w-3 h-3 mr-1" />
                        Botão
                      </Button>
                    </div>

                    {category.buttons.map((btn, btnIdx) => (
                      <div key={btnIdx} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span>{btn.emoji} {btn.label || `Botão ${btnIdx + 1}`}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeButton(catIdx, btnIdx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Ícone</Label>
                            <Input
                              value={btn.emoji}
                              onChange={(e) => updateButton(catIdx, btnIdx, 'emoji', e.target.value)}
                              placeholder="💬"
                              className="text-center"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Label</Label>
                            <Input
                              value={btn.label}
                              onChange={(e) => updateButton(catIdx, btnIdx, 'label', e.target.value)}
                              placeholder="Texto do botão"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">Cor (gradiente)</Label>
                            <select
                              value={btn.color}
                              onChange={(e) => updateButton(catIdx, btnIdx, 'color', e.target.value)}
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
                            onChange={(e) => updateButton(catIdx, btnIdx, 'prompt', e.target.value)}
                            placeholder="Ex: Quais são os horários de funcionamento?"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
