import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Plus, Trash2, GripVertical, Save, Sparkles } from 'lucide-react';

interface QuickAction {
  emoji: string;
  label: string;
  prompt: string;
  color: string;
}

interface UiConfig {
  title: string;
  subtitle: string;
  quick_actions: QuickAction[];
}

const DEFAULT_UI_CONFIG: UiConfig = {
  title: 'Assistente Virtual',
  subtitle: 'Como posso ajudar?',
  quick_actions: [
    { emoji: 'ℹ️', label: 'Informações', prompt: 'Quem é você?', color: 'from-teal-400 to-cyan-400' },
  ],
};

const COLOR_PRESETS = [
  { label: 'Teal → Cyan', value: 'from-teal-400 to-cyan-400' },
  { label: 'Purple → Pink', value: 'from-purple-400 to-pink-400' },
  { label: 'Orange → Yellow', value: 'from-orange-400 to-yellow-400' },
  { label: 'Blue → Indigo', value: 'from-blue-400 to-indigo-400' },
  { label: 'Green → Emerald', value: 'from-green-400 to-emerald-400' },
  { label: 'Rose → Red', value: 'from-rose-400 to-red-400' },
];

interface MenuBuilderProps {
  deviceId: string;
  initialConfig?: UiConfig | null;
}

export function MenuBuilder({ deviceId, initialConfig }: MenuBuilderProps) {
  const [config, setConfig] = useState<UiConfig>(initialConfig || DEFAULT_UI_CONFIG);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const updateField = <K extends keyof UiConfig>(key: K, value: UiConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const addAction = () => {
    setConfig(prev => ({
      ...prev,
      quick_actions: [
        ...prev.quick_actions,
        { emoji: '💬', label: 'Novo Botão', prompt: '', color: 'from-blue-400 to-indigo-400' },
      ],
    }));
    setHasChanges(true);
  };

  const removeAction = (index: number) => {
    setConfig(prev => ({
      ...prev,
      quick_actions: prev.quick_actions.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateAction = (index: number, field: keyof QuickAction, value: string) => {
    setConfig(prev => ({
      ...prev,
      quick_actions: prev.quick_actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('devices')
        .update({ ui_config: config as any })
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
              Personalize os botões de interação exibidos na tela do totem
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
              value={config.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Assistente Virtual"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtítulo</Label>
            <Input
              value={config.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Como posso ajudar?"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Pré-visualização</p>
          <div className="text-center space-y-2 mb-4">
            <h3 className="text-lg font-bold text-foreground">{config.title || 'Título'}</h3>
            <p className="text-sm text-muted-foreground">{config.subtitle || 'Subtítulo'}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {config.quick_actions.map((action, i) => (
              <div
                key={i}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${action.color} text-white text-sm font-medium shadow-md`}
              >
                <span>{action.emoji}</span>
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Botões de Ação Rápida ({config.quick_actions.length})
            </Label>
            <Button variant="outline" size="sm" onClick={addAction}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Botão
            </Button>
          </div>

          {config.quick_actions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum botão configurado</p>
              <p className="text-xs mt-1">Adicione botões para criar interações rápidas</p>
            </div>
          )}

          {config.quick_actions.map((action, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span>{action.emoji} {action.label || `Botão ${index + 1}`}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeAction(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Emoji</Label>
                  <Input
                    value={action.emoji}
                    onChange={(e) => updateAction(index, 'emoji', e.target.value)}
                    placeholder="💬"
                    className="text-center"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={action.label}
                    onChange={(e) => updateAction(index, 'label', e.target.value)}
                    placeholder="Texto do botão"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Cor (gradiente)</Label>
                  <select
                    value={action.color}
                    onChange={(e) => updateAction(index, 'color', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {COLOR_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Prompt (pergunta enviada para a IA)</Label>
                <Textarea
                  value={action.prompt}
                  onChange={(e) => updateAction(index, 'prompt', e.target.value)}
                  placeholder="Ex: Quais são os horários de funcionamento?"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
