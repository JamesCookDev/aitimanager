import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Monitor, Save, User, MessageSquare, Paintbrush } from 'lucide-react';

interface LayoutConfig {
  avatar_position: 'left' | 'center' | 'right';
  avatar_scale: number;
  chat_position: 'left' | 'right';
  bg_color: string;
  floor_color: string;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  avatar_position: 'center',
  avatar_scale: 1.5,
  chat_position: 'right',
  bg_color: '#0f3460',
  floor_color: '#1a1a2e',
};

interface LayoutBuilderProps {
  deviceId: string;
  initialLayout?: LayoutConfig | null;
  fullUiConfig?: Record<string, any> | null;
}

export function LayoutBuilder({ deviceId, initialLayout, fullUiConfig }: LayoutBuilderProps) {
  const [layout, setLayout] = useState<LayoutConfig>(initialLayout || DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
    }
  }, [initialLayout]);

  const update = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    setLayout(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const merged = { ...(fullUiConfig || {}), layout };
      const { error } = await supabase
        .from('devices')
        .update({ ui_config: merged as any })
        .eq('id', deviceId);

      if (error) throw error;

      toast.success('Layout do cenário atualizado!', {
        description: 'As mudanças serão aplicadas no próximo carregamento do dispositivo.',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      toast.error('Erro ao salvar configuração de layout');
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
              <Monitor className="w-5 h-5 text-primary" />
              Layout do Cenário
            </CardTitle>
            <CardDescription>
              Configure a posição do avatar, chat e cores do ambiente 3D
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Layout'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ background: layout.bg_color }}
        >
          <div className="relative h-48 flex items-end">
            {/* Avatar placeholder */}
            <div
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left:
                  layout.avatar_position === 'left'
                    ? '15%'
                    : layout.avatar_position === 'center'
                    ? '50%'
                    : '85%',
                transform: `translateX(-50%) scale(${layout.avatar_scale / 2})`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="w-12 h-16 rounded-lg bg-primary/60 border-2 border-primary/40 flex items-center justify-center mb-1">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            {/* Chat placeholder */}
            <div
              className="absolute top-4 w-32 h-24 rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-2"
              style={{
                [layout.chat_position === 'left' ? 'left' : 'right']: '8%',
              }}
            >
              <div className="flex items-center gap-1 mb-1">
                <MessageSquare className="w-3 h-3 text-white/60" />
                <span className="text-[9px] text-white/60 font-medium">Chat</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-3/4 rounded-full bg-white/20" />
                <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Floor */}
            <div
              className="w-full h-8 rounded-b-xl"
              style={{ background: layout.floor_color }}
            />
          </div>
          <p className="text-[10px] text-white/40 text-center py-1.5 uppercase tracking-widest">
            Pré-visualização do cenário
          </p>
        </div>

        {/* Avatar Position */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Posição do Avatar
          </Label>
          <RadioGroup
            value={layout.avatar_position}
            onValueChange={(v) => update('avatar_position', v as LayoutConfig['avatar_position'])}
            className="flex gap-4"
          >
            {[
              { value: 'left', label: 'Esquerda' },
              { value: 'center', label: 'Centro' },
              { value: 'right', label: 'Direita' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  layout.avatar_position === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                }`}
              >
                <RadioGroupItem value={opt.value} />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Chat Position */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Posição do Chat
          </Label>
          <RadioGroup
            value={layout.chat_position}
            onValueChange={(v) => update('chat_position', v as LayoutConfig['chat_position'])}
            className="flex gap-4"
          >
            {[
              { value: 'left', label: 'Esquerda' },
              { value: 'right', label: 'Direita' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  layout.chat_position === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                }`}
              >
                <RadioGroupItem value={opt.value} />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Avatar Scale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Tamanho do Avatar
            </Label>
            <span className="text-sm font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
              {layout.avatar_scale.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[layout.avatar_scale]}
            onValueChange={([v]) => update('avatar_scale', Math.round(v * 10) / 10)}
            min={1.0}
            max={2.5}
            step={0.1}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1.0 (pequeno)</span>
            <span>2.5 (grande)</span>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Paintbrush className="w-3.5 h-3.5" />
              Cor do Fundo (Parede)
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={layout.bg_color}
                onChange={(e) => update('bg_color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={layout.bg_color}
                onChange={(e) => update('bg_color', e.target.value)}
                placeholder="#0f3460"
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Paintbrush className="w-3.5 h-3.5" />
              Cor do Chão
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={layout.floor_color}
                onChange={(e) => update('floor_color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={layout.floor_color}
                onChange={(e) => update('floor_color', e.target.value)}
                placeholder="#1a1a2e"
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
