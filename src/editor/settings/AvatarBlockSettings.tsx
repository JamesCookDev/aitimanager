import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

type ColorKey = 'shirtColor' | 'pantsColor' | 'shoesColor' | 'skinColor' | 'hairColor' | 'bgColor';

function ColorRow({ label, propKey, props, setProp }: {
  label: string;
  propKey: ColorKey;
  props: Record<string, any>;
  setProp: (fn: (p: any) => void) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex gap-1.5 items-center">
        <input
          type="color"
          value={props[propKey] || '#000000'}
          onChange={(e) => setProp((p: any) => { p[propKey] = e.target.value; })}
          className="h-7 w-9 rounded border border-border cursor-pointer shrink-0"
        />
        <Input
          value={props[propKey] || ''}
          onChange={(e) => setProp((p: any) => { p[propKey] = e.target.value; })}
          className="flex-1 h-7 text-xs font-mono"
        />
      </div>
    </div>
  );
}

export function AvatarBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as Record<string, any>,
  }));

  const sliderRow = (label: string, key: string, min: number, max: number, step: number, unit = '') => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <span className="text-[10px] font-mono text-muted-foreground">
          {typeof props[key] === 'number' ? props[key].toFixed(step < 1 ? 1 : 0) : '—'}{unit}
        </span>
      </div>
      <Slider
        min={min} max={max} step={step}
        value={[props[key] ?? (min + max) / 2]}
        onValueChange={([v]) => setProp((p: any) => { p[key] = v; })}
      />
    </div>
  );

  return (
    <div className="space-y-3 p-3">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
        <span className="text-xs font-semibold text-foreground">Avatar Ativo</span>
        <Switch
          checked={props.enabled !== false}
          onCheckedChange={(v) => setProp((p: any) => { p.enabled = v; })}
        />
      </div>

      <Accordion type="multiple" defaultValue={['identity', 'appearance', 'clothing', 'models', 'animations', 'material']} className="space-y-0.5">

        {/* Identity */}
        <AccordionItem value="identity" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Identidade</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Nome do Avatar</Label>
              <Input
                value={props.avatarName || ''}
                onChange={(e) => setProp((p: any) => { p.avatarName = e.target.value; })}
                className="h-7 text-xs"
                placeholder="Assistente"
              />
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Posição Horizontal</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['left', 'center', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setProp((p: any) => { p.position = pos; })}
                    className={`py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      props.position === pos
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    {pos === 'left' ? '← Esq' : pos === 'center' ? '● Centro' : 'Dir →'}
                  </button>
                ))}
              </div>
            </div>

            {sliderRow('Escala', 'scale', 0.5, 3, 0.1, '×')}
            {sliderRow('Altura do Preview', 'height', 100, 600, 10, 'px')}
            {sliderRow('Arredondamento', 'borderRadius', 0, 32, 2, 'px')}
          </AccordionContent>
        </AccordionItem>

        {/* Appearance */}
        <AccordionItem value="appearance" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Aparência Visual</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <ColorRow label="Cor de fundo do canvas" propKey="bgColor" props={props} setProp={setProp} />
            <ColorRow label="Cor da pele" propKey="skinColor" props={props} setProp={setProp} />
            <ColorRow label="Cor do cabelo" propKey="hairColor" props={props} setProp={setProp} />
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Mostrar piso (grid)</Label>
              <Switch
                checked={props.showFloor !== false}
                onCheckedChange={(v) => setProp((p: any) => { p.showFloor = v; })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Mostrar glow ambiente</Label>
              <Switch
                checked={props.showGlow !== false}
                onCheckedChange={(v) => setProp((p: any) => { p.showGlow = v; })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Clothing */}
        <AccordionItem value="clothing" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Roupas</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            <ColorRow label="Camisa / Topo" propKey="shirtColor" props={props} setProp={setProp} />
            <ColorRow label="Calça / Parte inferior" propKey="pantsColor" props={props} setProp={setProp} />
            <ColorRow label="Sapatos / Calçados" propKey="shoesColor" props={props} setProp={setProp} />
          </AccordionContent>
        </AccordionItem>

        {/* Models */}
        <AccordionItem value="models" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Modelos 3D (.glb)</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">URL do Avatar</Label>
              <Input
                value={props.avatarUrl || ''}
                onChange={(e) => setProp((p: any) => { p.avatarUrl = e.target.value; })}
                className="h-7 text-xs font-mono"
                placeholder="/models/avatar.glb"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">URL das Animações</Label>
              <Input
                value={props.animationsUrl || ''}
                onChange={(e) => setProp((p: any) => { p.animationsUrl = e.target.value; })}
                className="h-7 text-xs font-mono"
                placeholder="/models/animations.glb"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Animations */}
        <AccordionItem value="animations" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Animações</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Animação Idle (repouso)</Label>
              <Input
                value={props.idleAnimation || 'Idle'}
                onChange={(e) => setProp((p: any) => { p.idleAnimation = e.target.value; })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Animação Falando</Label>
              <Input
                value={props.talkingAnimation || 'TalkingOne'}
                onChange={(e) => setProp((p: any) => { p.talkingAnimation = e.target.value; })}
                className="h-7 text-xs"
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              Os nomes devem corresponder exatamente aos clips do arquivo .glb de animações. Ex: <code className="bg-muted px-1 rounded">Idle</code>, <code className="bg-muted px-1 rounded">TalkingOne</code>
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Material */}
        <AccordionItem value="material" className="border-b-0 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">Material 3D</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2.5">
            {sliderRow('Roughness (aspereza)', 'roughness', 0, 1, 0.05)}
            {sliderRow('Metalness (metalicidade)', 'metalness', 0, 1, 0.05)}
            {sliderRow('Intensidade ambiente', 'ambientIntensity', 0, 3, 0.1, '×')}
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              Roughness alto = superfície opaca. Metalness alto = efeito espelho. Estes valores são aplicados nos materiais do modelo 3D no totem.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <LayoutSettingsPanel />
    </div>
  );
}
