import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Monitor, Save, User, MessageSquare, Paintbrush, LayoutTemplate, Image, Layers, Sparkles } from 'lucide-react';

interface LayoutConfig {
  avatar_position: 'left' | 'center' | 'right';
  avatar_scale: number;
  chat_position: 'left' | 'right';
  bg_type: 'solid' | 'gradient' | 'image';
  bg_color: string;
  bg_gradient: string;
  bg_image: string;
  show_floor: boolean;
  floor_color: string;
  show_wall: boolean;
  show_particles: boolean;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  avatar_position: 'center',
  avatar_scale: 1.5,
  chat_position: 'right',
  bg_type: 'solid',
  bg_color: '#0f3460',
  bg_gradient: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
  bg_image: '',
  show_floor: true,
  floor_color: '#1a1a2e',
  show_wall: true,
  show_particles: true,
};

const LAYOUT_TEMPLATES: { name: string; icon: string; description: string; layout: Partial<LayoutConfig> }[] = [
  {
    name: 'Recepção',
    icon: '🏢',
    description: 'Avatar à esquerda com chat à direita, ideal para lobbies',
    layout: { avatar_position: 'left', avatar_scale: 1.8, chat_position: 'right', bg_type: 'solid', bg_color: '#1a1a2e', floor_color: '#2d2d44' },
  },
  {
    name: 'Quiosque',
    icon: '🖥️',
    description: 'Avatar centralizado e compacto para totens de autoatendimento',
    layout: { avatar_position: 'center', avatar_scale: 1.3, chat_position: 'right', bg_type: 'solid', bg_color: '#0a192f', floor_color: '#112240' },
  },
  {
    name: 'Palco',
    icon: '🎭',
    description: 'Avatar grande e centralizado para apresentações e eventos',
    layout: { avatar_position: 'center', avatar_scale: 2.2, chat_position: 'right', bg_type: 'gradient', bg_color: '#0f0f23', bg_gradient: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', floor_color: '#1a1a3e' },
  },
  {
    name: 'Loja',
    icon: '🛍️',
    description: 'Avatar à direita com chat à esquerda, perfeito para vitrines',
    layout: { avatar_position: 'right', avatar_scale: 1.6, chat_position: 'left', bg_type: 'solid', bg_color: '#1b2838', floor_color: '#2a3f54' },
  },
  {
    name: 'Hospital',
    icon: '🏥',
    description: 'Layout limpo e acolhedor para ambientes de saúde',
    layout: { avatar_position: 'left', avatar_scale: 1.5, chat_position: 'right', bg_type: 'solid', bg_color: '#0d2137', floor_color: '#162d4a' },
  },
];

interface LayoutBuilderProps {
  deviceId: string;
  initialLayout?: Partial<LayoutConfig> | null;
  fullUiConfig?: Record<string, any> | null;
}

export function LayoutBuilder({ deviceId, initialLayout, fullUiConfig }: LayoutBuilderProps) {
  const [layout, setLayout] = useState<LayoutConfig>({ ...DEFAULT_LAYOUT, ...initialLayout });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [gradColor1, setGradColor1] = useState('#1e3a8a');
  const [gradColor2, setGradColor2] = useState('#0f172a');

  useEffect(() => {
    if (initialLayout) {
      setLayout({ ...DEFAULT_LAYOUT, ...initialLayout });
      // Parse gradient colors if available
      if (initialLayout.bg_gradient) {
        const match = initialLayout.bg_gradient.match(/#[0-9a-fA-F]{6}/g);
        if (match && match.length >= 2) {
          setGradColor1(match[0]);
          setGradColor2(match[1]);
        }
      }
    }
  }, [initialLayout]);

  const update = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    setLayout(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateGradient = (c1: string, c2: string) => {
    setGradColor1(c1);
    setGradColor2(c2);
    update('bg_gradient', `linear-gradient(135deg, ${c1}, ${c2})`);
  };

  const getPreviewBg = (): string => {
    if (layout.bg_type === 'gradient') return layout.bg_gradient;
    if (layout.bg_type === 'image' && layout.bg_image) return `url(${layout.bg_image}) center/cover no-repeat`;
    return layout.bg_color;
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
              Configure a posição do avatar, chat, fundo e elementos 3D
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
          style={{ background: getPreviewBg() }}
        >
          <div className="relative h-48 flex items-end">
            {/* Wall indicator */}
            {!layout.show_wall && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-white/30 bg-black/30 px-2 py-1 rounded">Parede oculta</span>
              </div>
            )}

            {/* Particles indicator */}
            {layout.show_particles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse"
                    style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            )}

            {/* Avatar placeholder */}
            <div
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left: layout.avatar_position === 'left' ? '15%' : layout.avatar_position === 'center' ? '50%' : '85%',
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
              style={{ [layout.chat_position === 'left' ? 'left' : 'right']: '8%' }}
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
            {layout.show_floor && (
              <div className="w-full h-8 rounded-b-xl" style={{ background: layout.floor_color }} />
            )}
          </div>
          <p className="text-[10px] text-white/40 text-center py-1.5 uppercase tracking-widest">
            Pré-visualização do cenário
          </p>
        </div>

        {/* Templates */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Templates Pré-configurados
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {LAYOUT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => {
                  setLayout(prev => ({ ...prev, ...tpl.layout }));
                  setHasChanges(true);
                  toast.info(`Template "${tpl.name}" aplicado`, { description: 'Clique em Salvar para confirmar.' });
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
              >
                <span className="text-2xl">{tpl.icon}</span>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{tpl.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{tpl.description}</span>
              </button>
            ))}
          </div>
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
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tamanho do Avatar</Label>
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

        {/* Background Type */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Paintbrush className="w-3.5 h-3.5" />
            Tipo de Fundo
          </Label>
          <RadioGroup
            value={layout.bg_type}
            onValueChange={(v) => update('bg_type', v as LayoutConfig['bg_type'])}
            className="flex gap-4"
          >
            {[
              { value: 'solid', label: '🎨 Cor Sólida' },
              { value: 'gradient', label: '🌈 Gradiente' },
              { value: 'image', label: '🖼️ Imagem' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  layout.bg_type === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                }`}
              >
                <RadioGroupItem value={opt.value} />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>

          {/* Solid Color */}
          {layout.bg_type === 'solid' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Cor de Fundo</Label>
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
          )}

          {/* Gradient */}
          {layout.bg_type === 'gradient' && (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Cores do Gradiente</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={gradColor1}
                    onChange={(e) => updateGradient(e.target.value, gradColor2)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={gradColor1}
                    onChange={(e) => updateGradient(e.target.value, gradColor2)}
                    placeholder="#1e3a8a"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={gradColor2}
                    onChange={(e) => updateGradient(gradColor1, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={gradColor2}
                    onChange={(e) => updateGradient(gradColor1, e.target.value)}
                    placeholder="#0f172a"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <div className="h-8 rounded-lg border border-border" style={{ background: layout.bg_gradient }} />
            </div>
          )}

          {/* Image */}
          {layout.bg_type === 'image' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Image className="w-3.5 h-3.5" />
                URL da Imagem de Fundo
              </Label>
              <Input
                value={layout.bg_image}
                onChange={(e) => update('bg_image', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="font-mono text-sm"
              />
              {layout.bg_image && (
                <div
                  className="h-20 rounded-lg border border-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${layout.bg_image})` }}
                />
              )}
            </div>
          )}
        </div>

        {/* Floor Color */}
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

        {/* 3D Element Visibility Switches */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            Visibilidade de Elementos 3D
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'show_floor' as const, label: 'Mostrar Chão 3D', icon: '🟫' },
              { key: 'show_wall' as const, label: 'Mostrar Parede 3D', icon: '🧱' },
              { key: 'show_particles' as const, label: 'Partículas/Efeitos', icon: '✨' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <Switch
                  checked={layout[item.key]}
                  onCheckedChange={(checked) => update(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
