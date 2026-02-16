import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ColorPickerPopover } from '@/components/devices/ColorPickerPopover';
import { UnsplashImagePicker } from '@/components/devices/UnsplashImagePicker';
import { Paintbrush, Layers, Monitor } from 'lucide-react';
import type { CanvasConfig } from '@/types/page-builder';

interface BackgroundModuleProps {
  canvas: CanvasConfig;
  onChange: (canvas: CanvasConfig) => void;
}

export function BackgroundModule({ canvas, onChange }: BackgroundModuleProps) {
  const [gradColor1, setGradColor1] = useState(() => {
    const match = canvas.background.gradient?.match(/#[0-9a-fA-F]{6}/g);
    return match?.[0] || '#1e3a8a';
  });
  const [gradColor2, setGradColor2] = useState(() => {
    const match = canvas.background.gradient?.match(/#[0-9a-fA-F]{6}/g);
    return match?.[1] || '#0f172a';
  });

  const update = (partial: Partial<CanvasConfig>) => {
    onChange({ ...canvas, ...partial });
  };

  const updateBg = (partial: Partial<CanvasConfig['background']>) => {
    onChange({ ...canvas, background: { ...canvas.background, ...partial } });
  };

  const updateEnv = (partial: Partial<CanvasConfig['environment']>) => {
    onChange({ ...canvas, environment: { ...canvas.environment, ...partial } });
  };

  const updateGradient = (c1: string, c2: string) => {
    setGradColor1(c1);
    setGradColor2(c2);
    updateBg({ gradient: `linear-gradient(135deg, ${c1}, ${c2})` });
  };

  return (
    <Accordion type="multiple" defaultValue={['orientation', 'background', 'environment']} className="space-y-1">
      {/* Orientation */}
      <AccordionItem value="orientation" className="border-b border-border px-1">
        <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
          <span className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5 text-primary" /> Orientação</span>
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <RadioGroup value={canvas.orientation} onValueChange={(v) => update({ orientation: v as any })} className="flex gap-2">
            {[
              { value: 'vertical', label: '📱 Vertical' },
              { value: 'horizontal', label: '🖥️ Horizontal' },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${canvas.orientation === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'}`}>
                <RadioGroupItem value={opt.value} />
                <span className="font-medium">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      {/* Background */}
      <AccordionItem value="background" className="border-b border-border px-1">
        <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
          <span className="flex items-center gap-2"><Paintbrush className="w-3.5 h-3.5 text-primary" /> Fundo</span>
        </AccordionTrigger>
        <AccordionContent className="pb-3 space-y-3">
          <RadioGroup value={canvas.background.type} onValueChange={(v) => updateBg({ type: v as any })} className="flex gap-2">
            {[
              { value: 'solid', label: 'Cor' },
              { value: 'gradient', label: 'Gradiente' },
              { value: 'image', label: 'Imagem' },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${canvas.background.type === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'}`}>
                <RadioGroupItem value={opt.value} />
                <span className="font-medium">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>

          {canvas.background.type === 'solid' && (
            <ColorPickerPopover color={canvas.background.color} onChange={(c) => updateBg({ color: c })} label="Cor de Fundo" />
          )}
          {canvas.background.type === 'gradient' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <ColorPickerPopover color={gradColor1} onChange={(c) => updateGradient(c, gradColor2)} label="Cor 1" />
                <ColorPickerPopover color={gradColor2} onChange={(c) => updateGradient(gradColor1, c)} label="Cor 2" />
              </div>
              <div className="h-6 rounded-lg border border-border" style={{ background: canvas.background.gradient }} />
            </div>
          )}
          {canvas.background.type === 'image' && (
            <UnsplashImagePicker currentImage={canvas.background.image_url || ''} onSelect={(url) => updateBg({ image_url: url })} />
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Environment */}
      <AccordionItem value="environment" className="border-b border-border px-1">
        <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
          <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-primary" /> Ambiente 3D</span>
        </AccordionTrigger>
        <AccordionContent className="pb-3 space-y-3">
          <div className="space-y-2">
            {[
              { key: 'show_floor' as const, label: 'Chão 3D' },
              { key: 'show_particles' as const, label: 'Partículas' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
                <span className="text-xs font-medium text-foreground">{item.label}</span>
                <Switch
                  checked={canvas.environment[item.key]}
                  onCheckedChange={(checked) => updateEnv({ [item.key]: checked })}
                />
              </div>
            ))}
          </div>
          {canvas.environment.show_floor && (
            <ColorPickerPopover
              color={canvas.environment.floor_color || '#1a1a2e'}
              onChange={(c) => updateEnv({ floor_color: c })}
              label="Cor do Chão"
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
