import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ButtonBlockProps } from '../components/ButtonBlock';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function ButtonBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props as ButtonBlockProps }));
  const p = props;
  const set = (field: keyof ButtonBlockProps, value: any) =>
    setProp((pr: ButtonBlockProps) => { (pr as any)[field] = value; });

  return (
    <div className="space-y-1">
      <Accordion type="multiple" defaultValue={['conteudo', 'aparencia', 'tipografia', 'comportamento']}>

        {/* ── Conteúdo ── */}
        <AccordionItem value="conteudo" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
            ✏️ Conteúdo
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Texto do botão</Label>
              <Input value={p.label} onChange={(e) => set('label', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Ícone</Label>
                <Input value={p.icon} onChange={(e) => set('icon', e.target.value)} className="h-8 text-center text-base" placeholder="🔥" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px] text-muted-foreground">Posição do ícone</Label>
                <Select value={p.iconPosition} onValueChange={(v) => set('iconPosition', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">← Esquerda</SelectItem>
                    <SelectItem value="right">Direita →</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Ação (prompt IA ou URL)</Label>
              <Input
                value={p.action}
                onChange={(e) => set('action', e.target.value)}
                placeholder="Ex: Quem é você? / https://..."
                className="mt-1 h-8 text-xs"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Aparência ── */}
        <AccordionItem value="aparencia" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
            🎨 Aparência
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Cores */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Cor de fundo</Label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={
                      p.bgColor?.startsWith('gradient-') ? '#6366f1'
                      : p.bgColor?.startsWith('hsl') ? '#3b82f6'
                      : p.bgColor ?? '#3b82f6'
                    }
                    onChange={(e) => set('bgColor', e.target.value)}
                    className="h-8 w-10 rounded border border-border cursor-pointer shrink-0"
                  />
                  <Input
                    value={p.bgColor ?? ''}
                    onChange={(e) => set('bgColor', e.target.value)}
                    className="h-8 text-[10px] font-mono flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Cor do texto</Label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={p.textColor ?? '#ffffff'}
                    onChange={(e) => set('textColor', e.target.value)}
                    className="h-8 w-10 rounded border border-border cursor-pointer shrink-0"
                  />
                  <Input
                    value={p.textColor ?? ''}
                    onChange={(e) => set('textColor', e.target.value)}
                    className="h-8 text-[10px] font-mono flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Arredondamento */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Arredondamento</Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {p.borderRadius >= 999 ? 'Pill' : `${p.borderRadius}px`}
                </span>
              </div>
              <Slider
                value={[Math.min(p.borderRadius, 64)]}
                onValueChange={([v]) => set('borderRadius', v === 64 ? 999 : v)}
                min={0} max={64} step={2}
              />
            </div>

            {/* Padding */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-[10px] text-muted-foreground">Padding H</Label>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.paddingX}px</span>
                </div>
                <Slider value={[p.paddingX]} onValueChange={([v]) => set('paddingX', v)} min={8} max={64} step={2} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-[10px] text-muted-foreground">Padding V</Label>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.paddingY}px</span>
                </div>
                <Slider value={[p.paddingY]} onValueChange={([v]) => set('paddingY', v)} min={4} max={40} step={2} />
              </div>
            </div>

            {/* Borda */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Cor da borda</Label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={p.borderColor === 'transparent' ? '#ffffff' : (p.borderColor ?? '#ffffff')}
                    onChange={(e) => set('borderColor', e.target.value)}
                    className="h-7 w-10 rounded border border-border cursor-pointer shrink-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-[10px] text-muted-foreground">Espessura</Label>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.borderWidth}px</span>
                </div>
                <Slider value={[p.borderWidth]} onValueChange={([v]) => set('borderWidth', v)} min={0} max={6} step={1} />
              </div>
            </div>

            {/* Sombra */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Sombra</Label>
              <Select value={p.shadow} onValueChange={(v) => set('shadow', v)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="sm">Leve</SelectItem>
                  <SelectItem value="md">Média</SelectItem>
                  <SelectItem value="lg">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opacidade */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{Math.round(p.opacity * 100)}%</span>
              </div>
              <Slider value={[p.opacity * 100]} onValueChange={([v]) => set('opacity', v / 100)} min={10} max={100} step={5} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Tipografia ── */}
        <AccordionItem value="tipografia" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
            🔤 Tipografia
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Tamanho da fonte</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.fontSize}px</span>
              </div>
              <Slider value={[p.fontSize]} onValueChange={([v]) => set('fontSize', v)} min={10} max={36} step={1} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Peso da fonte</Label>
              <div className="flex gap-1.5 mt-1">
                {(['normal', 'semibold', 'bold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => set('fontWeight', w)}
                    className={`flex-1 py-1 rounded text-[10px] border transition-all ${p.fontWeight === w ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground'}`}
                  >
                    {w === 'normal' ? 'Normal' : w === 'semibold' ? 'Semi' : 'Bold'}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Comportamento ── */}
        <AccordionItem value="comportamento" className="border-b-0 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
            ⚙️ Comportamento
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
              <div>
                <Label className="text-[10px] text-foreground font-medium">Largura total</Label>
                <p className="text-[10px] text-muted-foreground">Ocupa 100% do container</p>
              </div>
              <Switch checked={p.fullWidth} onCheckedChange={(v) => set('fullWidth', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      <LayoutSettingsPanel />
    </div>
  );
}
